"use client";

import { useEffect, useState } from "react";

interface Step {
  step: number;
  total: number;
  title: string;
  hint: string;
  next: string;
}

const STEPS: Record<string, Step> = {
  "/": {
    step: 1,
    total: 3,
    title: "랜딩 — 첫 인상",
    hint: "라이브 XRPL Testnet 터미널이 우측에서 실시간 트랜잭션을 흘립니다.",
    next: "다음 → 상단 우측 \"데모 체험하기\" 또는 메뉴에서 부모용 선택",
  },
  "/parent": {
    step: 2,
    total: 3,
    title: "부모 — 한도 잠그기",
    hint: "EscrowCreate 트랜잭션을 XRPL 테스트넷에 발행합니다.",
    next: "다음 → \"한도 잠그기 (EscrowCreate)\" 버튼 클릭",
  },
  "/child": {
    step: 3,
    total: 3,
    title: "자녀 — 받기·결제",
    hint: "EscrowFinish → Payment 두 트랜잭션이 발행됩니다.",
    next: "다음 → \"한도 받기\" → 4개 가맹점 중 하나 결제",
  },
};

/**
 * Renders a small floating guide when `?demo=guide` is in the URL.
 * Mount once in the root layout — checks the current pathname on its own.
 */
export default function DemoGuide() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<Step | null>(null);

  useEffect(() => {
    function compute() {
      const params = new URLSearchParams(window.location.search);
      const active = params.get("demo") === "guide";
      setShow(active);
      if (active) {
        const path = window.location.pathname.replace(/\/$/, "") || "/";
        setStep(STEPS[path] ?? null);
      }
    }
    compute();
    // Re-evaluate on client navigation
    const handler = () => compute();
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  if (!show || !step) return null;

  return (
    <aside className="pointer-events-auto fixed bottom-4 left-4 z-40 max-w-[320px] rounded-card border border-border bg-bg p-4 shadow-[0_16px_40px_rgba(10,10,10,0.12)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-2 py-0.5 text-[10px] font-bold text-bg">
          STEP {step.step}/{step.total}
        </span>
        <button
          type="button"
          onClick={() => setShow(false)}
          className="text-[11px] text-text-subtle hover:text-fg"
          aria-label="가이드 숨기기"
        >
          ✕
        </button>
      </div>
      <div className="text-[14px] font-bold text-fg">{step.title}</div>
      <div className="mt-1 text-[12px] text-text-muted">{step.hint}</div>
      <div className="mt-3 rounded-input bg-muted px-3 py-2 text-[12px] font-medium text-accent-dark">
        {step.next}
      </div>
    </aside>
  );
}
