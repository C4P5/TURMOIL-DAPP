import { NextResponse } from "next/server";
import { BaseError, ContractFunctionRevertedError, createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hederaTestnet } from "@/lib/chain";
import { TURMOIL_ABI, TURMOIL_ADDRESS } from "@/lib/turmoil";

/**
 * What each revert means to the person holding the phone. A restaurant owner
 * cannot act on "0x983d6bdc", and neither can anyone watching a demo.
 */
const REVERT_MESSAGES: Record<string, string> = {
  Expired: "This request expired. Ask the driver for a new QR.",
  NotRegistered: "This restaurant or collector is not registered yet.",
  SelfDeal: "Restaurant and collector cannot be the same account.",
  BadSignature: "Signature rejected — this pickup was already recorded, or the QR was altered.",
  UnderBonded: "The collector's bond does not cover this lot. They must top it up before collecting.",
};

/** Names the revert when the ABI knows it; falls back to the raw message otherwise. */
function explain(e: unknown): string {
  if (e instanceof BaseError) {
    const revert = e.walk((err) => err instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName;
      // A named error with no entry here is still better than a selector.
      if (name) return REVERT_MESSAGES[name] ?? `Rejected by the contract: ${name}.`;
    }
    return e.shortMessage;
  }
  return e instanceof Error ? e.message : String(e);
}

/**
 * Relayer. Submits a batch that both parties have already signed.
 *
 * This holds no authority of its own: attest() verifies both signatures against
 * the registered restaurant and collector, so a compromised relayer can replay
 * nothing and forge nothing. The worst it can do is refuse to submit, or waste
 * its own gas.
 *
 * ponytail: in production this key lives on the collector's device — they are
 * the ones earning the margin, so they should pay the gas. A server relayer is
 * the demo's stand-in for that, and it is the reason a restaurant owner never
 * needs HBAR.
 */
export async function POST(req: Request) {
  const key = process.env.RELAYER_PRIVATE_KEY as `0x${string}` | undefined;
  if (!key) {
    return NextResponse.json({ error: "RELAYER_PRIVATE_KEY unset" }, { status: 500 });
  }

  try {
    const { restaurant, collector, litres, ref, deadline, sigRestaurant, sigCollector } = await req.json();

    if (!restaurant || !collector || !litres || !ref || !deadline || !sigRestaurant || !sigCollector) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }

    const client = createWalletClient({
      account: privateKeyToAccount(key),
      chain: hederaTestnet,
      transport: http(),
    }).extend(publicActions);

    // Simulate first: a revert here is a clear error message instead of a
    // burnt transaction and a confused restaurant owner staring at a spinner.
    const { request } = await client.simulateContract({
      address: TURMOIL_ADDRESS,
      abi: TURMOIL_ABI,
      functionName: "attest",
      args: [restaurant, collector, BigInt(litres), ref, BigInt(deadline), sigRestaurant, sigCollector],
    });

    const txHash = await client.writeContract(request);
    return NextResponse.json({ txHash });
  } catch (e) {
    return NextResponse.json({ error: explain(e) }, { status: 400 });
  }
}
