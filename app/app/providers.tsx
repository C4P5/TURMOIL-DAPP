"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { hederaTestnet } from "@/lib/chain";

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // Without an app id Privy throws on mount and takes the whole page with it.
  // Render the app anyway so the provenance view and layout stay reviewable.
  if (!appId) {
    return (
      <>
        <div className="border-b border-fail bg-fail/10 px-4 py-2 text-xs">
          <span className="datum text-fail">NEXT_PUBLIC_PRIVY_APP_ID unset</span>
          <span className="text-muted"> — login and signing are disabled.</span>
        </div>
        {children}
      </>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // The restaurant owner has never held a private key. Email only.
        loginMethods: ["email"],
        // Privy 3.x nests this per chain family; the flat form is gone.
        embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
        defaultChain: hederaTestnet,
        supportedChains: [hederaTestnet],
        appearance: {
          theme: "dark",
          accentColor: "#f0a020",
          logo: undefined,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
