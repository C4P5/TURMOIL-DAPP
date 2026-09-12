/**
 * Who bears the loss, shown on the screen where it applies.
 *
 * These cards used to live only on the landing page, four across, under the
 * heading "the person who can lie is the person who pays". That is the right
 * argument in the wrong place: the landing is already dense, and the people who
 * most need to understand the rule are the ones standing in a kitchen doorway
 * looking at a phone, not a visitor reading a marketing page.
 *
 * So each screen shows the two roles that screen is about. The restaurant sees
 * why it is paid immediately; the driver sees why a shortfall lands on the
 * collector. Same copy, moved to where it does work.
 */

export type Role = "restaurant" | "collector" | "plant" | "investor";

const ROLES: Record<Role, { who: string; what: string; gets: string }> = {
  restaurant: {
    who: "Restaurant",
    what: "signs for the oil it handed over",
    gets: "paid instantly, in USDC",
  },
  collector: {
    who: "Collector",
    what: "signs, posts a bond, carries the lot",
    gets: "bears every shortfall",
  },
  plant: {
    who: "Plant",
    what: "signs for the weight on the scale",
    gets: "pays for what it received",
  },
  investor: {
    who: "Investor",
    what: "holds a compliance-gated share of the truck",
    gets: "paid only out of revenue received",
  },
};

export function ResidualCards({ roles, note }: { roles: Role[]; note?: string }) {
  return (
    <section className="ticket p-6 md:col-span-2">
      <p className="label mb-1">Who bears the loss</p>
      <p className="label mb-5 leading-relaxed text-muted">
        {note ??
          "Any gap between what was attested and what the plant weighed comes out of the collector's bond — never the restaurant's payment, and never the investors'."}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((key, i) => {
          const r = ROLES[key];
          return (
            <div key={key} className="rounded-lg border border-white/[0.06] bg-white/[0.045] p-6">
              <p className="datum mb-3 text-sm text-oil-dim">0{i + 1}</p>
              <p className="mb-2 text-lg">{r.who}</p>
              <p className="mb-4 leading-relaxed text-muted">{r.what}</p>
              <p className="label border-t border-line pt-3">{r.gets}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
