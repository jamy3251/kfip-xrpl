/**
 * GET /api/recent-tx
 *
 * Pulls recent XRPL transactions for the parent / child / merchant accounts,
 * merges, dedupes, sorts newest-first, and normalizes for the hero terminal
 * widget.
 *
 * Returns 200 with `{ configured: false }` if env isn't set yet — caller
 * should display seed data in that case.
 */
import { NextResponse } from "next/server";
import {
  readDemoAddresses,
  readyForXrpl,
  dropsToKrwAt,
} from "@/lib/config";
import { getClient, explorerTxUrl } from "@/lib/xrpl";
import { getXrpKrwRate } from "@/lib/rate";

export const dynamic = "force-dynamic";

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

export async function GET() {
  const ready = readyForXrpl();
  const addrs = readDemoAddresses();
  const rate = await getXrpKrwRate();

  if (!ready.ok || !addrs.parent || !addrs.child || !addrs.merchant) {
    return NextResponse.json({
      configured: false,
      missing: ready.missing,
      txs: [] as RecentTx[],
      rate,
    });
  }

  try {
    const client = await getClient();
    const accounts = [addrs.parent, addrs.child, addrs.merchant];
    const results = await Promise.all(
      accounts.map((account) =>
        client.request({
          command: "account_tx",
          account,
          limit: 10,
          ledger_index_min: -1,
          ledger_index_max: -1,
        }),
      ),
    );

    const byHash = new Map<string, RecentTx>();
    for (const r of results) {
      // account_tx returns { transactions: [{ tx_json?, tx?, meta, validated, ... }] }
      for (const entry of r.result.transactions ?? []) {
        const wrapper = entry as {
          tx?: Record<string, unknown>;
          tx_json?: Record<string, unknown>;
          hash?: string;
          meta?: unknown;
          validated?: boolean;
          ledger_index?: number;
        };
        const txObj = (wrapper.tx ?? wrapper.tx_json ?? {}) as {
          TransactionType?: string;
          Account?: string;
          Destination?: string;
          Amount?: string | { value?: string };
          Sequence?: number;
        };
        const hash =
          wrapper.hash ??
          (txObj as { hash?: string }).hash ??
          (wrapper.tx as { hash?: string } | undefined)?.hash;
        if (!hash || typeof hash !== "string") continue;
        if (byHash.has(hash)) continue;

        const type = txObj.TransactionType ?? "Unknown";
        const fromAddr = txObj.Account ?? "";
        const toAddr = txObj.Destination ?? "";
        let amountKrw: number | null = null;
        if (typeof txObj.Amount === "string") {
          amountKrw = dropsToKrwAt(txObj.Amount, rate.rate);
        }
        byHash.set(hash, {
          hash,
          type,
          fromShort: shortAddr(fromAddr),
          toShort: shortAddr(toAddr),
          amountKrw,
          ledger: wrapper.ledger_index ?? 0,
          validated: !!wrapper.validated,
          explorerUrl: explorerTxUrl(hash),
        });
      }
    }

    const txs = [...byHash.values()]
      .sort((a, b) => b.ledger - a.ledger)
      .slice(0, 10);

    return NextResponse.json({
      configured: true,
      txs,
      rate,
    });
  } catch (err) {
    console.warn("[recent-tx] xrpl query failed:", err);
    return NextResponse.json({
      configured: true,
      txs: [],
      rate,
      error: (err as Error).message,
    });
  }
}

function shortAddr(addr: string): string {
  if (!addr) return "—";
  return `${addr.slice(0, 4)}…${addr.slice(-3)}`;
}
