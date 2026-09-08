// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Turmoil} from "../src/Turmoil.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Stand-in for USDC where real testnet USDC can't be obtained. Six decimals,
///      open mint. Never deploy this anywhere that matters.
contract DemoUSDC is ERC20 {
    constructor() ERC20("Demo USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amt) external {
        _mint(to, amt);
    }
}

/// Usage:
///   anvil:   forge script script/Deploy.s.sol --tc Deploy --rpc-url localhost --broadcast
///   hedera:  SETTLEMENT_TOKEN=0x... forge script script/Deploy.s.sol --tc Deploy \
///              --rpc-url hedera_testnet --broadcast
///
/// SETTLEMENT_TOKEN is the STABLECOIN the restaurant is paid in and the collector
/// posts their deposit in - USDC on Hedera, or DemoUSDC locally. It is NOT the
/// truck share: that is a separate ERC-3643 issued through Hedera's Asset
/// Tokenization Studio, which also handles distributions to holders. Turmoil.sol
/// does not reference the truck token at all.
///
/// unset -> deploys DemoUSDC and mints the float (local / fallback demo)
/// set   -> uses the real token, e.g. USDC's ERC-20 facade on Hedera
contract Deploy is Script {
    uint256 constant PRICE_PER_LITRE = 248_000; // $0.248, 6dp — see README economics
    uint256 constant ESCROW_FLOAT = 100_000e6;

    function run() external {
        vm.startBroadcast();

        address token = vm.envOr("SETTLEMENT_TOKEN", address(0));
        if (token == address(0)) {
            DemoUSDC demo = new DemoUSDC();
            token = address(demo);
            console.log("DemoUSDC deployed  :", token);
        }

        Turmoil turmoil = new Turmoil(IERC20(token), PRICE_PER_LITRE);
        console.log("Turmoil deployed   :", address(turmoil));

        // ponytail: mint the float only for the demo token. With real USDC this is
        // a manual transfer, and the recipient must be associated with the token first.
        if (vm.envOr("SETTLEMENT_TOKEN", address(0)) == address(0)) {
            DemoUSDC(token).mint(address(turmoil), ESCROW_FLOAT);
            console.log("escrow float       :", ESCROW_FLOAT);
        }

        address restaurant = vm.envOr("RESTAURANT", address(0));
        address collector = vm.envOr("COLLECTOR", address(0));
        if (restaurant != address(0)) turmoil.setRestaurant(restaurant, true);
        if (collector != address(0)) turmoil.setCollector(collector, true);

        vm.stopBroadcast();

        // Everything the frontend needs to build a matching EIP-712 signature.
        // If any of these drift, ecrecover returns a stranger and attest() reverts.
        console.log("--- EIP-712 domain ---");
        console.log("name               : TURMOIL");
        console.log("version            : 1");
        console.log("chainId            :", block.chainid);
        console.log("verifyingContract  :", address(turmoil));
        console.log("primaryType        : Batch");
        console.log("types.Batch        : address restaurant, address collector, uint64 litres, uint256 nonce, uint256 deadline");
    }
}
