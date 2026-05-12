import Link from "next/link";
import HeroTerminal from "./components/HeroTerminal";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-20">
        <Header />
        <Hero />
        <MetricRow />
        <Footer />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border-subtle py-8">
      <div className="flex items-center gap-2 text-[17px] font-bold tracking-tight">
        <span className="block h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_8px_rgba(0,170,228,0.5)]" />
        <span>XRP·Family</span>
        <span className="font-normal text-text-subtle">/ KFIP 2026</span>
      </div>
      <nav className="hidden items-center gap-7 text-sm font-medium text-text-muted md:flex">
        <Link href="#" className="hover:text-fg">서비스 소개</Link>
        <Link href="#" className="hover:text-fg">XRPL 기술</Link>
        <Link href="/parent" className="hover:text-fg">부모용</Link>
        <Link href="/child" className="hover:text-fg">자녀용</Link>
        <Link href="/child" className="text-accent hover:opacity-80">데모</Link>
        <span className="ml-2 inline-flex items-center gap-1.5 rounded-pill border border-border-subtle px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-muted">
          Powered by <span className="font-bold text-accent">●</span> XRPL
        </span>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="grid items-start gap-12 pt-16 pb-12 md:grid-cols-[1.05fr_0.95fr] md:gap-15 md:pt-24 md:pb-16">
      {/* Left column */}
      <div>
        <span className="mb-7 inline-flex items-center gap-2 rounded-pill border border-accent-border bg-accent-bg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-dark">
          <span className="block h-[6px] w-[6px] rounded-full bg-accent animate-kfip-pulse" />
          XRPL Testnet · Live
        </span>
        <h1 className="mb-6 text-[40px] leading-[1.08] tracking-[-1.5px] font-extrabold text-fg md:text-[62px] md:tracking-[-2.2px]">
          XRPL 위에 세운
          <br />
          가족 송금·결제{" "}
          <span className="border-b-[3px] border-accent pb-0.5 text-accent">한 번에</span>
        </h1>
        <p className="mb-9 max-w-[520px] text-[17px] leading-[1.55] text-[#444] md:text-[19px]">
          베트남 부모님이 보낸 돈, <span className="font-semibold text-fg">3.2초</span> 안에 한국 카드 잔액으로.
          <br className="hidden md:inline" /> SWIFT의 며칠은 끝났습니다.
        </p>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/child"
            className="inline-block rounded-button bg-fg px-7 py-4 text-[15px] font-bold text-bg transition-opacity hover:opacity-90"
          >
            데모 체험하기 →
          </Link>
          <Link
            href="/parent"
            className="inline-block rounded-button border border-border px-5 py-4 text-[15px] font-semibold text-fg transition-colors hover:border-accent hover:text-accent"
          >
            부모 한도 설정 보기
          </Link>
        </div>
        <Microcopy />
      </div>

      {/* Right column — Live XRPL Terminal */}
      <HeroTerminal />
    </section>
  );
}

function Microcopy() {
  return (
    <div className="inline-flex items-center gap-2 text-[13px] text-text-muted">
      <span>최근 거래 ·</span>
      <span className="italic text-text-subtle">&ldquo;Mẹ đã gửi 200,000 KRW&rdquo;</span>
      <span>· 3초 전</span>
    </div>
  );
}

function MetricRow() {
  return (
    <div className="mt-12 grid grid-cols-2 border-y border-border-subtle py-12 md:mt-16 md:grid-cols-4 md:py-16">
      <Metric label="정산 속도" value="3.2" unit="s" accent>
        <span className="line-through text-[#bbb]">SWIFT 2~5일</span> · 100,000× faster
      </Metric>
      <Metric label="수수료" value="0.5" unit="%" accent>
        <span className="line-through text-[#bbb]">SWIFT 5~10%</span> · 10~20× cheaper
      </Metric>
      <Metric label="신용평가" value="없음" inline>
        가족 사전 승인 한도 · XRPL Escrow
      </Metric>
      <Metric label="XRPL 메인넷" value="활성" inline>
        2012~ · Escrow/DEX 네이티브
      </Metric>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  accent,
  inline,
  children,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  inline?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-r border-border-subtle px-4 last:border-r-0 md:px-7">
      <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
        {label}
      </div>
      <div className="mb-1.5 text-[28px] leading-none font-extrabold tracking-[-1px] text-fg md:text-[36px]">
        {inline ? (
          <>
            필요 <span className="font-mono tabular text-accent">{value}</span>
          </>
        ) : (
          <>
            <span className={`font-mono tabular ${accent ? "text-accent" : ""}`}>
              {value}
            </span>
            {unit ? <span className="text-[18px] text-text-subtle"> {unit}</span> : null}
          </>
        )}
      </div>
      <div className="text-[12px] leading-snug text-text-muted">{children}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-subtle py-10 text-[12px] text-text-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>© 2026 XRP·Family · KFIP 지원 프로젝트</span>
        <span className="flex items-center gap-1.5">
          Made with <span className="text-accent">●</span> XRPL Testnet · Demo only
        </span>
      </div>
    </footer>
  );
}
