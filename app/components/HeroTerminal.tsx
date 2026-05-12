"use client";

import { useEffect, useState } from "react";

interface RecentTx {
  hash: string;
  type: string;
  fromShort: string;
  toShort: string;
  amountKrw: number | null;
  ledger: number;
  validated: boolean;
  explorerUrl: string;
}

interface RecentTxResponse {
  configured: boolean;
  missing?: string[];
  txs: RecentTx[];
  rate: { rate: number; source: "coingecko" | "fallback"; fetchedAt: number };
}

const POLL_MS = 3_000;

const SEED_TX: RecentTx[] = [
  {
    hash: "7E5A4F2C9B41D8...B4A2C9F1D8",
    type: "EscrowCreate",
    fromShort: "rPa…K9x",
    toShort: "rHQ…M7b",
    amountKrw: 200_000,
    ledger: 0,
    validated: true,
    explorerUrl: "#",
  },
  {
    hash: "9B2C831E...AA01",
    type: "EscrowFinish",
    fromShort: "rHQ…M7b",
    toShort: "rPa…K9x",
    amountKrw: null,
    ledger: 0,
    validated: true,
    explorerUrl: "#",
  },
  {
    hash: "C71D...F4E2",
    type: "Payment",
    fromShort: "rHQ…M7b",
    toShort: "rMC…2x9",
    amountKrw: 15_000,
    ledger: 0,
    validated: true,
    explorerUrl: "#",
  },
];

export default function HeroTerminal() {
  const [data, setData] = useState<RecentTxResponse | null>(null);
  const [now, setNow] = useState(() => formatClock(new Date()));

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const r = await fetch("/api/recent-tx", { cache: "no-store" });
        if (cancelled) return;
        setData((await r.json()) as RecentTxResponse);
      } catch (e) {
        if (cancelled) return;
        // keep last successful data on transient error
        console.warn("recent-tx poll failed", e);
      }
    }
    tick();
    const id = window.setInterval(tick, POLL_MS);
    const clockId = window.setInterval(() => setNow(formatClock(new Date())), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearInterval(clockId);
    };
  }, []);

  const isLive = !!data && data.configured && data.txs.length > 0;
  const txs = isLive ? data!.txs : SEED_TX;
  const rate = data?.rate;

  return (
    <div className="overflow-hidden rounded-card border border-border bg-muted text-[13px] shadow-[0_12px_32px_rgba(10,10,10,0.04)]">
      <div className="flex items-center gap-2 border-b border-border bg-[#f4f6f8] px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-text-subtle">
        <span className="block h-[9px] w-[9px] rounded-full bg-[#ff6b6b]" />
        <span className="block h-[9px] w-[9px] rounded-full bg-[#feca57]" />
        <span className="block h-[9px] w-[9px] rounded-full bg-[#1dd1a1]" />
        <span className="ml-auto flex items-center gap-2">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 text-success">
              <span className="block h-[6px] w-[6px] rounded-full bg-success animate-kfip-pulse" />
              live
            </span>
          ) : (
            <span className="text-text-subtle">demo · {now}</span>
          )}
          <span className="text-text-subtle">xrpl.testnet</span>
        </span>
      </div>
      <div className="px-4 py-4 font-mono text-[12.5px] leading-[1.85] text-[#3a4250]">
        {txs.length === 0 ? (
          <div className="text-text-subtle">$ awaiting first tx_</div>
        ) : (
          txs.slice(0, 7).map((tx, i) => <TxLine key={tx.hash + i} tx={tx} isLive={isLive} />)
        )}
        {!isLive ? (
          <div className="mt-2 inline-block rounded-pill border border-border-subtle px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-subtle">
            seed data · 부모 한도 잠그면 실제 tx 흐름
          </div>
        ) : null}
        {rate ? (
          <div className="mt-2 text-[10px] text-text-subtle">
            1 XRP ≈ {rate.rate.toLocaleString("ko-KR")} KRW ·{" "}
            <span className="text-text-subtle">
              {rate.source === "coingecko" ? "CoinGecko live" : "fallback rate"}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TxLine({ tx, isLive }: { tx: RecentTx; isLive: boolean }) {
  const t = isLive ? "now" : "demo";
  return (
    <div className="flex gap-3.5">
      <span className="w-[44px] shrink-0 text-text-subtle">{t}</span>
      <span className="min-w-0 flex-1">
        <span className="font-semibold text-accent-dark">{tx.type}</span>
        <span className="text-text-subtle">{" · "}</span>
        <span>
          {tx.fromShort} <span className="text-text-subtle">→</span> {tx.toShort}
        </span>
        {tx.amountKrw != null ? (
          <>
            <span className="text-text-subtle">{" · "}</span>
            <span className="font-semibold text-[#b88200] tabular">
              {tx.amountKrw.toLocaleString("ko-KR")} KRW
            </span>
          </>
        ) : null}
        {isLive && tx.explorerUrl !== "#" ? (
          <>
            <span className="text-text-subtle">{" · "}</span>
            <a
              href={tx.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-highlight hover:underline"
            >
              {tx.hash.slice(0, 6)}…{tx.hash.slice(-4)}
            </a>
          </>
        ) : null}
      </span>
    </div>
  );
}

function formatClock(d: Date): string {
  return d.toLocaleTimeString("ko-KR", { hour12: false }).padStart(8, "0");
}
