/**
 * KFIP XRPL helpers — server-side only.
 *
 * v0.2: EscrowCreate + EscrowFinish + Payment all wired. UI calls these via
 *       API routes in app/api/. The hero terminal still shows mocked data;
 *       v0.3 will swap it for a live WebSocket subscription.
 *
 * Architecture rule: NEVER import this module from a client component. All
 * signing happens server-side. Seed material lives in env vars only.
 */
import "server-only";
import {
  Client,
  Wallet,
  xrpToDrops,
  type TxResponse,
  type EscrowCreate,
  type EscrowFinish,
  type Payment,
} from "xrpl";
import * as fiveBellsCondition from "five-bells-condition";
import { randomBytes } from "node:crypto";
import {
  XRPL_TESTNET_URL,
  XRPL_TESTNET_EXPLORER,
  krwToXrp,
} from "./config";

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
 * Use only during dev / one-off setup. Faucet is rate-limited.
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
 */
export function makeCondition(): { condition: string; fulfillment: string } {
  const preimage = randomBytes(32);
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
  condition: string;
  /** Unix seconds; after this the parent can reclaim unspent funds. */
  cancelAfter: number;
}

export async function createMonthlyEscrow(
  params: CreateEscrowParams,
): Promise<TxResponse<EscrowCreate>> {
  const client = await getClient();
  const xrp = krwToXrp(params.amountKrw);
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
  offerSequence: number;
  fulfillment: string;
  condition: string;
}

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

export interface MerchantPaymentParams {
  child: Wallet;
  merchantAddress: string;
  amountKrw: number;
  /** Free-form memo (max ~1KB) e.g. "편의점 결제". */
  memo?: string;
}

export async function sendMerchantPayment(
  params: MerchantPaymentParams,
): Promise<TxResponse<Payment>> {
  const client = await getClient();
  const xrp = krwToXrp(params.amountKrw);
  return client.submitAndWait(
    {
      TransactionType: "Payment",
      Account: params.child.classicAddress,
      Destination: params.merchantAddress,
      Amount: xrpToDrops(xrp.toFixed(6)),
      ...(params.memo
        ? {
            Memos: [
              {
                Memo: {
                  MemoData: Buffer.from(params.memo, "utf-8")
                    .toString("hex")
                    .toUpperCase(),
                },
              },
            ],
          }
        : {}),
    },
    { wallet: params.child },
  );
}

/** Query the current XRP balance (in drops) for an account. */
export async function getBalanceDrops(address: string): Promise<string> {
  const client = await getClient();
  const info = await client.request({
    command: "account_info",
    account: address,
    ledger_index: "validated",
  });
  return info.result.account_data.Balance;
}

/** Explorer link for any tx hash (testnet). */
export function explorerTxUrl(hash: string): string {
  return `${XRPL_TESTNET_EXPLORER}/transactions/${hash}`;
}
