import Link from "next/link";

export const metadata = {
  title: "부모 한도 설정 — XRP·Family",
  description: "베트남 측에서 자녀 앞으로 월 한도를 XRPL Escrow로 잠급니다.",
};

export default function ParentPage() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <div className="mx-auto w-full max-w-[720px] px-6 py-12 md:px-10 md:py-20">
        <Link href="/" className="text-sm text-text-muted hover:text-fg">
          ← 처음으로
        </Link>

        <header className="mt-6 mb-10">
          <span className="inline-flex items-center gap-2 rounded-pill border border-accent-border bg-accent-bg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-dark">
            부모 뷰 · Phụ huynh
          </span>
          <h1 className="mt-4 text-[36px] font-extrabold tracking-[-1px] leading-tight md:text-[44px]">
            자녀 앞으로 이번 달 한도를 잠가두세요
          </h1>
          <p className="mt-3 text-[15px] italic text-text-subtle">
            Đặt giới hạn hàng tháng cho con của bạn
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-text-muted">
            잠긴 금액은 자녀가 결제할 때만 차감됩니다. 월말까지 쓰지 않은 잔액은 자동으로 부모에게 돌아갑니다.
          </p>
        </header>

        <section className="rounded-card border border-border bg-muted p-6 md:p-8">
          <Field label="자녀 XRPL 주소" example="rHQ…M7b">
            <input
              type="text"
              placeholder="rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
              className="w-full rounded-input border border-border bg-bg px-4 py-3 font-mono text-[14px] text-fg placeholder:text-text-subtle focus:border-accent focus:outline-none"
              disabled
            />
          </Field>

          <Field label="이번 달 한도 (KRW)" example="200,000원">
            <input
              type="number"
              defaultValue={200000}
              className="w-full rounded-input border border-border bg-bg px-4 py-3 font-mono text-[20px] font-bold text-fg tabular focus:border-accent focus:outline-none"
              disabled
            />
          </Field>

          <Field label="만료 시점" example="이번 달 말">
            <input
              type="text"
              defaultValue="2026-05-31 23:59 KST"
              className="w-full rounded-input border border-border bg-bg px-4 py-3 text-[14px] text-fg focus:border-accent focus:outline-none"
              disabled
            />
          </Field>

          <button
            type="button"
            className="mt-2 w-full rounded-button bg-text-subtle px-6 py-4 text-[15px] font-bold text-bg opacity-60"
            disabled
          >
            한도 잠그기 (v0.2에서 활성화)
          </button>

          <p className="mt-4 text-[12px] text-text-subtle">
            v0.1은 UI 스켈레톤입니다. EscrowCreate 트랜잭션은 다음 빌드 사이클에 연결됩니다.
            <br />
            서명 흐름: 부모 키 → API route → <code className="font-mono text-highlight">lib/xrpl.ts</code> → XRPL 테스트넷.
          </p>
        </section>

        <PlannedFlow />
      </div>
    </main>
  );
}

function Field({
  label,
  example,
  children,
}: {
  label: string;
  example?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-[12px] font-semibold uppercase tracking-wider text-text-subtle">
          {label}
        </label>
        {example ? (
          <span className="text-[11px] text-text-subtle">예: {example}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function PlannedFlow() {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-text-subtle">
        예정된 흐름 (v0.2)
      </h2>
      <ol className="space-y-3 text-[14px] text-text-muted">
        <li className="flex gap-3">
          <span className="block w-6 shrink-0 font-mono tabular text-accent">1.</span>
          <span>부모 입력 → <code className="font-mono text-highlight">makeCondition()</code> 호출, preimage·condition 쌍 생성</span>
        </li>
        <li className="flex gap-3">
          <span className="block w-6 shrink-0 font-mono tabular text-accent">2.</span>
          <span>API route → <code className="font-mono text-highlight">createMonthlyEscrow()</code> → XRPL EscrowCreate 제출</span>
        </li>
        <li className="flex gap-3">
          <span className="block w-6 shrink-0 font-mono tabular text-accent">3.</span>
          <span>preimage(fulfillment)는 자녀에게 안전하게 전달 (QR / E2E 채널)</span>
        </li>
        <li className="flex gap-3">
          <span className="block w-6 shrink-0 font-mono tabular text-accent">4.</span>
          <span>자녀가 결제 시 EscrowFinish + preimage 제출 → 즉시 잔액 차감</span>
        </li>
      </ol>
    </section>
  );
}
