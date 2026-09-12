import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { BATCH_TYPES, CHAIN_ID, EIP712_DOMAIN, TURMOIL_ADDRESS } from "@/lib/turmoil";
import { isDenied, requireDriver } from "@/lib/auth";

/**
 * The collector's signature, produced by the company wallet rather than by the
 * driver's own key.
 *
 * Why this exists. A pickup needs two signatures from two distinct registered
 * parties. The restaurant signs with its own embedded wallet, which is the
 * point of the design and does not change. The collector is TURMOIL, a company,
 * and a company's signing key does not belong on a driver's phone: the driver
 * changes, the key does not, and a lost phone would otherwise mean a lost
 * collector identity and a bond nobody can post against.
 *
 * So the company keeps one Privy server wallet, bound by a Privy policy that
 * allows exactly three things:
 *
 *   1. sign Batch typed data, but only for the TURMOIL domain on chain 296
 *   2. send transactions to Turmoil.sol
 *   3. approve() on the settlement token, but only with Turmoil.sol as spender
 *
 * Everything else is denied, proven rather than assumed: a Batch for a
 * different verifyingContract, an HBAR transfer to any other address, and a
 * transfer() of the wallet's own USDC all come back policy_violation. A leaked
 * copy of this server's credentials therefore steals nothing. The worst it can
 * do is sign pickups that still need a restaurant's independent signature and
 * still have to survive the mass balance at the plant.
 *
 * The driver's part is authorisation, not custody: they authenticate with
 * Privy, the operator's driver list is checked in lib/auth, and only then does
 * the company wallet sign. The driver never holds the key they are using.
 */

export const runtime = "nodejs";

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const APP_SECRET = process.env.PRIVY_APP_SECRET;
const WALLET_ID = process.env.PRIVY_WALLET_ID;
const COLLECTOR = process.env.PRIVY_COLLECTOR_ADDRESS;

export async function POST(req: Request) {
  if (!APP_ID || !APP_SECRET || !WALLET_ID || !COLLECTOR) {
    return NextResponse.json(
      { error: "Collector signing is not configured on this deployment." },
      { status: 500 },
    );
  }

  const who = await requireDriver(req);
  if (isDenied(who)) {
    return NextResponse.json({ error: who.error }, { status: who.status });
  }

  /* Is the batch well formed. The policy independently refuses anything that is
     not a TURMOIL Batch, so this is about giving a driver a readable error
     rather than a policy_violation they cannot act on. */
  let body: {
    restaurant?: string;
    litres?: number | string;
    ref?: string;
    deadline?: number | string;
  };
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
      { status: 400 },
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

  /* Ask the company wallet. Values are strings: JSON has no bigint, and
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
        { status: denied ? 403 : 502 },
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
      { status: 502 },
    );
  }
}
