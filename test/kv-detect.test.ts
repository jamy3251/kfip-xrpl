import { describe, expect, test } from "bun:test";
import { detectKvBackend } from "../lib/kv-detect";

describe("detectKvBackend", () => {
  test("returns 'file' when no KV env vars are set", () => {
    expect(detectKvBackend({})).toBe("file");
  });

  test("returns 'kv' when Vercel KV vars are set", () => {
    expect(
      detectKvBackend({
        KV_REST_API_URL: "https://example.upstash.io",
        KV_REST_API_TOKEN: "token",
      }),
    ).toBe("kv");
  });

  test("returns 'kv' when raw Upstash vars are set", () => {
    expect(
      detectKvBackend({
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "token",
      }),
    ).toBe("kv");
  });

  test("returns 'file' when KV var present but token missing (partial config)", () => {
    expect(detectKvBackend({ KV_REST_API_URL: "https://example" })).toBe(
      "file",
    );
    expect(detectKvBackend({ KV_REST_API_TOKEN: "token" })).toBe("file");
  });

  test("empty-string values do not count as present", () => {
    expect(
      detectKvBackend({ KV_REST_API_URL: "", KV_REST_API_TOKEN: "" }),
    ).toBe("file");
  });
});
