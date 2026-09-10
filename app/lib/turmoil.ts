/**
 * The single source of truth the frontend shares with the contract.
 *
 * If any value in EIP712_DOMAIN or BATCH_TYPES drifts from what Turmoil.sol
 * computes, ecrecover returns a stranger and attest() reverts with BadSignature.
 * `forge script script/Deploy.s.sol --tc Deploy` prints these on every deploy —
 * copy them from there rather than editing by hand.
 */

/**
 * Fail loudly. Defaulting to the zero address binds it into the EIP-712 domain's
 * verifyingContract, so every signature the app produces recovers to a stranger
 * and attest() reverts with BadSignature — indistinguishable from forgery, with
 * no diagnostic anywhere. A missing env var on a deploy should break the build,
 * not the demo.
 */
const address = process.env.NEXT_PUBLIC_TURMOIL_ADDRESS;
if (address && !/^0x[0-9a-fA-F]{40}$/.test(address)) {
  throw new Error(`NEXT_PUBLIC_TURMOIL_ADDRESS is not an address: ${address}`);
}

export const TURMOIL_ADDRESS = (address ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

/** True when the app is pointed at a real deployment. Screens should say so if not. */
export const IS_CONFIGURED = Boolean(address);

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 296); // Hedera testnet

export const EIP712_DOMAIN = {
  name: "TURMOIL",
  version: "1",
  chainId: CHAIN_ID,
  verifyingContract: TURMOIL_ADDRESS,
} as const;

/** Must match BATCH_TYPEHASH in Turmoil.sol, field for field, in order. */
export const BATCH_TYPES = {
  Batch: [
    { name: "restaurant", type: "address" },
    { name: "collector", type: "address" },
    { name: "litres", type: "uint64" },
    { name: "ref", type: "bytes32" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export type BatchMessage = {
  restaurant: `0x${string}`;
  collector: `0x${string}`;
  litres: bigint;
  ref: `0x${string}`;
  deadline: bigint;
};

/**
 * A pickup's unique reference. Replaces a per-restaurant nonce, which had to be
 * read from chain when the QR was built and could only ever have one unredeemed
 * signature outstanding — so two trucks at one restaurant on the same morning
 * bricked the second QR. This needs no round trip and no ordering.
 */
export function newRef(): `0x${string}` {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/** Only the functions the app actually calls. ponytail: no need to ship the full ABI. */
export const TURMOIL_ABI = [
  {
    type: "function",
    name: "attest",
    stateMutability: "nonpayable",
    inputs: [
      { name: "restaurant", type: "address" },
      { name: "collector", type: "address" },
      { name: "litres", type: "uint64" },
      { name: "ref", type: "bytes32" },
      { name: "deadline", type: "uint256" },
      { name: "sigRestaurant", type: "bytes" },
      { name: "sigCollector", type: "bytes" },
    ],
    outputs: [{ name: "batchId", type: "uint256" }],
  },
  {
    type: "function",
    name: "pricePerLitre",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "batches",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "restaurant", type: "address" },
      { name: "collector", type: "address" },
      { name: "litres", type: "uint64" },
      { name: "lotId", type: "uint64" },
      { name: "audited", type: "bool" },
      { name: "failed", type: "bool" },
      { name: "confirmed", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "lotBatches",
    stateMutability: "view",
    inputs: [{ name: "lotId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "lots",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "collector", type: "address" },
      { name: "attestedLitres", type: "uint64" },
      { name: "receivedLitres", type: "uint64" },
      { name: "plant", type: "address" },
      { name: "drawnAt", type: "uint64" },
      { name: "isSealed", type: "bool" },
      { name: "settled", type: "bool" },
      { name: "drawn", type: "bool" },
      { name: "seed", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "toleranceBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint16" }],
  },
  {
    type: "function",
    name: "batchCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Read the settlement token from the contract instead of hardcoding it. payToken
  // is immutable but not universal: this deployment settles in DemoUSDC and the
  // previous one in Circle's USDC. Asking the contract is what makes the restaurant
  // view correct on both without an env var to forget.
  {
    type: "function",
    name: "payToken",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  // The errors attest() can revert with. viem can only name a revert it can find
  // in the ABI: without these, a failed pickup shows the restaurant owner a raw
  // selector like 0x983d6bdc — which is exactly what it did on Hedera testnet.
  { type: "error", name: "Expired", inputs: [] },
  { type: "error", name: "NotRegistered", inputs: [] },
  { type: "error", name: "SelfDeal", inputs: [] },
  { type: "error", name: "BadSignature", inputs: [] },
  { type: "error", name: "UnderBonded", inputs: [] },
] as const;

/**
 * Only what the restaurant view needs from the settlement token. ponytail: three
 * entries, not a full ERC-20 ABI — nothing here mints, approves or burns.
 */
export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

/** USDC is 6 decimals. Formatting it as 18 is how demos show someone $0.000000000048. */
export const PAY_DECIMALS = 6;

export function formatUsdc(amount: bigint): string {
  const whole = amount / 10n ** BigInt(PAY_DECIMALS);
  const frac = amount % 10n ** BigInt(PAY_DECIMALS);
  return `${whole}.${frac.toString().padStart(PAY_DECIMALS, "0").slice(0, 2)}`;
}
