"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { QRCodeSVG } from "qrcode.react";
import { useSignBatch } from "@/lib/useSignBatch";
import { publicClient } from "@/lib/publicClient";
import { TURMOIL_ABI, TURMOIL_ADDRESS } from "@/lib/turmoil";

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
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createBatch() {
    setError(null);
    setBusy(true);
    try {
      const nonce = (await publicClient.readContract({
        address: TURMOIL_ADDRESS,
        abi: TURMOIL_ABI,
        functionName: "nonces",
        args: [restaurant as `0x${string}`],
      })) as bigint;

      // 30 minutes: long enough for a pickup, short enough that a stale
      // signature is worthless if the phone is lost.
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 60);
      const message = {
        restaurant: restaurant as `0x${string}`,
        collector: address!,
        litres: BigInt(litres),
        nonce,
        deadline,
      };

      const sig = await signBatch(message);

      const params = new URLSearchParams({
        restaurant: message.restaurant,
        collector: message.collector,
        litres: litres,
        nonce: nonce.toString(),
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
          className="datum w-full bg-[--color-oil] px-4 py-3 text-sm uppercase tracking-widest text-[--color-ink]"
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
          <button onClick={logout} className="label hover:text-[--color-paper]">
            Sign out
          </button>
        </div>

        <p className="datum mb-6 break-all text-xs text-[--color-muted]">{address}</p>

        <label className="label mb-1 block">Restaurant address</label>
        <input
          value={restaurant}
          onChange={(e) => setRestaurant(e.target.value.trim())}
          placeholder="0x…"
          className="datum mb-5 w-full border border-[--color-line] bg-[--color-ink] px-3 py-2 text-sm outline-none focus:border-[--color-oil]"
        />

        <label className="label mb-1 block">Litres collected</label>
        <input
          value={litres}
          onChange={(e) => setLitres(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          className="datum mb-6 w-full border border-[--color-line] bg-[--color-ink] px-3 py-2 text-2xl outline-none focus:border-[--color-oil]"
        />

        <button
          onClick={createBatch}
          disabled={busy || !restaurant || !litres}
          className="datum w-full bg-[--color-oil] px-4 py-3 text-sm uppercase tracking-widest text-[--color-ink]"
        >
          {busy ? "Signing…" : "Sign batch"}
        </button>

        {error && <p className="datum mt-4 text-xs text-[--color-fail]">{error}</p>}
      </section>

      <section className="ticket flex flex-col items-center justify-center p-6">
        {link ? (
          <>
            <p className="label mb-4">Have the restaurant scan this</p>
            <div className="bg-[--color-paper] p-4">
              <QRCodeSVG value={link} size={220} />
            </div>
            <p className="label mt-4 text-center">
              One signature is not a pickup.
              <br />
              Nothing reaches the chain until they sign too.
            </p>
            <a href={link} className="datum mt-4 break-all text-[10px] text-[--color-oil-dim]">
              {link}
            </a>
          </>
        ) : (
          <p className="label text-center text-[--color-muted]">
            Measure the oil, then sign.
            <br />
            The QR appears here.
          </p>
        )}
      </section>
    </div>
  );
}
