/**
 * GET /api/account-info?address=r...
 *
 * Thin wrapper around XRPL account_info. Returns the fields the parent UI
 * displays as engineering signal — Sequence, OwnerCount, Balance, reserves.
 */
import { NextResponse } from "next/server";
import { getClient } from "@/lib/xrpl";

export const dynamic = "force-dynamic";

// Testnet base reserve = 10 XRP, owner reserve = 2 XRP each.
// (Mainnet uses 1 + 0.2 as of v2024; testnet keeps the older values.)
const BASE_RESERVE_XRP = 10;
const OWNER_RESERVE_XRP = 2;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  if (!address || !/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)) {
    return NextResponse.json(
      { ok: false, error: "invalid address" },
      { status: 400 },
    );
  }

  try {
    const client = await getClient();
    const info = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });
    const d = info.result.account_data;
    const balanceDrops = d.Balance;
    const balanceXrp = Number(balanceDrops) / 1_000_000;
    const ownerCount = d.OwnerCount ?? 0;
    const reserveXrp = BASE_RESERVE_XRP + ownerCount * OWNER_RESERVE_XRP;
    const spendableXrp = Math.max(0, balanceXrp - reserveXrp);

    return NextResponse.json({
      ok: true,
      address,
      balanceDrops,
      balanceXrp,
      sequence: d.Sequence,
      ownerCount,
      reserveXrp,
      spendableXrp,
      ledgerIndex: info.result.ledger_index,
      validated: info.result.validated,
    });
  } catch (err) {
    const message = (err as Error).message ?? "Unknown error";
    if (/actNotFound/i.test(message)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Account not found on testnet. Run `bun run setup:wallets` and update .env.local.",
        },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
