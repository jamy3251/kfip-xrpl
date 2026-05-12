/**
 * KFIP runtime config.
 * Server-only — never import this from a client component.
 */
import "server-only";

export const XRPL_TESTNET_URL =
  process.env.XRPL_TESTNET_URL ?? "wss://s.altnet.rippletest.net:51233";

export const XRPL_TESTNET_EXPLORER =
  process.env.XRPL_TESTNET_EXPLORER ?? "https://testnet.xrpl.org";

/**
 * Demo wallet seeds — testnet only.
 * Provision via `bun run setup:wallets` then paste output into `.env.local`.
 * Returns nulls if not set; callers must check and return 503-style error.
 */
export function readDemoSeeds() {
  return {
    parent: process.env.KFIP_PARENT_SEED ?? null,
    child: process.env.KFIP_CHILD_SEED ?? null,
  };
}

export function readDemoAddresses() {
  return {
    parent: process.env.KFIP_PARENT_ADDRESS ?? null,
    child: process.env.KFIP_CHILD_ADDRESS ?? null,
    merchant: process.env.KFIP_MERCHANT_ADDRESS ?? null,
  };
}

export function readyForXrpl(): {
  ok: boolean;
  missing: string[];
} {
  const seeds = readDemoSeeds();
  const addrs = readDemoAddresses();
  const missing: string[] = [];
  if (!seeds.parent) missing.push("KFIP_PARENT_SEED");
  if (!seeds.child) missing.push("KFIP_CHILD_SEED");
  if (!addrs.merchant) missing.push("KFIP_MERCHANT_ADDRESS");
  return { ok: missing.length === 0, missing };
}

/**
 * Mock KRW exchange rate for demo display (1 XRP ≈ KRW).
 * Replace with live oracle in v0.3. Source must be cited in DESIGN.md when updated.
 */
export const MOCK_XRP_KRW_RATE = 2_800;

/**
 * Monthly default limit, in KRW, that the parent can pre-approve.
 */
export const DEFAULT_MONTHLY_LIMIT_KRW = 200_000;

/** Helpers for KRW ↔ XRP conversion using the mock rate. */
export function krwToXrp(krw: number): number {
  return krw / MOCK_XRP_KRW_RATE;
}

export function dropsToKrw(drops: string | number): number {
  const xrp = Number(drops) / 1_000_000;
  return Math.round(xrp * MOCK_XRP_KRW_RATE);
}
