import Link from "next/link";
import HeroTerminal from "./components/HeroTerminal";
import { getStrings, parseLang, type Lang, type LandingStrings } from "@/lib/i18n";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const lang: Lang = parseLang(params.lang);
  const t = getStrings(lang);

  return (
    <main className="min-h-screen bg-bg text-fg" lang={lang}>
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-20">
        <Header t={t} lang={lang} />
        <Hero t={t} />
        <MetricRow t={t} />
        <Footer t={t} />
      </div>
    </main>
  );
}

function Header({ t, lang }: { t: LandingStrings; lang: Lang }) {
  const altHref = `/?lang=${t.altLangCode}`;
  return (
    <header className="relative flex items-center justify-between border-b border-border-subtle py-6 md:py-8">
      <div className="flex items-center gap-2 text-[15px] font-bold tracking-tight md:text-[17px]">
        <span className="block h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_8px_rgba(0,170,228,0.5)]" />
        <span>XRP·Family</span>
        <span className="hidden font-normal text-text-subtle sm:inline">
          / KFIP 2026
        </span>
      </div>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-7 text-sm font-medium text-text-muted md:flex">
        <Link href={`/?lang=${lang}#about`} className="hover:text-fg">
          {t.headerAbout}
        </Link>
        <Link href={`/?lang=${lang}#tech`} className="hover:text-fg">
          {t.headerTech}
        </Link>
        <Link href="/parent" className="hover:text-fg">{t.headerParent}</Link>
        <Link href="/child" className="hover:text-fg">{t.headerChild}</Link>
        <Link href="/child" className="text-accent hover:opacity-80">
          {t.headerDemo}
        </Link>
        <LangSwitch lang={lang} altHref={altHref} altLabel={t.altLangLabel} />
        <span className="ml-2 inline-flex items-center gap-1.5 rounded-pill border border-border-subtle px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-muted">
          {t.headerPowered} <span className="font-bold text-accent">●</span> XRPL
        </span>
      </nav>

      {/* Mobile menu */}
      <div className="flex items-center gap-2 md:hidden">
        <LangSwitch lang={lang} altHref={altHref} altLabel={t.altLangCode.toUpperCase()} />
        <details className="group relative">
          <summary
            aria-label="메뉴 열기"
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-input border border-border-subtle text-fg [&::-webkit-details-marker]:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </summary>
          <nav className="absolute right-0 top-full z-30 mt-2 flex w-56 flex-col rounded-card border border-border bg-bg p-2 text-[14px] font-medium text-fg shadow-[0_12px_32px_rgba(10,10,10,0.08)]">
            <Link href="/parent" className="rounded-input px-3 py-3 hover:bg-muted">
              {t.headerParent}
            </Link>
            <Link href="/child" className="rounded-input px-3 py-3 hover:bg-muted">
              {t.headerChild}
            </Link>
            <Link
              href="/child"
              className="rounded-input px-3 py-3 text-accent hover:bg-accent-bg"
            >
              {t.heroCtaPrimary}
            </Link>
            <hr className="my-1 border-border-subtle" />
            <span className="px-3 pb-2 pt-1 text-[10px] uppercase tracking-wider text-text-subtle">
              {t.headerPowered} ● XRPL
            </span>
          </nav>
        </details>
      </div>
    </header>
  );
}

function LangSwitch({
  lang: _lang,
  altHref,
  altLabel,
}: {
  lang: Lang;
  altHref: string;
  altLabel: string;
}) {
  return (
    <Link
      href={altHref}
      className="inline-flex items-center gap-1 rounded-pill border border-border-subtle px-2.5 py-1 text-[11px] font-semibold text-text-muted hover:border-accent hover:text-accent"
      title="Switch language"
    >
      <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M3 10h14M10 3a14 14 0 0 1 0 14M10 3a14 14 0 0 0 0 14" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
      {altLabel}
    </Link>
  );
}

function Hero({ t }: { t: LandingStrings }) {
  return (
    <section className="grid items-start gap-12 pt-12 pb-12 md:grid-cols-[1.05fr_0.95fr] md:gap-15 md:pt-24 md:pb-16">
      <div>
        <span className="mb-7 inline-flex items-center gap-2 rounded-pill border border-accent-border bg-accent-bg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-dark">
          <span className="block h-[6px] w-[6px] rounded-full bg-accent animate-kfip-pulse" />
          {t.heroLiveTag}
        </span>
        <h1 className="mb-6 text-[36px] leading-[1.08] tracking-[-1.5px] font-extrabold text-fg md:text-[62px] md:tracking-[-2.2px]">
          {t.heroHeadlineLine1}
          <br />
          {t.heroHeadlineLine2}{" "}
          <span className="border-b-[3px] border-accent pb-0.5 text-accent">
            {t.heroHeadlineAccent}
          </span>
        </h1>
        <p className="mb-9 max-w-[520px] text-[16px] leading-[1.55] text-[#444] md:text-[19px]">
          {t.heroSub}{" "}
          <span className="font-semibold text-fg">{t.heroSubAccent}</span>.
        </p>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/child"
            className="inline-block rounded-button bg-fg px-7 py-4 text-[15px] font-bold text-bg transition-opacity hover:opacity-90"
          >
            {t.heroCtaPrimary}
          </Link>
          <Link
            href="/parent"
            className="inline-block rounded-button border border-border px-5 py-4 text-[15px] font-semibold text-fg transition-colors hover:border-accent hover:text-accent"
          >
            {t.heroCtaSecondary}
          </Link>
        </div>
        <div className="inline-flex items-center gap-2 text-[13px] text-text-muted">
          <span>{t.heroMicroLabel}</span>
          <span className="italic text-text-subtle">{t.heroMicroBody}</span>
          <span>{t.heroMicroAgo}</span>
        </div>
      </div>

      <HeroTerminal />
    </section>
  );
}

function MetricRow({ t }: { t: LandingStrings }) {
  return (
    <div className="mt-12 grid grid-cols-2 border-y border-border-subtle py-12 md:mt-16 md:grid-cols-4 md:py-16">
      <Metric label={t.metricSpeedLabel} value="3.2" unit="s" accent>
        {t.metricSpeedSub}
      </Metric>
      <Metric label={t.metricFeeLabel} value="0.5" unit="%" accent>
        {t.metricFeeSub}
      </Metric>
      <Metric label={t.metricCreditLabel} value={t.metricCreditValue} inline>
        {t.metricCreditSub}
      </Metric>
      <Metric label={t.metricMainnetLabel} value={t.metricMainnetValue} inline>
        {t.metricMainnetSub}
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
          <span className="font-mono tabular text-accent">{value}</span>
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

function Footer({ t }: { t: LandingStrings }) {
  return (
    <footer className="border-t border-border-subtle py-10 text-[12px] text-text-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{t.footerLeft}</span>
        <span className="flex items-center gap-1.5">{t.footerRight}</span>
      </div>
    </footer>
  );
}
