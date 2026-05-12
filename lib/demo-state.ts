/**
 * In-memory demo state with optional disk persistence.
 *
 * v0.4: writes to `.kfip-state.json` (cwd, gitignored) on every mutation so
 *       state survives `bun dev` restarts. Useful while recording the demo
 *       video — you can stop the server mid-flow and pick up where you left.
 *
 * v0.5: migrate to Vercel KV / Upstash for serverless cold-start survival.
 *       The interface here stays — only the storage backend swaps.
 *
 * Architecture rule: server-only module. Never import from client components.
 */
import "server-only";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type EscrowStage = "idle" | "created" | "active" | "expired";

export interface DemoState {
  stage: EscrowStage;
  escrow: {
    parentAddress: string;
    childAddress: string;
    offerSequence: number;
    condition: string;
    fulfillment: string;
    totalKrw: number;
    createTxHash: string;
    finishTxHash?: string;
    createdAt: number;
    cancelAfter: number;
  } | null;
  payments: PaymentEntry[];
}

export interface PaymentEntry {
  label: string;
  amountKrw: number;
  txHash: string;
  at: number;
}

const initialState: DemoState = {
  stage: "idle",
  escrow: null,
  payments: [],
};

const STATE_FILE = resolve(process.cwd(), ".kfip-state.json");

function loadFromDisk(): DemoState {
  try {
    if (!existsSync(STATE_FILE)) return { ...initialState, payments: [] };
    const raw = readFileSync(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DemoState;
    // Minimal shape check — if anyone hand-edits the file we want to recover.
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.stage === "string" &&
      Array.isArray(parsed.payments)
    ) {
      return parsed;
    }
  } catch (err) {
    console.warn("[demo-state] could not load from disk, starting fresh:", err);
  }
  return { ...initialState, payments: [] };
}

function persist(s: DemoState): void {
  try {
    mkdirSync(dirname(STATE_FILE), { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify(s, null, 2), "utf-8");
  } catch (err) {
    // Don't crash on persist failure — in-memory is still authoritative.
    console.warn("[demo-state] persist failed:", err);
  }
}

let state: DemoState = loadFromDisk();

export function getState(): DemoState {
  return state;
}

export function setEscrowCreated(escrow: NonNullable<DemoState["escrow"]>): void {
  state = { stage: "created", escrow, payments: [] };
  persist(state);
}

export function setEscrowActive(finishTxHash: string): void {
  if (!state.escrow) return;
  state = {
    ...state,
    stage: "active",
    escrow: { ...state.escrow, finishTxHash },
  };
  persist(state);
}

export function recordPayment(entry: PaymentEntry): void {
  state = { ...state, payments: [entry, ...state.payments] };
  persist(state);
}

export function resetDemo(): void {
  state = { ...initialState, payments: [] };
  persist(state);
}
