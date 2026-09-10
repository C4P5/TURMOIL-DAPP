"use client";

import { useState } from "react";
import Link from "next/link";

/*
  The landing's focal object, and the only interactive thing on the page.

  Lives in app/_components/ — the underscore makes it a private folder, so Next
  does not try to route it. It has to be a client component for the live
  arithmetic, and page.tsx cannot be one because it exports `metadata`. The rest
  of the landing stays server-rendered and env-independent.

  PRICE is the contract's pricePerLitre (248000 at 6dp = $0.248/L), hardcoded on
  purpose: this page renders with zero environment variables and never opens an
  RPC connection. The screens that quote a real payout — /sign above all — read
  it from the chain instead, because there the number is a promise rather than an
  illustration.
*/
const PRICE_PER_LITRE = 0.248;
const MAX_LITRES = 100_000;

export function PickupWidget() {
  const [litres, setLitres] = useState("40");

  const n = Number(litres || 0);
  const payout = (n * PRICE_PER_LITRE).toFixed(2);

  return (
    <div className="mt-14 w-full max-w-2xl">
      <div className="glass sheen relative p-4 md:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.045] p-6 text-left transition-colors focus-within:border-oil/40">
            <label htmlFor="litres" className="label mb-4 block">
              Restaurant hands over
            </label>
            <div className="flex items-baseline justify-between gap-3">
              <input
                id="litres"
                value={litres}
                onChange={(e) =>
                  // Digits only, and capped — a paste of 40 nines would render a
                  // payout wider than the panel and blow the layout apart.
                  setLitres(e.target.value.replace(/\D/g, "").slice(0, 6) || "")
                }
                inputMode="numeric"
                aria-label="Litres collected"
                placeholder="0"
                className="datum w-full min-w-0 bg-transparent text-4xl text-paper outline-none placeholder:text-muted"
              />
              <span className="pill label shrink-0 px-3 py-1.5 text-paper">Litres</span>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.045] p-6 text-left">
            <p className="label mb-4">And is paid, instantly</p>
            <div className="flex items-baseline justify-between gap-3">
              <span className="datum truncate text-4xl">{payout}</span>
              <span className="pill label shrink-0 px-3 py-1.5 text-paper">USDC</span>
            </div>
          </div>
        </div>

        {/* The conversion mark, seated on the seam between the two legs. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
          <div className="pill flex h-11 w-11 items-center justify-center text-oil">
            <span className="datum text-lg">→</span>
          </div>
        </div>
      </div>

      {/* Carries the typed figure through, so the pickup screen opens on the
          number the visitor just chose rather than resetting to a default. */}
      <Link
        href={`/collect?litres=${Math.min(n, MAX_LITRES)}`}
        className="cta datum mt-6 inline-block px-10 py-4 text-sm uppercase tracking-widest"
      >
        Start a pickup
      </Link>

      <p className="label mt-5">
        $0.248 per litre, the contract&rsquo;s live rate · two signatures required
      </p>
    </div>
  );
}
