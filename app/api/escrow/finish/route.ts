/**
 * POST /api/escrow/finish
 *
 * No body. Child wallet redeems the active escrow created by the parent.
 * The preimage (fulfillment) is read from the in-memory demo store — in v0.3+
 * this will move to an E2E channel between parent and child devices.
 */
import { NextResponse } from "next/server";
import {
  readDemoSeeds,
  readyForXrpl,
} from "@/lib/config";
import {
  walletFromSeed,
  finishEscrow,
  explorerTxUrl,
} from "@/lib/xrpl";
import { getState, setEscrowActive } from "@/lib/demo-state";
import { humanizeXrplError } from "@/lib/xrpl-errors";

export const dynamic = "force-dynamic";

export async function POST() {
  const ready = readyForXrpl();
  if (!ready.ok) {
    return NextResponse.json(
      { ok: false, error: `Missing env vars: ${ready.missing.join(", ")}` },
      { status: 503 },
    );
  }

  const state = await getState();
  if (state.stage !== "created" || !state.escrow) {
    return NextResponse.json(
      {
        ok: false,
        error: `No escrow ready to finish. Current stage: '${state.stage}'.`,
      },
      { status: 409 },
    );
  }

  const seeds = readDemoSeeds();
  const child = walletFromSeed(seeds.child as string);

  try {
    const tx = await finishEscrow({
      child,
      parentAddress: state.escrow.parentAddress,
      offerSequence: state.escrow.offerSequence,
      fulfillment: state.escrow.fulfillment,
      condition: state.escrow.condition,
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
        {
          ok: false,
          error: humanizeXrplError({ engineResult }),
          engineResult,
        },
        { status: 502 },
      );
    }

    await setEscrowActive(hash);

    return NextResponse.json({
      ok: true,
      txHash: hash,
      explorerUrl: hash ? explorerTxUrl(hash) : null,
    });
  } catch (err) {
    console.error("[escrow/finish] failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: humanizeXrplError({ message: (err as Error).message }),
      },
      { status: 502 },
    );
  }
}
