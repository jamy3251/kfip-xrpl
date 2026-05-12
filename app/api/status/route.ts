/**
 * GET /api/status
 *
 * Returns the demo's current escrow stage, parent/child balances (drops + KRW),
 * and recent payments. Used by both /parent and /child views to render state.
 */
import { NextResponse } from "next/server";
import {
  readDemoAddresses,
  readyForXrpl,
  dropsToKrw,
  DEFAULT_MONTHLY_LIMIT_KRW,
} from "@/lib/config";
import { getState } from "@/lib/demo-state";
import { getBalanceDrops } from "@/lib/xrpl";

export const dynamic = "force-dynamic";

export async function GET() {
  const ready = readyForXrpl();
  const addrs = readDemoAddresses();
  const state = getState();

  if (!ready.ok) {
    return NextResponse.json(
      {
        configured: false,
        missing: ready.missing,
        stage: state.stage,
        escrow: state.escrow,
        payments: state.payments,
        defaultLimitKrw: DEFAULT_MONTHLY_LIMIT_KRW,
      },
      { status: 200 },
    );
  }

  // Best-effort balance fetch. If XRPL is unreachable we still return state.
  let parentBalanceKrw: number | null = null;
  let childBalanceKrw: number | null = null;
  try {
    if (addrs.parent) {
      parentBalanceKrw = dropsToKrw(await getBalanceDrops(addrs.parent));
    }
    if (addrs.child) {
      childBalanceKrw = dropsToKrw(await getBalanceDrops(addrs.child));
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
  });
}
