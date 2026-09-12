/**
 * The route book: names for the addresses this operator has registered.
 *
 * A driver does not know what 0x69AE… is, and asking them to type it is the
 * single worst piece of UX in this app — it was the first thing a mentor flagged.
 * So the pickup screen offers names.
 *
 * The discipline that matters: a name here is a LABEL for an address that is
 * really registered on chain, never a claim that a business exists. Entries with
 * `address: null` are unregistered and the UI must show them as such rather than
 * quietly pointing them at some other wallet — inventing counterparty identity is
 * exactly what this project accuses certificate schemes of doing.
 *
 * Names live off chain on purpose. `Turmoil.sol` knows addresses, and nothing
 * about a business name belongs in a contract that cannot verify it. In
 * production this is the operator's own customer list.
 */
export type Restaurant = {
  name: string;
  /** null = not registered on chain. */
  address: `0x${string}` | null;
  /**
   * Who can actually produce this restaurant's signature.
   *
   * "browser" — an email login owns the wallet, so an owner can sign at /sign.
   * "local"   — registered on chain, but the key lives in a terminal. It can
   *             appear in lot history and be settled from scripts; it CANNOT
   *             complete a pickup from the browser.
   *
   * This distinction exists because a dropdown that offered a local-key wallet
   * sent a driver all the way to the QR before /sign refused the signature —
   * correct behaviour, useless timing. Registered is not the same as signable.
   */
  custody?: "browser" | "local";
};

/** Only these can complete a pickup from a browser, so only these are offered. */
export function canSignInBrowser(r: Restaurant): boolean {
  return Boolean(r.address) && r.custody === "browser";
}

export const RESTAURANTS: Restaurant[] = [
  { name: "MILANGA", address: "0x69AEA2FB742080D04BA0B4a3923F70f2d39D97a9", custody: "browser" },
  // The second email login. Its owner can sign at /sign, which is what makes a
  // two-person demo possible: one human drives, a different human confirms.
  {
    name: "The Fish'n'Chips Club",
    address: "0x4ab27c1C0f12a0118BD0b72B8c53474B741B13DD",
    custody: "browser",
  },
  // Registered on chain, but its key is a local cast wallet from the first
  // enforcement run. It keeps its name in lot history and stays out of the
  // pickup dropdown.
  {
    name: "La Pomme Fritte",
    address: "0x936D3c5cDBf5E233aAD32c3097cdBE0833c46424",
    custody: "local",
  },
  { name: "Montevideo Fried Chicken", address: null },
  { name: "The Happy Meal", address: null },
];

/** The label for an address, when we have one. Falls back to shortened hex. */
export function nameFor(address: string): string | null {
  const hit = RESTAURANTS.find((r) => r.address?.toLowerCase() === address.toLowerCase());
  return hit ? hit.name : null;
}

/** What to print for an address: its name if known, otherwise readable hex. */
export function labelFor(address: string): string {
  return nameFor(address) ?? `${address.slice(0, 10)}…${address.slice(-6)}`;
}

/** The route-book entry for an address, if it has one. */
export function restaurantFor(address: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.address?.toLowerCase() === address.toLowerCase());
}
