import Link from "next/link";

export const metadata = {
  title: "자녀 지갑 — XRP·Family",
  description: "부모님이 잠가둔 한도로 즉시 결제하세요.",
};

export default function ChildPage() {
  // Mock balance state — v0.2 wires real XRPL account_info polling.
  const limitKrw = 200_000;
  const usedKrw = 15_000;
  const remainingKrw = limitKrw - usedKrw;

  return (
    <main className="min-h-screen bg-bg text-fg">
      <div className="mx-auto w-full max-w-[480px] px-6 py-10 md:py-16">
        <Link href="/" className="text-sm text-text-muted hover:text-fg">
          ← 처음으로
        </Link>

        <header className="mt-6 mb-8">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-text-subtle">
            가족 송금 잔액 · 이번 달
          </p>
          <div className="mt-2 text-[12px] italic text-text-subtle">
            &ldquo;Mẹ đã gửi&rdquo; · 3시간 전
          </div>
        </header>

        <BalanceCard remaining={remainingKrw} limit={limitKrw} used={usedKrw} />

        <ActionRow />

        <RecentTransactions />

        <p className="mt-10 text-[12px] text-text-subtle">
          v0.1은 UI 스켈레톤입니다. EscrowFinish 트랜잭션은 다음 빌드 사이클에 연결됩니다.
          <br />
          결제 흐름: 자녀 QR 스캔 → API route → <code className="font-mono text-highlight">lib/xrpl.ts</code> → preimage 제출 → 잔액 갱신.
        </p>
      </div>
    </main>
  );
}

function BalanceCard({
  remaining,
  limit,
  used,
}: {
  remaining: number;
  limit: number;
  used: number;
}) {
  const pct = Math.round((remaining / limit) * 100);
  return (
    <section className="rounded-card border border-border bg-muted p-6 md:p-8">
      <div className="flex items-baseline gap-3">
        <span className="font-mono tabular text-[44px] font-extrabold tracking-[-1px] text-fg md:text-[56px]">
          {remaining.toLocaleString("ko-KR")}
        </span>
        <span className="text-[18px] font-semibold text-text-muted">원</span>
        <span className="ml-auto rounded-pill bg-accent-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-dark">
          {pct}% 남음
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-pill bg-border">
        <div
          className="h-full rounded-pill bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px] text-text-muted">
        <span>
          이번 달 한도 <span className="font-mono tabular">{limit.toLocaleString("ko-KR")}</span>원
        </span>
        <span>
          사용 <span className="font-mono tabular">{used.toLocaleString("ko-KR")}</span>원
        </span>
      </div>
    </section>
  );
}

function ActionRow() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <button
        type="button"
        className="rounded-button bg-fg px-4 py-4 text-[15px] font-bold text-bg opacity-60"
        disabled
      >
        QR 스캔 결제
      </button>
      <button
        type="button"
        className="rounded-button border border-border px-4 py-4 text-[15px] font-semibold text-fg opacity-60"
        disabled
      >
        내 코드 보여주기
      </button>
    </div>
  );
}

function RecentTransactions() {
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-text-subtle">
        최근 트랜잭션
      </h2>
      <ul className="divide-y divide-border-subtle overflow-hidden rounded-card border border-border-subtle bg-bg">
        <TxRow
          when="3시간 전"
          label="엄마가 보낸 한도"
          amountKrw={200_000}
          incoming
          hashShort="7E5A…F1D8"
        />
        <TxRow
          when="2시간 전"
          label="편의점 결제"
          amountKrw={-15_000}
          hashShort="9B2C…AA01"
        />
      </ul>
    </section>
  );
}

function TxRow({
  when,
  label,
  amountKrw,
  incoming,
  hashShort,
}: {
  when: string;
  label: string;
  amountKrw: number;
  incoming?: boolean;
  hashShort: string;
}) {
  const sign = incoming ? "+" : "";
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-4">
      <div className="min-w-0">
        <div className="truncate text-[15px] font-medium text-fg">{label}</div>
        <div className="mt-0.5 text-[11px] text-text-subtle">
          {when} · <span className="font-mono text-highlight">{hashShort}</span>
        </div>
      </div>
      <div
        className={`font-mono tabular text-[16px] font-bold ${
          incoming ? "text-success" : "text-fg"
        }`}
      >
        {sign}
        {amountKrw.toLocaleString("ko-KR")}원
      </div>
    </li>
  );
}
