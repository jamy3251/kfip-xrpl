"use client";

import { useEffect, useState } from "react";

interface Info {
  ok: boolean;
  address?: string;
  balanceXrp?: number;
  sequence?: number;
  ownerCount?: number;
  reserveXrp?: number;
  spendableXrp?: number;
  ledgerIndex?: number;
  validated?: boolean;
  error?: string;
}

export default function AccountInfoWidget({
  label,
  address,
}: {
  label: string;
  address: string | null | undefined;
}) {
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(`/api/account-info?address=${address}`, {
          cache: "no-store",
        });
        if (cancelled) return;
        setInfo((await r.json()) as Info);
      } catch (e) {
        if (cancelled) return;
        setInfo({ ok: false, error: (e as Error).message });
      }
    }
    load();
    const id = window.setInterval(load, 8_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [address]);

  if (!address) {
    return null;
  }

  return (
    <div className="rounded-card border border-border-subtle bg-bg p-4 font-mono text-[11.5px] text-text-muted">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider">
        <span className="font-semibold text-fg">{label}</span>
        <span className="text-text-subtle">{shortAddr(address)}</span>
      </div>
      {!info ? (
        <div className="text-text-subtle">loading…</div>
      ) : !info.ok ? (
        <div className="text-[#c53030]">{info.error}</div>
      ) : (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
          <Cell k="Balance" v={`${info.balanceXrp?.toFixed(6)} XRP`} highlight />
          <Cell k="Spendable" v={`${info.spendableXrp?.toFixed(6)} XRP`} />
          <Cell k="Sequence" v={String(info.sequence)} />
          <Cell k="Owner" v={String(info.ownerCount)} />
          <Cell k="Reserve" v={`${info.reserveXrp} XRP`} />
          <Cell k="Ledger" v={String(info.ledgerIndex)} />
        </dl>
      )}
    </div>
  );
}

function Cell({
  k,
  v,
  highlight,
}: {
  k: string;
  v: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-text-subtle">{k}</dt>
      <dd
        className={`tabular text-right ${
          highlight ? "font-bold text-fg" : "text-fg"
        }`}
      >
        {v}
      </dd>
    </div>
  );
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
