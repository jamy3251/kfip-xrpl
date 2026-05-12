/**
 * Provision three funded testnet wallets (parent + child + merchant) and print seeds.
 *
 *   bun run setup:wallets
 *
 * Copy the printed lines into `.env.local`. Faucet calls take ~10-20s each.
 * Re-running creates fresh wallets — old ones still exist on testnet but
 * are not referenced by this app anymore.
 *
 * Roles:
 *   parent   — Vietnam-side. Locks monthly limit via EscrowCreate.
 *   child    — Korea-side. Claims via EscrowFinish, then makes Payment txs.
 *   merchant — destination of demo payments (편의점, 카페 등).
 */
import { Client, type Wallet } from "xrpl";

const TESTNET_URL =
  process.env.XRPL_TESTNET_URL ?? "wss://s.altnet.rippletest.net:51233";

async function fund(label: string): Promise<Wallet> {
  console.log(`[${label}] requesting testnet faucet…`);
  const client = new Client(TESTNET_URL);
  await client.connect();
  try {
    const { wallet, balance } = await client.fundWallet();
    console.log(
      `[${label}] address: ${wallet.classicAddress} · balance: ${balance} XRP`,
    );
    return wallet;
  } finally {
    await client.disconnect();
  }
}

async function main() {
  console.log("KFIP wallet setup — testnet only\n");
  const parent = await fund("parent");
  const child = await fund("child");
  const merchant = await fund("merchant");
  console.log("\n--- copy into .env.local ---");
  console.log(`KFIP_PARENT_SEED=${parent.seed}`);
  console.log(`KFIP_PARENT_ADDRESS=${parent.classicAddress}`);
  console.log(`KFIP_CHILD_SEED=${child.seed}`);
  console.log(`KFIP_CHILD_ADDRESS=${child.classicAddress}`);
  console.log(`KFIP_MERCHANT_ADDRESS=${merchant.classicAddress}`);
  console.log("----------------------------\n");
  console.log(
    "Faucet wallets last as long as testnet doesn't reset. If a future test fails with\n" +
      "actNotFound, re-run this script.",
  );
}

main().catch((err) => {
  console.error("setup failed:", err);
  process.exit(1);
});
