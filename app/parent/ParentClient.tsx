"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AccountInfoWidget from "../components/AccountInfoWidget";
import { Spinner } from "../components/Spinner";
import { showToast } from "../components/Toast";

interface StatusResponse {
  configured: boolean;
  missing?: string[];
  stage: "idle" | "created" | "active" | "expired";
  escrow: {
    parentAddress: string;
    childAddress: string;
    offerSequence: number;
    totalKrw: number;
    createTxHash: string;
    finishTxHash?: string;
  } | null;
  parentAddress?: string;
  childAddress?: string;
  parentBalanceKrw?: number | null;
  defaultLimitKrw: number;
  backend?: "kv" | "file";
}

interface CreateResponse {
  ok: boolean;
  txHash?: string;
  sequence?: number;
  explorerUrl?: string | null;
  amountKrw?: number;
  error?: string;
}

export default function ParentClient() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [amountKrw, setAmountKrw] = useState(200_000);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CreateResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/status", { cache: "no-store" });
      const data = (await r.json()) as StatusResponse;
      setStatus(data);
      setStatusError(null);
    } catch (e) {
      setStatusError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const onLock = async () => {
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/escrow/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountKrw }),
      });
      const data = (await r.json()) as CreateResponse;
      setResult(data);
      if (data.ok) {
        showToast({
          type: "success",
          message: `한도 ${data.amountKrw?.toLocaleString("ko-KR")}원 잠금 완료`,
          detail: data.txHash ? `tx: ${data.txHash.slice(0, 16)}…` : undefined,
        });
      } else {
        showToast({
          type: "error",
          message: "EscrowCreate 실패",
          detail: data.error,
        });
      }
      await refreshStatus();
    } catch (e) {
      const msg = (e as Error).message;
      setResult({ ok: false, error: msg });
      showToast({ type: "error", message: "네트워크 오류", detail: msg });
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    await fetch("/api/reset", { method: "POST" });
    setResult(null);
    await refreshStatus();
  };

  const configured = status?.configured ?? false;
  const stage = status?.stage ?? "idle";

  return (
    <main className="min-h-screen bg-bg text-fg">
      <div className="mx-auto w-full max-w-[720px] px-6 py-12 md:px-10 md:py-20">
        <Link href="/" className="text-sm text-text-muted hover:text-fg">
          ← 처음으로
        </Link>

        <header className="mt-6 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-pill border border-accent-border bg-accent-bg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-dark">
              부모 뷰 · Phụ huynh
            </span>
            {status?.backend ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-pill border border-border-subtle bg-bg px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-text-muted"
                title="Demo state storage backend"
              >
                state · {status.backend === "kv" ? "Vercel KV" : "local file"}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-[36px] font-extrabold tracking-[-1px] leading-tight md:text-[44px]">
            자녀 앞으로 이번 달 한도를 잠가두세요
          </h1>
          <p className="mt-3 text-[15px] italic text-text-subtle">
            Đặt giới hạn hàng tháng cho con của bạn
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-text-muted">
            잠긴 금액은 자녀가 받기 전까지 XRPL Escrow에 보관됩니다. 31일 동안 받지 않으면 자동으로 부모에게 돌아갑니다.
          </p>
        </header>

        {!configured ? (
          <NotConfigured missing={status?.missing ?? []} />
        ) : (
          <>
            <Section title="현재 상태">
              <StatusGrid
                stage={stage}
                parentBalanceKrw={status?.parentBalanceKrw ?? null}
                parentAddress={status?.parentAddress ?? null}
                childAddress={status?.childAddress ?? null}
              />
            </Section>

            <Section title="이번 달 한도 잠그기">
              <div className="mb-5">
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-text-subtle">
                  금액 (KRW)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={10000}
                  value={amountKrw}
                  onChange={(e) => setAmountKrw(Number(e.target.value) || 0)}
                  disabled={busy || stage !== "idle"}
                  className="w-full rounded-input border border-border bg-bg px-4 py-3 font-mono text-[20px] font-bold text-fg tabular focus:border-accent focus:outline-none disabled:opacity-60"
                />
              </div>

              <button
                type="button"
                onClick={onLock}
                disabled={busy || stage !== "idle"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-button bg-fg px-6 py-4 text-[15px] font-bold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? (
                  <>
                    <Spinner size={16} />
                    <span>XRPL Escrow 잠그는 중…</span>
                  </>
                ) : stage === "idle" ? (
                  "한도 잠그기 (EscrowCreate)"
                ) : (
                  "이미 잠긴 한도 있음"
                )}
              </button>

              {stage !== "idle" ? (
                <button
                  type="button"
                  onClick={onReset}
                  className="mt-3 w-full rounded-button border border-border px-4 py-3 text-[13px] font-medium text-text-muted transition-colors hover:border-text-muted hover:text-fg"
                >
                  데모 리셋 (현재 상태 잊기)
                </button>
              ) : null}

              {result ? <ResultBlock result={result} /> : null}
            </Section>

            <Section title="XRPL 계정 상태 (실시간)">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <AccountInfoWidget
                  label="부모 (베트남)"
                  address={status?.parentAddress}
                />
                <AccountInfoWidget
                  label="자녀 (한국)"
                  address={status?.childAddress}
                />
              </div>
              <p className="mt-3 text-[11px] text-text-subtle">
                XRPL <code className="font-mono">account_info</code> 8초 폴링. Sequence·OwnerCount·Reserve는 메인넷과 동일 의미.
              </p>
            </Section>

            {status?.escrow ? (
              <Section title="잠긴 Escrow 정보">
                <KeyValue label="EscrowCreate tx" mono>
                  <ExplorerLink hash={status.escrow.createTxHash} />
                </KeyValue>
                <KeyValue label="Sequence (OfferSequence)" mono>
                  {status.escrow.offerSequence}
                </KeyValue>
                <KeyValue label="잠긴 금액">
                  <span className="font-mono tabular text-fg">
                    {status.escrow.totalKrw.toLocaleString("ko-KR")}원
                  </span>
                </KeyValue>
                <KeyValue label="자녀 주소" mono>
                  {short(status.escrow.childAddress)}
                </KeyValue>
                {status.escrow.finishTxHash ? (
                  <KeyValue label="자녀가 수령" mono>
                    <ExplorerLink hash={status.escrow.finishTxHash} />
                  </KeyValue>
                ) : (
                  <KeyValue label="자녀 수령 대기 중">
                    자녀가 /child 페이지에서 &ldquo;한도 받기&rdquo; 클릭 필요
                  </KeyValue>
                )}
              </Section>
            ) : null}
          </>
        )}

        {statusError ? (
          <p className="mt-6 text-[12px] text-[#c53030]">상태 동기화 실패: {statusError}</p>
        ) : null}
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-card border border-border bg-muted p-6 md:p-8">
      <h2 className="mb-5 text-[12px] font-semibold uppercase tracking-wider text-text-subtle">
        {title}
      </h2>
      {children}
    </section>
  );
}

function StatusGrid({
  stage,
  parentBalanceKrw,
  parentAddress,
  childAddress,
}: {
  stage: "idle" | "created" | "active" | "expired";
  parentBalanceKrw: number | null;
  parentAddress: string | null;
  childAddress: string | null;
}) {
  const stageLabel = {
    idle: "대기 — 한도 미설정",
    created: "잠금됨 — 자녀 수령 대기",
    active: "자녀 수령 완료",
    expired: "만료됨",
  }[stage];
  return (
    <dl className="space-y-3 text-[14px]">
      <KeyValue label="단계">{stageLabel}</KeyValue>
      <KeyValue label="부모 잔액">
        {parentBalanceKrw == null ? (
          "—"
        ) : (
          <span className="font-mono tabular text-fg">
            {parentBalanceKrw.toLocaleString("ko-KR")}원
          </span>
        )}
      </KeyValue>
      <KeyValue label="부모 주소" mono>
        {short(parentAddress)}
      </KeyValue>
      <KeyValue label="자녀 주소" mono>
        {short(childAddress)}
      </KeyValue>
    </dl>
  );
}

function KeyValue({
  label,
  mono,
  children,
}: {
  label: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border-subtle pb-2 last:border-b-0 last:pb-0">
      <dt className="text-[12px] font-semibold uppercase tracking-wider text-text-subtle">
        {label}
      </dt>
      <dd className={`text-right text-[14px] ${mono ? "font-mono" : ""}`}>
        {children}
      </dd>
    </div>
  );
}

function ResultBlock({ result }: { result: CreateResponse }) {
  if (!result.ok) {
    return (
      <div className="mt-5 rounded-input border border-[#fecaca] bg-[#fef2f2] p-4 text-[13px] text-[#c53030]">
        실패: {result.error}
      </div>
    );
  }
  return (
    <div className="mt-5 rounded-input border border-[#d6eef7] bg-accent-bg p-4 text-[13px]">
      <div className="mb-2 font-semibold text-accent-dark">
        ✓ EscrowCreate 성공
      </div>
      <div className="space-y-1.5 font-mono text-[12px] text-fg">
        <div>
          <span className="text-text-muted">tx: </span>
          <ExplorerLink hash={result.txHash ?? ""} />
        </div>
        <div>
          <span className="text-text-muted">Sequence: </span>
          <span className="tabular">{result.sequence}</span>
        </div>
        <div>
          <span className="text-text-muted">잠긴 금액: </span>
          <span className="tabular">
            {result.amountKrw?.toLocaleString("ko-KR")}원
          </span>
        </div>
      </div>
    </div>
  );
}

function ExplorerLink({ hash }: { hash: string }) {
  if (!hash) return <span className="text-text-subtle">—</span>;
  return (
    <a
      href={`https://testnet.xrpl.org/transactions/${hash}`}
      target="_blank"
      rel="noreferrer"
      className="text-highlight hover:underline"
    >
      {hash.slice(0, 8)}…{hash.slice(-6)}
    </a>
  );
}

function NotConfigured({ missing }: { missing: string[] }) {
  return (
    <section className="rounded-card border border-border bg-muted p-6 md:p-8">
      <h2 className="mb-2 text-[16px] font-bold text-fg">먼저 지갑 설정이 필요해요</h2>
      <p className="mb-4 text-[14px] leading-relaxed text-text-muted">
        XRPL 테스트넷에서 작동하려면 부모·자녀·가맹점 세 지갑이 필요합니다.
      </p>
      <pre className="overflow-x-auto rounded-input bg-fg p-4 font-mono text-[12px] text-bg">
        <code>bun run setup:wallets</code>
      </pre>
      <p className="mt-4 text-[13px] text-text-muted">
        스크립트 출력을 <code className="font-mono text-highlight">.env.local</code>에 붙여넣은 뒤 dev server를 재시작하세요.
      </p>
      {missing.length > 0 ? (
        <p className="mt-3 text-[12px] text-[#c53030]">
          누락된 env: {missing.join(", ")}
        </p>
      ) : null}
    </section>
  );
}

function short(addr: string | null): string {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
