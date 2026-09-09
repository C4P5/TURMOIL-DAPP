// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Turmoil} from "../src/Turmoil.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @dev USDC is 6 decimals. Testing against an 18-decimal mock would hide the
///      exact class of bug that costs people a million dollars.
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amt) external {
        _mint(to, amt);
    }
}

contract TurmoilTest is Test {
    Turmoil internal t;
    MockUSDC internal usdc;

    address internal restaurant;
    uint256 internal restaurantKey;
    address internal collector;
    uint256 internal collectorKey;
    address internal plant;
    uint256 internal plantKey;

    uint256 internal constant PRICE = 248_000; // $0.248 per litre, 6dp

    /// Fixed ref for single-shot tests. Reusing it is how replay gets exercised.
    bytes32 internal constant ref = keccak256("fixed-ref");

    uint256 internal refSeq; // fresh ref per _attest, the job the nonce used to do

    function setUp() public {
        (restaurant, restaurantKey) = makeAddrAndKey("restaurant");
        (collector, collectorKey) = makeAddrAndKey("collector");
        (plant, plantKey) = makeAddrAndKey("plant");

        usdc = new MockUSDC();
        t = new Turmoil(IERC20(address(usdc)), PRICE);

        t.setRestaurant(restaurant, true);
        t.setCollector(collector, true);
        t.setPlant(plant, true);

        usdc.mint(address(t), 1_000_000e6); // escrow float from the truck raise
        usdc.mint(collector, 100_000e6);

        // Foundry leaves block.prevrandao at 0, which is the value _seed() falls back
        // to off-Hedera. Set it so sampling is exercised with a non-degenerate seed.
        vm.prevrandao(bytes32(uint256(0xC0FFEE)));

        vm.startPrank(collector);
        usdc.approve(address(t), type(uint256).max);
        t.postDeposit(50_000e6);
        vm.stopPrank();
    }

    function _sign(uint256 key, bytes32 digest) internal pure returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, digest);
        return abi.encodePacked(r, s, v);
    }

    function _attest(uint64 litres) internal returns (uint256) {
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 r = keccak256(abi.encode("seq", refSeq++));
        bytes32 digest = t.batchDigest(restaurant, collector, litres, r, deadline);
        return t.attest(
            restaurant, collector, litres, r, deadline, _sign(restaurantKey, digest), _sign(collectorKey, digest)
        );
    }

    /// @notice The reason the nonce had to go. Two trucks, two QRs generated the same
    ///         morning, both signed honestly — under a per-restaurant nonce read at
    ///         execution time, the second was dead on arrival and failed as
    ///         BadSignature, which looks exactly like forgery.
    function test_ConcurrentPickupsBothSucceed() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 refA = keccak256("truck-a");
        bytes32 refB = keccak256("truck-b");

        bytes32 dA = t.batchDigest(restaurant, collector, 40, refA, deadline);
        bytes32 dB = t.batchDigest(restaurant, collector, 60, refB, deadline);

        // Both QRs exist before either is redeemed.
        t.attest(restaurant, collector, 40, refA, deadline, _sign(restaurantKey, dA), _sign(collectorKey, dA));
        t.attest(restaurant, collector, 60, refB, deadline, _sign(restaurantKey, dB), _sign(collectorKey, dB));

        assertEq(t.batchCount(), 2, "both pickups recorded");
        assertEq(usdc.balanceOf(restaurant), 100 * PRICE, "paid for both");
    }

    // --- happy path ---------------------------------------------------------

    function test_AttestPaysRestaurantInstantly() public {
        _attest(40);
        assertEq(usdc.balanceOf(restaurant), 40 * PRICE, "restaurant paid on attestation");
        assertEq(t.batchCount(), 1);
    }

    function test_RestaurantNeverSendsATransaction() public {
        // the restaurant holds no gas token and is never msg.sender
        vm.deal(restaurant, 0);
        _attest(40);
        assertEq(usdc.balanceOf(restaurant), 40 * PRICE);
    }

    // --- attack 1: one party cannot invent a pickup -------------------------

    function test_RevertWhen_OnlyRestaurantSigns() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 digest = t.batchDigest(restaurant, collector, 40, ref, deadline);
        bytes memory sig = _sign(restaurantKey, digest);

        vm.expectRevert(Turmoil.BadSignature.selector);
        t.attest(restaurant, collector, 40, ref, deadline, sig, sig); // same key twice
    }

    function test_RevertWhen_SignatureReplayed() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 digest = t.batchDigest(restaurant, collector, 40, ref, deadline);
        bytes memory rSig = _sign(restaurantKey, digest);
        bytes memory cSig = _sign(collectorKey, digest);

        t.attest(restaurant, collector, 40, ref, deadline, rSig, cSig);

        vm.expectRevert(Turmoil.BadSignature.selector); // nonce moved on
        t.attest(restaurant, collector, 40, ref, deadline, rSig, cSig);
    }

    function test_RevertWhen_Expired() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 digest = t.batchDigest(restaurant, collector, 40, ref, deadline);
        vm.warp(deadline + 1);
        vm.expectRevert(Turmoil.Expired.selector);
        t.attest(restaurant, collector, 40, ref, deadline, _sign(restaurantKey, digest), _sign(collectorKey, digest));
    }

    // --- attack 2: inflated volume caught by mass balance -------------------

    function test_SettleSlashesShortfallBeyondTolerance() public {
        _attest(1000);
        _reseal();

        uint256 before = t.deposit(collector);
        _settle(0, 800); // plant signed for 800L against 1000L attested

        uint256 allowed = (800 * (10_000 + 200)) / 10_000; // 816
        uint256 expected = (1000 - allowed) * PRICE;
        assertEq(before - t.deposit(collector), expected, "shortfall slashed from deposit");
    }

    function test_SettleWithinToleranceSlashesNothing() public {
        _attest(1000);
        _reseal();
        uint256 before = t.deposit(collector);
        _settle(0, 990); // 1% shrinkage, inside the 2% tolerance
        assertEq(t.deposit(collector), before, "no slash inside tolerance");
    }

    // --- attack 3: fabricated pickup caught by the random audit -------------

    /// @notice The fix for the finding that killed the original thesis. The old rule
    ///         fined `lotValue * sampleBps`, which is an unbiased extrapolation and
    ///         therefore zero-EV at best — a caught cheat forfeited a bond worth twice
    ///         what it stole while an uncaught one kept everything, so cheating paid.
    ///         A caught fake now burns the whole bond.
    function test_AuditFailureBurnsEntireBond() public {
        for (uint64 i; i < 10; ++i) {
            _attest(100);
        }
        _reseal();

        uint256[] memory sampled = t.drawAudit(0);
        uint256 before = t.deposit(collector);
        assertGt(before, 0, "bond exists to burn");

        skip(t.challengeWindow() + 1); // the restaurant had its chance and said nothing
        t.flagAudit(sampled[0]);
        assertEq(t.deposit(collector), 0, "entire bond forfeited");
    }

    // --- the leg that makes restaurants the check on TURMOIL ----------------

    /// @notice Before this existed, flagAudit was an unsigned assertion by the
    ///         operator: a restaurant could neither prove it confirmed a pickup nor
    ///         dispute a false flag.
    function test_ConfirmedBatchCannotBeFlagged() public {
        for (uint64 i; i < 10; ++i) {
            _attest(100);
        }
        _reseal();
        uint256[] memory sampled = t.drawAudit(0);

        _confirm(sampled[0], restaurantKey);

        skip(t.challengeWindow() + 1);
        vm.expectRevert(Turmoil.AlreadyConfirmed.selector);
        t.flagAudit(sampled[0]);
        assertEq(t.deposit(collector), 50_000e6, "bond untouched");
    }

    function test_RevertWhen_FlaggedBeforeChallengeWindowCloses() public {
        for (uint64 i; i < 10; ++i) {
            _attest(100);
        }
        _reseal();
        uint256[] memory sampled = t.drawAudit(0);

        // Flagging the instant the sample is drawn would let the operator fine anyone.
        vm.expectRevert(Turmoil.ChallengeOpen.selector);
        t.flagAudit(sampled[0]);
    }

    function test_RevertWhen_SomeoneElseConfirmsForTheRestaurant() public {
        for (uint64 i; i < 10; ++i) {
            _attest(100);
        }
        _reseal();
        uint256[] memory sampled = t.drawAudit(0);

        uint256 deadline = block.timestamp + 1 hours;
        // The collector signs a confirmation on the restaurant's behalf.
        bytes memory sig = _sign(collectorKey, t.confirmDigest(sampled[0], deadline));

        vm.expectRevert(Turmoil.BadSignature.selector);
        t.confirmBatch(sampled[0], deadline, sig);
    }

    // --- the plant signs the weight; the operator only relays it ------------

    /// @notice Without this the operator supplies the very number its own mass
    ///         balance is checked against — the ISCC failure, rebuilt.
    function test_RevertWhen_SettledWithoutPlantSignature() public {
        _attest(1000);
        _reseal();

        uint256 deadline = block.timestamp + 1 hours;
        // Someone who is not a registered plant signs the receipt.
        (, uint256 impostorKey) = makeAddrAndKey("impostor");
        // Build the signature BEFORE arming expectRevert: receiptDigest is an external
        // call and would otherwise be the "next call" expectRevert watches.
        bytes memory sig = _sign(impostorKey, t.receiptDigest(0, 800, deadline));

        vm.expectRevert(Turmoil.NotRegistered.selector);
        t.settleLot(0, 800, deadline, sig);
    }

    function test_SettleRecordsWhichPlantSigned() public {
        _attest(1000);
        _reseal();
        _settle(0, 800);
        (,,, address signedBy,,,,,) = t.lots(0);
        assertEq(signedBy, plant, "receipt attributable to a counterparty");
    }

    /// @notice A sample of one cannot deter: catch probability equals the fabricated
    ///         fraction, so no bond below the whole lot's value makes EV negative.
    function test_SampleFloorAppliesToSmallLots() public {
        for (uint64 i; i < 4; ++i) {
            _attest(100);
        }
        _reseal();
        // 30% of 4 rounds to 2, but the floor lifts it to MIN_SAMPLE.
        assertEq(t.drawAudit(0).length, t.MIN_SAMPLE(), "floor beats the percentage");
    }

    /// @notice Sampling must be WITHOUT replacement, or a 3-of-3 draw can land on the
    ///         same batch three times — worst exactly where lots are smallest.
    function test_AuditSamplesDistinctBatches() public {
        for (uint64 i; i < 10; ++i) {
            _attest(100);
        }
        _reseal();

        uint256[] memory sampled = t.drawAudit(0);
        for (uint256 i; i < sampled.length; ++i) {
            for (uint256 j = i + 1; j < sampled.length; ++j) {
                assertTrue(sampled[i] != sampled[j], "duplicate draw");
            }
        }
    }

    function test_RevertWhen_AuditRedrawn() public {
        for (uint64 i; i < 10; ++i) {
            _attest(100);
        }
        _reseal();
        t.drawAudit(0);
        // Without this guard the owner redraws until the sample flags whatever it wants.
        vm.expectRevert(Turmoil.AlreadyDrawn.selector);
        t.drawAudit(0);
    }

    // --- attack 4: one key wearing both hats --------------------------------

    function test_RevertWhen_SelfDeal() public {
        (address both, uint256 bothKey) = makeAddrAndKey("both");
        t.setRestaurant(both, true);
        t.setCollector(both, true);

        uint256 deadline = block.timestamp + 1 hours;
        bytes32 digest = t.batchDigest(both, both, 100, ref, deadline);
        bytes memory sig = _sign(bothKey, digest);

        // Both signatures verify. Two roles is not two parties.
        vm.expectRevert(Turmoil.SelfDeal.selector);
        t.attest(both, both, 100, ref, deadline, sig, sig);
    }

    // --- attack 5: an unbonded collector ------------------------------------

    function test_RevertWhen_UnderBonded() public {
        (address broke, uint256 brokeKey) = makeAddrAndKey("broke");
        t.setCollector(broke, true);

        uint256 deadline = block.timestamp + 1 hours;
        bytes32 digest = t.batchDigest(restaurant, broke, 100, ref, deadline);

        // No bond posted: every slash in the system would cap at zero.
        vm.expectRevert(Turmoil.UnderBonded.selector);
        t.attest(restaurant, broke, 100, ref, deadline, _sign(restaurantKey, digest), _sign(brokeKey, digest));
    }

    // --- attack 6: the collector vetoing their own audit --------------------

    function test_OwnerCanForceSealLot() public {
        _attest(1000);
        // The collector never seals, so settleLot and drawAudit can never run.
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(plantKey, t.receiptDigest(0, 800, deadline));
        vm.expectRevert(Turmoil.LotNotReady.selector);
        t.settleLot(0, 800, deadline, sig);

        t.sealLotOf(collector);
        _settle(0, 800);
        assertLt(t.deposit(collector), 50_000e6, "shortfall charged after force-seal");
    }

    function test_AuditCannotBeDrawnBeforeSeal() public {
        _attest(100);
        vm.expectRevert(Turmoil.LotNotReady.selector);
        t.drawAudit(0);
    }

    // --- the invariant ------------------------------------------------------

    /// @notice The property the whole design rests on: after settlement, attested
    ///         litres never exceed what the plant received plus tolerance without
    ///         the collector paying for the difference.
    function testFuzz_ShortfallIsAlwaysChargedToTheCollector(uint64 attested, uint64 received) public {
        attested = uint64(bound(attested, 1, 100_000));
        received = uint64(bound(received, 0, 100_000));

        _attest(attested);
        _reseal();

        uint256 before = t.deposit(collector);
        _settle(0, received);
        uint256 slashed = before - t.deposit(collector);

        uint256 allowed = (uint256(received) * (10_000 + 200)) / 10_000;
        if (attested <= allowed) {
            assertEq(slashed, 0, "no slash when the numbers close");
        } else {
            uint256 owed = (uint256(attested) - allowed) * PRICE;
            uint256 expected = owed > before ? before : owed; // capped by the bond
            assertEq(slashed, expected, "gap charged to the collector, capped at deposit");
        }
    }

    function _reseal() internal {
        vm.prank(collector);
        t.sealLot();
    }

    /// The plant signs for what arrived. The operator relays it but cannot author it.
    function _settle(uint256 lotId, uint64 received) internal {
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 digest = t.receiptDigest(lotId, received, deadline);
        t.settleLot(lotId, received, deadline, _sign(plantKey, digest));
    }

    function _confirm(uint256 batchId, uint256 key) internal {
        uint256 deadline = block.timestamp + 1 hours;
        t.confirmBatch(batchId, deadline, _sign(key, t.confirmDigest(batchId, deadline)));
    }
}
