/**
 * In-memory demo state.
 *
 * v0.2: single active escrow per process. Lives until server restarts.
 *       Survives across requests because Next.js dev server is single-process.
 *
 * v0.3+: migrate to Vercel KV / Redis when production deployment needs to
 *        survive serverless cold starts. The interface here is the migration
 *        target — only the storage backend swaps.
 *
 * Architecture rule: server-only module. Never import from client components.
 */
import "server-only";

export type EscrowStage = "idle" | "created" | "active" | "expired";

export interface DemoState {
  stage: EscrowStage;
  escrow: {
    parentAddress: string;
    childAddress: string;
    /** EscrowCreate Sequence number — required to finish. */
    offerSequence: number;
    /** Hex crypto-condition published on chain. */
    condition: string;
    /** Hex preimage / fulfillment — secret. v0.3 will move to E2E channel. */
    fulfillment: string;
    /** Original locked amount, KRW units (mock rate applied at create time). */
    totalKrw: number;
    /** EscrowCreate transaction hash for audit / UI display. */
    createTxHash: string;
    /** EscrowFinish transaction hash once claimed. */
    finishTxHash?: string;
    /** Unix ms when the escrow was created. */
    createdAt: number;
    /** Unix seconds for CancelAfter (parent recovery). */
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

let state: DemoState = { ...initialState };

export function getState(): DemoState {
  return state;
}

export function setEscrowCreated(escrow: NonNullable<DemoState["escrow"]>): void {
  state = {
    stage: "created",
    escrow,
    payments: [],
  };
}

export function setEscrowActive(finishTxHash: string): void {
  if (!state.escrow) return;
  state = {
    ...state,
    stage: "active",
    escrow: { ...state.escrow, finishTxHash },
  };
}

export function recordPayment(entry: PaymentEntry): void {
  state = {
    ...state,
    payments: [entry, ...state.payments],
  };
}

export function resetDemo(): void {
  state = { ...initialState, payments: [] };
}
