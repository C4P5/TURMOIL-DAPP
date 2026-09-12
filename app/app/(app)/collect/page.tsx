"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { QRCodeSVG } from "qrcode.react";
import { publicClient } from "@/lib/publicClient";
import { newRef, formatUsdc, TURMOIL_ABI, TURMOIL_ADDRESS } from "@/lib/turmoil";
import { RESTAURANTS, canSignInBrowser, labelFor } from "@/lib/restaurants";
import { ResidualCards } from "@/app/_components/residual-cards";
import { FlowCards } from "@/app/_components/flow-cards";

/**
 * Collector view — the driver's screen.
 *
 * The driver no longer holds the collector's key, and no longer types hex. Both
 * were mentor findings and both were right: a real driver does not know what an
 * address is, and a company's signing identity does not belong on the phone of
 * whoever happens to be driving today.
 *
 * So the driver authenticates with Privy, picks a restaurant by name, and the
 * server asks the company's policy-bound wallet for the collector signature. The
 * driver's phone never sees a key. Nothing reaches the chain here either: a batch
 * with one signature is not a batch, and the restaurant's own signature is what
 * completes it.
 */

const COLLECTOR = process.env.NEXT_PUBLIC_COLLECTOR_ADDRESS as `0x${string}` | undefined;

type Pickup = {
  batchId: number;
  restaurant: `0x${string}`;
  litres: bigint;
  paid: bigint;
  lotId: number;
};

/** What a restaurant asked for, before any of it is on chain. */
type PickupRequest = { id: string; restaurant: `0x${string}`; litres: number; at: number };

/**
 * Pure loader, outside the component — same shape the restaurant view uses, so
 * the effect stays a single `.then(setState)` rather than an effect that calls a
 * function that sets state.
 *
 * ponytail: reads batches directly instead of querying logs. `collector` is not
 * an indexed event field and Hedera caps getLogs ranges, so this is O(n) and
 * honest about it. At demo scale that is a handful of reads.
 */
async function loadTruck(collector: `0x${string}`): Promise<Pickup[]> {
  const [count, price] = await Promise.all([
    publicClient.readContract({
      address: TURMOIL_ADDRESS,
      abi: TURMOIL_ABI,
      functionName: "batchCount",
    }) as Promise<bigint>,
    publicClient.readContract({
      address: TURMOIL_ADDRESS,
      abi: TURMOIL_ABI,
      functionName: "pricePerLitre",
    }) as Promise<bigint>,
  ]);

  const out: Pickup[] = [];
  for (let i = 0; i < Number(count); i++) {
    const b = (await publicClient.readContract({
      address: TURMOIL_ADDRESS,
      abi: TURMOIL_ABI,
      functionName: "batches",
      args: [BigInt(i)],
    })) as readonly [`0x${string}`, `0x${string}`, bigint, bigint, boolean, boolean, boolean];
    if (b[1].toLowerCase() === collector.toLowerCase()) {
      out.push({
        batchId: i,
        restaurant: b[0],
        litres: BigInt(b[2]),
        paid: BigInt(b[2]) * price,
        lotId: Number(b[3]),
      });
    }
  }
  return out.reverse();
}

export default function CollectorPage() {
  const { ready, authenticated, login, logout, getAccessToken } = usePrivy();

  /* Only wallets an owner can actually sign from. Offering a registered-but-
     terminal-only wallet walks the driver to a QR that /sign then refuses. */
  const selectable = RESTAURANTS.filter(canSignInBrowser);
  const [restaurant, setRestaurant] = useState<string>(selectable[0]?.address ?? "");
  const [litres, setLitres] = useState("40");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pickups, setPickups] = useState<Pickup[] | null>(null);

  /*
    The landing links here as /collect?litres=N so the driver arrives on the
    figure the visitor typed. Read on mount rather than through useSearchParams:
    that hook would force this page into a Suspense boundary, and reading
    window.location in a useState initialiser renders one value on the server and
    another on the client.
  */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("litres");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q && /^[1-9]\d{0,5}$/.test(q)) setLitres(q);
  }, []);

  useEffect(() => {
    if (!COLLECTOR) return;
    loadTruck(COLLECTOR)
      .then(setPickups)
      .catch(() => setPickups([]));
  }, []);

  /* The queue the restaurants filled. A driver's day starts here rather than
     with a guess about who might have oil. */
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  useEffect(() => {
    fetch("/api/pickup-request")
      .then((r) => r.json())
      .then((b) => setRequests(b.requests ?? []))
      .catch(() => setRequests([]));
  }, []);

  async function createBatch() {
    setError(null);
    setBusy(true);
    try {
      const ref = newRef();
      // 30 minutes: long enough for a pickup, short enough that a stale
      // signature is worthless if the phone is lost.
      const deadline = Math.floor(Date.now() / 1000) + 30 * 60;

      /* The company wallet signs, not this browser. The access token proves who
         is asking; the server checks them against the operator's driver list. */
      const token = await getAccessToken();
      const res = await fetch("/api/collector-sign", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ restaurant, litres: Number(litres), ref, deadline }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not sign this pickup.");

      const params = new URLSearchParams({
        restaurant,
        collector: body.collector,
        litres,
        ref,
        deadline: String(deadline),
        sigCollector: body.signature,
      });
      setLink(`${window.location.origin}/sign?${params.toString()}`);

      /* The ask has been answered — drop it from the queue so a second driver
         does not turn up at the same door. Best effort: a failure here costs a
         stale row, not a pickup. */
      const fulfilled = requests.find(
        (r) => r.restaurant.toLowerCase() === restaurant.toLowerCase(),
      );
      if (fulfilled) {
        await fetch(`/api/pickup-request?id=${fulfilled.id}`, {
          method: "DELETE",
          headers: { authorization: `Bearer ${token}` },
        }).catch(() => {});
        setRequests((rs) => rs.filter((r) => r.id !== fulfilled.id));
      }
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
        <p className="label mt-3">Drivers only. The company wallet signs, not your phone.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="ticket p-6">
        <div className="mb-6 flex items-baseline justify-between">
          <p className="label">Pickup</p>
          <button onClick={logout} className="label hover:text-paper">
            Sign out
          </button>
        </div>

        {requests.length > 0 && (
          <div className="mb-6">
            <p className="label mb-2">Waiting for a truck</p>
            <div className="divide-y divide-line">
              {requests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRestaurant(r.restaurant);
                    setLitres(String(r.litres));
                  }}
                  className="flex w-full items-baseline justify-between py-2 text-left transition-colors hover:text-oil"
                >
                  <span className="datum text-sm">{labelFor(r.restaurant)}</span>
                  <span className="label">~{r.litres} L</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="label mb-1 block" htmlFor="restaurant">
          Restaurant
        </label>
        <select
          id="restaurant"
          value={restaurant}
          onChange={(e) => setRestaurant(e.target.value)}
          className="datum mb-5 w-full field px-3 py-2 text-sm"
        >
          {RESTAURANTS.map((r) => (
            <option key={r.name} value={r.address ?? ""} disabled={!canSignInBrowser(r)}>
              {r.name}
              {r.address ? (canSignInBrowser(r) ? "" : " — signs from a terminal") : " — not registered"}
            </option>
          ))}
        </select>

        <label className="label mb-1 block" htmlFor="litres">
          Litres collected
        </label>
        <input
          id="litres"
          value={litres}
          onChange={(e) => setLitres(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          className="datum mb-6 w-full field px-3 py-2 text-2xl"
        />

        <button
          onClick={createBatch}
          disabled={busy || !restaurant || !litres}
          className="datum w-full rounded bg-oil px-4 py-3 text-sm uppercase tracking-widest text-ink disabled:opacity-40"
        >
          {busy ? "Signing…" : "Sign pickup"}
        </button>

        {error && <p className="datum mt-4 text-xs text-fail">{error}</p>}

        <p className="label mt-6 leading-relaxed text-muted">
          Signed by TURMOIL Collections, the company wallet. A Privy policy lets it sign pickups
          for this contract and nothing else.
        </p>
      </section>

      <section className="ticket flex flex-col items-center justify-center p-6">
        {link ? (
          <>
            <p className="label mb-4">Show this to the restaurant owner</p>
            <div className="bg-paper p-4">
              <QRCodeSVG value={link} size={220} />
            </div>
            <p className="label mt-4 text-center leading-relaxed">
              They scan it and sign to confirm the pickup.
              <br />
              One signature is not a pickup — nothing reaches the chain until they sign too.
            </p>
            <a href={link} className="datum mt-4 break-all text-[10px] text-oil-dim">
              {link}
            </a>
          </>
        ) : (
          <p className="label text-center text-muted">
            Measure the oil, then sign.
            <br />
            The QR appears here for the restaurant to scan.
          </p>
        )}
      </section>

      <section className="ticket p-6 md:col-span-2">
        <p className="label mb-4">This truck&rsquo;s pickups</p>
        {pickups === null && <p className="label">reading…</p>}
        {pickups?.length === 0 && (
          <p className="label text-muted">No pickups recorded for this truck yet.</p>
        )}
        {pickups && pickups.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="label">
                <th className="pb-2">Restaurant</th>
                <th className="pb-2">Lot</th>
                <th className="pb-2">Litres</th>
                <th className="pb-2">Paid</th>
              </tr>
            </thead>
            <tbody>
              {pickups.map((p) => (
                <tr key={p.batchId} className="datum text-sm">
                  <td className="py-1">{labelFor(p.restaurant)}</td>
                  <td className="py-1">
                    <a href={`/lot/${p.lotId}`} className="hover:text-paper">
                      {p.lotId}
                    </a>
                  </td>
                  <td className="py-1">{p.litres.toString()} L</td>
                  <td className="py-1">${formatUsdc(p.paid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <FlowCards title="Where this pickup sits" />

      <ResidualCards
        roles={["collector", "restaurant"]}
        note="You sign for what you loaded; the restaurant signs for what it handed over. If the plant weighs less than the lot claims, the difference comes out of this truck's bond — not out of what the restaurant was already paid."
      />
    </div>
  );
}
