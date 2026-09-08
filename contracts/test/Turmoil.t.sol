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

    function test_AuditFailureFinesExtrapolated() public {
        for (uint64 i; i < 10; ++i) {
            _attest(100);
        }
        _reseal();

        uint256[] memory sampled = t.drawAudit(0);
        assertEq(sampled.length, 1, "10% of 10 batches");

        uint256 before = t.deposit(collector);
        t.flagAudit(sampled[0]);

        uint256 lotValue = 1000 * PRICE;
        assertEq(before - t.deposit(collector), (lotValue * 1000) / 10_000, "fined as if 10% was fake");
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
