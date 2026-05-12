/**
 * Demo state — KV-backed.
 *
 * Stored under a single key in either Vercel KV (production) or the local
 * `.kfip-state.json` file (dev). State machine: idle → created → active.
 * Single global escrow at a time (v0.6 will key by user).
 *
 * Architecture rule: server-only. Never import from client components.
 */
import "server-only";
import { kvGet, kvSet } from "./kv-store";

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

const STATE_KEY = "kfip:demo:v1";

const EMPTY_STATE: DemoState = {
  stage: "idle",
  escrow: null,
  payments: [],
};

export async function getState(): Promise<DemoState> {
  const stored = await kvGet<DemoState>(STATE_KEY);
  if (!stored || typeof stored.stage !== "string") {
    return { ...EMPTY_STATE };
  }
  // Defensive defaults for fields that may be missing in older stored objects.
  return {
    stage: stored.stage,
    escrow: stored.escrow ?? null,
    payments: Array.isArray(stored.payments) ? stored.payments : [],
  };
}

export async function setEscrowCreated(
  escrow: NonNullable<DemoState["escrow"]>,
): Promise<void> {
  const next: DemoState = {
    stage: "created",
    escrow,
    payments: [],
  };
  await kvSet(STATE_KEY, next);
}

export async function setEscrowActive(finishTxHash: string): Promise<void> {
  const cur = await getState();
  if (!cur.escrow) return;
  const next: DemoState = {
    ...cur,
    stage: "active",
    escrow: { ...cur.escrow, finishTxHash },
  };
  await kvSet(STATE_KEY, next);
}

export async function recordPayment(entry: PaymentEntry): Promise<void> {
  const cur = await getState();
  const next: DemoState = {
    ...cur,
    payments: [entry, ...cur.payments],
  };
  await kvSet(STATE_KEY, next);
}

export async function resetDemo(): Promise<void> {
  await kvSet(STATE_KEY, { ...EMPTY_STATE });
}
