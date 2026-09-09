<h1 align="center">TURMOIL</h1>

<p align="center">
  <strong>Oil pickup service + UCO audits for verifiable Biofuel operations, onchain.</strong>
</p>

<p align="center">
  Used cooking oil, traceable to the exact fryer it came from — and the trucks that collect it, owned by anyone.
</p>

<p align="center">
  <a href="#track">ETHOnline 2026</a> ·
  <a href="#problem">The Problem</a> ·
  <a href="#audit">The Audit Mechanism</a> ·
  <a href="#threat">Honest Limits</a> ·
  <a href="#quickstart">Quick Start</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20on-Hedera-blueviolet" alt="Hedera"/>
  <img src="https://img.shields.io/badge/RWA-ERC--3643%20via%20ATS-green" alt="ERC-3643"/>
  <img src="https://img.shields.io/badge/Wallets-Privy-blue" alt="Privy"/>
  <img src="https://img.shields.io/badge/Stack-Next.js%20%2B%20Foundry-orange" alt="Stack"/>
  <img src="https://img.shields.io/badge/Location-Uruguay%20🇺🇾-blue" alt="Uruguay"/>
  <img src="https://img.shields.io/badge/License-MIT-lightgrey" alt="MIT"/>
</p>

> 🚧 **Header image — WIP**

---

<a id="problem"></a>

## The Problem

Biodiesel is largely -and preferably- made from **used cooking oils (UCO)**. Europe pays a premium for fuel that is made from waste instead of virgin crops — and this premium is exactly why bad actors cheat.

The numbers, from the people who investigate this for a living:

### The arithmetic doesn't close

| Finding | Date | Source |
|---|---|---|
| Roughly **2 Mt of POME-oil-based biofuel** reached the European market in 2023 — **more than global production capacity** | Apr 2025 | [Transport & Environment](https://www.transportenvironment.org/articles/uco) |
| **1.8 million tonnes** of fraudulently ISCC-certified POME entered the EU | 2023 | [Maritime Executive](https://maritime-executive.com/article/eu-scrutinizes-fraud-in-certification-of-biofuels) |
| ISCC certified volumes **exceed physical production** | Mar 2025 | Same |
| ISCC issued certification for fuel from a refinery in the UAE that, per BLE satellite imagery, **does not exist**. ISCC suspended the *importer's* certificate — **not the auditor** that approved the non-existent refinery *(as reported by NDR Panorama 3)* | Nov 2025 | [NDR Panorama 3](https://www.ndr.de/fernsehen/sendungen/panorama3/meldungen/betrug-mit-biotreibstoffen-besser-als-drogenhandel,betrug-biodiesel-hvo-100.html) |

### The scale of the incentive

| Finding | Date | Source |
|---|---|---|
| Relabelling palm oil as waste earns **$300–565 per tonne**; total profits estimated in the hundreds of millions of euros. A trader interviewed called it **better than drug dealing** | 2023–2025 | Argus Media, via [NDR Panorama 3](https://www.ndr.de/fernsehen/sendungen/panorama3/meldungen/betrug-mit-biotreibstoffen-besser-als-drogenhandel,betrug-biodiesel-hvo-100.html) |
| **~80% of EU used cooking oil is imported**, ~60% of it from China — a supply chain that begins outside EU jurisdiction | Dec 2024 | [Transport & Environment](https://www.transportenvironment.org/articles/uco) |
| T&E estimates **20–33%** of imported UCO is **suspected** to be mislabelled virgin palm oil | Nov 2025 – Jun 2026 | Transport & Environment |

### The response so far

| Finding | Date | Source |
|---|---|---|
| **26 of 27 EU member states** back a proposed **2.5-year suspension** of ISCC recognition for waste-based biofuels | Mar 2025 – Mar 2026 | ENGINE / Varuna Marine |
| ISCC **withdrew or suspended 7 certificates** after a mislabelling investigation; 6 revoked, **3 holders China-based** | 2024 | [QC Intel](https://www.qcintel.com/biofuels/article/iscc-withdraws-certification-from-uco-supplier-accused-of-non-delivery-33218.html) |
| Germany's **BLE linked two companies to certification fraud** | May 2025 | [S&P Global](https://www.spglobal.com/energy/en/news-research/latest-news/crude-oil/050725-german-biofuels-regulator-links-two-companies-to-certification-fraud) |
| European Commission opened an **anti-dumping investigation**, plus a probe into Indonesian biodiesel routed via China to evade duties | Dec 2023 | [Fastmarkets](https://www.fastmarkets.com/insights/ec-confirms-china-eu-waste-biofuel-probe/) |
| **11 arrests in Indonesia** — customs officials and executives — over virgin palm oil declared as POME | Feb 2026 | QC Intel |

Palm oil and used cooking oil are chemically similar enough that you cannot reliably tell them apart by looking, and largely not by testing either. So the entire market runs on **paperwork** — and the body issuing that paperwork certified more POME than the planet produces, and a refinery that isn't there.

The fraud is possible because **a certificate is a claim made by one party about oil nobody else saw.**

---

## The Solution

TURMOIL builds the receipt - Incentivizes small businesses, and *ackchyually* collects UCO from reliable sources (instead of, you know, fraud).

**1. Two signatures or no pickup.** A driver arrives to collect a restaurant's used oil, measures it, and shows a QR code on his phone containing the batch hash. The restaurant scans it and signs. Neither party can record a pickup alone, and the countersignature is only possible in the same room.

**2. The restaurant is paid in USDC, immediately.** Their wallet is created with an email address through Privy. No seed phrase, no app install, no gas — the restaurant signs **EIP-712 typed data off-chain**, and the collector submits both signatures in a single transaction and pays for it.

**3. The totals have to close.** When the load reaches the plant, the plant signs a receipt for what physically arrived. The contract enforces `Σ(attested batches) ≤ received + tolerance`. Any shortfall is debited from the driver's deposit, or against a restaurant's future payouts — never from investors.

**4. We audit ourselves at random.** See [the audit mechanism](#audit).

**5. The trucks are shares.** Each collection vehicle is issued as an **ERC-3643 security token** through Hedera's Asset Tokenization Studio — whitelisted holders, transfer restrictions enforced on-chain, distributions paid only from stablecoin revenue that actually arrived. Buying into a route funds both the truck and the payment float.

---

<a id="track"></a>

## Hackathon Track & Bounty

| | Details |
|---|---|
| **Hackathon** | ETHGlobal — ETHOnline 2026 (Sept 4–16) |
| **Primary track** | Hedera — *Tokenization of Anything* (Asset Tokenization Studio) |
| **Secondary track** | Privy — *Best B2B Financial Product* / *Best Financial Flow* |
| **Registration** | Classic "From Scratch" — no pre-event code |
| **Team** | Solo |

### Why This Qualifies

- **A real, documented, unsolved market crime** — Pretty self-explanatory. Every figure above is sourced and dated.
- **ERC-3643, not a hand-rolled NFT.** A truck paying revenue to holders is a security. We issued it on rails built for such — identity registry, compliance module, transfer restrictions — rather than pretending it isn't one. Because that's the right thing to do. 
- **Hedera-native, not a copy-paste EVM deploy.** Audit sampling uses Hedera's PRNG system contract at `0x169` ([HIP-351](https://hips.hedera.com/hip/hip-351)) — no oracle, no VRF wait.
- **Gasless for the people who don't want a wallet.** Restaurants sign typed data; they never hold HBAR or send a transaction.
- **The economics of cheating are negative on purpose**, The arithmetic is further down in this README.
- **We state what the system cannot do** — see [Honest Limits](#threat).

---

## System Overview

```
                        ┌──────────────────────────┐
   investor ──USDC────► │  TRUCK TOKEN (ERC-3643)  │
                        │  via Hedera ATS          │
                        └────────────┬─────────────┘
                                     │ funds truck + escrow float
                                     ▼
 restaurant ──oil──► collector ──lot──► plant
      │                   │              │
      │ EIP-712 sig       │ tx + sig     │ signs receipt (weight)
      ▼                   ▼              ▼
 ┌──────────────────────────────────────────────────┐
 │  BatchRegistry → PayoutEscrow → LotRegistry      │
 │  Σ attested ≤ received + tolerance               │
 │  0x169 PRNG → random 10% audit → slash deposit   │
 └──────────────────────┬───────────────────────────┘
                        │ revenue-gated
                        ▼
             distribution ──USDC──► token holders
```

> 🚧 **Rendered architecture image — WIP**

---

## Key Design Decisions

**No middleware.** Everything is EVM contracts on Hedera + Next.js frontend. Business logic that matters lives onchain where anyone can check and audit independently.

**Restaurants never transact.** Hedera natively supports ECDSA secp256k1 keys, so a Privy embedded wallet signs EIP-712 typed data for a batch. The collector relays both signatures in one call:

```solidity
attest(Batch calldata b, bytes calldata sigRestaurant, bytes calldata sigCollector)
```

The contract `ecrecover`s both and requires two distinct registered parties. Nobody without HBAR is ever asked to pay gas.

**The collector is the residual claimant.** The restaurant is paid instantly, because a small business can't wait a week. Any reconciliation shortfall comes out of the collector's deposit — so the operator has a direct financial reason to measure honestly and refuse an inflated number from a supplier.

**The restaurants are the check on TURMOIL.** We collect the oil *and* issue the receipt, which is exactly the conflict of interest that broke ISCC. The answer has to be structural: **every litre requires a signature from a restaurant we do not employ**, so inflating a load means fabricating counterparties who each sign independently and each survive a random post-hoc challenge. Two of the three legs of that argument are enforced on chain today; the third — the challenge itself — is not yet, and [Honest Limits](#threat) says exactly which.

---

<a id="audit"></a>

## The Audit Mechanism

Once a load is sealed, the contract draws a random sample of the pickups inside it — **30% of the batches, never fewer than three** — using Hedera's PRNG precompile. Those restaurants are asked to confirm the pickup happened. **A failed confirmation burns the collector's entire bond.**

```
Hedera PRNG:  IPrngSystemContract(0x169).getPseudorandomSeed()  → bytes32
              (running hash of the n-3 transaction record, HIP-351)

Drawn AFTER the lot is sealed, once only, and sampled without
replacement — so the collector cannot know what will be checked,
and the drawer cannot redraw until it likes the answer.
```

### Why cheating loses money

Two numbers do the work: how much of a lot gets sampled, and how large the collector's bond is relative to the lot it secures. The bond is **50% of lot value**, and a caught fabrication forfeits **all** of it.

Getting caught costs the bond while you keep what you stole, so the expectation is `EV = f − p·D` for fabricated fraction `f`, catch probability `p`, and bond `D`:

| Batches in lot | Sampled | Fabricated | P(caught) | EV of cheating |
|---|---|---|---|---|
| 100 | 30 | 5% | 83.9% | **−36.96%** |
| 100 | 30 | 10% | 97.7% | **−38.85%** |
| 10 | 3 | 10% | 30.0% | **−5.00%** |
| 4 | 3 | 25% | 75.0% | **−12.50%** |

*Hypergeometric, sampling without replacement, expressed as a fraction of lot value.*

**Why the sample has a floor.** A flat percentage of a small lot rounds down to a single draw, and with one draw the catch probability is simply the fabricated fraction — so `EV = f·(1 − D)`, which is negative only if the bond exceeds the entire lot's value. Three is the smallest sample that deters anything, so it is a floor rather than a target.

**Why the fine is the whole bond, not a share of it.** An earlier version fined an unbiased extrapolation of the sample — fake 5%, get fined as though 10% were fake. That is zero-EV by construction, and at a 41.6% catch rate it was strictly *positive*-EV: a caught cheat forfeited a bond worth twice what it stole while an uncaught one kept everything. Deterrence needs the downside to dominate the upside, which no unbiased estimator can do.

**Why any of this is sized the way it is.** Relabelling palm oil as waste earns $300–565 per tonne, and a trader in the NDR investigation called it better than drug dealing. Deterrence that isn't priced against a number that large is decoration. Sample rate, sample floor and bond size are all owner-tunable, because that payoff moves.

---

## Adversarial Demo

Most projects demo the happy path. We demo the system refusing to be cheated.

| Attack | What stops it |
|---|---|
| A restaurant records a pickup alone | Reverts — two distinct registered keys required |
| One address registered in both roles pays itself | Reverts — two roles is not two parties |
| A collector attests without posting a bond | Reverts — an unbonded collector caps every slash at zero |
| A collector inflates volume | Mass balance at settlement; the gap comes out of their bond |
| A collector never seals, to dodge the audit | Owner force-seals the lot |
| The auditor redraws until it flags what it wants | Reverts — the sample is drawn once |

All three are executable tests, not slides — [`contracts/test/Turmoil.t.sol`](contracts/test/Turmoil.t.sol):

```
test_RevertWhen_OnlyRestaurantSigns          one party cannot invent a pickup
test_RevertWhen_SelfDeal                     two roles is not two parties
test_RevertWhen_UnderBonded                  no bond, no attestation
test_RevertWhen_SignatureReplayed            a signature cannot be reused
test_SettleSlashesShortfallBeyondTolerance   inflated volume caught by mass balance
test_OwnerCanForceSealLot                    the collector cannot dodge settlement
test_RevertWhen_AuditRedrawn                 the sample is drawn once
test_AuditSamplesDistinctBatches             without replacement
test_SampleFloorAppliesToSmallLots           a sample of one deters nothing
test_AuditFailureBurnsEntireBond             a fabricated pickup costs the whole bond
testFuzz_ShortfallIsAlwaysChargedToTheCollector   (runs: 2000)
```

16 passing. The fuzz test is the one that matters: 2,000 random `(attested, received)` pairs, asserting the gap is always charged to the collector or capped at their bond — never absorbed by investors.

Most of these exist because a strict review found the mechanism they test to be missing or wrong. The git history has the details; each fix landed with the test that would have caught it.

> 🚧 **Demo recording — WIP**

---

<a id="threat"></a>

## Threat Model & Honest Limits

**We cannot chemically distinguish palm oil from used cooking oil.** Hell, neither ISCC can — that is exactly why the fraud works so well. Anyone claiming a supply-chain system that solves this is straight-up making stuff up. The lateral thinking that makes this project viable is: "why would small, medium, or family-owned restaurants lie about this? We're literally paying them for picking up their goop". And there are hundreds of them - all over the world, probably discarding +100L of used oil weekly.

Nor is this a problem that diligence alone has solved. A 2023 USDA report suggested Neste may have received fraudulently exported virgin palm oil as UCO at its Singapore refinery. Neste — which runs laboratory analysis on incoming material, supplier vetting, third-party audits and traceability systems — [disputed the finding](https://www.biobased-diesel.com/post/neste-challenges-assertions-in-usda-report-about-receiving-fraudulent-uco-from-china), stating its own analyses did not support the assertion and that the reference was "either a mistake or based on a misunderstanding." Take that at face value and it is *still* the argument for this project: the largest buyer in the sector, with the best testing in the sector, ended up in a public dispute about what it had bought. That is not negligence. It is what happens when provenance rests on paperwork.

What we actually change: the origin claim becomes **two-sided and mass-balanced**. Every litre traces to a named restaurant that signed with its own key, and the totals cannot exceed what the plant received. Faking this at the scale the EU is currently seeing would mean fabricating thousands of restaurant counterparties, each signing independently, each surviving a random post-hoc challenge. That is a different order of difficulty from buying a certificate. 

Other things this system does **not** do (yet):

- It does not make the oil itself testable.
- It does not replace an accredited certification body. It produces the evidence one would need. Exploring the feasibility of adding this to the platform is a top priority PR
- It won't stop plants from lying about what they received — but the plant is also the party paying, so understating costs it money, and the drivers' signed batches contradict it. An extraordinarily dumb thing to do, in my most honest opinion.
- System assumes restaurants are repeat counterparties. A one-time supplier has weaker deterrence.
- **The bond bounds what can be recovered.** Fabricate more than the bond is worth — above roughly half a load — and the theft outruns the slash: expected value turns non-negative even at a 92% catch rate, because forfeiting the bond only cancels the gain. Faking half a load is not subtle, though. It puts the mass balance out by half, and `settleLot` catches that deterministically rather than by sampling. The two mechanisms cover different sizes of fraud, and neither is sufficient alone.

### What is not built yet

This section exists because the project's whole argument is that unverified claims are worthless. These are claims the code does **not** currently support:

- **There is no plant role on chain.** `settleLot` takes the received weight as an owner-supplied argument, so today the operator types the number its own mass balance is checked against. The design calls for the plant to sign that figure; it isn't implemented.
- **The confirmation challenge is not on chain.** `flagAudit` is an owner assertion, not a restaurant signature. A restaurant cannot yet prove it confirmed a pickup, nor dispute a false flag.
- **`setRestaurant` is owner-controlled**, with nothing tying an address to a real business, so fabricated restaurants cost one transaction each.

What the contract genuinely enforces today is narrower than the headline: *every litre carries a signature from an address the operator registered as a restaurant, and the totals cannot exceed what was reported received without the collector's bond paying for the gap.* That is still a real improvement on a certificate nobody can check. It is not yet "we cannot inflate our own volume."

---

## Contracts

**One contract**, not four. A single operator, never upgraded — splitting this into a registry, an escrow, a lot ledger and a sampler would buy four deploys, four verifications and cross-contract authorisation for no change in behaviour.

[`contracts/src/Turmoil.sol`](contracts/src/Turmoil.sol)

| Function | What it does |
|---|---|
| `attest()` | Requires EIP-712 signatures from restaurant **and** collector over the same struct, with per-restaurant nonces. Pays the restaurant instantly. The restaurant never sends a transaction and never needs gas |
| `sealLot()` | Closes the collector's open lot so the audit sample can be drawn against a fixed set |
| `settleLot()` | Plant reports what arrived; enforces `Σ attested ≤ received + tolerance` and charges any gap to the collector's deposit |
| `drawAudit()` | Samples `sampleBps` of the lot's batches using Hedera's PRNG at `0x169` ([HIP-351](https://hips.hedera.com/hip/hip-351)) |
| `flagAudit()` | A sampled batch failed confirmation — fines at the sample rate, so one catch costs the whole deposit |
| `postDeposit()` | Collector bond, sized at 10% of lot value |

Every economic parameter — price per litre, tolerance, sample rate, deposit size — is owner-tunable, because the payoff they have to beat moves.

**Truck share:** a separate ERC-3643 issued through Hedera's Asset Tokenization Studio, which also handles distributions to holders. `Turmoil.sol` does not reference it. 🚧

> 🚧 **Deployed addresses and verified HashScan links land with the testnet deploy.**

---

## Token Economics

**Truck share (ERC-3643).** Issue price = truck cost ÷ number of shares. Whitelisted holders only, transfer restrictions enforced by the compliance module. Holders receive USDC distributions **only from revenue that actually arrived** — there is no promised yield, no floor price, and no minted token backing a claim the system cannot fund. A buyback fund accrues from a fixed percentage of revenue and redeems at whatever it can genuinely cover.

**Collector bond.** **50% of lot value, and `attest` refuses to record a pickup without it.** The bond is the only thing any slash in this system can ever take, so a bond that doesn't cover the lot it secures makes every enforcement path decoration. A caught fabrication forfeits all of it.

> 🚧 **WIP — shares per truck, real truck acquisition cost, buyback percentage. Pending field data.**

---

## Hedera Services Used

| Service | Purpose | ID / Address |
|---|---|---|
| Smart Contract Service | All protocol contracts | 🚧 |
| PRNG system contract | Random audit sampling (HIP-351) | `0x169` |
| HTS — USDC | Restaurant payouts and distributions | `0.0.429274` (testnet, per Circle — 🚧 to verify on HashScan) |
| Asset Tokenization Studio | ERC-3643 truck token issuance | 🚧 |
| Mirror Node | Public reads for the frontend | `testnet.mirrornode.hedera.com` |

---

## Frontend

Next.js with the Privy React SDK. Email login creates an embedded ECDSA wallet; the restaurant signs EIP-712 typed data and never sends a transaction.

> 🚧 **WIP — screens table, live URL, data sources.**

---

<a id="quickstart"></a>

## Quick Start

> 🚧 **WIP — lands with the first working scaffold.**

---

## Project Structure

```
TURMOIL-DAPP/
├── contracts/        # Foundry — Turmoil.sol + 10 tests    ✅
├── app/              # Next.js + Privy React SDK           🚧
├── agent/            # Reconciliation / anomaly flagger    🚧
├── docs/             # Architecture, threat model, pitch   🚧
└── README.md
```

---

## Real-World Impact & Market Validation

> 🚧 **WIP — field data collection in Montevideo in progress.** Litres per pickup and frequency, who currently collects and whether they pay, what the current disposal receipt physically looks like, and whether Uruguayan restaurants are legally required to document disposal.

---

## Cost Analysis

> 🚧 **WIP — gas per attestation, per lot settlement, and per audit round, measured on testnet.**

---

## AI Attribution

This project is built solo, with heavy use of **Claude Opus 5** (Anthropic) via Claude Code. In the interest of the honesty this project is about, here is the split:

| Component | Human | AI |
|---|---|---|
| Problem selection, domain knowledge, restaurant-industry context | ✅ All | — |
| Market research and source verification | Direction, judgment calls | Search, fetch, fact-checking against primary sources |
| Architecture and mechanism design | Every decision, every trade-off accepted or rejected | Proposed options, challenged assumptions, found the `0x169` and ERC-3643 paths |
| Killed ideas (Guardian, carbon credits, native token, ENS, Etc) | Final calls | Verification that surfaced why each failed |
| Smart contracts | 🚧 | 🚧 |
| Frontend | 🚧 | 🚧 |
| Tests | 🚧 | 🚧 |
| This README | Review and corrections | Drafting |

Design decisions were adversarial, not generated: the architecture below survived several rounds in which proposed features were verified against primary sources and cut when they failed. Hedera's Guardian software, dMRV system with Gold Standard's methodology implementation for carbon credits creation, a native payment token, a Biofuel petrol station, a Biofuel refinery RWA token, and a token floor price were all removed for documented reasons.

> 🚧 **WIP — updated per component as code lands.**

---

## Built With

- **[Hedera Smart Contract Service](https://hedera.com/smart-contract)** — protocol contracts
- **[Hedera Asset Tokenization Studio](https://github.com/hashgraph/asset-tokenization-studio)** — ERC-3643 / ERC-1400 issuance
- **[HIP-351 PRNG](https://hips.hedera.com/hip/hip-351)** — `0x169`, native randomness for audit sampling
- **[Privy](https://privy.io)** — embedded wallets, email login, EIP-712 signing
- **[USDC on Hedera](https://www.circle.com/multi-chain-usdc/hedera)** — settlement
- **[Foundry](https://getfoundry.sh)** — contracts and tests
- **[Next.js](https://nextjs.org)** — frontend
- **LOVE AND A NEURODIVERGENT SENSE OF JUSTICE ❤️‍🔥**

---

## Team

| Name | Role | Links |
|---|---|---|
| Santiago Caprioli | buildoor | [GitHub](https://github.com/C4P5) |
| Claude Opus 5 | Orchestrator | [Anthropic](https://www.anthropic.com) |

---

## References

- [Transport & Environment — *UCO: The Certified Unknown*](https://www.transportenvironment.org/articles/uco)
- [NDR Panorama 3 — *Betrug mit Biotreibstoffen: "Besser als Drogenhandel"*](https://www.ndr.de/fernsehen/sendungen/panorama3/meldungen/betrug-mit-biotreibstoffen-besser-als-drogenhandel,betrug-biodiesel-hvo-100.html) (German public broadcaster)
- [OCCRP — *How Biofuels Scams Have Undermined A Flagship EU Climate Policy*](https://www.occrp.org/en/investigation/how-biofuels-scams-have-undermined-a-flagship-eu-climate-policy)
- [S&P Global — *German biofuels regulator links two companies to certification fraud*](https://www.spglobal.com/energy/en/news-research/latest-news/crude-oil/050725-german-biofuels-regulator-links-two-companies-to-certification-fraud)
- [EU scrutinizes fraud in certification of biofuels](https://maritime-executive.com/article/eu-scrutinizes-fraud-in-certification-of-biofuels)
- [Neste's response to the USDA report](https://www.biobased-diesel.com/post/neste-challenges-assertions-in-usda-report-about-receiving-fraudulent-uco-from-china)
- [ISCC withdraws certification from UCO supplier](https://www.qcintel.com/biofuels/article/iscc-withdraws-certification-from-uco-supplier-accused-of-non-delivery-33218.html)
- [EC confirms China–EU waste biofuel probe](https://www.fastmarkets.com/insights/ec-confirms-china-eu-waste-biofuel-probe/)
- [HIP-351 — UtilPrngTransaction](https://hips.hedera.com/hip/hip-351)
- [ERC-3643 — T-REX permissioned tokens](https://eips.ethereum.org/EIPS/eip-3643)
- [Hedera Asset Tokenization Studio docs](https://docs.hedera.com/hedera/open-source-solutions/asset-tokenization-studio-ats)

---

## License

MIT — see [LICENSE](./LICENSE).

---

<p align="center">
  <strong>Europe burned more POME-based biofuel in 2023 than the planet can produce.<br/>We make used cooking oil provable — from the fryer.</strong>
</p>
