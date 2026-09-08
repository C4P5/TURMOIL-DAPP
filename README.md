<h1 align="center">TURMOIL</h1>

<p align="center">
  <strong>Oil pickup sevice + UCO audits for verifiable Biofuel operations, onchain-</strong>
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

| Finding | Source |
|---|---|
| **~80%** of UCO the EU imported in 2022 is **suspected** to be mislabelled virgin palm oil | [Transport & Environment](https://www.transportenvironment.org/articles/uco) |
| **1.8 million tonnes** of fraudulently ISCC-certified POME entered the EU in 2023 | [Maritime Executive](https://maritime-executive.com/article/eu-scrutinizes-fraud-in-certification-of-biofuels) |
| ISCC's certified volumes **exceed physical production** (March 2025 data) | Same |
| A live proposal asks the European Commission to **suspend recognition of ISCC** for waste-based biofuels for 2.5 years | Same |
| ISCC **withdrew or suspended 7 certificates** after a mislabelling investigation; 6 revoked, **3 holders China-based** | [QC Intel](https://www.qcintel.com/biofuels/article/iscc-withdraws-certification-from-uco-supplier-accused-of-non-delivery-33218.html) |
| The European Commission opened an **anti-dumping investigation** (Dec 2023), plus a probe into Indonesian biodiesel routed via China to evade duties | [Fastmarkets](https://www.fastmarkets.com/insights/ec-confirms-china-eu-waste-biofuel-probe/) |

Palm oil and used cooking oil are chemically similar enough that you cannot tell them apart by looking, and largely not by testing either. So the entire market runs on **paperwork** — and the body issuing that paperwork is in enough trouble that regulators are discussing not recognising it any more.

The fraud is possible because **a certificate is a claim made by one party about oil nobody else saw.**

---

## The Solution

TURMOIL builds the receipt - Incentivizes small bussinesses, and *ackchyually* collects UCO from reliable sources (instead of, you know, fraud).

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

- **A real, documented, unsolved market crime** — Pretty self-exlainatory. Every figure above is sourced and dated.
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

**No middleware.** Everything is EVM contracts on Hedera + Next.js frontend. Business logic that matters lives onchain where anyone can check and audit independantly.

**Restaurants never transact.** Hedera natively supports ECDSA secp256k1 keys, so a Privy embedded wallet signs EIP-712 typed data for a batch. The collector relays both signatures in one call:

```solidity
attest(Batch calldata b, bytes calldata sigRestaurant, bytes calldata sigCollector)
```

The contract `ecrecover`s both and requires two distinct registered parties. Nobody without HBAR is ever asked to pay gas.

**The collector is the residual claimant.** The restaurant is paid instantly, because a small business can't wait a week. Any reconciliation shortfall comes out of the collector's deposit — so the operator has a direct financial reason to measure honestly and refuse an inflated number from a supplier.

**The restaurants are the check on TURMOIL.** We collect the oil *and* issue the receipt, which is exactly the conflict of interest that broke ISCC. The answer is structural: **we cannot inflate our own volume, because every litre requires a signature from a restaurant we do not employ — and the audit challenges them directly, after the load is sealed.**

---

<a id="audit"></a>

## The Audit Mechanism

After a load closes, the contract calls Hedera's PRNG precompile and selects **10% of the pickups at random**. Those restaurants get a one-tap confirmation challenge. A failed confirmation is punished **as if the same proportion of the whole load were fake.**

```
Hedera PRNG:  IPrngSystemContract(0x169).getPseudorandomSeed()  → bytes32
              (running hash of the n-3 transaction record, HIP-351)

Seed is drawn AFTER the load is sealed, so the collector cannot
know in advance which pickups will be challenged.
```

**Why cheating loses money.** Fake 5 of 100 pickups; 10 are sampled without replacement:

```
P(no fake sampled) = (90·89·88·87·86) / (100·99·98·97·96) ≈ 0.584
P(caught)          ≈ 41.6%
```

Get caught once and you are fined as though 10% of the load were fake. With the deposit sized at **10% of load value**, that is the entire deposit — a ~41.6% chance of losing everything to gain 5%. The expected value of cheating is negative. That is the whole design.

---

## Adversarial Demo

Most projects demo the happy path. We demo the system refusing to be cheated.

| Attack | What stops it |
|---|---|
| A restaurant records a pickup alone | Reverts — two distinct registered keys required |
| A restaurant inflates its volume | Mass balance at the plant, plus the random audit |
| **TURMOIL inflates a load** | Every litre needs a signature from a restaurant we don't employ; the audit asks them directly |

> 🚧 **Foundry test names and demo recording — WIP**

---

<a id="threat"></a>

## Threat Model & Honest Limits

**We cannot chemically distinguish palm oil from used cooking oil.** Hell, neither ISCC can — that is exactly why the fraud works so well. Anyone claiming a supply-chain system that solves this is straight-up making stuff up. The lateral thinking that makes this project viable is: "why would small, medium, or family-owned restaurants lie about this? We're literally paying them for picking up their goop". And there are hundreds of them - all over the world, probably discarding +100L of used oil weekly.  

What we actually change: the origin claim becomes **two-sided and mass-balanced**. Every litre traces to a named restaurant that signed with its own key, and the totals cannot exceed what the plant received. Faking this at the scale the EU is currently seeing would mean fabricating thousands of restaurant counterparties, each signing independently, each surviving a random post-hoc challenge. That is a different order of difficulty from buying a certificate. 

Other things this system does **not** do (yet):

- It does not make the oil itself testable.
- It does not replace an accredited certification body. It produces the evidence one would need. Exploring the feasibility of adding this to the platform is a top priority PR
- It won't stop plants from lying about what they received — but the plant is also part the party paying, so understating costs it money, and the drivers' signed batches contradict it. An extraodinary dumb thing to do in my most honest opinion  
- System assumes restaurants are repeat counterparties. A one-time supplier has weaker deterrence.

---

## Contracts

> 🚧 **WIP — addresses, ABIs and verified HashScan links land as they deploy.**

| Contract | Purpose | Status |
|---|---|---|
| `BatchRegistry` | Pickup lifecycle; dual EIP-712 attestation | 🚧 |
| `PayoutEscrow` | Instant USDC payout on countersignature | 🚧 |
| `LotRegistry` | Lot aggregation, plant receipt, mass-balance invariant | 🚧 |
| `AuditSampler` | `0x169` sampling + extrapolated slashing | 🚧 |
| Truck token | ERC-3643 via Hedera Asset Tokenization Studio | 🚧 |

---

## Token Economics

**Truck share (ERC-3643).** Issue price = truck cost ÷ number of shares. Whitelisted holders only, transfer restrictions enforced by the compliance module. Holders receive USDC distributions **only from revenue that actually arrived** — there is no promised yield, no floor price, and no minted token backing a claim the system cannot fund. A buyback fund accrues from a fixed percentage of revenue and redeems at whatever it can genuinely cover.

**Collector deposit.** Sized at 10% of load value, so the audit arithmetic above holds literally.

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
├── contracts/        # Foundry — Solidity + tests          🚧
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
- ** LOVE AND A NEURODIVERGENT SENSE OF JUSTICE ❤️‍🔥**
---

## Team

| Name | Role | Links |
|---|---|---|
| Santiago Caprioli | buildoor | [GitHub](https://github.com/C4P5) |
| Claude 5 | Orchestrator | (https://www.anthropic.com) |

---

## References

- [Transport & Environment — *UCO: The Certified Unknown*](https://www.transportenvironment.org/articles/uco)
- [EU scrutinizes fraud in certification of biofuels](https://maritime-executive.com/article/eu-scrutinizes-fraud-in-certification-of-biofuels)
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
  <strong>Eighty percent of Europe's "used cooking oil" is suspected to be virgin palm oil.<br/>We make the other twenty percent provable — from the fryer.</strong>
</p>
