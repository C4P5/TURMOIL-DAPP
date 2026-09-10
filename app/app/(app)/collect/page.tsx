"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { QRCodeSVG } from "qrcode.react";
import { useSignBatch } from "@/lib/useSignBatch";
import { newRef } from "@/lib/turmoil";

/**
 * Collector view. The driver measures the oil, signs the batch, and shows the
 * restaurant a QR. Nothing is on chain yet — a batch with one signature is not
 * a batch.
 */
export default function CollectorPage() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { signBatch, address } = useSignBatch();

  const [restaurant, setRestaurant] = useState("");
  const [litres, setLitres] = useState("40");

  /*
    The landing's widget links here as /collect?litres=N, so the driver arrives
    on the figure the visitor just typed instead of a reset default.

    Read on mount rather than through useSearchParams: that hook would force this
    whole page into a Suspense boundary, and reading window.location in the
    useState initialiser would render "40" on the server and something else on
    the client — a hydration mismatch. An effect costs one frame and nothing else.
  */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("litres");
    /*
      One-shot read at mount, not a render loop. The rule's usual fix,
      useSearchParams, needs a Suspense boundary in a prerendered route (Next
      docs, layouts-and-pages, "What to use and when"), and a useState
      initialiser reading window would render "40" on the server and something
      else on the client. Both cost more than the single frame this costs.
    */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q && /^[1-9]\d{0,5}$/.test(q)) setLitres(q);
  }, []);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [onboarded, setOnboarded] = useState<string | null>(null);

  async function onboard() {
    setError(null);
    setOnboarded(null);
    setOnboarding(true);
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ restaurant }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Onboarding failed");
      setOnboarded(
        `Registered ${body.registered}, wallet funded ${body.funded}. They can be paid and can withdraw.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setOnboarding(false);
    }
  }

  async function createBatch() {
    setError(null);
    setBusy(true);
    try {
      // No chain read to build a QR: the ref is generated here, so two trucks can
      // have live QRs for the same restaurant at once.
      const ref = newRef();

      // 30 minutes: long enough for a pickup, short enough that a stale
      // signature is worthless if the phone is lost.
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 60);
      const message = {
        restaurant: restaurant as `0x${string}`,
        collector: address!,
        litres: BigInt(litres),
        ref,
        deadline,
      };

      const sig = await signBatch(message);

      const params = new URLSearchParams({
        restaurant: message.restaurant,
        collector: message.collector,
        litres: litres,
        ref,
        deadline: deadline.toString(),
        sigCollector: sig,
      });
      setLink(`${window.location.origin}/sign?${params.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="label">Loading…</p>;

  if (!authenticated) {
    return (
      <div className="ticket max-w-md p-8">
        <p className="label mb-2">Collector</p>
        <h1 className="mb-6 text-2xl">Sign in to start a pickup</h1>
        <button
          onClick={login}
          className="datum w-full rounded bg-oil px-4 py-3 text-sm uppercase tracking-widest text-ink"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="ticket p-6">
        <div className="mb-6 flex items-baseline justify-between">
          <p className="label">Collector</p>
          <button onClick={logout} className="label hover:text-paper">
            Sign out
          </button>
        </div>

        <p className="datum mb-6 break-all text-xs text-muted">{address}</p>

        <label className="label mb-1 block">Restaurant address</label>
        <input
          value={restaurant}
          onChange={(e) => setRestaurant(e.target.value.trim())}
          placeholder="0x…"
          className="datum mb-2 w-full field px-3 py-2 text-sm"
        />

        {/*
          First visit only. Registers the restaurant and puts one HBAR in their
          wallet so they can move what they earn — signing a pickup is gasless,
          withdrawing is not. Idempotent, so pressing it twice costs a read.
        */}
        <button
          onClick={onboard}
          disabled={onboarding || !restaurant}
          className="label mb-5 w-full rounded border border-line px-3 py-2 text-paper transition-colors hover:border-oil hover:text-oil disabled:opacity-40"
        >
          {onboarding ? "Onboarding…" : "New restaurant? Register + activate wallet"}
        </button>

        {onboarded && <p className="label mb-5 text-oil">{onboarded}</p>}

        <label className="label mb-1 block">Litres collected</label>
        <input
          value={litres}
          onChange={(e) => setLitres(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          className="datum mb-6 w-full field px-3 py-2 text-2xl"
        />

        <button
          onClick={createBatch}
          disabled={busy || !restaurant || !litres}
          className="datum w-full rounded bg-oil px-4 py-3 text-sm uppercase tracking-widest text-ink"
        >
          {busy ? "Signing…" : "Sign batch"}
        </button>

        {error && <p className="datum mt-4 text-xs text-fail">{error}</p>}
      </section>

      <section className="ticket flex flex-col items-center justify-center p-6">
        {link ? (
          <>
            <p className="label mb-4">Have the restaurant scan this</p>
            <div className="bg-paper p-4">
              <QRCodeSVG value={link} size={220} />
            </div>
            <p className="label mt-4 text-center">
              One signature is not a pickup.
              <br />
              Nothing reaches the chain until they sign too.
            </p>
            <a href={link} className="datum mt-4 break-all text-[10px] text-oil-dim">
              {link}
            </a>
          </>
        ) : (
          <p className="label text-center text-muted">
            Measure the oil, then sign.
            <br />
            The QR appears here.
          </p>
        )}
      </section>
    </div>
  );
}
