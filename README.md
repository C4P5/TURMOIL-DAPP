<h1 align="center">TURMOIL</h1>

<p align="center">
  <strong>Used cooking oil, traceable to the fryer it came from, and the trucks that collect it, owned by anyone.</strong>
</p>

<p align="center">
  <a href="#the-problem">The problem</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#why-cheating-loses-money">The arithmetic</a> ·
  <a href="#what-this-cannot-do">Honest limits</a> ·
  <a href="#running-it">Running it</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20on-Hedera-blueviolet" alt="Hedera"/>
  <img src="https://img.shields.io/badge/RWA-ERC--3643%20via%20ATS-green" alt="ERC-3643"/>
  <img src="https://img.shields.io/badge/Wallets-Privy-blue" alt="Privy"/>
  <img src="https://img.shields.io/badge/License-MIT-lightgrey" alt="MIT"/>
</p>

---

A restaurant hands over a drum of used frying oil. A driver measures it, both sign the same figure, and the restaurant is paid in stablecoin before the truck leaves. When the load reaches the plant, the plant signs for what its scale says. If the litres do not add up, the difference comes out of the collector's bond. A random sample of pickups is then checked with the restaurants themselves, drawn after the load is sealed so nobody knows in advance which ones.

That is the whole product: a receipt for waste oil that two parties signed and a third party's scale has to agree with.

<a id="the-problem"></a>

## The problem

Biodiesel is made from used cooking oil, and Europe pays a premium for fuel made from waste instead of virgin crops. That premium is why people cheat.

### The arithmetic does not close

| Finding | Date | Source |
|---|---|---|
| Roughly 2 Mt of POME-oil-based biofuel reached the European market in 2023, against an estimated 1 Mt available globally | Mar 2025 | [Transport & Environment, *Palm oil in disguise?*](https://www.transportenvironment.org/uploads/files/202504_POME_fraud_Report.pdf) |
| 1.8 million tonnes of fraudulently ISCC-certified POME entered the EU | 2023 | [Maritime Executive](https://maritime-executive.com/article/eu-scrutinizes-fraud-in-certification-of-biofuels) |
| ISCC certified volumes exceed physical production | Mar 2025 | Same |
| ISCC issued certification for fuel from a refinery in the UAE that, per BLE satellite imagery, does not exist. ISCC suspended the importer's certificate, not the auditor that approved the non-existent refinery | Nov 2025 | [NDR Panorama 3](https://www.ndr.de/fernsehen/sendungen/panorama3/meldungen/betrug-mit-biotreibstoffen-besser-als-drogenhandel,betrug-biodiesel-hvo-100.html) |

The first row is contested, and you should hear it from us rather than find it yourself. [studioGearUp](https://www.studiogearup.com/current-pome-based-biofuels-in-eu-fall-within-current-production-potential/) puts global POME-oil production at 1.2 to 2 Mt rather than the 1 Mt T&E works from, which would place 2023 European consumption at the ceiling of what is produced rather than past it. We cite the stricter figure because it is the one in the report, and we name the looser one because the argument survives either reading. When the volume of a commodity and the volume of its certification are the same number, and no independent record of either exists, "at the ceiling" and "past the ceiling" are the same problem.

### The scale of the incentive

| Finding | Date | Source |
|---|---|---|
| Relabelling palm oil as waste earns $300 to $565 per tonne, with total profits estimated in the hundreds of millions of euros. One trader called it better than drug dealing | 2023–2025 | Argus Media, via [NDR Panorama 3](https://www.ndr.de/fernsehen/sendungen/panorama3/meldungen/betrug-mit-biotreibstoffen-besser-als-drogenhandel,betrug-biodiesel-hvo-100.html) |
| About 80% of the used cooking oil Europe burns is imported, roughly 60% of it from China, so the chain of custody starts outside EU jurisdiction | Dec 2023 | [Transport & Environment](https://www.transportenvironment.org/articles/80-of-europes-used-cooking-oil-now-imported-raising-concerns-over-fraud-study) |
| The European Court of Auditors says voluntary schemes cannot guarantee that all UCO imported into Europe is actually used | 2023 | via T&E, above |

### The response so far

| Finding | Date | Source |
|---|---|---|
| EU member states tabled a proposed 2.5-year suspension of ISCC recognition for waste-based biofuels. ISCC states no vote was taken and no decision made at the March 2025 meeting, so it remains a live proposal | Mar 2025 | [QC Intel](https://www.qcintel.com/biofuels/article/eu-countries-propose-plan-to-suspend-iscc-waste-biofuel-certification-sources-38517.html) · [ISCC's response](https://www.iscc-system.org/news/on-the-recent-discussions-on-iscc-eu-certification-for-waste-based-biofuels/) |
| ISCC withdrew or suspended 7 certificates after a mislabelling investigation. Six were revoked, three of the holders China-based | 2024 | [QC Intel](https://www.qcintel.com/biofuels/article/iscc-withdraws-certification-from-uco-supplier-accused-of-non-delivery-33218.html) |
| Germany's BLE linked two companies to certification fraud | May 2025 | [S&P Global](https://www.spglobal.com/energy/en/news-research/latest-news/crude-oil/050725-german-biofuels-regulator-links-two-companies-to-certification-fraud) |
| The European Commission opened an anti-dumping investigation, plus a probe into Indonesian biodiesel routed via China to evade duties | Dec 2023 | [Fastmarkets](https://www.fastmarkets.com/insights/ec-confirms-china-eu-waste-biofuel-probe/) |
| Eleven arrests in Indonesia, customs officials and executives, over virgin palm oil declared as POME | Feb 2026 | QC Intel |

Palm oil and used cooking oil are chemically similar enough that you cannot reliably tell them apart by looking, and largely not by testing either. So the market runs on paperwork, and the body issuing that paperwork certified more POME than the planet is thought to produce, and a refinery that was not there. A certificate is a claim made by one party about oil nobody else saw.

### From 2027, Europe stops accepting that

[Commission Regulation (EU) 2025/2181](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32025R2181), published 30 October 2025, amends Annexes I, XIV and XV of Regulation (EU) No 142/2011 and rewrites what an importer has to show:

| Requirement | What it means for a supplier |
|---|---|
| UCO must come from approved or registered establishments in the exporting country | Being clean is no longer enough. You have to be on a list |
| Backed by a "fully documented chain of custody, including initial collection and processing all the way to delivery" | The chain starts at collection, not at the first aggregator |
| An importer's declaration on the official template (Annex XV, Ch. 22) | Per consignment, not per annual audit |
| All UCO imports from officially approved sources, 2027 | A dated deadline, not a consultation |

Initial collection is the fryer. It is the one link no certificate scheme evidences today, and the link `attest()` produces a signature for. Every honest exporter selling into Europe acquires that documentation problem on the same date, which is what makes this a market rather than a policing exercise.

Sources: [EUR-Lex 32025R2181](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32025R2181) · [QC Intel](https://www.qcintel.com/biofuels/article/eu-to-require-registration-of-uco-suppliers-from-2027-51947.html) · [ResourceWise](https://www.resourcewise.com/blog/eu-tightens-rules-on-uco-imports-implications-for-the-biofuels-market)

---

<a id="how-it-works"></a>

## How it works

**The business asks.** A restaurant opens its own screen and requests a pickup for the oil it already has. The operation starts with the generator, the way it does in the real trade.

**Two signatures or no pickup.** The driver measures the oil and the company wallet signs the batch. The restaurant scans a QR carrying that batch and signs it too. Neither side can record a pickup alone, and the countersignature is only possible in the same room.

**The restaurant is paid immediately, in USDC.** Their wallet was created from an email address through Privy. No seed phrase, no app, no gas: they sign EIP-712 typed data off-chain and the collector submits both signatures in one transaction and pays for it.

**The totals have to close.** When the load reaches the plant, the plant signs for what arrived with its own key. We relay that signature and cannot author the number. The contract enforces `Σ(attested batches) ≤ received + tolerance`, and any shortfall is debited from the collector's bond rather than from the restaurants or the investors.

**A random sample is checked.** See [the audit mechanism](#why-cheating-loses-money).

**The trucks are shares.** Each collection vehicle is issued as an ERC-3643 security token through Hedera's Asset Tokenization Studio: whitelisted holders, transfer restrictions enforced on-chain, distributions declared as corporate actions.

### The collector is a company wallet, not a key on a phone

The restaurant signs with its own embedded wallet, which is the point of the design. The collector is a company, and a company's signing identity does not belong on the phone of whoever happens to be driving today. Drivers change; the identity and the bond posted against it do not.

So TURMOIL keeps one Privy server wallet under a policy that allows exactly three things:

1. sign `Batch` typed data, but only for the TURMOIL domain on chain 296
2. send transactions to `Turmoil.sol`
3. call `approve` on the settlement token, but only with `Turmoil.sol` as the spender

A driver authenticates with Privy, the server checks them against the operator's driver list, and only then does the company wallet sign. The driver never holds the key they are using. Every refusal below was executed against the live policy, not asserted:

| Attempt | Result |
|---|---|
| `Batch` typed data carrying a different `verifyingContract` | `RPC request denied due to policy violation` |
| HBAR transfer to any address other than `Turmoil.sol` | `policy violation` |
| `transfer()` of the wallet's own USDC | `policy violation` |
| `approve(Turmoil, …)` on the same token | allowed |

A leaked copy of the server's credentials therefore steals nothing. The worst it can do is sign pickups that still need a restaurant's independent signature and still have to survive the mass balance at the plant.

---

<a id="why-cheating-loses-money"></a>

## The audit mechanism

Once a load is sealed, the contract draws a random sample of the pickups inside it, 30% of the batches and never fewer than three, using Hedera's PRNG system contract at `0x169` ([HIP-351](https://hips.hedera.com/hip/hip-351)). Those restaurants are asked to confirm the pickup happened. A failed confirmation burns the collector's entire bond.

```
IPrngSystemContract(0x169).getPseudorandomSeed() -> bytes32
(running hash of the n-3 transaction record, HIP-351)

Drawn AFTER the lot is sealed, once only, and sampled without replacement,
so the collector cannot know what will be checked and the drawer cannot
redraw until it likes the answer.
```

### Why cheating loses money

Two numbers do the work: how much of a lot gets sampled, and how large the bond is relative to the lot it secures. The bond is 50% of lot value and a caught fabrication forfeits all of it. Getting caught costs the bond while you keep what you stole, so the expectation is `EV = f − p·D` for fabricated fraction `f`, catch probability `p`, and bond `D`:

| Batches in lot | Sampled | Fabricated | P(caught) | EV of cheating |
|---|---|---|---|---|
| 100 | 30 | 5% | 83.9% | −36.96% |
| 100 | 30 | 10% | 97.7% | −38.85% |
| 10 | 3 | 10% | 30.0% | −5.00% |
| 4 | 3 | 25% | 75.0% | −12.50% |

Hypergeometric, sampling without replacement, expressed as a fraction of lot value.

**Why the sample has a floor.** A flat percentage of a small lot rounds down to a single draw, and with one draw the catch probability is simply the fabricated fraction, so `EV = f·(1 − D)` is negative only if the bond exceeds the entire lot's value. Three is the smallest sample that deters anything.

**Why the fine is the whole bond.** An earlier version fined an unbiased extrapolation of the sample: fake 5%, get fined as though 10% were fake. That is zero-EV by construction, and at a 41.6% catch rate it was positive-EV, because a caught cheat forfeited a bond worth twice what it stole while an uncaught one kept everything. Deterrence needs the downside to dominate the upside, which no unbiased estimator can do. A strict review caught this after the claim had already been published.

**Why it is sized this way.** Relabelling palm oil as waste earns $300 to $565 per tonne. Deterrence that is not priced against a number that large is decoration. Sample rate, sample floor and bond size are all owner-tunable, because that payoff moves.

### The adversarial tests

| Attack | What stops it |
|---|---|
| A restaurant records a pickup alone | Reverts. Two distinct registered keys required |
| One address registered in both roles pays itself | Reverts. Two roles is not two parties |
| A collector attests without posting a bond | Reverts. An unbonded collector caps every slash at zero |
| A collector inflates volume | Mass balance at settlement. The gap comes out of their bond |
| A collector never seals, to dodge the audit | The owner can force-seal the lot |
| The auditor redraws until it flags what it wants | Reverts. The sample is drawn once |
| TURMOIL types its own received weight | Reverts. The figure needs a registered plant's signature |
| TURMOIL flags an honest restaurant | Reverts. A restaurant that confirmed cannot be flagged, and it has a challenge window to answer in |

These are executable tests in [`contracts/test/Turmoil.t.sol`](contracts/test/Turmoil.t.sol), 22 of them, passing:

```
test_RevertWhen_OnlyRestaurantSigns                  one party cannot invent a pickup
test_RevertWhen_SelfDeal                             two roles is not two parties
test_RevertWhen_UnderBonded                          no bond, no attestation
test_RevertWhen_SignatureReplayed                    a signature cannot be reused
test_SettleSlashesShortfallBeyondTolerance           inflated volume caught by mass balance
test_OwnerCanForceSealLot                            the collector cannot dodge settlement
test_RevertWhen_AuditRedrawn                         the sample is drawn once
test_AuditSamplesDistinctBatches                     without replacement
test_SampleFloorAppliesToSmallLots                   a sample of one deters nothing
test_AuditFailureBurnsEntireBond                     a fabricated pickup costs the whole bond
test_RevertWhen_SettledWithoutPlantSignature         the weight must be signed, not typed
test_SettleRecordsWhichPlantSigned                   and it is attributable afterwards
test_ConfirmedBatchCannotBeFlagged                   a restaurant that answered is safe
test_RevertWhen_FlaggedBeforeChallengeWindowCloses   it gets time to answer
test_RevertWhen_SomeoneElseConfirmsForTheRestaurant  only its own key will do
testFuzz_ShortfallIsAlwaysChargedToTheCollector      (runs: 2000)
```

The fuzz test is the one that matters: 2,000 random `(attested, received)` pairs, asserting the gap is always charged to the collector or capped at their bond, never absorbed by investors. Most of these exist because a strict review found the mechanism they test missing or wrong, and each fix landed with the test that would have caught it.

---

<a id="what-this-cannot-do"></a>

## What this cannot do

**We cannot chemically distinguish palm oil from used cooking oil.** Neither can ISCC, which is why the fraud works. Any supply-chain system claiming otherwise is selling something.

Diligence alone has not solved it either. A 2023 USDA report suggested Neste may have received fraudulently exported virgin palm oil as UCO at its Singapore refinery. Neste runs laboratory analysis on incoming material, supplier vetting, third-party audits and traceability systems, and it [disputed the finding](https://www.biobased-diesel.com/post/neste-challenges-assertions-in-usda-report-about-receiving-fraudulent-uco-from-china), stating its own analyses did not support the assertion. Take that at face value and it is still the argument for this project: the largest buyer in the sector, with the best testing in the sector, ended up in a public dispute about what it had bought.

What changes here is the shape of the claim. The origin becomes two-sided and mass-balanced. Every litre traces to a named restaurant that signed with its own key, and the totals cannot exceed what the plant received. Faking that at the scale Europe is currently seeing means fabricating thousands of restaurant counterparties who each sign independently and each survive a random post-hoc challenge. That is a different order of difficulty from buying a certificate.

Other things this does not do:

- It does not make the oil itself testable.
- It does not replace an accredited certification body. It produces the evidence one would need.
- It does not stop a plant lying about what it received. The plant is also the party paying, so understating costs it money, and the drivers' signed batches contradict it.
- It assumes restaurants are repeat counterparties. A one-time supplier has weaker deterrence.
- The bond bounds what can be recovered. Fabricate more than the bond is worth, above roughly half a load, and the theft outruns the slash even at a 92% catch rate. Faking half a load is not subtle, though: it puts the mass balance out by half, and `settleLot` catches that deterministically rather than by sampling. The two mechanisms cover different sizes of fraud and neither is sufficient alone.

### What the operator still controls

The project's argument is that unverified claims are worthless, so here is what remains inside our control.

`setRestaurant` is owner-controlled, with nothing on chain tying an address to a real business. Fabricated restaurants cost one transaction each. What stops that being free is the audit: a fabricated restaurant has to answer a confirmation challenge with a key, on a batch it cannot predict. Nothing prevents an operator from holding those keys itself. Binding registration to an off-chain business identity is the obvious next step and is not built.

The operator chooses when to draw the audit and when to flag. It cannot choose what the sample contains, cannot redraw, and cannot flag a batch the restaurant confirmed, but it can decline to draw at all.

`settleLot` still requires the owner to submit, though the weight must carry a registered plant's signature.

What the contract enforces: every litre carries signatures from two distinct registered parties, the received weight is signed by a plant rather than typed by us, the totals cannot exceed it beyond tolerance without the collector's bond paying the gap, and a sampled restaurant can defend itself with its own signature.

---

## Deployed on Hedera testnet

| | |
|---|---|
| `Turmoil.sol` | [`0.0.10448308`](https://hashscan.io/testnet/contract/0.0.10448308) · `0x89440484d81ab086616586aa3922619d579c6a7c` |
| Settlement token | `DemoUSDC` [`0.0.10448306`](https://hashscan.io/testnet/contract/0.0.10448306) · `0xDb8b588021B1926857B183cf59830B3a7c5415b1`, symbol `USDC`, 6 decimals |
| Truck share | `TURMOIL UNIT 001` [`0.0.10452566`](https://hashscan.io/testnet/contract/0.0.10452566) · `0x26b8a054df08c26b692615725200815feaadf8b2` |
| Company wallet | `0x18F5cB7Da6Ce33B8C4a4884dc6a90d5Ae7d66CFA` = `0.0.10488364`, registered collector, 100 USDC bond |
| EIP-712 domain | `name: "TURMOIL"`, `version: "1"`, `chainId: 296`, `verifyingContract:` the address above |
| Live parameters | `pricePerLitre 248000` ($0.248/L) · `depositBps 5000` · `sampleBps 3000` · `toleranceBps 200` · `challengeWindow 60s` |

`challengeWindow` is 60 seconds on this deployment so the audit can be demonstrated inside a few minutes. Production is three days. Every value above is read back from the deployed contract rather than copied from the deploy script.

Both contracts are verified on Sourcify with an exact runtime match: [`Turmoil.sol`](https://repo.sourcify.dev/296/0x89440484D81AB086616586aA3922619d579c6a7c) and [`DemoUSDC`](https://repo.sourcify.dev/296/0xDb8b588021B1926857B183cf59830B3a7c5415b1).

### Proven on chain

| Claim | How it was verified |
|---|---|
| The deployed contract is the committed source | Verified on Sourcify as an [exact match](https://repo.sourcify.dev/296/0x89440484D81AB086616586aA3922619d579c6a7c), so a stranger can check it instead of taking our word. We also compared runtime bytecode byte for byte against the local build: all 30 differing runs are constructor-set immutables, `payToken`, the cached `chainId` (`0x128` = 296), the contract's own address, and the EIP-712 name and version |
| A restaurant is paid without ever transacting | Balance `0 → 4,960,000` ($4.96 for 20 L) in the same transaction that recorded the pickup |
| A Privy signature verifies inside a Hedera contract | `attest()` passed both `ECDSA.recover` checks against the registered addresses |
| A restaurant needs no token association | Contract and embedded wallet both carry `maxAutomaticTokenAssociations = -1`, and no association transaction exists on either |
| The bond gate fires | An unbonded collector's attestation reverted `UnderBonded()` before any payout |
| Audit sampling comes from Hedera | `drawAudit` on lot 0 stored seed `0xa5df6581…b387df`, lot 1 drew a different one, both from `0x169` and both after the lot sealed |
| Mass balance is arithmetic | 20 L attested against an 18 L plant receipt, allowed `(18×10200)/10000 = 18`, shortfall 2 L, 496,000 slashed from the bond. The plant address stored is the recovered signer, not a field we set |
| An unanswered audit costs the whole bond | A sampled batch went unconfirmed past the challenge window, and `flagAudit` burned the deposit from 499.504 to 0 |
| A confirmed batch cannot be flagged | Another batch was sampled and confirmed by its restaurant's own key. `flagAudit` then reverted `AlreadyConfirmed` and the bond stayed whole. This is the leg that makes restaurants a check on us rather than the other way round |
| Transfer restrictions restrict | A share transfer to an unapproved wallet reverts `AccountIsBlocked`. On creation the allow list held nobody, including the issuer, whose own redeem was refused |
| The whole loop runs from the browser | Three pickups were created end to end through the UI, signed by the policy-bound company wallet and each restaurant's own key: 20 L, 50 L and 30 L, paid instantly. `batchCount` is 5 across 3 lots |

### Why the demo does not settle in real USDC

It was supposed to. Circle's USDC on Hedera testnet is [`0.0.429274`](https://hashscan.io/testnet/token/0.0.429274) and we verified it: `FUNGIBLE_COMMON`, 6 decimals, no KYC key, ERC-20 facade answering at `0x…068cDa`. The contract was deployed bound to it and `payToken()` returned that address.

We could not obtain any. Circle's faucet lists Hedera Testnet and reports success, and nothing arrives. Two attempts hours apart delivered zero, with no inbound transfer and no token association ever created on the receiving account, while the faucet's rate limiter counted both requests against the quota. Other accounts were receiving 20-USDC drips at the same time. The receiving side was provably fine: `deleted: false`, `maxAutomaticTokenAssociations: -1`, `receiverSigRequired: false`. SaucerSwap's testnet has 592 pools and none of them holds `0.0.429274`.

So the demo settles against a 6-decimal `DemoUSDC` deployed by the same script. This changes no logic: `payToken` is immutable and set from the constructor, and the contract assumes nothing about the token beyond `SafeERC20` and six decimals. Setting `SETTLEMENT_TOKEN` back to `0x…068cDa` binds real USDC, which is how the first deployment ran. One unplanned upside: a 20-USDC drip every two hours would have capped the demo at 80 litres, and a 100,000 USDC float lets it run at honest volumes.

---

## The truck share

Collection needs capital before it earns anything: a van, a pump, a route. That is ordinary asset finance, and dressing it up as a utility token would make it an unregistered security. So the share is issued as ERC-3643 through Hedera's Asset Tokenization Studio, carrying the transfer restrictions a security actually has.

| | |
|---|---|
| Supply | 4,000 shares, 6 decimals, $10.00 nominal, $40,000 per unit |
| ISIN | `UYTURMOIL015` |
| Regulation | Reg S, offshore offering, sanctioned jurisdictions blocked |
| Compliance | Allow list, internal KYC, registered SSI credential issuer, `isControllable() == true` |
| Rights | Information, liquidation and redemption on. Put right deliberately off |

Redemption lets the issuer buy shares back out of revenue that arrived. A put right would let a holder force that buyback, which is a floor price by another name and an obligation the truck's revenue may not be able to meet. The issuer may buy back; nobody must.

### The lifecycle, run on chain

| Step | Result |
|---|---|
| KYC granted to a new holder | `grantKyc` with a credential id, valid from and to, and the registered issuer |
| Added to the allow list | `getControlListCount` 1 → 2 |
| Compliant transfer | 400 shares moved to the holder, issuer left with 3,600 |
| Corporate action declared | `setDividend` with a record date and execution date, 20.000000 at 6 decimals. `getDividendsCount` 0 → 1 |
| Entitlement read back | `getDividendFor` returns `tokenBalance 400.000000`, `recordDateReached true` |
| Paid | 20 USDC delivered to the holder of record |

**What is not automated.** The USDC payment was a manual transfer to the address that holds the shares. ATS ships a separate Mass Payout service that distributes pro rata to every holder, and we did not deploy it: it needs its own backend, a Postgres instance and a full monorepo build. The entitlement is computed on chain; the payment is not yet.

**What is not wired.** ERC-3643 also defines an on-chain `identityRegistry` and a modular `compliance` contract. On this token both read `0x0`, because Hedera publishes no deployed identity-registry or compliance infrastructure for testnet, and pointing them at a non-existent address would be worse than leaving them unset. The restrictions above come from ATS's own allow list and internal KYC registry, which is what refused the blocked transfer. Both have setters, so wiring them is configuration rather than a redeploy.

Also note `getDividend` still reports `snapshotId 0`. The per-holder view reports the balance at the record date and flags `recordDateReached`, and no snapshot id was bound in this deployment.

---

## What the market pays

The contract holds `pricePerLitre = 248000`, which is $0.248 per litre to the restaurant.

| Leg of the chain | Price | Source |
|---|---|---|
| What a generator receives, US benchmark | $0.026–0.079/L | Energy Solutions, *UCO Market 2026*, Jun 2026 |
| What a generator receives, typical EU practice | often nothing, free removal is the payment | ibid. |
| What a plant pays a collector, Brazil | $0.72/L | Statledger, *Brazil UCO Market*, Sep 2025 |
| HoReCa collection cost, Brazil | $0.50–0.55/L | ibid. |
| UCO DDP Northwest Europe | €1,040–1,075/t, about $0.97–1.06/L | Fastmarkets, Mar 2026 |

So $0.248 is three to eight times the going rate to the generator, and more than the zero most European restaurants get. It is deliberately above market, funded by the spread between what a generator is paid and what a plant pays. Paying a restaurant properly is the acquisition strategy, and the reason a restaurant would bother scanning anything.

Sensitivity, one truck, 40 stops a week at 20 L:

| | Resale @ $0.72/L | Resale @ $1.00/L |
|---|---|---|
| Revenue on 800 L | $576 | $800 |
| Paid to restaurants (800 × $0.248) | −$198 | −$198 |
| Truck amortisation | −$109 | −$109 |
| Before fuel, labour, insurance | +$269/wk | +$493/wk |

These are Brazilian and European prices. No Uruguayan figure is public at any point in the chain, fuel and labour and insurance are not modelled, and 20 L per stop is the low end: a measured Ecuadorean study puts fast-food outlets at 10 to 24 L per week, with larger venues well above that.

Restaurant payouts come from the collector's bond, which `postDeposit` transfers into the contract and `attest` pays out of, so investors never front working capital and a shortfall hits the collector's margin rather than the raise.

## What it costs to run

Measured on Hedera testnet at an observed gas price of about 2,240 to 2,260 gwei. Foundry labels the total "ETH"; it means HBAR.

| Operation | Gas | Note |
|---|---|---|
| Deploy `Turmoil.sol` | 5,194,465 | about 4.28 ℏ measured from the balance delta, against an 11.6 ℏ estimate |
| `attest()` | 274,868 | two signature recoveries, a batch write and a USDC transfer |
| `drawAudit()` | 110,138 | includes the `0x169` call and partial Fisher-Yates over the lot |
| `settleLot()` | 81,135 | plant signature recovery, mass-balance check, slash |
| `confirmBatch()` | 40,449 | the restaurant's defence, relayed, so the restaurant pays nothing |
| `flagAudit()` | 44,959 | burns the entire bond |
| Materialise a restaurant account | 607,859 | high for a transfer because it creates the account, one time per restaurant |

The restaurant's cost is zero. They sign typed data and the collector's relayer pays every fee, which is correct: the party paying the gas is the party earning the margin. Enforcement is also cheap relative to collection. `flagAudit` and `confirmBatch` each cost under a sixth of `attest`.

---

## Hedera services used

| Service | Purpose |
|---|---|
| Smart Contract Service | `Turmoil.sol`: attestation, mass balance, audit slashing |
| PRNG system contract `0x169` | Audit sampling drawn after the lot seals (HIP-351) |
| HTS auto-association | Restaurants receive USDC with no association transaction (`maxAutomaticTokenAssociations = -1`, HIP-904) |
| Asset Tokenization Studio | ERC-3643 truck share, allow list, internal KYC, SSI issuer registry, dividend corporate action |
| JSON-RPC relay | Frontend reads and relayed writes, `testnet.hashio.io/api` |
| Mirror node | Deployment, account and token verification |

The auto-association row is load-bearing. Without HIP-904 defaults a restaurant would have to sign an association transaction before it could be paid, and the "never sends a transaction" claim would be false.

## The app

Next.js with the Privy React SDK. Email login creates an embedded wallet, and the restaurant signs typed data without ever sending a transaction.

| Route | Who | What happens |
|---|---|---|
| `/` | Anyone | Static landing. No client components, no wallet, no chain reads, so it renders with zero environment variables set |
| `/restaurant` | Restaurant | Request a pickup, see the balance and past pickups, withdraw. First visit registers the business and activates the wallet |
| `/collect` | Driver | Open requests, pick a restaurant by name, enter litres, get a QR for the owner to scan |
| `/sign` | Restaurant | Opened from the QR. Shows the litres and the exact USDC amount read live from the contract, then signs |
| `/lot/[id]` | Anyone | Chain of custody: every pickup in a lot, the plant's weight, and the audit seed once drawn |
| `/api/collector-sign` | Server | Verifies the driver's Privy token against the app's JWKS, checks the driver list, asks the company wallet to sign |
| `/api/attest` | Server | Submits a batch both parties already signed. Holds no authority: `attest()` verifies both signatures on chain |
| `/api/onboard` | Server | Registers a restaurant and sends 0.5 ℏ so it can move what it earns. Declines to fund when the relayer drops below 200 ℏ |
| `/api/pickup-request` | Server | The queue of businesses waiting for a truck |

Every figure on screen is read from `Turmoil.sol` through the JSON-RPC relay, `pricePerLitre` included, because it is owner-tunable state and hardcoding it would let the consent screen misstate what someone is agreeing to.

Pickup requests are stored in memory and are not durable. They die with the server process and are not shared between serverless instances. A real deployment puts them in the operator's database.

<a id="running-it"></a>

## Running it

Needs [Foundry](https://getfoundry.sh), Node 20+, a Hedera testnet account from [portal.hedera.com](https://portal.hedera.com) (ECDSA, not ED25519), and a [Privy](https://dashboard.privy.io) app id.

### Contracts

```bash
cd contracts
forge test                       # 22 tests, fuzz at 2000 runs

cp .env.example .env             # then add PRIVATE_KEY
set -a && source .env && set +a

# Simulate against live Hedera state first, no key and no transaction:
forge script script/Deploy.s.sol --tc Deploy \
  --rpc-url hedera_testnet --sender <your-address>

# Then broadcast:
forge script script/Deploy.s.sol --tc Deploy \
  --rpc-url hedera_testnet --private-key "$PRIVATE_KEY" --broadcast
```

The deploy prints the contract address and the full EIP-712 domain. Copy those into the app rather than typing them: if `chainId` or `verifyingContract` drifts by one character, every signature recovers to a stranger and `attest()` reverts with `BadSignature`, which is indistinguishable from forgery.

Leaving `SETTLEMENT_TOKEN` unset deploys a 6-decimal `DemoUSDC` and mints an escrow float, which is what you want against a local `anvil`.

### Frontend

```bash
cd app
npm install
cp .env.example .env.local       # then fill in, see the file for what each value does
npm run dev                      # localhost:3000
```

`next dev` reads the environment only at boot, so restart it after editing `.env.local` or it will keep serving the previous configuration. Add every origin you will use to Privy's allowed origins, including `http://localhost:3000`: adding one origin turns the list from "anything" into "only these", and a missing entry fails with `Origin not allowed` and a page stuck on a loading state.

### Driver access

`/collect` refuses anyone who is not on the operator's driver list. `DRIVERS` is a comma-separated list of emails, and leaving it unset denies everyone: defaulting an empty list to "any authenticated user" would let a missing environment variable turn the company wallet into a public signing service, and the failure would look exactly like everything working.

## Project structure

```
TURMOIL-DAPP/
├── contracts/
│   ├── src/Turmoil.sol             the whole protocol, one contract
│   ├── test/Turmoil.t.sol          22 tests, fuzz at 2000 runs
│   └── script/Deploy.s.sol         anvil or Hedera, prints the domain
├── app/
│   ├── app/page.tsx                static landing
│   ├── app/(app)/collect/          driver: requests, name, litres, QR
│   ├── app/(app)/restaurant/       owner: ask, balance, pickups, withdraw
│   ├── app/(app)/sign/             owner: email login, sign
│   ├── app/(app)/lot/[id]/         chain of custody
│   ├── app/api/                    collector-sign, attest, onboard, pickup-request
│   ├── app/_components/            shared cards
│   └── lib/                        ABI, EIP-712 domain, route book
└── docs/
```

One contract, not four. A single operator, never upgraded. Splitting this into a registry, an escrow, a lot ledger and a sampler would buy four deploys, four verifications and cross-contract authorisation for no change in behaviour.

The anomaly flagger described in earlier drafts reads events and scores risk. Enforcement lives in the contract rather than in it, which is why it is the last thing on the list rather than the first, and it is not built.

## Validation

The prices, volumes and market structure above come from published sources and are cited with dates. What has not happened is a conversation with a real restaurant, collector or plant. Every counterparty in the demo is simulated, and the strongest evidence here is that the mechanism works on chain, not that anyone has agreed to use it. Closing that gap is the first thing a pilot would do.

The problem is international and the pilot geography is incidental. This was built in Montevideo, where UCO export is legal, the domestic collector is a state company that pays generators nothing, and no public registry of private collectors serving restaurants exists. Nothing in the contract is Uruguayan.

## AI attribution

Built solo, with heavy use of Claude Opus 5 via Claude Code. The split:

| Component | Human | AI |
|---|---|---|
| Problem selection, domain knowledge, restaurant-industry context | All | |
| Market research and source verification | Direction, judgment calls | Search, fetch, checking claims against primary sources |
| Architecture and mechanism design | Every decision and trade-off | Proposed options, challenged assumptions, found the `0x169` and ERC-3643 paths |
| Killed ideas (Guardian, carbon credits, native token, ENS) | Final calls | Verification that surfaced why each failed |
| Smart contracts | Mechanism design, every economic parameter, and the demand that the deterrence arithmetic be computed rather than asserted | Solidity drafting, plus an adversarial review that returned BLOCK with eight executed proof-of-concept tests |
| Tests | Which attacks must be provably impossible | Foundry test authoring, fuzz setup |
| Frontend | Screen-by-screen intent, UX calls, review | React and Next drafting, EIP-712 wiring, Privy and Hedera integration |
| Hedera integration and deployment | Credentials, go/no-go calls, the decision to spike before building | Spike design and execution, mirror-node verification, deploy and on-chain checks |
| This README | Review and corrections | Drafting |

The most useful thing to know about that split is where it failed. The worst error in this project was the AI's, and it survived until something adversarially tested it. The headline claim, that the expected value of cheating is negative, was published while false: the old fine was an unbiased extrapolation and therefore zero-EV by construction, and at the demo's own configuration cheating paid 0.84% of lot value. The 41.6% catch probability underneath it had been derived correctly; the conclusion it supported was never computed. A correct sub-calculation inside an unchecked claim.

It was caught by running a review that tried to break the contract, not by reading the contract. The same pass found a `depositBps` that was declared, assigned and never read, which made every slash cap out at nothing, and a once-only audit guard keyed on `seed != 0`, which is dead off-Hedera because that is exactly what `block.prevrandao` returns there. The deterrence table above is the corrected one.

## Built with

[Hedera Smart Contract Service](https://hedera.com/smart-contract) · [Asset Tokenization Studio](https://github.com/hashgraph/asset-tokenization-studio) · [HIP-351 PRNG](https://hips.hedera.com/hip/hip-351) · [Privy](https://privy.io) · [Foundry](https://getfoundry.sh) · [Next.js](https://nextjs.org)

## Team

| Name | Role | Links |
|---|---|---|
| Santiago Caprioli | buildoor | [GitHub](https://github.com/C4P5) |
| Claude Opus 5 | Orchestrator | [Anthropic](https://www.anthropic.com) |

## References

- [Transport & Environment, *UCO: The Certified Unknown*](https://www.transportenvironment.org/articles/uco)
- [Transport & Environment, *Palm oil in disguise?* (March 2025)](https://www.transportenvironment.org/uploads/files/202504_POME_fraud_Report.pdf)
- [Transport & Environment, 80% of Europe's used cooking oil now imported](https://www.transportenvironment.org/articles/80-of-europes-used-cooking-oil-now-imported-raising-concerns-over-fraud-study)
- [Commission Regulation (EU) 2025/2181](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32025R2181), the 2027 chain-of-custody requirement
- [QC Intel, EU to require registration of UCO suppliers from 2027](https://www.qcintel.com/biofuels/article/eu-to-require-registration-of-uco-suppliers-from-2027-51947.html)
- [ResourceWise, EU tightens rules on UCO imports](https://www.resourcewise.com/blog/eu-tightens-rules-on-uco-imports-implications-for-the-biofuels-market)
- [studioGearUp, POME-based biofuels fall within production potential](https://www.studiogearup.com/current-pome-based-biofuels-in-eu-fall-within-current-production-potential/), the counter-estimate, cited because it disputes us
- [NDR Panorama 3, *Betrug mit Biotreibstoffen*](https://www.ndr.de/fernsehen/sendungen/panorama3/meldungen/betrug-mit-biotreibstoffen-besser-als-drogenhandel,betrug-biodiesel-hvo-100.html)
- [OCCRP, How biofuels scams have undermined a flagship EU climate policy](https://www.occrp.org/en/investigation/how-biofuels-scams-have-undermined-a-flagship-eu-climate-policy)
- [S&P Global, German biofuels regulator links two companies to certification fraud](https://www.spglobal.com/energy/en/news-research/latest-news/crude-oil/050725-german-biofuels-regulator-links-two-companies-to-certification-fraud)
- [Maritime Executive, EU scrutinizes fraud in certification of biofuels](https://maritime-executive.com/article/eu-scrutinizes-fraud-in-certification-of-biofuels)
- [Neste's response to the USDA report](https://www.biobased-diesel.com/post/neste-challenges-assertions-in-usda-report-about-receiving-fraudulent-uco-from-china)
- [QC Intel, ISCC withdraws certification from UCO supplier](https://www.qcintel.com/biofuels/article/iscc-withdraws-certification-from-uco-supplier-accused-of-non-delivery-33218.html)
- [Fastmarkets, EC confirms China-EU waste biofuel probe](https://www.fastmarkets.com/insights/ec-confirms-china-eu-waste-biofuel-probe/)
- [HIP-351, UtilPrngTransaction](https://hips.hedera.com/hip/hip-351)
- [ERC-3643, T-REX permissioned tokens](https://eips.ethereum.org/EIPS/eip-3643)
- [Hedera Asset Tokenization Studio docs](https://docs.hedera.com/hedera/open-source-solutions/asset-tokenization-studio-ats)

## License

MIT, see [LICENSE](./LICENSE).
