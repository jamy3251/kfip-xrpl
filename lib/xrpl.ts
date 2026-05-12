/**
 * KFIP XRPL helpers — server-side only.
 *
 * v0.1: skeleton. Function signatures and minimal connection logic are in place
 *       but the EscrowCreate / EscrowFinish flow is not wired into UI yet. The
 *       hero terminal on the landing page uses hardcoded data.
 * v0.2: parent/child route wiring will call these functions via API routes.
 * v0.3: switch from polled balances to a live WebSocket subscription that feeds
 *       the hero terminal.
 *
 * Architecture rule: NEVER import this module from a client component. All
 * signing happens server-side. Seed material lives in env vars only.
 */
import {
  Client,
  Wallet,
  xrpToDrops,
  type TxResponse,
  type EscrowCreate,
  type EscrowFinish,
} from "xrpl";
import * as fiveBellsCondition from "five-bells-condition";
import { randomBytes } from "node:crypto";
import { XRPL_TESTNET_URL, XRPL_TESTNET_EXPLORER } from "./config";

let cachedClient: Client | null = null;

/** Single shared testnet client. Connects on first call, reuses afterward. */
export async function getClient(): Promise<Client> {
  if (cachedClient && cachedClient.isConnected()) return cachedClient;
  cachedClient = new Client(XRPL_TESTNET_URL);
  await cachedClient.connect();
  return cachedClient;
}

/** Convenience: build a Wallet from a seed string (testnet 'sEd…' / 's…'). */
export function walletFromSeed(seed: string): Wallet {
  return Wallet.fromSeed(seed);
}

/**
 * Ask the testnet faucet to fund a fresh wallet. Returns the funded Wallet.
 * Use only during local dev / first-time setup. Faucet is rate-limited.
 */
export async function fundFromFaucet(): Promise<Wallet> {
  const client = await getClient();
  const { wallet } = await client.fundWallet();
  return wallet;
}

/**
 * Generate a fresh crypto-condition pair.
 *  - `condition`  → published on the EscrowCreate, anyone can see
 *  - `fulfillment` → secret preimage, only the child holds. Required to
 *                    redeem via EscrowFinish.
 *
 * NOTE: 32-byte preimage gives 256-bit security. The 5-byte preimage shown in
 * some XRPL examples is for compactness only and is NOT acceptable here.
 */
export function makeCondition(): { condition: string; fulfillment: string } {
  const preimage = randomBytes(32);
  // five-bells-condition returns the BER-encoded condition + fulfillment as hex
  const fulfillment = new fiveBellsCondition.PreimageSha256();
  fulfillment.setPreimage(preimage);
  return {
    condition: fulfillment.getConditionBinary().toString("hex").toUpperCase(),
    fulfillment: fulfillment.serializeBinary().toString("hex").toUpperCase(),
  };
}

export interface CreateEscrowParams {
  parent: Wallet;
  childAddress: string;
  amountKrw: number;
  /** Hex condition from `makeCondition`. */
  condition: string;
  /** Unix seconds; after this the parent can reclaim unspent funds. */
  cancelAfter: number;
}

/**
 * Submit an EscrowCreate from parent → child.
 * Returns the submission response so callers can extract the Sequence number.
 * v0.2 will wire this from the /parent route.
 */
export async function createMonthlyEscrow(
  params: CreateEscrowParams,
): Promise<TxResponse<EscrowCreate>> {
  const client = await getClient();
  // Convert KRW amount to drops via the mock rate.
  // v0.3: use a live oracle.
  const { MOCK_XRP_KRW_RATE } = await import("./config");
  const xrp = params.amountKrw / MOCK_XRP_KRW_RATE;
  return client.submitAndWait(
    {
      TransactionType: "EscrowCreate",
      Account: params.parent.classicAddress,
      Destination: params.childAddress,
      Amount: xrpToDrops(xrp.toFixed(6)),
      Condition: params.condition,
      CancelAfter: params.cancelAfter,
    },
    { wallet: params.parent },
  );
}

export interface FinishEscrowParams {
  child: Wallet;
  parentAddress: string;
  /** EscrowCreate Sequence number (from createMonthlyEscrow response). */
  offerSequence: number;
  /** Hex fulfillment from `makeCondition`. */
  fulfillment: string;
  condition: string;
}

/**
 * Submit an EscrowFinish from the child, releasing funds to themselves.
 */
export async function finishEscrow(
  params: FinishEscrowParams,
): Promise<TxResponse<EscrowFinish>> {
  const client = await getClient();
  return client.submitAndWait(
    {
      TransactionType: "EscrowFinish",
      Account: params.child.classicAddress,
      Owner: params.parentAddress,
      OfferSequence: params.offerSequence,
      Condition: params.condition,
      Fulfillment: params.fulfillment,
    },
    { wallet: params.child },
  );
}

/** Helper: explorer link for any tx hash (testnet). */
export function explorerTxUrl(hash: string): string {
  return `${XRPL_TESTNET_EXPLORER}/transactions/${hash}`;
}
