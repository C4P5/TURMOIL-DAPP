import { defineChain } from "viem";

/**
 * Hedera testnet, defined by hand rather than imported so we own the RPC.
 *
 * Hedera accounts are ECDSA secp256k1 — the same curve Ethereum uses — which is
 * the whole reason a Privy embedded wallet can produce a signature that
 * ecrecover resolves inside a Hedera contract.
 *
 * Lives outside providers.tsx so server components and route handlers can import
 * it without dragging in "use client".
 */
export const hederaTestnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 296),
  name: "Hedera Testnet",
  nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_HEDERA_RPC ?? "https://testnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: { name: "HashScan", url: "https://hashscan.io/testnet" },
  },
  testnet: true,
});
