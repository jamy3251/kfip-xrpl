/**
 * POST /api/escrow/create
 *
 * Body: { amountKrw?: number }   // defaults to DEFAULT_MONTHLY_LIMIT_KRW
 *
 * Runs EscrowCreate from the configured parent wallet to the configured
 * child address, generates a fresh crypto-condition, persists the preimage in
 * the in-memory demo store, and returns the tx hash + Sequence number.
 */
import { NextResponse } from "next/server";
import {
  readDemoSeeds,
  readDemoAddresses,
  readyForXrpl,
  DEFAULT_MONTHLY_LIMIT_KRW,
} from "@/lib/config";
import {
  walletFromSeed,
  makeCondition,
  createMonthlyEscrow,
  explorerTxUrl,
} from "@/lib/xrpl";
import { setEscrowCreated, getState } from "@/lib/demo-state";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ready = readyForXrpl();
  if (!ready.ok) {
    return NextResponse.json(
      { ok: false, error: `Missing env vars: ${ready.missing.join(", ")}. Run \`bun run setup:wallets\`.` },
      { status: 503 },
    );
  }

  const existing = await getState();
  if (existing.stage !== "idle") {
    return NextResponse.json(
      {
        ok: false,
        error: `Escrow already in stage '${existing.stage}'. Reset via /api/reset to start over.`,
      },
      { status: 409 },
    );
  }

  let amountKrw = DEFAULT_MONTHLY_LIMIT_KRW;
  try {
    const body = await req.json();
    if (typeof body?.amountKrw === "number" && body.amountKrw > 0) {
      amountKrw = Math.floor(body.amountKrw);
    }
  } catch {
    // body is optional; fall through with default
  }

  const seeds = readDemoSeeds();
  const addrs = readDemoAddresses();
  const parent = walletFromSeed(seeds.parent as string);

  const { condition, fulfillment } = makeCondition();
  // CancelAfter = now + 31 days, in XRPL Ripple-epoch seconds.
  // XRPL epoch is 2000-01-01; convert from unix.
  const RIPPLE_EPOCH = 946_684_800;
  const cancelAfter =
    Math.floor(Date.now() / 1000) + 31 * 24 * 60 * 60 - RIPPLE_EPOCH;

  try {
    const tx = await createMonthlyEscrow({
      parent,
      childAddress: addrs.child as string,
      amountKrw,
      condition,
      cancelAfter,
    });

    const result = tx.result;
    const sequence =
      (result as { tx_json?: { Sequence?: number }; Sequence?: number })
        .tx_json?.Sequence ??
      (result as { Sequence?: number }).Sequence;
    const hash =
      (result as { hash?: string }).hash ??
      (result as { tx_json?: { hash?: string } }).tx_json?.hash ??
      "";
    const engineResult =
      (result as { engine_result?: string; meta?: { TransactionResult?: string } })
        .engine_result ??
      (result as { meta?: { TransactionResult?: string } }).meta?.TransactionResult;

    if (engineResult && engineResult !== "tesSUCCESS") {
      return NextResponse.json(
        { ok: false, error: `EscrowCreate failed on chain: ${engineResult}` },
        { status: 502 },
      );
    }

    if (typeof sequence !== "number") {
      return NextResponse.json(
        { ok: false, error: "Could not read Sequence from EscrowCreate response." },
        { status: 502 },
      );
    }

    await setEscrowCreated({
      parentAddress: addrs.parent as string,
      childAddress: addrs.child as string,
      offerSequence: sequence,
      condition,
      fulfillment,
      totalKrw: amountKrw,
      createTxHash: hash,
      createdAt: Date.now(),
      cancelAfter,
    });

    return NextResponse.json({
      ok: true,
      txHash: hash,
      sequence,
      explorerUrl: hash ? explorerTxUrl(hash) : null,
      amountKrw,
    });
  } catch (err) {
    console.error("[escrow/create] failed:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "Unknown error" },
      { status: 502 },
    );
  }
}
