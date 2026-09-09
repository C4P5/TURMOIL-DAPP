"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useSignBatch } from "@/lib/useSignBatch";
import { publicClient } from "@/lib/publicClient";
import { formatUsdc, TURMOIL_ABI, TURMOIL_ADDRESS } from "@/lib/turmoil";

/** Module scope, so the clock read is outside React's render purity rules. */
function isExpired(deadline: string | null): boolean {
  return deadline !== null && Number(deadline) * 1000 < Date.now();
}

/**
 * Restaurant view. Opened by scanning the collector's QR.
 *
 * The owner logs in with an email address, sees exactly what they are agreeing
 * to, and signs. They never send a transaction, never hold HBAR, never install
 * anything. The signature goes to a relayer that submits both signatures
 * together — the collector pays the gas, which is correct, because they are the
 * one earning a margin.
 */
function SignInner() {
  const params = useSearchParams();
  const { ready, authenticated, login } = usePrivy();
  const { signBatch, address } = useSignBatch();

  const [state, setState] = useState<"idle" | "signing" | "sending" | "done" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const restaurant = params.get("restaurant") as `0x${string}` | null;
  const collector = params.get("collector") as `0x${string}` | null;
  const litres = params.get("litres");
  const ref = params.get("ref");
  const deadline = params.get("deadline");
  const sigCollector = params.get("sigCollector");

  const complete = restaurant && collector && litres && ref && deadline && sigCollector;

  // Date.now() during render is impure, and a value computed once at hydration
  // never re-evaluates — so a QR that expires while the owner reads the screen
  // would still offer them a dead message to sign. A ticking clock keeps the UI
  // honest; the check that actually matters happens at click time in confirm().
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);
  const expired = now !== null && deadline ? Number(deadline) * 1000 < now : false;

  // pricePerLitre is owner-tunable state, not a constant. Hardcoding it means one
  // setParams call and this screen misstates the amount — on the one screen whose
  // whole job is showing the owner what they are agreeing to.
  const [price, setPrice] = useState<bigint | null>(null);
  useEffect(() => {
    publicClient
      .readContract({ address: TURMOIL_ADDRESS, abi: TURMOIL_ABI, functionName: "pricePerLitre" })
      .then((p) => setPrice(p as bigint))
      .catch(() => setPrice(null));
  }, []);

  const payout = price !== null && litres ? `$${formatUsdc(BigInt(litres) * price)} USDC` : "reading…";

  async function confirm() {
    if (!complete) return;
    setError(null);
    // Authoritative expiry check: never ask someone to sign a message the contract
    // will reject. attest() reverts with Expired past the deadline.
    if (isExpired(deadline)) {
      setError("This request expired. Ask the driver for a new QR.");
      setState("error");
      return;
    }
    try {
      setState("signing");
      const sigRestaurant = await signBatch({
        restaurant: restaurant!,
        collector: collector!,
        litres: BigInt(litres!),
        ref: ref as `0x${string}`,
        deadline: BigInt(deadline!),
      });

      setState("sending");
      const res = await fetch("/api/attest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ restaurant, collector, litres, ref, deadline, sigRestaurant, sigCollector }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Relay failed");

      setTxHash(body.txHash);
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState("error");
    }
  }

  if (!complete) {
    return <p className="datum text-[--color-fail]">Incomplete pickup link — scan the QR again.</p>;
  }

  return (
    <div className="ticket mx-auto max-w-md p-8">
      <p className="label mb-1">Pickup confirmation</p>
      <h1 className="mb-8 text-2xl">Did this collection happen?</h1>

      <dl className="perf mb-8 divide-y divide-[--color-line] py-1">
        <Row label="Litres" value={litres!} big />
        <Row label="You receive" value={payout} big />
        <Row label="Collector" value={`${collector!.slice(0, 10)}…${collector!.slice(-6)}`} />
        <Row label="Your account" value={restaurant.slice(0, 10) + "…" + restaurant.slice(-6)} />
      </dl>

      {/* The URL names who is being paid; the wallet decides who signs. If they
          differ, the signature recovers to the wrong address and attest() reverts
          with BadSignature — which looks identical to forgery. Say so up front. */}
      {authenticated && address && restaurant.toLowerCase() !== address.toLowerCase() && (
        <p className="datum mb-6 border border-[--color-fail] p-3 text-xs text-[--color-fail]">
          You are signed in as {address.slice(0, 10)}…{address.slice(-6)}, but this pickup pays{" "}
          {restaurant.slice(0, 10)}…{restaurant.slice(-6)}. Sign out and use the account the
          collector registered.
        </p>
      )}

      {expired ? (
        <p className="datum text-sm text-[--color-fail]">
          This request expired. Ask the driver for a new QR.
        </p>
      ) : state === "done" ? (
        <div>
          <p className="stamp mb-4 inline-block text-[--color-pass]">Signed &amp; paid</p>
          <p className="label mb-2">Transaction</p>
          <a
            href={`https://hashscan.io/testnet/transaction/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="datum block break-all text-xs text-[--color-oil]"
          >
            {txHash}
          </a>
        </div>
      ) : !ready ? (
        <p className="label">Loading…</p>
      ) : !authenticated ? (
        <>
          <button
            onClick={login}
            className="datum w-full bg-[--color-oil] px-4 py-3 text-sm uppercase tracking-widest text-[--color-ink]"
          >
            Continue with email
          </button>
          <p className="label mt-3 text-center">No wallet, no app, no fees.</p>
        </>
      ) : (
        <>
          <button
            onClick={confirm}
            disabled={state === "signing" || state === "sending"}
            className="datum w-full bg-[--color-oil] px-4 py-3 text-sm uppercase tracking-widest text-[--color-ink]"
          >
            {state === "signing" ? "Waiting for your signature…" : state === "sending" ? "Submitting…" : "Yes, confirm and get paid"}
          </button>
          {address && (
            <p className="datum mt-3 break-all text-center text-[10px] text-[--color-muted]">
              signing as {address}
            </p>
          )}
        </>
      )}

      {error && <p className="datum mt-4 text-xs text-[--color-fail]">{error}</p>}
    </div>
  );
}

function Row({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-3">
      <dt className="label">{label}</dt>
      <dd className={`datum ${big ? "text-xl" : "text-sm text-[--color-muted]"}`}>{value}</dd>
    </div>
  );
}

export default function SignPage() {
  return (
    <Suspense fallback={<p className="label">Loading…</p>}>
      <SignInner />
    </Suspense>
  );
}
