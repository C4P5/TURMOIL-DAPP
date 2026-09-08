import { createPublicClient, http } from "viem";
import { hederaTestnet } from "@/lib/chain";

/** Read-only client. Every number the UI shows is read from chain, never cached by us. */
export const publicClient = createPublicClient({
  chain: hederaTestnet,
  transport: http(),
});
