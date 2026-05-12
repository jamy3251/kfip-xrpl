import { describe, expect, test } from "bun:test";
import { parseLang, isLang, getStrings, LANGS } from "../lib/i18n";

describe("i18n parseLang", () => {
  test("defaults to ko on missing input", () => {
    expect(parseLang(undefined)).toBe("ko");
  });

  test("accepts 'ko' and 'vi'", () => {
    expect(parseLang("ko")).toBe("ko");
    expect(parseLang("vi")).toBe("vi");
  });

  test("rejects unknown locales and falls back to ko", () => {
    expect(parseLang("en")).toBe("ko");
    expect(parseLang("xx")).toBe("ko");
  });

  test("flattens array form", () => {
    expect(parseLang(["vi", "ko"])).toBe("vi");
    expect(parseLang([])).toBe("ko");
  });
});

describe("i18n dictionary", () => {
  test("every language has the full set of keys", () => {
    const ko = getStrings("ko");
    const vi = getStrings("vi");
    expect(Object.keys(ko).sort()).toEqual(Object.keys(vi).sort());
  });

  test("LANGS list includes ko and vi", () => {
    expect(LANGS).toContain("ko");
    expect(LANGS).toContain("vi");
  });

  test("ko / vi swap altLangCode", () => {
    expect(getStrings("ko").altLangCode).toBe("vi");
    expect(getStrings("vi").altLangCode).toBe("ko");
  });

  test("no empty strings in either dict", () => {
    for (const lang of LANGS) {
      const dict = getStrings(lang) as unknown as Record<string, string>;
      for (const [k, v] of Object.entries(dict)) {
        expect(v.length, `${lang}.${k}`).toBeGreaterThan(0);
      }
    }
  });

  test("isLang narrows correctly", () => {
    expect(isLang("ko")).toBe(true);
    expect(isLang("vi")).toBe(true);
    expect(isLang("en")).toBe(false);
    expect(isLang(undefined)).toBe(false);
    expect(isLang(123)).toBe(false);
  });
});
