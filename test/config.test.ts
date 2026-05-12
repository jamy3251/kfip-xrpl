import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import {
  krwToXrp,
  dropsToKrw,
  dropsToKrwAt,
  readyForXrpl,
  MOCK_XRP_KRW_RATE,
  DEFAULT_MONTHLY_LIMIT_KRW,
} from "../lib/config";

describe("KRW ↔ XRP conversion", () => {
  test("krwToXrp inverse of mock rate", () => {
    expect(krwToXrp(MOCK_XRP_KRW_RATE)).toBe(1);
    expect(krwToXrp(MOCK_XRP_KRW_RATE * 2)).toBe(2);
  });

  test("krwToXrp zero / negative is permitted but caller's problem", () => {
    expect(krwToXrp(0)).toBe(0);
    expect(krwToXrp(-1000)).toBe(-1000 / MOCK_XRP_KRW_RATE);
  });

  test("dropsToKrw round trips through 1 XRP", () => {
    expect(dropsToKrw(1_000_000)).toBe(MOCK_XRP_KRW_RATE);
  });

  test("dropsToKrw rounds to whole won", () => {
    // 1.5 XRP at mock rate 2800 = 4200 KRW exact, but try a fractional case
    expect(dropsToKrw(1_234_567)).toBe(
      Math.round((1_234_567 / 1_000_000) * MOCK_XRP_KRW_RATE),
    );
  });

  test("dropsToKrw accepts string input (XRPL native)", () => {
    expect(dropsToKrw("2000000")).toBe(MOCK_XRP_KRW_RATE * 2);
  });

  test("dropsToKrwAt uses supplied rate, not mock", () => {
    expect(dropsToKrwAt(1_000_000, 3500)).toBe(3500);
    expect(dropsToKrwAt("500000", 3000)).toBe(1500);
  });
});

describe("readyForXrpl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.KFIP_PARENT_SEED;
    delete process.env.KFIP_CHILD_SEED;
    delete process.env.KFIP_MERCHANT_ADDRESS;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test("reports all three when nothing is set", () => {
    const r = readyForXrpl();
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual([
      "KFIP_PARENT_SEED",
      "KFIP_CHILD_SEED",
      "KFIP_MERCHANT_ADDRESS",
    ]);
  });

  test("reports partial gaps", () => {
    process.env.KFIP_PARENT_SEED = "sEdTest1";
    process.env.KFIP_MERCHANT_ADDRESS = "rTest";
    const r = readyForXrpl();
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual(["KFIP_CHILD_SEED"]);
  });

  test("returns ok when all three are present", () => {
    process.env.KFIP_PARENT_SEED = "sEdTest1";
    process.env.KFIP_CHILD_SEED = "sEdTest2";
    process.env.KFIP_MERCHANT_ADDRESS = "rTestMerchant";
    const r = readyForXrpl();
    expect(r.ok).toBe(true);
    expect(r.missing).toEqual([]);
  });
});

describe("constants are sane", () => {
  test("DEFAULT_MONTHLY_LIMIT_KRW is a reasonable amount", () => {
    expect(DEFAULT_MONTHLY_LIMIT_KRW).toBeGreaterThan(10_000);
    expect(DEFAULT_MONTHLY_LIMIT_KRW).toBeLessThan(10_000_000);
  });

  test("MOCK_XRP_KRW_RATE roughly matches real-world 2026 XRP price", () => {
    // 1 XRP has been in the $0.50-$5 range for years; 2-3K KRW is plausible.
    expect(MOCK_XRP_KRW_RATE).toBeGreaterThan(500);
    expect(MOCK_XRP_KRW_RATE).toBeLessThan(20_000);
  });
});
