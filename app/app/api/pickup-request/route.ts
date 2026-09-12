import { NextResponse } from "next/server";
import { createRemoteJWKSet } from "jose";
import { verifyAccessToken } from "@privy-io/node";
import { isAddress } from "viem";
import { publicClient } from "@/lib/publicClient";
import { TURMOIL_ABI, TURMOIL_ADDRESS } from "@/lib/turmoil";

/**
 * Pickup requests — the step the product was missing.
 *
 * Until now the flow began with a driver deciding to visit someone, which is
 * backwards: in the real trade the business calls when the drum is full. The
 * restaurant asks, the truck answers. That ordering also matters for the pitch,
 * because it is what makes this a service a restaurant wants rather than an
 * obligation a collector imposes.
 *
 * A request carries no money and no signature. It is an intent to be visited,
 * and it is deliberately OFF chain: nothing about "please come on Tuesday"
 * belongs in a contract that settles litres, and Turmoil.sol is frozen anyway.
 * The pickup itself is unchanged — two signatures, or it never happened.
 *
 * KNOWN LIMITS, stated rather than hidden:
 *   · Storage is a module-scope Map. It survives a page reload and dies with the
 *     server process, and on serverless it will not be shared between instances.
 *     A real deployment puts this in the operator's own database.
 *   · The caller must hold a valid Privy session and name a restaurant that is
 *     registered on chain, but we do not prove the session OWNS that address —
 *     so an authenticated stranger could ask for a truck to visit a registered
 *     restaurant. The cost of that is a wasted journey, not a payment, and the
 *     pickup still requires that restaurant's own signature to be worth
 *     anything. Binding session to wallet is the obvious next step.
 */

export const runtime = "nodejs";

type PickupRequest = {
  id: string;
  restaurant: `0x${string}`;
  litres: number;
  at: number;
};

const REQUESTS = new Map<string, PickupRequest>();

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const jwks = APP_ID
  ? createRemoteJWKSet(new URL(`https://auth.privy.io/api/v1/apps/${APP_ID}/jwks.json`))
  : null;

async function caller(req: Request): Promise<string | null> {
  if (!APP_ID || !jwks) return null;
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const claims = await verifyAccessToken({
      access_token: token,
      app_id: APP_ID,
      verification_key: jwks,
    });
    return claims.user_id;
  } catch {
    return null;
  }
}

/** The driver's queue. Open to read: it holds no secrets, only "come and collect". */
export async function GET() {
  const open = [...REQUESTS.values()].sort((a, b) => a.at - b.at);
  return NextResponse.json({ requests: open });
}

export async function POST(req: Request) {
  if (!(await caller(req))) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  let body: { restaurant?: string; litres?: number | string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { restaurant, litres } = body;
  if (!restaurant || !isAddress(restaurant)) {
    return NextResponse.json({ error: "That is not a valid address." }, { status: 400 });
  }
  const litresNum = Number(litres);
  if (!Number.isInteger(litresNum) || litresNum <= 0 || litresNum > 100_000) {
    return NextResponse.json({ error: "Litres must be a whole number above zero." }, { status: 400 });
  }

  /* Registered on chain, or the driver would be sent to someone attest() will
     refuse anyway. Cheaper to find out now than at the QR. */
  const registered = (await publicClient.readContract({
    address: TURMOIL_ADDRESS,
    abi: TURMOIL_ABI,
    functionName: "isRestaurant",
    args: [restaurant as `0x${string}`],
  })) as boolean;
  if (!registered) {
    return NextResponse.json(
      { error: "This restaurant is not registered yet." },
      { status: 403 }
    );
  }

  /* One open request per restaurant: asking twice means "still waiting", not
     "send two trucks". */
  const existing = [...REQUESTS.values()].find(
    (r) => r.restaurant.toLowerCase() === restaurant.toLowerCase()
  );
  if (existing) {
    existing.litres = litresNum;
    existing.at = Date.now();
    return NextResponse.json({ request: existing, updated: true });
  }

  const request: PickupRequest = {
    id: crypto.randomUUID(),
    restaurant: restaurant as `0x${string}`,
    litres: litresNum,
    at: Date.now(),
  };
  REQUESTS.set(request.id, request);
  return NextResponse.json({ request, updated: false });
}

/** The driver clears it once the pickup is signed. */
export async function DELETE(req: Request) {
  if (!(await caller(req))) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  REQUESTS.delete(id);
  return NextResponse.json({ ok: true });
}
