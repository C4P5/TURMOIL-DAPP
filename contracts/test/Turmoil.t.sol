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

    uint256 internal constant PRICE = 248_000; // $0.248 per litre, 6dp

    function setUp() public {
        (restaurant, restaurantKey) = makeAddrAndKey("restaurant");
        (collector, collectorKey) = makeAddrAndKey("collector");

        usdc = new MockUSDC();
        t = new Turmoil(IERC20(address(usdc)), PRICE);

        t.setRestaurant(restaurant, true);
        t.setCollector(collector, true);

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
        bytes32 digest = t.batchDigest(restaurant, collector, litres, deadline);
        return t.attest(
            restaurant,
            collector,
            litres,
            deadline,
            _sign(restaurantKey, digest),
            _sign(collectorKey, digest)
        );
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
        bytes32 digest = t.batchDigest(restaurant, collector, 40, deadline);
        bytes memory sig = _sign(restaurantKey, digest);

        vm.expectRevert(Turmoil.BadSignature.selector);
        t.attest(restaurant, collector, 40, deadline, sig, sig); // same key twice
    }

    function test_RevertWhen_SignatureReplayed() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 digest = t.batchDigest(restaurant, collector, 40, deadline);
        bytes memory rSig = _sign(restaurantKey, digest);
        bytes memory cSig = _sign(collectorKey, digest);

        t.attest(restaurant, collector, 40, deadline, rSig, cSig);

        vm.expectRevert(Turmoil.BadSignature.selector); // nonce moved on
        t.attest(restaurant, collector, 40, deadline, rSig, cSig);
    }

    function test_RevertWhen_Expired() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 digest = t.batchDigest(restaurant, collector, 40, deadline);
        vm.warp(deadline + 1);
        vm.expectRevert(Turmoil.Expired.selector);
        t.attest(restaurant, collector, 40, deadline, _sign(restaurantKey, digest), _sign(collectorKey, digest));
    }

    // --- attack 2: inflated volume caught by mass balance -------------------

    function test_SettleSlashesShortfallBeyondTolerance() public {
        _attest(1000);
        _reseal();

        uint256 before = t.deposit(collector);
        t.settleLot(0, 800); // plant received 800L against 1000L attested

        uint256 allowed = (800 * (10_000 + 200)) / 10_000; // 816
        uint256 expected = (1000 - allowed) * PRICE;
        assertEq(before - t.deposit(collector), expected, "shortfall slashed from deposit");
    }

    function test_SettleWithinToleranceSlashesNothing() public {
        _attest(1000);
        _reseal();
        uint256 before = t.deposit(collector);
        t.settleLot(0, 990); // 1% shrinkage, inside the 2% tolerance
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

        t.flagAudit(sampled[0]);
        assertEq(t.deposit(collector), 0, "entire bond forfeited");
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
        bytes32 digest = t.batchDigest(both, both, 100, deadline);
        bytes memory sig = _sign(bothKey, digest);

        // Both signatures verify. Two roles is not two parties.
        vm.expectRevert(Turmoil.SelfDeal.selector);
        t.attest(both, both, 100, deadline, sig, sig);
    }

    // --- attack 5: an unbonded collector ------------------------------------

    function test_RevertWhen_UnderBonded() public {
        (address broke, uint256 brokeKey) = makeAddrAndKey("broke");
        t.setCollector(broke, true);

        uint256 deadline = block.timestamp + 1 hours;
        bytes32 digest = t.batchDigest(restaurant, broke, 100, deadline);

        // No bond posted: every slash in the system would cap at zero.
        vm.expectRevert(Turmoil.UnderBonded.selector);
        t.attest(restaurant, broke, 100, deadline, _sign(restaurantKey, digest), _sign(brokeKey, digest));
    }

    // --- attack 6: the collector vetoing their own audit --------------------

    function test_OwnerCanForceSealLot() public {
        _attest(1000);
        // The collector never seals, so settleLot and drawAudit can never run.
        vm.expectRevert(Turmoil.LotNotReady.selector);
        t.settleLot(0, 800);

        t.sealLotOf(collector);
        t.settleLot(0, 800);
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
        t.settleLot(0, received);
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
}
