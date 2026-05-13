/**
 * Top up existing parent + child wallets with another round of testnet faucet.
 * Useful when XRPL Reserve constraints (10 XRP base + 2 XRP per owner)
 * make a 200,000 KRW demo lock fail with tecUNFUNDED.
 *
 *   bun run topup
 *
 * Reads seeds from .env.local. Add ~30~60 seconds for the two faucet calls.
 */
import { Client, Wallet } from "xrpl";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const TESTNET_URL =
  process.env.XRPL_TESTNET_URL ?? "wss://s.altnet.rippletest.net:51233";

function loadEnvLocal(): Record<string, string> {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function topup(label: string, seed: string): Promise<void> {
  console.log(`[${label}] connecting…`);
  const client = new Client(TESTNET_URL);
  await client.connect();
  try {
    const wallet = Wallet.fromSeed(seed);
    const info = await client.request({
      command: "account_info",
      account: wallet.classicAddress,
      ledger_index: "validated",
    });
    const before = Number(info.result.account_data.Balance) / 1_000_000;
    console.log(`[${label}] ${wallet.classicAddress} · before: ${before} XRP`);
    const { balance } = await client.fundWallet(wallet);
    console.log(`[${label}] after: ${balance} XRP`);
  } finally {
    await client.disconnect();
  }
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env };
  const parent = env.KFIP_PARENT_SEED;
  const child = env.KFIP_CHILD_SEED;
  if (!parent || !child) {
    console.error("Missing KFIP_PARENT_SEED or KFIP_CHILD_SEED in .env.local");
    process.exit(1);
  }
  console.log("Topping up parent + child wallets…\n");
  await topup("parent", parent);
  await topup("child", child);
  console.log("\n✓ Done. Try the demo again — 200,000 KRW lock should now succeed.");
}

main().catch((err) => {
  console.error("topup failed:", err);
  process.exit(1);
});
