import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hederaTestnet } from "@/lib/chain";
import { TURMOIL_ABI, TURMOIL_ADDRESS } from "@/lib/turmoil";

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
    const { restaurant, collector, litres, deadline, sigRestaurant, sigCollector } = await req.json();

    if (!restaurant || !collector || !litres || !deadline || !sigRestaurant || !sigCollector) {
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
      args: [restaurant, collector, BigInt(litres), BigInt(deadline), sigRestaurant, sigCollector],
    });

    const txHash = await client.writeContract(request);
    return NextResponse.json({ txHash });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
