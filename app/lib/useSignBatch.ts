"use client";

import { useCallback } from "react";
import { useWallets } from "@privy-io/react-auth";
import { BATCH_TYPES, EIP712_DOMAIN, type BatchMessage } from "./turmoil";

/**
 * Signs a Batch as EIP-712 typed data.
 *
 * Uses the raw EIP-1193 provider rather than a Privy-version-specific hook —
 * eth_signTypedData_v4 is stable across every wallet, and the restaurant's
 * embedded wallet is just another provider.
 *
 * ponytail: no transaction is ever sent from here. The signer needs no gas,
 * no HBAR, and no association with any token. That is the entire point.
 */
export function useSignBatch() {
  const { wallets } = useWallets();
  // Not wallets[0]: a browser with an injected extension puts that first, and the
  // restaurant would sign with the wrong key. We want the embedded wallet Privy
  // created for their email — that is the address the collector registered.
  const wallet = wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];

  const signBatch = useCallback(
    async (message: BatchMessage): Promise<`0x${string}`> => {
      if (!wallet) throw new Error("No wallet available");

      const provider = await wallet.getEthereumProvider();

      // JSON has no bigint. Serialise the uint fields as decimal strings —
      // eth_signTypedData_v4 expects exactly that.
      const typedData = {
        domain: EIP712_DOMAIN,
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          ...BATCH_TYPES,
        },
        primaryType: "Batch",
        message: {
          restaurant: message.restaurant,
          collector: message.collector,
          litres: message.litres.toString(),
          ref: message.ref,
          deadline: message.deadline.toString(),
        },
      };

      return (await provider.request({
        method: "eth_signTypedData_v4",
        params: [wallet.address, JSON.stringify(typedData)],
      })) as `0x${string}`;
    },
    [wallet]
  );

  return { signBatch, address: wallet?.address as `0x${string}` | undefined };
}
