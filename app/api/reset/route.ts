/**
 * POST /api/reset
 *
 * Clears in-memory demo state so the demo can be re-run from the top.
 * Does NOT cancel the on-chain escrow — it just forgets about it locally.
 * (For the demo this is fine; the previous escrow will auto-cancel after
 * 31 days, freeing the parent's locked XRP.)
 */
import { NextResponse } from "next/server";
import { resetDemo } from "@/lib/demo-state";

export const dynamic = "force-dynamic";

export async function POST() {
  await resetDemo();
  return NextResponse.json({ ok: true });
}
