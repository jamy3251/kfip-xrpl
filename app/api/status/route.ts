/**
 * GET /api/status
 *
 * Returns the demo's current escrow stage, parent/child balances (drops + KRW),
 * the active XRP→KRW rate, and recent payments. Used by both /parent and /child
 * views to render state.
 */
import { NextResponse } from "next/server";
import {
  readDemoAddresses,
  readyForXrpl,
  DEFAULT_MONTHLY_LIMIT_KRW,
  dropsToKrwAt,
} from "@/lib/config";
import { getState } from "@/lib/demo-state";
import { backendName } from "@/lib/kv-store";
import { getBalanceDrops } from "@/lib/xrpl";
import { getXrpKrwRate } from "@/lib/rate";

export const dynamic = "force-dynamic";

export async function GET() {
  const ready = readyForXrpl();
  const addrs = readDemoAddresses();
  const state = await getState();
  const rate = await getXrpKrwRate();

  if (!ready.ok) {
    return NextResponse.json(
      {
        configured: false,
        missing: ready.missing,
        stage: state.stage,
        escrow: state.escrow,
        payments: state.payments,
        defaultLimitKrw: DEFAULT_MONTHLY_LIMIT_KRW,
        rate,
        backend: backendName(),
      },
      { status: 200 },
    );
  }

  // Best-effort balance fetch. If XRPL is unreachable we still return state.
  let parentBalanceKrw: number | null = null;
  let childBalanceKrw: number | null = null;
  try {
    if (addrs.parent) {
      parentBalanceKrw = dropsToKrwAt(
        await getBalanceDrops(addrs.parent),
        rate.rate,
      );
    }
    if (addrs.child) {
      childBalanceKrw = dropsToKrwAt(
        await getBalanceDrops(addrs.child),
        rate.rate,
      );
    }
  } catch (err) {
    console.warn("[status] balance fetch failed:", err);
  }

  return NextResponse.json({
    configured: true,
    stage: state.stage,
    escrow: state.escrow,
    payments: state.payments,
    parentAddress: addrs.parent,
    childAddress: addrs.child,
    merchantAddress: addrs.merchant,
    parentBalanceKrw,
    childBalanceKrw,
    defaultLimitKrw: DEFAULT_MONTHLY_LIMIT_KRW,
    rate,
    backend: backendName(),
  });
}
