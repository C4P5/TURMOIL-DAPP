import Link from "next/link";
import { publicClient } from "@/lib/publicClient";
import { TURMOIL_ABI, TURMOIL_ADDRESS, formatUsdc } from "@/lib/turmoil";
import { labelFor } from "@/lib/restaurants";

// Chain state changes under us; never serve a cached lot.
export const dynamic = "force-dynamic";

type Lot = readonly [
  `0x${string}`, // collector
  bigint, // attestedLitres
  bigint, // receivedLitres
  `0x${string}`, // plant — who signed for the weight
  bigint, // drawnAt
  boolean, // isSealed
  boolean, // settled
  boolean, // drawn
  bigint, // seed
];
type Batch = readonly [`0x${string}`, `0x${string}`, bigint, bigint, boolean, boolean, boolean];

async function loadLot(id: string) {
  // BigInt() belongs inside the try: /lot/abc used to throw an unhandled 500
  // instead of rendering the error card below.
  const lotId = BigInt(id);

  const [price, tolerance] = await Promise.all([
    publicClient.readContract({
      address: TURMOIL_ADDRESS,
      abi: TURMOIL_ABI,
      functionName: "pricePerLitre",
    }) as Promise<bigint>,
    publicClient.readContract({
      address: TURMOIL_ADDRESS,
      abi: TURMOIL_ABI,
      functionName: "toleranceBps",
    }) as Promise<number>,
  ]);

  const lot = (await publicClient.readContract({
    address: TURMOIL_ADDRESS,
    abi: TURMOIL_ABI,
    functionName: "lots",
    args: [lotId],
  })) as Lot;

  const ids = (await publicClient.readContract({
    address: TURMOIL_ADDRESS,
    abi: TURMOIL_ABI,
    functionName: "lotBatches",
    args: [lotId],
  })) as readonly bigint[];

  const batches = await Promise.all(
    ids.map(
      async (id) =>
        [
          id,
          (await publicClient.readContract({
            address: TURMOIL_ADDRESS,
            abi: TURMOIL_ABI,
            functionName: "batches",
            args: [id],
          })) as Batch,
        ] as const
    )
  );

  return { lot, batches, price, tolerance };
}

export default async function LotPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  let data: Awaited<ReturnType<typeof loadLot>> | null = null;
  let error: string | null = null;
  try {
    data = await loadLot(id);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error || !data) {
    return (
      <div className="ticket mx-auto max-w-lg p-8">
        <p className="label mb-2">Lot #{id}</p>
        <p className="datum text-sm text-fail">Could not read this lot from chain.</p>
        <p className="label mt-4 leading-relaxed">
          Contract: <span className="datum">{TURMOIL_ADDRESS}</span>
          <br />
          {error}
        </p>
      </div>
    );
  }

  const [collector, attested, received, plant, , isSealed, settled, drawn, seed] = data.lot;

  // Read from chain, never hardcoded: pricePerLitre and toleranceBps are both
  // owner-tunable, so a constant here would quietly start lying after setParams.
  const allowed = (received * BigInt(10_000 + data.tolerance)) / 10_000n;
  const closes = attested <= allowed;

  return (
    <div className="mx-auto max-w-lg">
      <div className="ticket p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <p className="label">Chain of custody</p>
            <h1 className="datum text-2xl">LOT #{id}</h1>
          </div>
          <span
            className={`stamp ${
              settled ? "text-pass" : isSealed ? "text-oil" : "text-muted"
            }`}
          >
            {settled ? "Settled" : isSealed ? "Sealed" : "Open"}
          </span>
        </div>

        <p className="label mb-8 break-all">
          Collector <span className="datum text-muted">{collector}</span>
        </p>

        {/* Plain language first. A mentor read this screen as a wall of technical
            data, and he was right: a restaurant owner or a non-technical judge
            should be able to follow it without knowing what a mass balance is. */}
        <p className="label mb-1">Pickups — every litre, every fryer</p>
        <p className="label mb-3 leading-relaxed text-muted">
          Each line is one collection, signed by the restaurant that handed the oil over.
        </p>
        <div className="perf divide-y divide-line">
          {data.batches.length === 0 && (
            <p className="datum py-4 text-sm text-muted">No pickups recorded.</p>
          )}
          {data.batches.map(([batchId, b]) => {
            const [restaurant, , litres, , audited, failed, confirmed] = b;
            return (
              <div key={batchId.toString()} className="flex items-baseline justify-between py-3">
                <div className="min-w-0">
                  {/* A name where we have one. The address stays reachable on
                      HashScan; a wall of hex is what made this screen read as a
                      technical dump rather than a chain of custody. */}
                  <p className="datum truncate text-sm">{labelFor(restaurant)}</p>
                  <p className="label">
                    batch #{batchId.toString()}
                    {audited && !failed && !confirmed && " · sampled, awaiting confirmation"}
                    {confirmed && " · confirmed by the restaurant ✓"}
                    {failed && " · FAILED AUDIT"}
                  </p>
                </div>
                <p
                  className={`datum shrink-0 pl-4 text-lg ${
                    failed ? "text-fail line-through" : ""
                  }`}
                >
                  {litres.toString()} L
                </p>
              </div>
            );
          })}
        </div>

        <dl className="mt-8 space-y-2">
          <Line label="Collected from restaurants" value={`${attested.toString()} L`} />
          <Line label="Weighed at the plant" value={settled ? `${received.toString()} L` : "—"} />
          <Line
            label="Weight signed by"
            value={settled ? `${plant.slice(0, 10)}…${plant.slice(-6)}` : "—"}
          />
          <Line
            label={`Tolerance (${(data.tolerance / 100).toFixed(1)}%)`}
            value={settled ? `${allowed.toString()} L` : "—"}
          />
          <Line label="Paid to restaurants" value={`$${formatUsdc(attested * data.price)}`} />
        </dl>

        {settled && (
          <div
            className={`mt-8 rounded border p-4 text-center ${
              closes ? "border-pass text-pass" : "border-fail text-fail"
            }`}
          >
            <p className="datum text-sm uppercase tracking-widest">
              {closes ? "Mass balance closes" : "Shortfall — collector charged"}
            </p>
            <p className="label mt-1 text-current opacity-70">
              {closes
                ? "The plant weighed at least as much as these pickups claimed."
                : "These pickups claimed more than the plant weighed. The gap came out of the collector's bond."}
            </p>
            <p className="label mt-1 text-current opacity-50">
              Σ attested {closes ? "≤" : ">"} received + tolerance
            </p>
          </div>
        )}

        {drawn && (
          <div className="mt-8">
            <p className="label mb-1">Audit seed — drawn after sealing, from Hedera 0x169</p>
            <p className="datum break-all text-[10px] text-oil-dim">{seed.toString(16)}</p>
          </div>
        )}
      </div>

      <p className="label mt-4 text-center">
        <Link href="/" className="hover:text-paper">
          ← New pickup
        </Link>
      </p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="label">{label}</dt>
      <dd className="datum text-sm">{value}</dd>
    </div>
  );
}
