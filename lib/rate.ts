/**
 * XRP → KRW rate, with CoinGecko as primary source and a hardcoded
 * fallback for offline / rate-limited cases.
 *
 * Cached in-process for 60s to avoid hammering the free API tier.
 * Server-only — never import from a client component.
 */
import "server-only";
import { MOCK_XRP_KRW_RATE } from "./config";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=krw";

const TTL_MS = 60_000;

export type RateSource = "coingecko" | "fallback";

export interface XrpKrwRate {
  rate: number;
  source: RateSource;
  fetchedAt: number;
}

let cached: XrpKrwRate | null = null;
let inflight: Promise<XrpKrwRate> | null = null;

export async function getXrpKrwRate(): Promise<XrpKrwRate> {
  const now = Date.now();
  if (cached && now - cached.fetchedAt < TTL_MS) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch(COINGECKO_URL, {
        // Short timeout — we'd rather fall back than block the UI.
        signal: AbortSignal.timeout(2_500),
        // Mark as opt-out of Next.js fetch caching so we control TTL ourselves.
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`coingecko: HTTP ${res.status}`);
      const body = (await res.json()) as { ripple?: { krw?: number } };
      const rate = body?.ripple?.krw;
      if (typeof rate !== "number" || rate <= 0) {
        throw new Error("coingecko: invalid payload");
      }
      cached = { rate, source: "coingecko", fetchedAt: now };
      return cached;
    } catch (err) {
      console.warn("[rate] CoinGecko fetch failed, using fallback:", err);
      cached = {
        rate: MOCK_XRP_KRW_RATE,
        source: "fallback",
        fetchedAt: now,
      };
      return cached;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

// dropsToKrwAt moved to ./config so test files can import it without
// triggering the "server-only" guard. Import path: `@/lib/config`.
