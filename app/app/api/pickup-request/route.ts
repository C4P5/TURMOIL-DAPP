import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { publicClient } from "@/lib/publicClient";
import { TURMOIL_ABI, TURMOIL_ADDRESS } from "@/lib/turmoil";
import { isDenied, ownsWallet, requireDriver, requireUser } from "@/lib/auth";

/**
 * Pickup requests: the step the product was missing.
 *
 * The flow used to begin with a driver deciding to visit someone, which is
 * backwards. In the real trade the business calls when the drum is full, so the
 * restaurant asks and the truck answers.
 *
 * A request carries no money and no signature. It is an intent to be visited,
 * and it is deliberately off chain: nothing about "please come on Tuesday"
 * belongs in a contract that settles litres. The pickup itself is unchanged,
 * two signatures or it never happened.
 *
 * WHO MAY DO WHAT, after a review found this wide open:
 *
 *   POST    a verified session, for its OWN address, already registered on
 *           chain. Taking the address off the body let anyone queue a truck to
 *           any registered business.
 *   GET     drivers only. The queue names which businesses have oil waiting,
 *           which is the route list a collector treats as commercial in
 *           confidence. It has no business being public.
 *   DELETE  drivers only. It used to accept any session at all, so a fresh
 *           email signup could read the ids from GET and empty the driver's
 *           screen mid-demo.
 *
 * KNOWN LIMIT, stated rather than hidden: storage is a module-scope Map. It
 * survives a page reload, dies with the server process, and is not shared
 * between serverless instances, so on a multi-instance deployment a driver may
 * read an empty queue that a restaurant just filled. A real deployment puts
 * this in the operator's database.
 */

export const runtime = "nodejs";

type PickupRequest = {
  id: string;
  restaurant: `0x${string}`;
  litres: number;
  at: number;
};

const REQUESTS = new Map<string, PickupRequest>();

/** The driver's queue. */
export async function GET(req: Request) {
  const who = await requireDriver(req);
  if (isDenied(who)) {
    return NextResponse.json({ error: who.error }, { status: who.status });
  }
  const open = [...REQUESTS.values()].sort((a, b) => a.at - b.at);
  return NextResponse.json({ requests: open });
}

export async function POST(req: Request) {
  const who = await requireUser(req);
  if (isDenied(who)) {
    return NextResponse.json({ error: who.error }, { status: who.status });
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

  /* Your own oil only. Otherwise a stranger can send a truck to a competitor. */
  if (!(await ownsWallet(who.userId, restaurant))) {
    return NextResponse.json(
      { error: "You can only request a pickup for the wallet you signed in with." },
      { status: 403 },
    );
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
    return NextResponse.json({ error: "This restaurant is not registered yet." }, { status: 403 });
  }

  /* One open request per restaurant: asking twice means "still waiting", not
     "send two trucks". */
  const existing = [...REQUESTS.values()].find(
    (r) => r.restaurant.toLowerCase() === restaurant.toLowerCase(),
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
  const who = await requireDriver(req);
  if (isDenied(who)) {
    return NextResponse.json({ error: who.error }, { status: who.status });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  REQUESTS.delete(id);
  return NextResponse.json({ ok: true });
}
