import { createRemoteJWKSet } from "jose";
import { PrivyClient, verifyAccessToken } from "@privy-io/node";

/**
 * Who is asking, and are they allowed to ask for this.
 *
 * Three routes hand-rolled the same twelve-line preamble, and two of them got
 * the authorization half wrong in different ways: onboard checked that someone
 * was signed in but never that they owned the address they were registering,
 * and pickup-request's DELETE accepted any session at all. One owner for the
 * concept keeps the next route from inventing a third variant.
 *
 * The distinction that matters:
 *
 *   requireUser     any verified Privy session. Use where the caller acts on
 *                   their own behalf, and CHECK the thing they are acting on
 *                   belongs to them.
 *   requireDriver   a verified session whose email the operator put in DRIVERS.
 *                   Use for anything that spends the company's authority.
 *   ownsWallet      binds a session to an address, so a route can stop trusting
 *                   an address off the request body.
 */

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const APP_SECRET = process.env.PRIVY_APP_SECRET;

/**
 * Privy's public keys for this app. Fetched rather than pasted from the
 * dashboard: that is one less value to forget on a deploy, and
 * createRemoteJWKSet caches, so this is not a fetch per request.
 */
const jwks = APP_ID
  ? createRemoteJWKSet(new URL(`https://auth.privy.io/api/v1/apps/${APP_ID}/jwks.json`))
  : null;

const privy = APP_ID && APP_SECRET ? new PrivyClient({ appId: APP_ID, appSecret: APP_SECRET }) : null;

/**
 * Emails allowed to spend the company's authority, comma separated.
 *
 * Unset means nobody, deliberately. An empty list defaulting to "any
 * authenticated user" would let a missing environment variable quietly turn the
 * company wallet into a public signing service, and the failure would look
 * exactly like everything working.
 */
const DRIVERS = (process.env.DRIVERS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export type AuthResult = { userId: string } | { error: string; status: number };

export function isDenied(r: AuthResult): r is { error: string; status: number } {
  return "error" in r;
}

export function isConfigured(): boolean {
  return Boolean(APP_ID && APP_SECRET && jwks && privy);
}

/** The verified Privy user behind this request, or the reason there isn't one. */
export async function requireUser(req: Request): Promise<AuthResult> {
  if (!APP_ID || !jwks) return { error: "Authentication is not configured.", status: 500 };

  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return { error: "Sign in first.", status: 401 };

  try {
    /* verifyAccessToken pins ES256, the privy.io issuer and this app as the
       audience, and jwtVerify enforces expiry. A token minted for another Privy
       app does not pass. */
    const claims = await verifyAccessToken({
      access_token: token,
      app_id: APP_ID,
      verification_key: jwks,
    });
    return { userId: claims.user_id };
  } catch {
    return { error: "Session expired — sign in again.", status: 401 };
  }
}

/**
 * Allowlisted driver ids, resolved once per server instance.
 *
 * Resolving email to id keeps this independent of the user object's shape, and
 * compares against the one field a verified token actually asserts.
 *
 * Only a COMPLETE answer is memoised. Swallowing a lookup failure and caching
 * the partial set meant one transient Privy hiccup on a cold instance dropped a
 * real driver for the life of that instance, and every later attempt returned
 * "not an authorised driver" — which sends you editing DRIVERS and redeploying
 * for what was a network blip.
 */
let driverIds: Set<string> | null = null;

async function allowedDriverIds(): Promise<Set<string>> {
  if (driverIds) return driverIds;

  const ids = new Set<string>();
  let incomplete = false;
  for (const address of DRIVERS) {
    try {
      const user = await privy!.users().getByEmailAddress({ address });
      if (user?.id) ids.add(user.id);
      else incomplete = true; // on the list but has never signed in
    } catch {
      incomplete = true;
    }
  }
  if (!incomplete) driverIds = ids;
  return ids;
}

/** A verified session that the operator authorised to act for the company. */
export async function requireDriver(req: Request): Promise<AuthResult> {
  if (!isConfigured()) return { error: "Authentication is not configured.", status: 500 };
  if (DRIVERS.length === 0) {
    return { error: "No drivers are authorised on this deployment.", status: 503 };
  }

  const who = await requireUser(req);
  if (isDenied(who)) return who;

  const ids = await allowedDriverIds();
  if (!ids.has(who.userId)) {
    return { error: "Not an authorised driver — ask the operator to add this account.", status: 403 };
  }
  return who;
}

/**
 * Does this session own this address?
 *
 * Without it, a route that takes an address from the request body will happily
 * act on any address a stranger names. Privy resolves an address to the user it
 * belongs to, so the comparison is against the token's own subject.
 */
export async function ownsWallet(userId: string, address: string): Promise<boolean> {
  if (!privy) return false;
  try {
    const owner = await privy.users().getByWalletAddress({ address });
    return Boolean(owner?.id) && owner.id === userId;
  } catch {
    /* Not found, or Privy is unreachable. Either way we cannot prove ownership,
       and an unprovable claim is a denied one. */
    return false;
  }
}
