import { NextResponse } from "next/server";
import { createRemoteJWKSet } from "jose";
import { PrivyClient, verifyAccessToken } from "@privy-io/node";
import { isAddress } from "viem";
import { BATCH_TYPES, CHAIN_ID, EIP712_DOMAIN, TURMOIL_ADDRESS } from "@/lib/turmoil";

/**
 * The collector's signature, produced by the company wallet rather than by the
 * driver's own key.
 *
 * Why this exists. A pickup needs two signatures from two distinct registered
 * parties. The restaurant signs with its own embedded wallet — that is the whole
 * point of the design and it does not change. The *collector* is TURMOIL, a
 * company, and a company's signing key does not belong on a driver's phone: the
 * driver changes, the key does not, and a lost phone would otherwise mean a lost
 * collector identity and a bond nobody can post against.
 *
 * So the company keeps one Privy server wallet, bound by a Privy policy that
 * allows exactly three things:
 *
 *   1. sign Batch typed data, but only for the TURMOIL domain on chain 296
 *   2. send transactions to Turmoil.sol
 *   3. approve() on the settlement token, but only with Turmoil.sol as spender
 *
 * Everything else is denied — proven, not assumed: a Batch for a different
 * verifyingContract, an HBAR transfer to any other address, and a transfer() of
 * the wallet's own USDC all come back `policy_violation`. A leaked copy of this
 * server's credentials therefore steals nothing; the worst it can do is sign
 * pickups that still need a restaurant's independent signature to be worth
 * anything, and which the mass balance at the plant still has to survive.
 *
 * The driver's part is authorisation, not custody: they authenticate with Privy,
 * the server checks they are on the operator's driver list, and only then asks
 * the company wallet to sign. The driver never holds the key they are using.
 */

/* @privy-io/node uses node APIs; do not let this route be moved to edge. */
export const runtime = "nodejs";

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const APP_SECRET = process.env.PRIVY_APP_SECRET;
const WALLET_ID = process.env.PRIVY_WALLET_ID;
const COLLECTOR = process.env.PRIVY_COLLECTOR_ADDRESS;

/**
 * Emails allowed to trigger a company signature, comma separated.
 *
 * Unset means nobody, deliberately. An empty allowlist that defaulted to "any
 * authenticated user" would mean a missing environment variable silently turns
 * the company wallet into a public signing service — the failure would look like
 * everything working. Adding a driver is a config change and a redeploy, which
 * is honest for a hackathon build and is stated as such in the README rather
 * than dressed up as user management.
 */
const DRIVERS = (process.env.DRIVERS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Privy's public key set for this app. Fetched rather than pasted: the
 * dashboard also offers a verification key to copy into an env var, and that is
 * one more value to forget on a deploy. createRemoteJWKSet caches internally, so
 * this is not a fetch per request.
 */
const jwks = APP_ID
  ? createRemoteJWKSet(new URL(`https://auth.privy.io/api/v1/apps/${APP_ID}/jwks.json`))
  : null;

const privy =
  APP_ID && APP_SECRET ? new PrivyClient({ appId: APP_ID, appSecret: APP_SECRET }) : null;

/**
 * Allowlisted emails resolved to Privy user ids, once per server instance.
 *
 * Resolving email -> id (rather than reading the caller's email off their user
 * object) keeps this independent of the user object's shape, and means the
 * comparison is against the one field the verified token actually asserts:
 * user_id. A token cannot lie about that without breaking the signature.
 */
let driverIds: Set<string> | null = null;

async function allowedDriverIds(): Promise<Set<string>> {
  if (driverIds) return driverIds;
  const ids = new Set<string>();
  for (const address of DRIVERS) {
    try {
      /* users() is a method on PrivyClient, not a property — it returns the
         service that carries the lookups. */
      const user = await privy!.users().getByEmailAddress({ address });
      if (user?.id) ids.add(user.id);
    } catch {
      /* An email on the list that has never logged in has no user yet. That is
         not an error worth failing the request over — it simply is not a match
         until they sign in for the first time. */
    }
  }
  driverIds = ids;
  return ids;
}

export async function POST(req: Request) {
  if (!APP_ID || !APP_SECRET || !WALLET_ID || !COLLECTOR || !privy || !jwks) {
    return NextResponse.json(
      { error: "Collector signing is not configured on this deployment." },
      { status: 500 }
    );
  }
  if (DRIVERS.length === 0) {
    return NextResponse.json(
      { error: "No drivers are authorised on this deployment." },
      { status: 503 }
    );
  }

  /* 1. Who is asking. */
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Sign in as a driver first." }, { status: 401 });
  }

  let userId: string;
  try {
    const claims = await verifyAccessToken({
      access_token: token,
      app_id: APP_ID,
      verification_key: jwks,
    });
    userId = claims.user_id;
  } catch {
    return NextResponse.json({ error: "Session expired — sign in again." }, { status: 401 });
  }

  /* 2. Are they a driver this operator authorised. */
  const ids = await allowedDriverIds();
  if (!ids.has(userId)) {
    return NextResponse.json(
      { error: "Not an authorised driver — ask the operator to add this account." },
      { status: 403 }
    );
  }

  /* 3. Is the batch well formed. The policy independently refuses anything that
     is not a TURMOIL Batch, so this is about giving a driver a readable error
     rather than a policy_violation they cannot act on. */
  let body: { restaurant?: string; litres?: number | string; ref?: string; deadline?: number | string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { restaurant, litres, ref, deadline } = body;
  if (!restaurant || !isAddress(restaurant)) {
    return NextResponse.json({ error: "That is not a valid restaurant address." }, { status: 400 });
  }
  if (restaurant.toLowerCase() === COLLECTOR.toLowerCase()) {
    /* attest() reverts SelfDeal on this; catching it here saves a round trip. */
    return NextResponse.json(
      { error: "Restaurant and collector cannot be the same account." },
      { status: 400 }
    );
  }
  const litresNum = Number(litres);
  if (!Number.isInteger(litresNum) || litresNum <= 0 || litresNum > 1_000_000) {
    return NextResponse.json({ error: "Litres must be a whole number above zero." }, { status: 400 });
  }
  if (typeof ref !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(ref)) {
    return NextResponse.json({ error: "Malformed batch reference." }, { status: 400 });
  }
  const deadlineNum = Number(deadline);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(deadlineNum) || deadlineNum <= now || deadlineNum > now + 24 * 60 * 60) {
    /* A signature good for a day is a signature someone can hold. */
    return NextResponse.json({ error: "Deadline must be in the next 24 hours." }, { status: 400 });
  }

  /* 4. Ask the company wallet. Values are strings: JSON has no bigint, and
     eth_signTypedData_v4 expects decimal strings for the uint fields. */
  const typedData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      ...BATCH_TYPES,
    },
    domain: EIP712_DOMAIN,
    message: {
      restaurant,
      collector: COLLECTOR,
      litres: String(litresNum),
      ref,
      deadline: String(deadlineNum),
    },
    primary_type: "Batch",
  };

  try {
    const res = await fetch(`https://api.privy.io/v1/wallets/${WALLET_ID}/rpc`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${APP_ID}:${APP_SECRET}`).toString("base64"),
        "privy-app-id": APP_ID,
        "content-type": "application/json",
      },
      body: JSON.stringify({ method: "eth_signTypedData_v4", params: { typed_data: typedData } }),
    });
    const json = await res.json();

    if (!res.ok || !json?.data?.signature) {
      /* A policy refusal is the system working, so it reads as a rule rather
         than as a failure. Anything else keeps Privy's own words. */
      const denied = json?.code === "policy_violation";
      return NextResponse.json(
        {
          error: denied
            ? "The company wallet refused to sign this: it is outside the collector policy."
            : (json?.error ?? "The company wallet could not sign this pickup."),
        },
        { status: denied ? 403 : 502 }
      );
    }

    return NextResponse.json({
      collector: COLLECTOR,
      signature: json.data.signature as `0x${string}`,
      chainId: CHAIN_ID,
      verifyingContract: TURMOIL_ADDRESS,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Signing failed." },
      { status: 502 }
    );
  }
}
