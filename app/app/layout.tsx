import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import { IS_CONFIGURED } from "@/lib/turmoil";

export const metadata: Metadata = {
  title: "TURMOIL — provable used cooking oil",
  description:
    "They certify more waste oil than exists. Two signatures and a random audit make ours provable.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          {/*
            An unset NEXT_PUBLIC_TURMOIL_ADDRESS binds the zero address into the
            EIP-712 domain, so every signature recovers to a stranger and attest()
            reverts — indistinguishable from forgery. Say so, rather than letting
            a misconfigured deploy look exactly like a broken one.
          */}
          {!IS_CONFIGURED && (
            <p className="label border-b border-[--color-fail] px-5 py-3 text-[--color-fail]">
              Not configured — NEXT_PUBLIC_TURMOIL_ADDRESS is unset. Signing is disabled;
              nothing on this page is reading a real contract.
            </p>
          )}
          <header className="border-b border-[--color-line]">
            <div className="mx-auto flex max-w-5xl items-baseline gap-6 px-5 py-4">
              <Link href="/" className="datum text-lg tracking-[0.2em] text-[--color-oil]">
                TURMOIL
              </Link>
              <nav className="label flex gap-5">
                <Link href="/" className="hover:text-[--color-paper]">
                  Pickup
                </Link>
                <Link href="/lot/0" className="hover:text-[--color-paper]">
                  Provenance
                </Link>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>

          <footer className="mx-auto max-w-5xl px-5 pb-10">
            <p className="label leading-relaxed">
              Testnet. Every figure on this page is read from the contract, not stored by us.
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
