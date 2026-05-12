/**
 * POST /api/payment
 *
 * Body: { amountKrw: number, label: string }
 *
 * Child sends an XRPL Payment to the configured merchant address. Only
 * allowed once the escrow has been finished (stage === 'active').
 */
import { NextResponse } from "next/server";
import {
  readDemoSeeds,
  readDemoAddresses,
  readyForXrpl,
} from "@/lib/config";
import {
  walletFromSeed,
  sendMerchantPayment,
  explorerTxUrl,
} from "@/lib/xrpl";
import { getState, recordPayment } from "@/lib/demo-state";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ready = readyForXrpl();
  if (!ready.ok) {
    return NextResponse.json(
      { ok: false, error: `Missing env vars: ${ready.missing.join(", ")}` },
      { status: 503 },
    );
  }

  const state = getState();
  if (state.stage !== "active") {
    return NextResponse.json(
      {
        ok: false,
        error: `결제 가능 상태가 아닙니다. 현재: '${state.stage}'. 먼저 한도를 받으세요.`,
      },
      { status: 409 },
    );
  }

  let amountKrw = 0;
  let label = "결제";
  try {
    const body = await req.json();
    if (typeof body?.amountKrw === "number" && body.amountKrw > 0) {
      amountKrw = Math.floor(body.amountKrw);
    }
    if (typeof body?.label === "string" && body.label.length > 0) {
      label = body.label.slice(0, 64);
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (amountKrw <= 0) {
    return NextResponse.json(
      { ok: false, error: "amountKrw must be positive" },
      { status: 400 },
    );
  }

  const seeds = readDemoSeeds();
  const addrs = readDemoAddresses();
  const child = walletFromSeed(seeds.child as string);

  try {
    const tx = await sendMerchantPayment({
      child,
      merchantAddress: addrs.merchant as string,
      amountKrw,
      memo: label,
    });

    const result = tx.result;
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
        { ok: false, error: `Payment failed on chain: ${engineResult}` },
        { status: 502 },
      );
    }

    recordPayment({
      label,
      amountKrw,
      txHash: hash,
      at: Date.now(),
    });

    return NextResponse.json({
      ok: true,
      txHash: hash,
      explorerUrl: hash ? explorerTxUrl(hash) : null,
      amountKrw,
      label,
    });
  } catch (err) {
    console.error("[payment] failed:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "Unknown error" },
      { status: 502 },
    );
  }
}
