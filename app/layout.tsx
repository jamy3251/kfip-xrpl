import type { Metadata } from "next";
import { Noto_Sans_KR, Geist_Mono } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XRP·Family — XRPL 가족 송금·결제 즉시 실행",
  description:
    "베트남 부모님이 보낸 돈, 3초 안에 한국 카드 잔액으로. XRPL 위에 세운 가족 송금·결제 인프라.",
  openGraph: {
    title: "XRP·Family — XRPL 가족 송금·결제",
    description:
      "베트남 부모님이 보낸 돈, 3.2초 안에 한국 카드 잔액으로. KFIP 2026 지원 프로젝트.",
    type: "website",
    locale: "ko_KR",
    siteName: "XRP·Family",
  },
  twitter: {
    card: "summary_large_image",
    title: "XRP·Family — XRPL 가족 송금·결제",
    description:
      "Mẹ đã gửi 200,000 KRW · 3.2초 안에 한국 카드 잔액으로",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
