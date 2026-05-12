/**
 * Pure environment detection — no imports, no side effects.
 * Split out from kv-store.ts so tests can import without tripping the
 * `server-only` guard.
 */

export type Backend = "kv" | "file";

/** Subset of the env vars this function reads, so tests can pass partials. */
export interface BackendEnv {
  KV_REST_API_URL?: string;
  KV_REST_API_TOKEN?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
}

function readEnv(): BackendEnv {
  return {
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  };
}

export function detectKvBackend(env: BackendEnv = readEnv()): Backend {
  const hasVercelKv = !!(env.KV_REST_API_URL && env.KV_REST_API_TOKEN);
  const hasUpstash = !!(
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  );
  return hasVercelKv || hasUpstash ? "kv" : "file";
}
