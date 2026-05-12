/**
 * GET /api/rate
 *
 * Returns the cached XRP → KRW rate plus its source.
 * Cache TTL is 60s in-process; clients can poll every 30s and get the cached value.
 */
import { NextResponse } from "next/server";
import { getXrpKrwRate } from "@/lib/rate";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = await getXrpKrwRate();
  return NextResponse.json(r);
}
