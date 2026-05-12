/**
 * Single key/value store with two interchangeable backends.
 *
 *   KV_REST_API_URL + KV_REST_API_TOKEN present  → Vercel KV (Upstash Redis)
 *   otherwise                                    → local JSON file (.kfip-state.json)
 *
 * The file backend survives `bun dev` restarts. The KV backend survives
 * serverless cold starts on Vercel. Both implement the same async interface,
 * so call sites do not branch on environment.
 *
 * Server-only. Do not import from a client component.
 */
import "server-only";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { detectKvBackend, type Backend } from "./kv-detect";

export type { Backend };

let cachedBackend: Backend | null = null;

export function detectBackend(): Backend {
  if (cachedBackend) return cachedBackend;
  cachedBackend = detectKvBackend();
  return cachedBackend;
}

/** Reset the memoised backend choice. Test-only. */
export function _resetBackendForTests(): void {
  cachedBackend = null;
}

// ---------- KV backend (lazy-loaded so file mode never hits the package) ----

let kvImpl: typeof import("@vercel/kv").kv | null = null;
async function getKv(): Promise<typeof import("@vercel/kv").kv> {
  if (kvImpl) return kvImpl;
  const mod = await import("@vercel/kv");
  kvImpl = mod.kv;
  return kvImpl;
}

// ---------- File backend -------------------------------------------------

const FILE_PATH = resolve(process.cwd(), ".kfip-state.json");

function fileRead(): Record<string, unknown> {
  try {
    if (!existsSync(FILE_PATH)) return {};
    const raw = readFileSync(FILE_PATH, "utf-8").trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch (err) {
    console.warn("[kv-store] file read failed:", err);
    return {};
  }
}

function fileWrite(obj: Record<string, unknown>): void {
  try {
    mkdirSync(dirname(FILE_PATH), { recursive: true });
    writeFileSync(FILE_PATH, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.warn("[kv-store] file write failed:", err);
  }
}

// ---------- Public API ---------------------------------------------------

export async function kvGet<T>(key: string): Promise<T | null> {
  if (detectBackend() === "kv") {
    const kv = await getKv();
    const v = await kv.get<T>(key);
    return v ?? null;
  }
  const all = fileRead();
  return (all[key] as T | undefined) ?? null;
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  if (detectBackend() === "kv") {
    const kv = await getKv();
    await kv.set(key, value);
    return;
  }
  const all = fileRead();
  all[key] = value;
  fileWrite(all);
}

export async function kvDel(key: string): Promise<void> {
  if (detectBackend() === "kv") {
    const kv = await getKv();
    await kv.del(key);
    return;
  }
  const all = fileRead();
  delete all[key];
  fileWrite(all);
}

/** Diagnostic: name of the backend currently active. */
export function backendName(): Backend {
  return detectBackend();
}
