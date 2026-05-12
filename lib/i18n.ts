/**
 * Pure i18n dictionary for the landing page. Pure module — safe everywhere.
 *
 * Two supported locales:
 *   ko — Korean primary (KFIP judges, Korean-side child user)
 *   vi — Vietnamese (parent-side, Vietnamese international audience)
 *
 * Native-speaker review is a TODO for the post-KFIP cycle. Strings here are
 * pragmatic translations for the demo, not localisation-ready production copy.
 */

export type Lang = "ko" | "vi";

export const LANGS: Lang[] = ["ko", "vi"];

export function isLang(v: unknown): v is Lang {
  return v === "ko" || v === "vi";
}

export function parseLang(input: string | string[] | undefined): Lang {
  const raw = Array.isArray(input) ? input[0] : input;
  return isLang(raw) ? raw : "ko";
}

export interface LandingStrings {
  langLabel: string;
  altLangLabel: string;
  altLangCode: Lang;

  // Header
  headerAbout: string;
  headerTech: string;
  headerParent: string;
  headerChild: string;
  headerDemo: string;
  headerPowered: string;

  // Hero
  heroLiveTag: string;
  heroHeadlineLine1: string;
  heroHeadlineLine2: string;
  heroHeadlineAccent: string;
  heroSub: string;
  heroSubAccent: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroMicroLabel: string;
  heroMicroBody: string;
  heroMicroAgo: string;

  // Metric labels + sub
  metricSpeedLabel: string;
  metricSpeedSub: string;
  metricFeeLabel: string;
  metricFeeSub: string;
  metricCreditLabel: string;
  metricCreditValue: string;
  metricCreditSub: string;
  metricMainnetLabel: string;
  metricMainnetValue: string;
  metricMainnetSub: string;

  // Footer
  footerLeft: string;
  footerRight: string;
}

const ko: LandingStrings = {
  langLabel: "한국어",
  altLangLabel: "Tiếng Việt",
  altLangCode: "vi",

  headerAbout: "서비스 소개",
  headerTech: "XRPL 기술",
  headerParent: "부모용",
  headerChild: "자녀용",
  headerDemo: "데모",
  headerPowered: "Powered by",

  heroLiveTag: "XRPL Testnet · Live",
  heroHeadlineLine1: "XRPL 위에 세운",
  heroHeadlineLine2: "가족 송금·결제",
  heroHeadlineAccent: "한 번에",
  heroSub: "베트남 부모님이 보낸 돈,",
  heroSubAccent: "3.2초",
  heroCtaPrimary: "데모 체험하기 →",
  heroCtaSecondary: "부모 한도 설정 보기",
  heroMicroLabel: "최근 거래 ·",
  heroMicroBody: '"Mẹ đã gửi 200,000 KRW"',
  heroMicroAgo: "· 3초 전",

  metricSpeedLabel: "정산 속도",
  metricSpeedSub: "vs SWIFT 2~5일 · 100,000× faster",
  metricFeeLabel: "수수료",
  metricFeeSub: "vs SWIFT 5~10% · 10~20× cheaper",
  metricCreditLabel: "신용평가",
  metricCreditValue: "없음",
  metricCreditSub: "가족 사전 승인 한도 · XRPL Escrow",
  metricMainnetLabel: "XRPL 메인넷",
  metricMainnetValue: "활성",
  metricMainnetSub: "2012~ · Escrow/DEX 네이티브",

  footerLeft: "© 2026 XRP·Family · KFIP 지원 프로젝트",
  footerRight: "Made with ● XRPL Testnet · Demo only",
};

const vi: LandingStrings = {
  langLabel: "Tiếng Việt",
  altLangLabel: "한국어",
  altLangCode: "ko",

  headerAbout: "Giới thiệu",
  headerTech: "Công nghệ XRPL",
  headerParent: "Phụ huynh",
  headerChild: "Học sinh",
  headerDemo: "Demo",
  headerPowered: "Powered by",

  heroLiveTag: "XRPL Testnet · Live",
  heroHeadlineLine1: "Xây trên XRPL,",
  heroHeadlineLine2: "Chuyển tiền & thanh toán",
  heroHeadlineAccent: "trong một bước",
  heroSub: "Tiền bố mẹ Việt Nam gửi đến số dư thẻ KRW trong",
  heroSubAccent: "3.2 giây",
  heroCtaPrimary: "Trải nghiệm Demo →",
  heroCtaSecondary: "Cài đặt hạn mức phụ huynh",
  heroMicroLabel: "Giao dịch gần đây ·",
  heroMicroBody: '"Mẹ đã gửi 200,000 KRW"',
  heroMicroAgo: "· 3 giây trước",

  metricSpeedLabel: "Tốc độ",
  metricSpeedSub: "vs SWIFT 2-5 ngày · Nhanh hơn 100,000×",
  metricFeeLabel: "Phí",
  metricFeeSub: "vs SWIFT 5-10% · Rẻ hơn 10-20×",
  metricCreditLabel: "Đánh giá tín dụng",
  metricCreditValue: "Không cần",
  metricCreditSub: "Hạn mức phụ huynh duyệt sẵn · XRPL Escrow",
  metricMainnetLabel: "XRPL Mainnet",
  metricMainnetValue: "Hoạt động",
  metricMainnetSub: "2012~ · Escrow/DEX gốc",

  footerLeft: "© 2026 XRP·Family · Dự án ứng tuyển KFIP",
  footerRight: "Made with ● XRPL Testnet · Demo only",
};

const dicts: Record<Lang, LandingStrings> = { ko, vi };

export function getStrings(lang: Lang): LandingStrings {
  return dicts[lang];
}
