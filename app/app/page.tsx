import Link from "next/link";

/*
  The landing. Its job is the first ten seconds, and it is the only page in the
  app that argues rather than reports.

  Structure follows the order a sceptic needs, not the order we built things in:
  the crime first, the admission of what we cannot do second, the mechanism
  third, the arithmetic fourth. Leading with the mechanism is how this gets
  filed under "supply chain on blockchain", which is the single worst outcome
  for a project whose strongest axis is originality.

  Static by construction — no client components, no wallet, no chain reads. It
  renders correctly with zero environment variables set.
*/

export const metadata = {
  title: "TURMOIL — provable used cooking oil",
};

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      <Ambience />

      <div className="relative z-10">
        <Nav />
        <Hero />
        <Crime />
        <Limit />
        <Mechanism />
        <Arithmetic />
        <Flow />
        <Stack />
        <Close />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/*
  Three amber light sources behind everything. These are the "alien shapes
  turned upside down" — a square with one sharp corner, rotated 45° so the point
  leads: a falling droplet. Blurred to 80px they stop being shapes and become
  light, which is the only way a decorative blob survives contact with a
  sceptical viewer.
*/
function Ambience() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="drop glow absolute -top-40 -right-24 h-[34rem] w-[34rem] bg-oil opacity-[0.18]" />
      <div className="drop glow absolute top-[70rem] -left-40 h-[26rem] w-[26rem] bg-oil opacity-[0.10]" />
      <div className="drop glow absolute bottom-0 right-0 h-[30rem] w-[30rem] bg-oil opacity-[0.08]" />
    </div>
  );
}

function Nav() {
  return (
    <nav className="glass-nav sticky top-0 z-30 mx-auto flex items-center justify-between px-6 py-5">
      <span className="datum text-lg tracking-[0.28em] text-oil">TURMOIL</span>
      <div className="label hidden gap-7 md:flex">
        <a href="#crime" className="hover:text-paper">
          The fraud
        </a>
        <a href="#mechanism" className="hover:text-paper">
          Mechanism
        </a>
        <a href="#arithmetic" className="hover:text-paper">
          The arithmetic
        </a>
      </div>
      <Link
        href="/lot/0"
        className="label rounded border border-line px-4 py-2 text-paper transition-colors hover:border-oil hover:text-oil"
      >
        Open a receipt
      </Link>
    </nav>
  );
}

function Hero() {
  return (
    <header className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-24">
      <p className="label mb-8">ETHOnline 2026 · Hedera testnet · single contract</p>

      <h1 className="display max-w-4xl text-[2.75rem] sm:text-6xl md:text-7xl">
        Eighty percent of Europe&rsquo;s{" "}
        <span className="text-muted">used cooking oil</span> is suspected to be{" "}
        <span className="text-oil">virgin palm oil</span>.
      </h1>

      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
        We make the other twenty percent provable — from the fryer. Two signatures per
        pickup, a mass balance at the plant, and a random audit that costs a liar their
        bond.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/lot/0"
          className="datum rounded bg-oil px-6 py-3.5 text-sm uppercase tracking-widest text-ink transition-opacity hover:opacity-90"
        >
          Open a live lot receipt
        </Link>
        <a
          href="#mechanism"
          className="datum rounded border border-line px-6 py-3.5 text-sm uppercase tracking-widest text-paper transition-colors hover:border-oil hover:text-oil"
        >
          How a liar gets caught
        </a>
      </div>

      <ReceiptPreview />
    </header>
  );
}

/*
  A glass panel showing the product rather than describing it. The figures are
  the demo lot's, and they are labelled as such — a landing page may illustrate,
  but it may not present an illustration as a live reading. The real numbers live
  one click away on /lot/[id], which reads them from the contract.
*/
function ReceiptPreview() {
  return (
    <div className="glass sheen mt-20 overflow-hidden p-8 md:p-10">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="label">Chain of custody</p>
          <p className="datum text-2xl">LOT #0</p>
        </div>
        <span className="stamp text-pass">Settled</span>
      </div>

      <div className="grid gap-y-3 sm:grid-cols-3 sm:gap-8">
        <Reading label="Attested by drivers" value="412 L" />
        <Reading label="Weighed at plant" value="410 L" />
        <Reading label="Sampled at random" value="3 of 10" />
      </div>

      <div className="mt-8 flex items-center gap-3 rounded border border-pass/40 px-4 py-3">
        <span className="datum text-sm text-pass">Mass balance closes</span>
        <span className="label">Σ attested ≤ received + tolerance</span>
      </div>

      <p className="label mt-6">
        Illustrative figures. The live receipt reads every value from the contract.
      </p>
    </div>
  );
}

function Reading({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between sm:block">
      <p className="label sm:mb-1">{label}</p>
      <p className="datum text-2xl">{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const CRIME = [
  {
    figure: "80%",
    body: "of the used cooking oil the EU imported in 2022 is suspected to be mislabelled virgin palm oil.",
    source: "Transport & Environment",
    href: "https://www.transportenvironment.org/articles/uco",
  },
  {
    figure: "1.8 Mt",
    body: "of fraudulent ISCC-certified POME entered the EU in 2023 — certified waste that was never waste.",
    source: "Maritime Executive",
    href: "https://maritime-executive.com/article/eu-scrutinizes-fraud-in-certification-of-biofuels",
  },
  {
    figure: ">100%",
    body: "ISCC certified volumes exceed physical production. More waste oil is certified than the world makes.",
    source: "March 2025 data",
    href: "https://www.transportenvironment.org/articles/uco",
  },
  {
    figure: "2.5 yr",
    body: "proposed suspension of ISCC recognition for waste-based biofuels, live before the European Commission.",
    source: "Transport & Environment",
    href: "https://www.transportenvironment.org/articles/uco",
  },
];

function Crime() {
  return (
    <section id="crime" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHead
        eyebrow="The fraud"
        title="Certification already failed"
        lede="This is not a hypothetical inefficiency waiting for a blockchain. It is a live, documented fraud that has already broken the certificate system built to stop it."
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {CRIME.map((c) => (
          <a
            key={c.figure}
            href={c.href}
            target="_blank"
            rel="noreferrer"
            className="glass sheen lift group block p-7"
          >
            <p className="figure text-5xl md:text-6xl">{c.figure}</p>
            <p className="mt-4 leading-relaxed text-paper/80">{c.body}</p>
            <p className="label mt-5 group-hover:text-oil">{c.source} ↗</p>
          </a>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/*
  The admission, placed before the pitch on purpose. Every judge's first question
  is "how do you know it's really used oil" — answering it unprompted is worth
  more than any feature, and it is the difference between a provenance claim and
  a provenance product.
*/
function Limit() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="glass sheen p-8 md:p-14">
        <p className="label mb-6">What we cannot do</p>
        <p className="display max-w-3xl text-3xl md:text-4xl">
          We cannot chemically distinguish palm oil from used cooking oil.
        </p>
        <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted">
          Neither can ISCC. That is precisely why the fraud works, and any project claiming
          otherwise is selling you something. What we change is the shape of the lie: we make
          the origin claim two-sided and mass-balanced, so faking it at scale means
          fabricating thousands of restaurant counterparties who each sign independently,
          with their own key, at their own address, on their own schedule.
        </p>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-paper">
          That is a different order of difficulty than buying a certificate.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

const LAYERS = [
  {
    tag: "L1",
    name: "Dual attestation",
    body: "A batch exists only if the restaurant and the collector both sign it. The owner signs by scanning a QR on the driver's phone, so physical co-presence is implied by the scan itself.",
    kills: "Kills unilateral fabrication.",
  },
  {
    tag: "L2",
    name: "Conservation law",
    body: "The plant signs for the weight it actually received. The contract enforces Σ(attestations) ≤ receipt + tolerance. A skimming driver produces an arithmetic gap.",
    kills: "A bill of lading, on chain.",
  },
  {
    tag: "L3",
    name: "Revenue-gated payout",
    body: "Truck-token holders are paid only out of stablecoin the system actually received. Inflating volume cannot manufacture a distribution.",
    kills: "Inflation stops paying.",
  },
  {
    tag: "L4",
    name: "Anomaly flagging",
    body: "A thin agent reads events and flags what does not fit: a restaurant at 3× its own eight-week average, a route whose volume never closes, one driver's gap trending. A risk scorer, not an oracle.",
    kills: "Enforcement stays in the mechanism, not in a model's judgment.",
  },
  {
    tag: "L5",
    name: "Random audit, extrapolated slashing",
    body: "When a lot seals, the contract calls Hedera's PRNG at 0x169 and samples 30% of the batches — after sealing, so nobody knows which. A sampled restaurant confirms with its own signature. A failure burns the collector's bond.",
    kills: "This is how customs auditing works.",
  },
];

function Mechanism() {
  return (
    <section id="mechanism" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHead
        eyebrow="Mechanism"
        title="You cannot verify a physical fact on chain"
        lede="So we do not try. Every layer below exists to make lying unprofitable and detectable, rather than to make it impossible — because impossible is a claim no honest system can make about the physical world."
      />

      <div className="mt-14 space-y-3">
        {LAYERS.map((l) => (
          <div key={l.tag} className="glass sheen p-7 md:p-8">
            <div className="grid gap-5 md:grid-cols-[5rem_1fr_15rem] md:items-baseline md:gap-8">
              <p className="datum text-3xl text-oil">{l.tag}</p>
              <div>
                <p className="mb-2 text-xl">{l.name}</p>
                <p className="leading-relaxed text-muted">{l.body}</p>
              </div>
              <p className="label leading-relaxed md:text-right">{l.kills}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/*
  The technicality section. Every number here was recomputed after a review found
  the original deterrence claim was false — the old rule fined an unbiased
  extrapolation, which is zero-EV by construction. Publishing the table, including
  the row where it stops working, is the point.
*/
function Arithmetic() {
  return (
    <section id="arithmetic" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHead
        eyebrow="The arithmetic"
        title="Cheating has to lose money"
        lede="A deterrent that has not been multiplied out is a slogan. Hypergeometric, sampling without replacement, expressed as a fraction of lot value — with a 50% bond at a 30% sample rate."
      />

      <div className="glass sheen mt-14 overflow-x-auto p-7 md:p-10">
        <table className="w-full min-w-[34rem] text-left">
          <thead>
            <tr className="border-b border-line">
              <Th>Batches</Th>
              <Th>Sampled</Th>
              <Th>Fabricated</Th>
              <Th>P(caught)</Th>
              <Th right>Expected value</Th>
            </tr>
          </thead>
          <tbody className="datum">
            <Row n="100" k="30" f="5%" p="83.9%" ev="−36.96%" />
            <Row n="10" k="3" f="10%" p="30.0%" ev="−5.00%" />
            <Row n="4" k="3" f="25%" p="75.0%" ev="−12.50%" />
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="glass sheen p-7">
          <p className="label mb-3">Where it stops working</p>
          <p className="leading-relaxed text-muted">
            As fabrication approaches the size of the bond — around 50% — expected value turns
            non-negative. The theft outruns the slash. We would rather you heard that from us.
          </p>
        </div>
        <div className="glass sheen p-7">
          <p className="label mb-3">Which is why there are two</p>
          <p className="leading-relaxed text-muted">
            That range is exactly where the mass balance bites, and it is deterministic — no
            sampling, no probability. Two mechanisms for two fraud sizes. Neither is sufficient
            alone, and we do not pretend either is.
          </p>
        </div>
      </div>
    </section>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`label pb-4 font-normal ${right ? "text-right" : ""}`}>{children}</th>;
}

function Row({ n, k, f, p, ev }: { n: string; k: string; f: string; p: string; ev: string }) {
  return (
    <tr className="border-b border-line/60 last:border-0">
      <td className="py-4 text-muted">{n}</td>
      <td className="py-4 text-muted">{k}</td>
      <td className="py-4">{f}</td>
      <td className="py-4">{p}</td>
      <td className="py-4 text-right text-lg text-pass">{ev}</td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */

function Flow() {
  const steps = [
    { who: "Restaurant", what: "signs for the oil it handed over", gets: "paid instantly, in USDC" },
    { who: "Collector", what: "signs, posts a bond, carries the lot", gets: "bears every shortfall" },
    { who: "Plant", what: "signs for the weight on the scale", gets: "pays for what it received" },
    { who: "Investor", what: "holds a compliance-gated share of the truck", gets: "paid from real revenue" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHead
        eyebrow="Residual claimant"
        title="The person who can lie is the person who pays"
        lede="The restaurant is paid the moment both signatures land, because nobody waits a week for eleven dollars. Any gap between what was attested and what the plant weighed comes out of the collector's bond — never the investors'."
      />

      <div className="mt-14 grid gap-3 md:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.who} className="glass sheen p-7">
            <p className="datum mb-4 text-sm text-oil-dim">0{i + 1}</p>
            <p className="mb-3 text-lg">{s.who}</p>
            <p className="mb-5 leading-relaxed text-muted">{s.what}</p>
            <p className="label border-t border-line pt-4">{s.gets}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Stack() {
  const items = [
    {
      name: "Hedera",
      body: "One contract, one chain. The audit draws its seed from the native PRNG at 0x169 — no oracle, no VRF wait. Trucks are issued as ERC-3643 through Asset Tokenization Studio, because a share of an operating asset is a security and should behave like one.",
    },
    {
      name: "Privy",
      body: "A restaurant owner logs in with an email address, sees the amount, and signs. They never hold HBAR, never send a transaction, never install anything. The collector relays it and pays the gas — correct, since the collector is the one earning a margin.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((i) => (
          <div key={i.name} className="glass sheen p-8 md:p-10">
            <p className="label mb-5">Built on</p>
            <p className="display mb-5 text-3xl">{i.name}</p>
            <p className="leading-relaxed text-muted">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Close() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-28 pt-12">
      <div className="glass sheen p-10 text-center md:p-20">
        <h2 className="display mx-auto max-w-3xl text-4xl md:text-5xl">
          Every litre traces back to a named fryer.
        </h2>
        <p className="mx-auto mt-7 max-w-xl leading-relaxed text-muted">
          Not a certificate. Not an attestation of an attestation. A receipt with two signatures
          on it, and a bond that burns if either one was a lie.
        </p>
        <Link
          href="/lot/0"
          className="datum mt-10 inline-block rounded bg-oil px-8 py-4 text-sm uppercase tracking-widest text-ink transition-opacity hover:opacity-90"
        >
          Open a live lot receipt
        </Link>
      </div>

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        <p className="label">TURMOIL · ETHOnline 2026 · Hedera testnet</p>
        <p className="label">Origin Montevideo. The buyer is abroad.</p>
      </footer>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function SectionHead({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="label mb-6">{eyebrow}</p>
      <h2 className="display text-4xl md:text-5xl">{title}</h2>
      <p className="mt-7 text-lg leading-relaxed text-muted">{lede}</p>
    </div>
  );
}
