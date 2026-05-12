import QRCode from "qrcode";
import Link from "next/link";

export const metadata = {
  title: "가맹점 QR — XRP·Family",
  description: "데모용 가맹점 QR 코드 모음. 자녀 폰으로 스캔.",
};

interface SampleMerchant {
  label: string;
  amountKrw: number;
}

const MERCHANTS: SampleMerchant[] = [
  { label: "편의점", amountKrw: 15_000 },
  { label: "카페", amountKrw: 5_500 },
  { label: "분식점", amountKrw: 8_000 },
  { label: "마트", amountKrw: 28_000 },
  { label: "지하철", amountKrw: 1_550 },
  { label: "택시", amountKrw: 12_000 },
];

async function buildQrPayload(m: SampleMerchant): Promise<string> {
  const url = `kfip://pay?label=${encodeURIComponent(m.label)}&amount=${m.amountKrw}`;
  return QRCode.toDataURL(url, {
    width: 256,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });
}

export default async function MerchantPage() {
  const dataUrls = await Promise.all(MERCHANTS.map(buildQrPayload));
  return (
    <main className="min-h-screen bg-bg text-fg">
      <div className="mx-auto w-full max-w-[960px] px-5 py-10 md:px-10 md:py-16">
        <Link href="/" className="text-sm text-text-muted hover:text-fg">
          ← 처음으로
        </Link>

        <header className="mt-6 mb-10">
          <span className="inline-flex items-center gap-2 rounded-pill border border-accent-border bg-accent-bg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-dark">
            가맹점 QR · Demo
          </span>
          <h1 className="mt-4 text-[28px] font-extrabold tracking-[-1px] leading-tight md:text-[36px]">
            데모용 가맹점 QR
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-text-muted">
            자녀 폰의 <Link href="/child" className="text-accent hover:underline">/child 페이지</Link>{" "}
            에서 &ldquo;QR 스캔&rdquo; 누른 뒤 이 화면의 QR을 카메라로 비추면 결제 진행. KFIP 시연용.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {MERCHANTS.map((m, i) => (
            <div
              key={m.label}
              className="flex flex-col items-center rounded-card border border-border-subtle bg-muted p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrls[i]}
                alt={`${m.label} QR · ${m.amountKrw}원`}
                width={256}
                height={256}
                className="h-auto w-full max-w-[180px]"
              />
              <div className="mt-3 text-[16px] font-bold text-fg">{m.label}</div>
              <div className="mt-1 font-mono tabular text-[14px] text-text-muted">
                {m.amountKrw.toLocaleString("ko-KR")}원
              </div>
              <div className="mt-2 break-all text-center font-mono text-[10px] text-text-subtle">
                kfip://pay?label={encodeURIComponent(m.label)}
                <br />
                &amp;amount={m.amountKrw}
              </div>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-card border border-border-subtle bg-bg p-5 text-[13px] text-text-muted">
          <h2 className="mb-2 text-[14px] font-bold text-fg">사용 흐름</h2>
          <ol className="ml-4 list-decimal space-y-1.5">
            <li>두 기기 준비 (또는 한 화면에 /merchant + /child 동시 표시)</li>
            <li>자녀 폰 → <code className="font-mono text-highlight">/child</code> → 한도 받은 상태</li>
            <li>자녀 폰 → &ldquo;QR 스캔&rdquo; 버튼 → 카메라 권한 허용</li>
            <li>이 화면의 QR을 비춤 → 결제 확인 다이얼로그 → 확인</li>
            <li>XRPL Payment 발행 → 잔액 차감 + tx hash explorer 링크</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
