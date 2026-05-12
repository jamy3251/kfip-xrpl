import { describe, expect, test } from "bun:test";
import { humanizeXrplError, isRetryable } from "../lib/xrpl-errors";

describe("humanizeXrplError", () => {
  test("translates known engine results to Korean", () => {
    expect(humanizeXrplError({ engineResult: "tecNO_DST" })).toContain("받는 사람");
    expect(humanizeXrplError({ engineResult: "tecINSUFFICIENT_FUNDS" })).toContain(
      "잔액 부족",
    );
  });

  test("returns generic XRPL phrase for unknown engine result", () => {
    expect(humanizeXrplError({ engineResult: "tecMADE_UP" })).toContain(
      "tecMADE_UP",
    );
  });

  test("recognises actNotFound text", () => {
    expect(humanizeXrplError({ message: "actNotFound: r123..." })).toContain(
      "testnet",
    );
  });

  test("recognises tooBusy text", () => {
    expect(humanizeXrplError({ message: "tooBusy: server queue" })).toContain(
      "과부하",
    );
  });

  test("falls back to truncated raw on unknown message", () => {
    const long = "x".repeat(500);
    const out = humanizeXrplError({ message: long });
    expect(out.length).toBeLessThanOrEqual(200);
  });

  test("empty input returns generic", () => {
    expect(humanizeXrplError({})).toBe("알 수 없는 오류");
  });
});

describe("isRetryable", () => {
  test("ter-class engine results retry", () => {
    expect(isRetryable({ engineResult: "terRETRY" })).toBe(true);
    expect(isRetryable({ engineResult: "terQUEUED" })).toBe(true);
    expect(isRetryable({ engineResult: "tefMAX_LEDGER" })).toBe(true);
  });

  test("tec-class engine results do not retry", () => {
    expect(isRetryable({ engineResult: "tecNO_DST" })).toBe(false);
    expect(isRetryable({ engineResult: "tecINSUFFICIENT_FUNDS" })).toBe(false);
  });

  test("network-ish messages retry", () => {
    expect(isRetryable({ message: "request timeout" })).toBe(true);
    expect(isRetryable({ message: "ECONNRESET" })).toBe(true);
    expect(isRetryable({ message: "tooBusy" })).toBe(true);
  });

  test("non-retryable messages do not retry", () => {
    expect(isRetryable({ message: "invalid signature" })).toBe(false);
    expect(isRetryable({ message: "" })).toBe(false);
  });
});
