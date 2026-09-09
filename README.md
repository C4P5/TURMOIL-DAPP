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

**3. The totals have to close.** When the load reaches the plant, the plant signs — with its own key — a receipt for what physically arrived. We relay that signature; we cannot author the number. The contract enforces `Σ(attested batches) ≤ received + tolerance`, and any shortfall is debited from the collector's bond, never from investors.

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

**The restaurants are the check on TURMOIL.** We collect the oil *and* issue the receipt, which is exactly the conflict of interest that broke ISCC. The answer is structural, and all three legs are enforced on chain: **every litre requires a signature from a restaurant we do not employ**; the weight the mass balance is checked against carries **a registered plant's signature**, not a number we typed; and a sampled restaurant **confirms with its own key**, which we cannot forge and cannot overrule. Inflating a load means fabricating counterparties who each sign independently and each survive a challenge on a batch nobody could predict.

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
| **TURMOIL types its own received weight** | Reverts — the figure needs a registered plant's signature |
| **TURMOIL flags an honest restaurant** | Reverts — a restaurant that confirmed cannot be flagged, and it has a challenge window to answer in |

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
test_RevertWhen_SettledWithoutPlantSignature the weight must be signed, not typed
test_SettleRecordsWhichPlantSigned           and it is attributable afterwards
test_ConfirmedBatchCannotBeFlagged           a restaurant that answered is safe
test_RevertWhen_FlaggedBeforeChallengeWindowCloses  it gets time to answer
test_RevertWhen_SomeoneElseConfirmsForTheRestaurant only its own key will do
testFuzz_ShortfallIsAlwaysChargedToTheCollector   (runs: 2000)
```

21 passing. The fuzz test is the one that matters: 2,000 random `(attested, received)` pairs, asserting the gap is always charged to the collector or capped at their bond — never absorbed by investors.

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

### What the operator still controls

This section exists because the project's whole argument is that unverified claims are worthless, so here is what remains inside our control:

- **`setRestaurant` is owner-controlled**, with nothing on chain tying an address to a real business. Fabricated restaurants cost one transaction each. What stops that being free is the audit: a fabricated restaurant has to answer a confirmation challenge with a key, on a batch it cannot predict — but nothing prevents an operator from holding those keys itself. Binding registration to an off-chain business identity is the obvious next step and is not built.
- **The operator chooses when to draw the audit and when to flag.** It cannot choose *what* the sample contains, cannot redraw, and cannot flag a batch the restaurant confirmed — but it can decline to draw at all.
- **`settleLot` still requires the owner to submit**, though it can no longer author the weight: that figure must carry a registered plant's signature.

What the contract enforces: *every litre carries signatures from two distinct registered parties, the received weight is signed by a plant rather than typed by us, the totals cannot exceed it beyond tolerance without the collector's bond paying the gap, and a sampled restaurant can defend itself with its own signature.*

---

## Contracts

**One contract**, not four. A single operator, never upgraded — splitting this into a registry, an escrow, a lot ledger and a sampler would buy four deploys, four verifications and cross-contract authorisation for no change in behaviour.

[`contracts/src/Turmoil.sol`](contracts/src/Turmoil.sol)

| Function | What it does |
|---|---|
| `attest()` | Requires EIP-712 signatures from restaurant **and** collector over the same struct, replay-protected by spending the digest. Pays the restaurant instantly. The restaurant never sends a transaction and never needs gas |
| `confirmBatch()` | A sampled restaurant answers the challenge with its own signature. Gasless and relayable, like `attest` |
| `setPlant()` / `setChallengeWindow()` | Registry for the counterparty that signs received weights, and how long a restaurant has to answer |
| `sealLot()` | Closes the collector's open lot so the audit sample can be drawn against a fixed set |
| `settleLot()` | Plant reports what arrived; enforces `Σ attested ≤ received + tolerance` and charges any gap to the collector's deposit |
| `drawAudit()` | Samples `sampleBps` of the lot's batches using Hedera's PRNG at `0x169` ([HIP-351](https://hips.hedera.com/hip/hip-351)) |
| `flagAudit()` | A sampled batch went unanswered — burns the collector's **entire** bond. Refused if the restaurant confirmed, and refused until the challenge window has closed, so the operator cannot fine on sight |
| `postDeposit()` | Collector bond, sized at `depositBps` of lot value — **currently 50%**, and `attest()` refuses a pickup that the bond does not cover |

Every economic parameter — price per litre, tolerance, sample rate, deposit size — is owner-tunable, because the payoff they have to beat moves.

**Truck share:** a separate ERC-3643 issued through Hedera's Asset Tokenization Studio, which also handles distributions to holders. `Turmoil.sol` does not reference it. 🚧 *not yet issued*

### Deployed — Hedera testnet (chain 296)

| | |
|---|---|
| `Turmoil.sol` | [`0.0.10448308`](https://hashscan.io/testnet/contract/0.0.10448308) · `0x89440484d81ab086616586aa3922619d579c6a7c` |
| Settlement token | `DemoUSDC` [`0.0.10448306`](https://hashscan.io/testnet/contract/0.0.10448306) · `0xDb8b588021B1926857B183cf59830B3a7c5415b1` — symbol `USDC`, **6 decimals** |
| EIP-712 domain | `name: "TURMOIL"`, `version: "1"`, `chainId: 296`, `verifyingContract:` the address above |
| Live parameters | `pricePerLitre 248000` ($0.248/L) · `depositBps 5000` · `sampleBps 3000` · `toleranceBps 200` |

Every value above is read back **from the deployed contract**, not copied from the deploy script.

### Why the demo does not settle in real USDC

It was supposed to. Circle's USDC on Hedera testnet is [`0.0.429274`](https://hashscan.io/testnet/token/0.0.429274) and we verified it properly — `FUNGIBLE_COMMON`, 6 decimals, no KYC key, ERC-20 facade answering at `0x…068cDa`. The contract was deployed bound to it, and `payToken()` returned that address.

**We could not obtain any.** Circle's faucet lists Hedera Testnet and reports success; nothing arrives. Two attempts, hours apart, delivered zero — the mirror node shows no inbound transfer and no token association ever created on the receiving account, while the faucet's own rate limiter counted both requests against the quota. Other accounts were receiving 20-USDC drips from it at the same time, and other developers report the same silent failure. The receiving side was provably fine: `deleted: false`, `maxAutomaticTokenAssociations: -1`, `receiverSigRequired: false`.

There is no second source. SaucerSwap's testnet has 592 pools and **not one of them holds `0.0.429274`** — `getPair(WHBAR, USDC)` returns the zero address.

So the demo settles against a 6-decimal `DemoUSDC` deployed by the same script. **This changes no logic.** `payToken` is `immutable` and set from the constructor; the contract never assumes anything about the token beyond `SafeERC20` and six decimals. Setting `SETTLEMENT_TOKEN` to `0x…068cDa` binds real USDC and nothing else changes — that is exactly how the first deployment ran.

The upside was unplanned: a 20-USDC drip every two hours would have capped the demo at 80 litres. A 100,000 USDC float lets the demo run at honest volumes.

### Proven onchain, not asserted

| Claim | How it was verified |
|---|---|
| The deployed contract **is** the committed source | Runtime bytecode compared byte-for-byte against the local build. All 30 differing runs are constructor-set immutables — `payToken`, the cached `chainId` (`0x128` = 296), the contract's own address, and the EIP-712 name and version. Everything else is identical |
| A restaurant is paid without ever transacting | Balance `0 → 4,960,000` (**$4.96** for 20 L), contract float `100,500.00 → 100,495.04`, `batchCount 1` |
| A Privy signature verifies inside a Hedera contract | `attest()` passed both `ECDSA.recover` checks against the registered addresses |
| A restaurant needs no token association | Contract and embedded wallet both carry `maxAutomaticTokenAssociations = -1`; no association transaction exists on either |
| The bond gate actually fires | An unbonded collector's attestation reverted with `UnderBonded()` before any payout |
| Audit sampling really comes from Hedera | `drawAudit` on lot 0 stored seed `0xa5df6581…b387df`; lot 1 drew a different one. Both from `0x169`, both after the lot sealed |
| Mass balance is enforced arithmetically | 20 L attested against an 18 L plant receipt → allowed `(18×10200)/10000 = 18`, shortfall 2 L, **496,000 slashed** from the bond. The plant address stored is the recovered signer, not a field we set |
| An unanswered audit costs the whole bond | Batch 0 went unconfirmed past the challenge window → `flagAudit` burned `deposit` **500.504 → 0** |
| **A confirmed batch cannot be flagged** | Batch 1 was sampled and confirmed by its restaurant's own signature; `flagAudit` then reverted `AlreadyConfirmed` (`0x5f8a9c0b`) and the bond stayed whole. This is the leg that makes the restaurants a check on us rather than the other way round |

---

## Token Economics

**Truck share (ERC-3643).** Issue price = truck cost ÷ number of shares. Whitelisted holders only, transfer restrictions enforced by the compliance module. Holders receive USDC distributions **only from revenue that actually arrived** — there is no promised yield, no floor price, and no minted token backing a claim the system cannot fund. A buyback fund accrues from a fixed percentage of revenue and redeems at whatever it can genuinely cover.

**Collector bond.** **50% of lot value, and `attest` refuses to record a pickup without it.** The bond is the only thing any slash in this system can ever take, so a bond that doesn't cover the lot it secures makes every enforcement path decoration. A caught fabrication forfeits all of it.

> 🚧 **WIP — shares per truck, real truck acquisition cost, buyback percentage. Pending field data.**

---

## Hedera Services Used

| Service | Purpose | ID / Address |
|---|---|---|
| Smart Contract Service | `Turmoil.sol` — attestation, mass balance, audit slashing | [`0.0.10448308`](https://hashscan.io/testnet/contract/0.0.10448308) |
| PRNG system contract | Audit sampling drawn **after** the lot seals (HIP-351) | `0x169` — verified live, returns a non-zero seed |
| HTS — USDC | The token the contract is *designed* to settle in; verified `FUNGIBLE_COMMON`, 6 decimals, no KYC key, and bound by an earlier deployment | [`0.0.429274`](https://hashscan.io/testnet/token/0.0.429274) — unobtainable on testnet, see above |
| Settlement in this demo | `DemoUSDC`, same 6 decimals, deployed by the same script | [`0.0.10448306`](https://hashscan.io/testnet/contract/0.0.10448306) |
| HTS auto-association | Restaurants receive USDC with **no association transaction** | `maxAutomaticTokenAssociations = -1` (HIP-904), on both the contract and the embedded wallet |
| Asset Tokenization Studio | ERC-3643 truck token issuance | 🚧 not yet issued |
| JSON-RPC relay | Frontend contract reads, relayed `attest` writes | `testnet.hashio.io/api` |
| Mirror Node | Deployment, account and token verification during the build | `testnet.mirrornode.hedera.com` |

The auto-association row is load-bearing, not trivia: without HIP-904 defaults a restaurant would have to sign an association transaction before it could be paid, and the "never sends a transaction" claim above would be false.

---

## Frontend

Next.js with the Privy React SDK. Email login creates an embedded ECDSA wallet; the restaurant signs EIP-712 typed data and never sends a transaction.

| Route | Who | What happens |
|---|---|---|
| `/` | Collector | Enter litres, sign as collector, render a QR carrying the batch and that signature |
| `/sign` | Restaurant | Email login, sees the litres and the exact USDC amount read live from the contract, signs. No wallet, no HBAR, no transaction |
| `/lot/[id]` | Anyone | Provenance receipt — every batch in a lot, the plant's received weight, and the audit seed once drawn |
| `/api/attest` | Relayer | Submits a batch both parties already signed. Holds no authority: `attest()` verifies both signatures onchain, so a leaked relayer key can forge nothing and replay nothing |

**Data sources.** Every figure on screen is read from `Turmoil.sol` through the JSON-RPC relay — `pricePerLitre` included, because it is owner-tunable state and hardcoding it would let the consent screen misstate what someone is agreeing to. Nothing is stored off-chain.

🚧 *No public URL yet — runs locally against Hedera testnet.*

---

<a id="quickstart"></a>

## Quick Start

**Needs:** [Foundry](https://getfoundry.sh), Node 20+, a Hedera testnet account from [portal.hedera.com](https://portal.hedera.com) (**ECDSA**, not ED25519), and a [Privy](https://dashboard.privy.io) app id.

### Contracts

```bash
cd contracts
forge test                       # 22 tests, fuzzed at 2000 runs

cp .env.example .env             # then add PRIVATE_KEY
set -a && source .env && set +a

# Simulate against live Hedera state first — no key, no transaction:
forge script script/Deploy.s.sol --tc Deploy \
  --rpc-url hedera_testnet --sender <your-address>

# Then broadcast:
forge script script/Deploy.s.sol --tc Deploy \
  --rpc-url hedera_testnet --private-key "$PRIVATE_KEY" --broadcast
```

The deploy prints the contract address **and the full EIP-712 domain**. Copy those into the app rather than typing them: if `chainId` or `verifyingContract` drifts by one character, every signature recovers to a stranger and `attest()` reverts with `BadSignature` — indistinguishable from forgery.

Leaving `SETTLEMENT_TOKEN` unset deploys a 6-decimal `DemoUSDC` and mints an escrow float, which is what you want against a local `anvil`.

### Frontend

```bash
cd app
npm install
cp .env.example .env.local       # add NEXT_PUBLIC_PRIVY_APP_ID and the deployed address
npm run dev                      # localhost:3000
```

`next dev` reads the environment only at boot — restart it after editing `.env.local`, or the app will keep serving the previous configuration. If `NEXT_PUBLIC_TURMOIL_ADDRESS` is unset the app says so in a banner instead of failing silently.

### Registering counterparties

Only registered addresses can attest. As the contract owner:

```bash
cast send <contract> "setCollector(address,bool)" <collector> true \
  --rpc-url "$HEDERA_RPC_URL" --private-key "$PRIVATE_KEY"
cast send <contract> "setRestaurant(address,bool)" <restaurant> true \
  --rpc-url "$HEDERA_RPC_URL" --private-key "$PRIVATE_KEY"
```

A restaurant's embedded wallet is not a Hedera account until it holds something. Send it a dust HBAR transfer once at signup; the account is then created with unlimited auto-association and can receive USDC without ever signing an association transaction.

---

## Project Structure

```
TURMOIL-DAPP/
├── contracts/
│   ├── src/Turmoil.sol         # the whole protocol, one contract     ✅
│   ├── test/Turmoil.t.sol      # 22 tests, fuzz at 2000 runs          ✅
│   └── script/Deploy.s.sol     # anvil or Hedera, prints the domain   ✅
├── app/
│   ├── app/page.tsx            # collector: measure, sign, show QR    ✅
│   ├── app/sign/page.tsx       # restaurant: email login, sign        ✅
│   ├── app/lot/[id]/page.tsx   # provenance receipt                   ✅
│   ├── app/api/attest/route.ts # relayer                              ✅
│   └── lib/turmoil.ts          # ABI + EIP-712 domain, shared         ✅
├── LICENSE
└── README.md
```

**Not built, and deliberately so.** The anomaly flagger described in the trust model reads events and scores risk; enforcement lives in the contract, not in it, which is why it is the last thing on the list rather than the first. There is no `docs/` — the architecture, threat model and honest limits are all in this file.

---

## Real-World Impact & Market Validation

> 🚧 **WIP — field data collection in Montevideo in progress.** Litres per pickup and frequency, who currently collects and whether they pay, what the current disposal receipt physically looks like, and whether Uruguayan restaurants are legally required to document disposal.

---

## Cost Analysis

Measured on Hedera testnet, chain 296, at an observed gas price of ~2,240–2,260 gwei. Foundry labels the total "ETH"; it is HBAR.

| Operation | Gas | Note |
|---|---|---|
| Deploy `Turmoil.sol` | 5,194,465 | **~4.28 ℏ** measured from the balance delta, against an 11.6 ℏ estimate |
| `attest()` | **274,868** | two signature recoveries, a batch write and a USDC transfer — the only cost in the pickup loop, and the collector pays it |
| `drawAudit()` | **110,138** | includes the `0x169` system-contract call and partial Fisher-Yates over the lot |
| `settleLot()` | **81,135** | plant signature recovery, mass-balance check, slash |
| `confirmBatch()` | **40,449** | the restaurant's defence — relayed, so the restaurant pays nothing for it |
| `flagAudit()` | **44,959** | burns the entire bond for under a sixth of what recording a pickup costs |
| Materialise a restaurant account (dust HBAR) | 607,859 | high for a transfer because it *creates* the account — one-time, per restaurant |

**The restaurant's cost is zero, and that is a design outcome rather than a subsidy.** They sign typed data; the collector's relayer pays every fee. The collector is the party earning the margin, so the party paying the gas is the party being paid — which is also why the relayer key belongs on their device in production, not on our server.

Note the shape of it: enforcement is cheap and collection is not. `flagAudit` and `confirmBatch` both cost under a sixth of `attest` — the two operations that make fraud unprofitable are the least expensive writes in the system.


---

## AI Attribution

This project is built solo, with heavy use of **Claude Opus 5** (Anthropic) via Claude Code. In the interest of the honesty this project is about, here is the split:

| Component | Human | AI |
|---|---|---|
| Problem selection, domain knowledge, restaurant-industry context | ✅ All | — |
| Market research and source verification | Direction, judgment calls | Search, fetch, fact-checking against primary sources |
| Architecture and mechanism design | Every decision, every trade-off accepted or rejected | Proposed options, challenged assumptions, found the `0x169` and ERC-3643 paths |
| Killed ideas (Guardian, carbon credits, native token, ENS, Etc) | Final calls | Verification that surfaced why each failed |
| Smart contracts | Mechanism design, every economic parameter, and the demand that the deterrence arithmetic be *computed* rather than asserted | Solidity drafting; an adversarial review that returned BLOCK with eight executed proof-of-concept tests |
| Tests | Which attacks must be provably impossible for the design to mean anything | Foundry test authoring, fuzz-testing setup |
| Frontend | Screen-by-screen intent, the UX calls, review | React/Next drafting, EIP-712 wiring, Privy and Hedera integration |
| Hedera integration and deployment | Credentials, go/no-go calls, and the decision to spike before building | Spike design and execution, mirror-node verification, deploy and onchain checks |
| This README | Review and corrections | Drafting |

Design decisions were adversarial, not generated: the architecture below survived several rounds in which proposed features were verified against primary sources and cut when they failed. Hedera's Guardian software, dMRV system with Gold Standard's methodology implementation for carbon credits creation, a native payment token, a Biofuel petrol station, a Biofuel refinery RWA token, and a token floor price were all removed for documented reasons.

**The most useful thing to know about this split is where it failed.** The worst error in this project was the AI's, and it survived until something adversarially tested it. The headline claim — *"the expected value of cheating is negative"* — was published while being false: the old fine was an unbiased extrapolation and therefore zero-EV by construction, and at the demo's own configuration cheating paid **+0.84% of lot value**. The 41.6% catch probability underneath it had been derived correctly; the conclusion it supported was never computed at all. A correct sub-calculation inside an unchecked claim.

It was caught by running a review that tried to break the contract, not by reading the contract. The same pass found a `depositBps` that was declared, assigned and never read — making every slash cap out at nothing — and a once-only audit guard keyed on `seed != 0`, which is dead off-Hedera because that is exactly what `block.prevrandao` returns there. The deterrence table in [Why cheating loses money](#) is the corrected one, and it is corrected because it was finally calculated.

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
