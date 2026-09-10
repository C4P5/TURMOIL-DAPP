import Link from "next/link";
import { PickupWidget } from "./_components/pickup-widget";

/*
  The landing. Its job is the first ten seconds, and it is the only page in the
  app that argues rather than reports.

  Structure follows the order a sceptic needs, not the order we built things in:
  the crime first, the admission of what we cannot do second, the mechanism
  third, the arithmetic fourth. Leading with the mechanism is how this gets
  filed under "supply chain on blockchain", which is the single worst outcome
  for a project whose strongest axis is originality.

  Server-rendered apart from the pickup widget, which is a client island for its
  live arithmetic. No wallet, no chain reads, no environment variables — the page
  renders identically on a machine that has never been configured, which is the
  property that lets it be the URL handed to a judge.
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
        <Receipt />
        <Flow />
        <Stack />
        <Close />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/*
  Everything behind the content: one warm vignette centred on the composition,
  and two trails that fall outward to lit droplets resting at the sides.

  This replaced three blurred corner blobs. Screenshotting them settled it — at
  1600px they read as a light leak on the lens rather than as atmosphere, and
  their brightest point sat in a corner, dragging the eye out of a layout whose
  entire subject is the middle.
*/
function Ambience() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Warm light centred on the composition, not leaking in from a corner. */}
      <div className="vignette absolute inset-x-0 top-0 h-[130vh]" />

      {/*
        Two trails sweeping in toward the centre, each ending in a lit droplet.
        SaucerSwap runs orbital arcs here because its subject is space; ours fall
        and converge, because the subject is liquid arriving somewhere.
      */}
      <svg
        className="absolute inset-x-0 top-0 h-[100vh] w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          {/* Offset 0 sits at the droplet end of each path's bounding box, so the
              trail is brightest where it lands and fades out toward the top. */}
          <linearGradient id="trailL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f0a020" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#f0a020" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#f0a020" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trailR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#f0a020" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#f0a020" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#f0a020" stopOpacity="0" />
          </linearGradient>
          <filter id="dotGlow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* Sweeping outward and down to droplets resting at the sides, clear of
            the headline and the widget. Trails that converge on the centre put
            their brightest point exactly where the text is. */}
        <path d="M 690 120 Q 400 300 214 543" stroke="url(#trailL)" strokeWidth="1.25" />
        <path d="M 910 120 Q 1200 300 1386 543" stroke="url(#trailR)" strokeWidth="1.25" />

        <circle cx="214" cy="543" r="6" fill="#f0a020" filter="url(#dotGlow)" opacity="0.95" />
        <circle cx="214" cy="543" r="2.6" fill="#ffe7bd" />
        <circle cx="1386" cy="543" r="6" fill="#f0a020" filter="url(#dotGlow)" opacity="0.95" />
        <circle cx="1386" cy="543" r="2.6" fill="#ffe7bd" />
      </svg>
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-30 mx-auto flex items-center justify-between px-6 py-5">
      <span className="pill datum px-5 py-2.5 text-base tracking-[0.28em] text-oil">TURMOIL</span>
      <div className="label absolute left-1/2 hidden -translate-x-1/2 gap-7 md:flex">
        <a href="#crime" className="transition-colors hover:text-paper">
          The fraud
        </a>
        <a href="#mechanism" className="transition-colors hover:text-paper">
          Mechanism
        </a>
        <a href="#arithmetic" className="transition-colors hover:text-paper">
          The arithmetic
        </a>
      </div>
      {/*
        The two people who use this app never use the same screen. A driver
        measures oil and hands over a QR; an owner signs it and watches a balance.
        Splitting them here, before login, means neither is ever shown the other's
        controls — and it is the first thing a judge sees about who this is for.
      */}
      <div className="flex items-center gap-2">
        <Link href="/restaurant" className="pill pill-lit label px-4 py-2.5">
          Restaurant
        </Link>
        <Link href="/lot/0" className="pill pill-lit label hidden px-4 py-2.5 sm:inline-block">
          Receipt
        </Link>
        <Link href="/collect" className="cta label px-5 py-2.5 font-medium">
          Driver
        </Link>
      </div>
    </nav>
  );
}

/*
  Monolithic hero: one viewport, centred, symmetric, with the product itself at
  dead centre. The earlier version was a left-aligned editorial layout — it read
  as an article about a project rather than as the thing itself, and in a demo
  where the first frame is the whole first impression, that difference is the
  design.

  min-h-[100svh] rather than 100vh: on mobile, vh includes the browser chrome, so
  100vh pushes the call to action under the fold on exactly the devices where the
  fold matters most.
*/
function Hero() {
  return (
    <header className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-6 pb-20 pt-10 text-center">
      <p className="label mb-9">ETHOnline 2026 · live on Hedera testnet</p>

      <h1 className="display text-[3.25rem] sm:text-7xl md:text-8xl">
        <span className="mark">Prove</span> every litre.
      </h1>

      <p className="mt-9 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
        Eighty percent of Europe&rsquo;s used cooking oil is suspected fraud. Ours is signed
        twice, weighed at the plant, and audited at random.
      </p>

      <PickupWidget />

      <p className="label mt-9">
        <a href="#crime" className="transition-colors hover:text-oil">
          Or read why certification already failed ↓
        </a>
      </p>
    </header>
  );
}

/*
  A glass panel showing the product rather than describing it. The figures are
  the demo lot's, and they are labelled as such — a landing page may illustrate,
  but it may not present an illustration as a live reading. The real numbers live
  one click away on /lot/[id], which reads them from the contract.
*/
/*
  This section used to show a mock receipt with invented figures — 412 L attested,
  410 L weighed — captioned "illustrative". On a page whose whole argument is that
  numbers should not be taken on trust, that was the wrong artifact. Every figure
  below is a real value read back from a deployed contract, and every one of them
  is checkable by a stranger with a block explorer.
*/

const EVIDENCE = [
  {
    claim: "A restaurant is paid without ever transacting",
    proof: "Balance 0 → $4.96 for 20 L, in the same transaction that recorded the pickup. The restaurant signed typed data and sent nothing.",
  },
  {
    claim: "The audit sample really is unpredictable",
    proof: "Seed 0xa5df6581…b387df, drawn from Hedera's PRNG at 0x169 after the lot sealed. A second lot drew a different one.",
  },
  {
    claim: "Mass balance is arithmetic, not a promise",
    proof: "20 L attested against an 18 L plant receipt. Tolerance allowed 18. The 2 L gap cost the collector 0.496 USDC, taken from the bond.",
  },
  {
    claim: "An unanswered audit costs the whole bond",
    proof: "A sampled batch went unconfirmed past the challenge window. The collector's deposit went 499.504 → 0.",
  },
  {
    claim: "A restaurant's signature stops the slash",
    proof: "A second batch was sampled and confirmed by its restaurant. Flagging it then reverted AlreadyConfirmed and the bond stayed whole.",
  },
  {
    claim: "The truck share refuses unapproved holders",
    proof: "An ERC-3643 transfer to a wallet that is not on the allow list reverts with AccountIsBlocked. Compliance that has already said no.",
  },
];

function Receipt() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHead
        eyebrow="Live on Hedera testnet"
        title="Every claim above has a transaction behind it"
        lede="Not a prototype of the idea. A deployed contract whose runtime bytecode matches the committed source, with the enforcement path exercised end to end — including the parts where it refuses us."
      />

      <div className="mt-14 grid gap-3 sm:grid-cols-2">
        {EVIDENCE.map((e) => (
          <div key={e.claim} className="glass sheen p-7">
            <p className="mb-3 text-lg">{e.claim}</p>
            <p className="leading-relaxed text-muted">{e.proof}</p>
          </div>
        ))}
      </div>

      <div className="glass sheen mt-3 p-7 md:p-8">
        <p className="label mb-5">Deployed</p>
        <div className="grid gap-4 md:grid-cols-3">
          <Deployed
            name="Turmoil.sol"
            id="0.0.10448308"
            note="attestation, mass balance, audit"
          />
          <Deployed
            name="TURMOIL UNIT 001"
            id="0.0.10452566"
            note="ERC-3643 truck share, 4,000 issued"
          />
          <Deployed name="Settlement" id="0.0.10448306" note="6-decimal USDC stand-in" />
        </div>
        <p className="label mt-6 leading-relaxed">
          Circle&rsquo;s testnet faucet reports success and delivers nothing on Hedera, and no
          DEX there carries their USDC — so the demo settles against a stand-in with the same
          six decimals. <code>payToken</code> is immutable and token-agnostic; binding the real
          one is a config change, and an earlier deployment ran on it.
        </p>
      </div>
    </section>
  );
}

function Deployed({ name, id, note }: { name: string; id: string; note: string }) {
  return (
    <a
      href={`https://hashscan.io/testnet/contract/${id}`}
      target="_blank"
      rel="noreferrer"
      className="group block"
    >
      <p className="mb-1 text-base">{name}</p>
      <p className="datum text-sm text-oil group-hover:underline">{id} ↗</p>
      <p className="label mt-1">{note}</p>
    </a>
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
    figure: "2 Mt",
    body: "of POME-oil biofuel reached the EU in 2023 — against an estimated 1 Mt available worldwide.",
    source: "T&E — Palm oil in disguise?",
    href: "https://www.transportenvironment.org/uploads/files/202504_POME_fraud_Report.pdf",
  },
  {
    figure: "2.5 yr",
    body: "proposed suspension of ISCC recognition for waste-based biofuels, tabled before the European Commission.",
    source: "QC Intel",
    href: "https://www.qcintel.com/biofuels/article/eu-countries-propose-plan-to-suspend-iscc-waste-biofuel-certification-sources-38517.html",
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

/*
  `live` means there is a transaction on Hedera testnet behind it. `designed`
  means exactly what it says. Labelling our own unbuilt layers costs a little
  and buys the only thing that matters on a page like this, which is that the
  live ones can be believed without checking.
*/
const LAYERS = [
  {
    tag: "L1",
    name: "Dual attestation",
    body: "A batch exists only if the restaurant and the collector both sign it. The owner signs by scanning a QR on the driver's phone, so physical co-presence is implied by the scan itself.",
    kills: "Kills unilateral fabrication.",
    status: "live",
  },
  {
    tag: "L2",
    name: "Conservation law",
    body: "The plant signs for the weight it actually received. The contract enforces Σ(attestations) ≤ receipt + tolerance. A skimming driver produces an arithmetic gap.",
    kills: "A bill of lading, on chain.",
    status: "live",
  },
  {
    tag: "L3",
    name: "Revenue-gated payout",
    body: "Truck-token holders are paid only out of stablecoin the system actually received. Inflating volume cannot manufacture a distribution.",
    kills: "Inflation stops paying.",
    status: "designed",
  },
  {
    tag: "L4",
    name: "Anomaly flagging",
    body: "A thin agent reads events and flags what does not fit: a restaurant at 3× its own eight-week average, a route whose volume never closes, one driver's gap trending. A risk scorer, not an oracle.",
    kills: "Enforcement stays in the mechanism, not in a model's judgment.",
    status: "designed",
  },
  {
    tag: "L5",
    name: "Random audit, extrapolated slashing",
    body: "When a lot seals, the contract calls Hedera's PRNG at 0x169 and samples 30% of the batches — after sealing, so nobody knows which. A sampled restaurant confirms with its own signature. A failure burns the collector's bond.",
    kills: "This is how customs auditing works.",
    status: "live",
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
                <div className="mb-2 flex flex-wrap items-baseline gap-3">
                  <p className="text-xl">{l.name}</p>
                  <span
                    className={`label rounded border px-2 py-0.5 ${
                      l.status === "live"
                        ? "border-pass/40 text-pass"
                        : "border-line text-muted"
                    }`}
                  >
                    {l.status === "live" ? "live on testnet" : "designed, not built"}
                  </span>
                </div>
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
          <div key={s.who} className="glass sheen lift bright p-7">
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

/*
  Two lines, not two essays. Both choices are already demonstrated further up the
  page — the 0x169 seed in the evidence block, the gasless signature in the flow —
  so restating them at length was the page arguing with itself.
*/
function Stack() {
  const items = [
    {
      name: "Hedera",
      body: "Native PRNG at 0x169 for the audit draw — no oracle, no VRF wait. Trucks issued as ERC-3643 through Asset Tokenization Studio, because a share of an operating asset is a security.",
    },
    {
      name: "Privy",
      body: "Email login, embedded wallet, EIP-712 signature. No HBAR, no transaction, no install. The collector relays and pays the gas, since the collector earns the margin.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass sheen grid gap-6 p-7 md:grid-cols-2 md:gap-10 md:p-8">
        {items.map((i) => (
          <div key={i.name}>
            <p className="label mb-2">Built on</p>
            <p className="mb-2 text-2xl">{i.name}</p>
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
