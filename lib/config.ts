/**
 * KFIP runtime config.
 * Server-only — never import this from a client component.
 */

export const XRPL_TESTNET_URL =
  process.env.XRPL_TESTNET_URL ?? "wss://s.altnet.rippletest.net:51233";

export const XRPL_TESTNET_EXPLORER =
  process.env.XRPL_TESTNET_EXPLORER ?? "https://testnet.xrpl.org";

/**
 * Demo wallet seeds — testnet only.
 * Provision via `.env.local` or Vercel project settings.
 * Loaded lazily in API routes; absent values are tolerated until v0.2.
 */
export function readDemoSeeds() {
  return {
    parent: process.env.KFIP_PARENT_SEED ?? null,
    child: process.env.KFIP_CHILD_SEED ?? null,
  };
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
