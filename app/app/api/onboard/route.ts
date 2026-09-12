import { NextResponse } from "next/server";
import { createWalletClient, http, isAddress, parseEther, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hederaTestnet } from "@/lib/chain";
import { TURMOIL_ABI, TURMOIL_ADDRESS } from "@/lib/turmoil";
import { isDenied, ownsWallet, requireUser } from "@/lib/auth";

/**
 * Onboards a restaurant: registers it, and gives its wallet enough HBAR to move
 * its own money later.
 *
 * Why the HBAR matters. Signing a pickup is gasless, which is the whole UX
 * claim and it holds. Withdrawing is an ordinary token transfer the restaurant
 * pays for, and an email-login wallet starts with nothing, so without this step
 * a restaurant can be paid and then be unable to touch what it earned.
 *
 * It is also what materialises the account. A Privy wallet is an EVM address
 * with no Hedera account behind it until something arrives; the first transfer
 * creates it with unlimited auto-association (HIP-904), which is why the
 * restaurant never signs a token association either.
 *
 * ponytail: half an HBAR, once, from the collector. Cents to keep a customer
 * who would otherwise have to buy crypto to get paid.
 *
 * SECURITY. setRestaurant is onlyOwner, so this route signs with the owner key,
 * which makes it the most dangerous endpoint in the app. Two checks bound it:
 *
 *   1. A verified Privy session, AND that session must own the address being
 *      registered. Checking only "is someone signed in" was the defect a review
 *      caught: signup is open email OTP, so it raised the bar from curl to curl
 *      plus thirty seconds, and the owner key would still have registered any
 *      address a stranger named, forever, on a frozen verified contract.
 *   2. A relayer balance floor on BOTH writes. The earlier version guarded only
 *      the HBAR grant, so registrations could still drain gas from the key that
 *      also relays every pickup. A dry relayer during judging is a dead demo.
 *
 * Idempotent by construction: it reads before it writes, so calling it twice
 * costs one read and nothing else.
 */

/* @privy-io/node and viem both want node APIs. Do not let this move to edge. */
export const runtime = "nodejs";

/** Enough for many withdrawals. A transfer costs a small fraction of this. */
const GRANT = parseEther("0.5");

/** Below this we assume the wallet cannot pay for a transfer. */
const FLOOR = parseEther("0.1");

/** The relayer stops giving, and stops writing, before it stops working. */
const RELAYER_FLOOR = parseEther("200");

export async function POST(req: Request) {
  const who = await requireUser(req);
  if (isDenied(who)) {
    return NextResponse.json({ error: who.error }, { status: who.status });
  }

  const key = process.env.RELAYER_PRIVATE_KEY as `0x${string}` | undefined;
  if (!key) {
    return NextResponse.json({ error: "RELAYER_PRIVATE_KEY unset" }, { status: 500 });
  }

  try {
    const { restaurant } = await req.json();
    if (!restaurant || !isAddress(restaurant)) {
      return NextResponse.json({ error: "Not a valid address" }, { status: 400 });
    }
    const target = restaurant as `0x${string}`;

    /* The address is the caller's own or nothing happens. This is what turns a
       client-supplied field into a server-derived one. */
    if (!(await ownsWallet(who.userId, target))) {
      return NextResponse.json(
        { error: "You can only register the wallet you signed in with." },
        { status: 403 },
      );
    }

    const account = privateKeyToAccount(key);
    const client = createWalletClient({
      account,
      chain: hederaTestnet,
      transport: http(),
    }).extend(publicActions);

    const [already, balance, relayerBalance] = await Promise.all([
      client.readContract({
        address: TURMOIL_ADDRESS,
        abi: TURMOIL_ABI,
        functionName: "isRestaurant",
        args: [target],
      }) as Promise<boolean>,
      client.getBalance({ address: target }),
      client.getBalance({ address: account.address }),
    ]);

    /* Both writes are gated, not just the grant: registering also costs gas from
       the key that relays pickups. */
    if (relayerBalance < RELAYER_FLOOR && !already) {
      return NextResponse.json(
        { error: "The operator's relayer is low on HBAR. Ask them to top it up." },
        { status: 503 },
      );
    }

    let registerTx: string | null = null;
    let fundTx: string | null = null;

    if (!already) {
      registerTx = await client.writeContract({
        address: TURMOIL_ADDRESS,
        abi: TURMOIL_ABI,
        functionName: "setRestaurant",
        args: [target, true],
      });
      await client.waitForTransactionReceipt({ hash: registerTx as `0x${string}` });
    }

    /* Registration is the half that matters and has already happened. Funding is
       a convenience, so it is the half withheld when the relayer runs low. */
    const needsFunding = balance < FLOOR;
    const canFund = relayerBalance >= RELAYER_FLOOR;
    if (needsFunding && canFund) {
      fundTx = await client.sendTransaction({ to: target, value: GRANT });
    }

    return NextResponse.json({
      restaurant: target,
      registered: already ? "already" : "now",
      funded: !needsFunding ? "already" : canFund ? "now" : "held",
      ...(needsFunding && !canFund
        ? { note: "Relayer is low on HBAR — registered, but not funded. Top it up." }
        : {}),
      registerTx,
      fundTx,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
