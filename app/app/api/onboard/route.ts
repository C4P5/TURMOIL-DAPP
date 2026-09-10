import { NextResponse } from "next/server";
import { createWalletClient, http, isAddress, parseEther, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hederaTestnet } from "@/lib/chain";
import { TURMOIL_ABI, TURMOIL_ADDRESS } from "@/lib/turmoil";

/**
 * Onboards a restaurant: registers it, and gives its wallet enough HBAR to move
 * its own money later.
 *
 * Why the HBAR matters. Signing a pickup is gasless — that is the whole UX claim
 * and it holds. But *withdrawing* is an ordinary token transfer the restaurant
 * pays for, and an email-login wallet starts with nothing. Without this step a
 * restaurant can be paid and then be unable to touch what it earned, which is a
 * worse failure than not being paid at all.
 *
 * It is also what materialises the account. A Privy wallet is an EVM address
 * with no Hedera account behind it until something arrives; the first transfer
 * creates it, with unlimited auto-association (HIP-904), which is why the
 * restaurant never signs a token association either.
 *
 * ponytail: one HBAR, once, from the collector. Cents to keep a customer who
 * would otherwise have to buy crypto to get paid. No oracle, no contract change,
 * and nothing added to attest() that could make a pickup fail.
 *
 * Idempotent by construction: it reads before it writes, so calling it twice
 * costs one read and nothing else.
 */

/** Enough for many withdrawals. A transfer costs a small fraction of this. */
const GRANT = parseEther("1");

/** Below this we assume the wallet cannot pay for a transfer. */
const FLOOR = parseEther("0.1");

export async function POST(req: Request) {
  const key = process.env.RELAYER_PRIVATE_KEY as `0x${string}` | undefined;
  if (!key) {
    return NextResponse.json({ error: "RELAYER_PRIVATE_KEY unset" }, { status: 500 });
  }

  try {
    const { restaurant } = await req.json();
    if (!restaurant || !isAddress(restaurant)) {
      return NextResponse.json({ error: "Not a valid address" }, { status: 400 });
    }
    const who = restaurant as `0x${string}`;

    const client = createWalletClient({
      account: privateKeyToAccount(key),
      chain: hederaTestnet,
      transport: http(),
    }).extend(publicActions);

    const [already, balance] = await Promise.all([
      client.readContract({
        address: TURMOIL_ADDRESS,
        abi: TURMOIL_ABI,
        functionName: "isRestaurant",
        args: [who],
      }) as Promise<boolean>,
      client.getBalance({ address: who }),
    ]);

    let registerTx: string | null = null;
    let fundTx: string | null = null;

    // setRestaurant is owner-only. In this demo the relayer key is also the owner;
    // in production these are different keys and this route would hold neither —
    // the collector would call it from their own device.
    if (!already) {
      registerTx = await client.writeContract({
        address: TURMOIL_ADDRESS,
        abi: TURMOIL_ABI,
        functionName: "setRestaurant",
        args: [who, true],
      });
      await client.waitForTransactionReceipt({ hash: registerTx as `0x${string}` });
    }

    if (balance < FLOOR) {
      fundTx = await client.sendTransaction({ to: who, value: GRANT });
    }

    return NextResponse.json({
      restaurant: who,
      registered: already ? "already" : "now",
      funded: balance < FLOOR ? "now" : "already",
      registerTx,
      fundTx,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
