/**
 * The operation, end to end, in four cards.
 *
 * A mentor's finding: the screens show mechanism without showing sequence, so a
 * non-technical reader cannot place what they are looking at. This is the whole
 * loop — who asks, who measures, who weighs, who gets paid — in the order it
 * actually happens, and it starts where the real operation starts: with a
 * business asking for a pickup, not with a truck appearing.
 *
 * Four cards, hard cap. The seven-step version reads as a process diagram; four
 * reads as an idea. Steps that belong together are merged rather than dropped.
 *
 * The last card carries a status because the payout leg has never run. The
 * shares exist and their transfer restrictions are live; the distribution is
 * scheduled work, and saying so here costs nothing next to being caught.
 */

const STEPS: { who: string; what: string; gets: string; status?: string }[] = [
  {
    who: "The business asks",
    what: "a restaurant requests a pickup from its own screen, for the oil it already has",
    gets: "the flow starts with them",
  },
  {
    who: "The truck arrives",
    what: "the operator measures what is really in the drum, and both sides sign the same figure",
    gets: "paid instantly, in USDC",
  },
  {
    who: "The refinery weighs it",
    what: "the plant signs for the weight that actually landed on its scale",
    gets: "any shortfall hits the bond",
  },
  {
    who: "The revenue splits",
    what: "what the refinery pays flows back to the people who funded the truck",
    gets: "paid out of revenue received",
    status: "designed, not built",
  },
];

export function FlowCards({ title = "How a pickup works" }: { title?: string }) {
  return (
    <section className="ticket p-6 md:col-span-2">
      <p className="label mb-1">{title}</p>
      <p className="label mb-5 leading-relaxed text-muted">
        Every step is signed by the party that can see it, and nobody signs for anyone else.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div key={s.who} className="rounded-lg border border-white/[0.06] bg-white/[0.045] p-6">
            <p className="datum mb-3 text-sm text-oil-dim">0{i + 1}</p>
            <p className="mb-2 text-lg">{s.who}</p>
            <p className="mb-4 leading-relaxed text-muted">{s.what}</p>
            <p className="label border-t border-line pt-3">{s.gets}</p>
            {s.status && <p className="label mt-2 text-oil-dim">{s.status}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
