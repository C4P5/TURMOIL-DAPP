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
 * ponytail: half an HBAR, once, from the collector. Cents to keep a customer who
 * would otherwise have to buy crypto to get paid. No oracle, no contract change,
 * and nothing added to attest() that could make a pickup fail.
 *
 * Idempotent by construction: it reads before it writes, so calling it twice
 * costs one read and nothing else.
 */

/** Enough for many withdrawals. A transfer costs a small fraction of this. */
const GRANT = parseEther("0.5");

/** Below this we assume the wallet cannot pay for a transfer. */
const FLOOR = parseEther("0.1");

/**
 * The relayer stops giving before it stops working.
 *
 * This route is unauthenticated: anyone who can reach it can ask for HBAR, and
 * the only thing bounding that is the recipient's own balance check — so fresh
 * addresses could drain the relayer one grant at a time. Testnet HBAR is not
 * money, but a dry relayer during judging is a dead demo, which costs more than
 * the funds do. Below this floor onboarding still registers the restaurant and
 * simply declines to fund it, which is the recoverable half.
 */
const RELAYER_FLOOR = parseEther("200");

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
        args: [who],
      }) as Promise<boolean>,
      client.getBalance({ address: who }),
      client.getBalance({ address: account.address }),
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

    /* Registration is the half that matters and it has already happened above.
       Funding is a convenience, so it is the half that gets withheld when the
       relayer is running low rather than failing the whole call. */
    const needsFunding = balance < FLOOR;
    const canFund = relayerBalance >= RELAYER_FLOOR;
    if (needsFunding && canFund) {
      fundTx = await client.sendTransaction({ to: who, value: GRANT });
    }

    return NextResponse.json({
      restaurant: who,
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
