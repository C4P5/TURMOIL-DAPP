"use client";

import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, isAddress } from "viem";
import { publicClient } from "@/lib/publicClient";
import { hederaTestnet } from "@/lib/chain";
import { ERC20_ABI, TURMOIL_ABI, TURMOIL_ADDRESS, formatUsdc } from "@/lib/turmoil";
import { ResidualCards } from "@/app/_components/residual-cards";
import { FlowCards } from "@/app/_components/flow-cards";

/**
 * Restaurant view. The other half of the split: a driver runs /collect, an owner
 * runs this. They never see each other's screen.
 *
 * There is no "accrued balance" held anywhere on our side to display. attest()
 * pays the restaurant in the same transaction that records the pickup, straight
 * to their own wallet — so what this page shows is simply that wallet's token
 * balance. The money was never ours to hold.
 *
 * The page opens on the ask, not on the money: a real operation starts when a
 * business says the drum is full. Registration and requesting are the same
 * control at two stages of one relationship — you cannot ask for a truck before
 * the operator knows who you are, and once they do, asking is one tap.
 */

type Pickup = { batchId: number; litres: bigint; paid: bigint; lotId: number };
type View = {
  token: `0x${string}`;
  balance: bigint;
  pickups: Pickup[];
  registered: boolean;
};

/**
 * Pure loader, deliberately outside the component: it reads and returns, and
 * touches no state. That keeps the effect a single `.then(setView)` — the same
 * shape the sign screen uses — instead of an effect that calls a function which
 * sets state, which is what react-hooks/set-state-in-effect rejects.
 */
async function loadRestaurant(address: `0x${string}`): Promise<View> {
  const token = (await publicClient.readContract({
    address: TURMOIL_ADDRESS,
    abi: TURMOIL_ABI,
    functionName: "payToken",
  })) as `0x${string}`;

  const [balance, count, price, registered] = await Promise.all([
    publicClient.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address],
    }) as Promise<bigint>,
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
    publicClient.readContract({
      address: TURMOIL_ADDRESS,
      abi: TURMOIL_ABI,
      functionName: "isRestaurant",
      args: [address],
    }) as Promise<boolean>,
  ]);

  // ponytail: read batches directly rather than scanning logs. `restaurant` is not
  // an indexed event field, so a log query could not filter by topic anyway, and
  // Hedera's RPC caps getLogs block ranges. One read per batch, O(n) — fine at demo
  // scale. If a lot ever holds thousands, this needs an indexer.
  const pickups: Pickup[] = [];
  for (let i = 0; i < Number(count); i++) {
    const b = (await publicClient.readContract({
      address: TURMOIL_ADDRESS,
      abi: TURMOIL_ABI,
      functionName: "batches",
      args: [BigInt(i)],
    })) as readonly [string, string, bigint, bigint, boolean, boolean, boolean];
    if (b[0].toLowerCase() === address.toLowerCase()) {
      pickups.push({
        batchId: i,
        litres: BigInt(b[2]),
        paid: BigInt(b[2]) * price,
        lotId: Number(b[3]),
      });
    }
  }

  return { token, balance, pickups: pickups.reverse(), registered };
}

export default function RestaurantPage() {
  const { ready, authenticated, login, logout, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  // Same rule as useSignBatch: never wallets[0]. A browser extension puts itself
  // first, and the owner would be shown a stranger's balance.
  const wallet = wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];
  const address = wallet?.address as `0x${string}` | undefined;

  const [view, setView] = useState<View | null>(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // The ask — registration and pickup requests share one control.
  const [askLitres, setAskLitres] = useState("40");
  const [asking, setAsking] = useState(false);
  const [asked, setAsked] = useState<string | null>(null);
  const [askError, setAskError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    loadRestaurant(address)
      .then(setView)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [address]);

  /** First contact: the operator registers this wallet and activates it. */
  async function register() {
    if (!address) return;
    setAskError(null);
    setAsking(true);
    try {
      /* The route calls setRestaurant, which is onlyOwner, so it verifies a Privy
         session before signing with the owner key. Unauthenticated it would be a
         public endpoint with owner authority. */
      const token = await getAccessToken();
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurant: address }),
      });
      /* Status before parsing. A platform timeout returns HTML or nothing, and
         res.json() would then throw "Unexpected end of JSON input" over a
         registration that may well have landed on chain. */
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Registration failed (${res.status})`);
      }
      /* Registered. A failure to re-read the chain afterwards is not a
         registration failure, and reporting it as one tells the owner their
         setup broke when it worked. */
      loadRestaurant(address).then(setView).catch(() => {});
    } catch (e) {
      setAskError(e instanceof Error ? e.message : String(e));
    } finally {
      setAsking(false);
    }
  }

  /** The step the whole operation starts from. */
  async function requestPickup() {
    if (!address) return;
    setAskError(null);
    setAsking(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/pickup-request", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurant: address, litres: Number(askLitres) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Could not send the request (${res.status})`);
      }
      const body = await res.json();
      setAsked(
        body.updated
          ? `Updated — the driver will collect about ${askLitres} litres.`
          : `Requested — a truck will come for about ${askLitres} litres.`,
      );
    } catch (e) {
      setAskError(e instanceof Error ? e.message : String(e));
    } finally {
      setAsking(false);
    }
  }

  async function withdraw() {
    if (!wallet || !address || !view) return;
    setError(null);
    setTxHash(null);

    if (!isAddress(to)) {
      setError("That is not a valid address.");
      return;
    }
    /* Validate before converting. Number("1,5") is NaN and BigInt(NaN) throws
       synchronously, outside the try below — so writing a decimal the way it is
       written in Montevideo made the Send button silently do nothing at all. */
    const parsed = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter an amount above zero.");
      return;
    }
    const units = BigInt(Math.round(parsed * 1_000_000));
    if (units > view.balance) {
      setError("That is more than you have.");
      return;
    }

    setBusy(true);
    try {
      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        account: address,
        chain: hederaTestnet,
        transport: custom(provider),
      });
      const hash = await walletClient.writeContract({
        address: view.token,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [to as `0x${string}`, units],
      });
      setTxHash(hash);
      setTo("");
      setAmount("");
      setView(await loadRestaurant(address));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Unlike signing a pickup, moving money out IS a transaction, so it costs
      // HBAR. A restaurant that has only ever been paid has none unless the
      // collector sent them dust at signup. Say that instead of showing a stack.
      setError(
        /insufficient|gas|balance/i.test(msg)
          ? "Not enough HBAR to send this. Ask your collector to top up your wallet."
          : msg,
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="label">Loading…</p>;

  if (!authenticated) {
    return (
      <div className="flex min-h-[62vh] items-center justify-center">
        <div className="ticket w-full max-w-md p-8 text-center">
        <p className="label mb-2">Restaurant</p>
        <h1 className="mb-6 text-2xl">Sign in to ask for a pickup</h1>
        <button
          onClick={login}
          className="datum w-full rounded bg-oil px-4 py-3 text-sm uppercase tracking-widest text-ink"
        >
          Sign in with email
        </button>
        <p className="label mt-3">No wallet, no app, no fees.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/*
        The ask sits above the money on purpose. A restaurant opens this screen
        because the drum is full, not because it wants to check a balance — and
        the same control carries them from "nobody knows me" to "a truck is
        coming", which is the whole onboarding story in one button.
      */}
      <section className="ticket p-6 md:col-span-2">
        <div className="mb-5 flex items-baseline justify-between">
          <p className="label">Your oil</p>
          <button onClick={logout} className="label hover:text-paper">
            Sign out
          </button>
        </div>

        {view === null ? (
          <p className="label">reading…</p>
        ) : !view.registered ? (
          <>
            <h1 className="mb-3 text-2xl">Get set up to sell your used oil</h1>
            <p className="mb-6 max-w-2xl leading-relaxed text-muted">
              One tap registers this business with the operator and activates your wallet, so a
              truck can come and you can be paid for what you hand over.
            </p>
            <button
              onClick={register}
              disabled={asking}
              className="datum rounded bg-oil px-6 py-3 text-sm uppercase tracking-widest text-ink disabled:opacity-40"
            >
              {asking ? "Setting up…" : "Register this restaurant"}
            </button>
          </>
        ) : (
          <>
            <h1 className="mb-3 text-2xl">Ask for a pickup</h1>
            <p className="mb-6 max-w-2xl leading-relaxed text-muted">
              Tell the operator roughly how much you have. A driver measures it on arrival, and the
              litres you both sign for are the litres you are paid for.
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="label mb-1 block" htmlFor="ask">
                  Roughly how many litres
                </label>
                <input
                  id="ask"
                  value={askLitres}
                  onChange={(e) => setAskLitres(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  className="datum field w-40 px-3 py-2 text-2xl"
                />
              </div>
              <button
                onClick={requestPickup}
                disabled={asking || !askLitres}
                className="datum rounded bg-oil px-6 py-3 text-sm uppercase tracking-widest text-ink disabled:opacity-40"
              >
                {asking ? "Sending…" : "Request a pickup"}
              </button>
            </div>
            {asked && <p className="label mt-4 text-oil">{asked}</p>}
          </>
        )}

        {askError && <p className="datum mt-4 text-xs text-fail">{askError}</p>}
        <p className="datum mt-6 break-all text-xs text-muted">{address}</p>
      </section>

      <section className="ticket p-6">
        <p className="label mb-1">Your balance</p>
        <p className="datum mb-6 text-4xl">
          {view === null ? "reading…" : `$${formatUsdc(view.balance)}`}{" "}
          <span className="text-base text-muted">USDC</span>
        </p>

        <p className="label leading-relaxed text-muted">
          Paid to your wallet the moment each pickup was recorded. It was never held by us.
        </p>
      </section>

      <section className="ticket p-6">
        <p className="label mb-4">Withdraw</p>

        <label className="label mb-1 block">Send to</label>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value.trim())}
          placeholder="0x…"
          className="datum mb-4 w-full field px-3 py-2 text-sm"
        />

        <label className="label mb-1 block">Amount (USDC)</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.trim())}
          inputMode="decimal"
          placeholder="0.00"
          className="datum mb-5 w-full field px-3 py-2 text-sm"
        />

        <button
          onClick={withdraw}
          disabled={busy || !to || !amount}
          className="datum w-full rounded bg-oil px-4 py-3 text-sm uppercase tracking-widest text-ink disabled:opacity-40"
        >
          {busy ? "Sending…" : "Send"}
        </button>

        {txHash && (
          <a
            href={`https://hashscan.io/testnet/transaction/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="label mt-4 block break-all hover:text-paper"
          >
            Sent — view on HashScan
          </a>
        )}
        {error && <p className="label mt-4 text-[--color-fail]">{error}</p>}
      </section>

      <section className="ticket p-6 md:col-span-2">
        <p className="label mb-4">Your pickups</p>
        {view === null && <p className="label">reading…</p>}
        {view?.pickups.length === 0 && (
          <p className="label text-muted">No pickups recorded for this wallet yet.</p>
        )}
        {view && view.pickups.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="label">
                <th className="pb-2">Batch</th>
                <th className="pb-2">Lot</th>
                <th className="pb-2">Litres</th>
                <th className="pb-2">Paid</th>
              </tr>
            </thead>
            <tbody>
              {view.pickups.map((p) => (
                <tr key={p.batchId} className="datum text-sm">
                  <td className="py-1">#{p.batchId}</td>
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

      <FlowCards />

      {/* Why the money is already yours, on the screen where that matters. The
          landing made this argument to visitors; it belongs here, to the person
          holding the wallet. */}
      <ResidualCards
        roles={["restaurant", "collector"]}
        note="You are paid the moment both signatures land, because nobody waits a week for eleven dollars. If the plant later weighs less than the lot claimed, that gap comes out of the collector's bond — never out of what you were already paid."
      />
    </div>
  );
}
