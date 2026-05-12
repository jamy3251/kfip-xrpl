"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Spinner } from "../components/Spinner";
import { showToast } from "../components/Toast";
import QrScanner, { type QrParseResult } from "../components/QrScanner";

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
    createdAt: number;
  } | null;
  payments: { label: string; amountKrw: number; txHash: string; at: number }[];
  childBalanceKrw?: number | null;
}

interface ActionResponse {
  ok: boolean;
  txHash?: string;
  explorerUrl?: string | null;
  amountKrw?: number;
  label?: string;
  error?: string;
}

const QUICK_PAYMENTS: { label: string; amountKrw: number }[] = [
  { label: "편의점", amountKrw: 15_000 },
  { label: "카페", amountKrw: 5_500 },
  { label: "분식점", amountKrw: 8_000 },
  { label: "마트", amountKrw: 28_000 },
];

export default function ChildClient() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastAction, setLastAction] = useState<ActionResponse | null>(null);
  const [scanning, setScanning] = useState(false);
  const [pendingScan, setPendingScan] = useState<QrParseResult | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/status", { cache: "no-store" });
      setStatus((await r.json()) as StatusResponse);
    } catch (e) {
      console.error("status fetch failed", e);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const onFinish = async () => {
    setBusy(true);
    setLastAction(null);
    try {
      const r = await fetch("/api/escrow/finish", { method: "POST" });
      const data = (await r.json()) as ActionResponse;
      setLastAction(data);
      if (data.ok) {
        showToast({
          type: "success",
          message: "한도 수령 완료",
          detail: data.txHash ? `tx: ${data.txHash.slice(0, 16)}…` : undefined,
        });
      } else {
        showToast({ type: "error", message: "EscrowFinish 실패", detail: data.error });
      }
      await refreshStatus();
    } catch (e) {
      showToast({ type: "error", message: "네트워크 오류", detail: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const onPay = async (label: string, amountKrw: number) => {
    setBusy(true);
    setLastAction(null);
    try {
      const r = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, amountKrw }),
      });
      const data = (await r.json()) as ActionResponse;
      setLastAction(data);
      if (data.ok) {
        showToast({
          type: "success",
          message: `${label} 결제 완료 · ${amountKrw.toLocaleString("ko-KR")}원`,
          detail: data.txHash ? `tx: ${data.txHash.slice(0, 16)}…` : undefined,
        });
      } else {
        showToast({ type: "error", message: "Payment 실패", detail: data.error });
      }
      await refreshStatus();
    } catch (e) {
      showToast({ type: "error", message: "네트워크 오류", detail: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const onScanned = useCallback((parsed: QrParseResult) => {
    setScanning(false);
    setPendingScan(parsed);
  }, []);

  const confirmScannedPayment = async () => {
    if (!pendingScan) return;
    const { label, amountKrw } = pendingScan;
    setPendingScan(null);
    await onPay(label, amountKrw);
  };

  const configured = status?.configured ?? false;
  const stage = status?.stage ?? "idle";

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
            &ldquo;Mẹ đã gửi&rdquo;
          </div>
        </header>

        {!configured ? (
          <NotConfigured missing={status?.missing ?? []} />
        ) : (
          <StageBlock
            stage={stage}
            status={status!}
            busy={busy}
            onFinish={onFinish}
            onPay={onPay}
            lastAction={lastAction}
            onScanRequest={() => setScanning(true)}
          />
        )}
      </div>

      {scanning ? (
        <QrScanner onScan={onScanned} onCancel={() => setScanning(false)} />
      ) : null}

      {pendingScan ? (
        <ScanConfirm
          parsed={pendingScan}
          onConfirm={confirmScannedPayment}
          onCancel={() => setPendingScan(null)}
        />
      ) : null}
    </main>
  );
}

function ScanConfirm({
  parsed,
  onConfirm,
  onCancel,
}: {
  parsed: QrParseResult;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-fg/60 p-5">
      <div className="w-full max-w-[400px] rounded-card border border-border bg-bg p-6 shadow-[0_24px_48px_rgba(10,10,10,0.2)]">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
          가맹점 결제 확인
        </div>
        <div className="text-[20px] font-bold text-fg">{parsed.label}</div>
        <div className="mt-2 font-mono tabular text-[28px] font-extrabold text-fg">
          {parsed.amountKrw.toLocaleString("ko-KR")}원
        </div>
        <div className="mt-3 break-all font-mono text-[10px] text-text-subtle">
          {parsed.raw}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-button border border-border px-4 py-3 text-[14px] font-semibold text-fg hover:border-text-muted"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-button bg-fg px-4 py-3 text-[14px] font-bold text-bg hover:opacity-90"
          >
            결제
          </button>
        </div>
      </div>
    </div>
  );
}

function StageBlock({
  stage,
  status,
  busy,
  onFinish,
  onPay,
  lastAction,
  onScanRequest,
}: {
  stage: "idle" | "created" | "active" | "expired";
  status: StatusResponse;
  busy: boolean;
  onFinish: () => Promise<void>;
  onPay: (label: string, amountKrw: number) => Promise<void>;
  lastAction: ActionResponse | null;
  onScanRequest: () => void;
}) {
  if (stage === "idle") {
    return (
      <section className="rounded-card border border-border-subtle bg-muted p-8 text-center">
        <div className="mb-2 text-[44px]">⏳</div>
        <h2 className="text-[16px] font-bold text-fg">한도를 기다리고 있어요</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
          부모님이 <code className="font-mono text-highlight">/parent</code> 페이지에서 이번 달 한도를 설정하면 여기에 잔액이 나타납니다.
        </p>
        <Link
          href="/parent"
          className="mt-5 inline-block rounded-button border border-border px-4 py-2 text-[13px] font-medium text-fg hover:border-accent hover:text-accent"
        >
          부모 화면 열기 →
        </Link>
      </section>
    );
  }

  if (stage === "created") {
    const total = status.escrow?.totalKrw ?? 0;
    return (
      <>
        <section className="rounded-card border border-accent-border bg-accent-bg p-6 md:p-8">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent-dark">
            도착한 한도
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono tabular text-[44px] font-extrabold tracking-[-1px] text-fg md:text-[56px]">
              {total.toLocaleString("ko-KR")}
            </span>
            <span className="text-[18px] font-semibold text-text-muted">원</span>
          </div>
          <p className="mt-3 text-[13px] text-text-muted">
            엄마가 보낸 한도가 XRPL Escrow에 잠겨있어요. 받기를 누르면 내 잔액으로 옮겨집니다.
          </p>
          <button
            type="button"
            onClick={onFinish}
            disabled={busy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-button bg-fg px-6 py-4 text-[15px] font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? (
              <>
                <Spinner size={16} />
                <span>XRPL EscrowFinish 중…</span>
              </>
            ) : (
              "한도 받기 (EscrowFinish)"
            )}
          </button>
        </section>

        {lastAction ? <ActionResult action={lastAction} kind="finish" /> : null}
      </>
    );
  }

  if (stage === "active") {
    const total = status.escrow?.totalKrw ?? 0;
    const usedKrw = status.payments.reduce((s, p) => s + p.amountKrw, 0);
    const remaining = Math.max(0, total - usedKrw);
    return (
      <>
        <BalanceCard remaining={remaining} limit={total} used={usedKrw} />

        <button
          type="button"
          onClick={onScanRequest}
          disabled={busy}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-button bg-accent px-4 py-4 text-[15px] font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 7V4a1 1 0 0 1 1-1h3M21 7V4a1 1 0 0 0-1-1h-3M3 17v3a1 1 0 0 0 1 1h3M21 17v3a1 1 0 0 1-1 1h-3M7 12h10M7 8h2M15 8h2M7 16h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          QR 스캔 결제
        </button>

        <section className="mt-6">
          <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-text-subtle">
            가맹점 결제 (빠른 버튼)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_PAYMENTS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onPay(p.label, p.amountKrw)}
                disabled={busy || remaining < p.amountKrw}
                className="min-h-[72px] rounded-button border border-border bg-bg px-4 py-4 text-left transition-colors active:scale-[0.98] hover:border-accent hover:bg-accent-bg disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="text-[14px] font-semibold text-fg">{p.label}</div>
                <div className="mt-1 font-mono tabular text-[15px] text-text-muted">
                  {p.amountKrw.toLocaleString("ko-KR")}원
                </div>
              </button>
            ))}
          </div>
          {busy ? (
            <p className="mt-3 inline-flex w-full items-center justify-center gap-2 text-center text-[12px] text-text-muted">
              <Spinner size={12} />
              <span>XRPL Payment 전송 중…</span>
            </p>
          ) : null}
          <p className="mt-4 text-center text-[11px] text-text-subtle">
            QR 스캔 테스트: <a href="/merchant" target="_blank" className="text-accent hover:underline">/merchant</a>에서 가맹점 QR 표시 → 다른 기기 카메라로 스캔
          </p>
        </section>

        {lastAction ? <ActionResult action={lastAction} kind="payment" /> : null}

        {status.payments.length > 0 ? (
          <section className="mt-10">
            <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-text-subtle">
              최근 트랜잭션
            </h2>
            <ul className="divide-y divide-border-subtle overflow-hidden rounded-card border border-border-subtle bg-bg">
              {status.payments.map((p) => (
                <TxRow
                  key={p.txHash}
                  when={timeAgo(p.at)}
                  label={p.label}
                  amountKrw={-p.amountKrw}
                  hash={p.txHash}
                />
              ))}
              {status.escrow?.finishTxHash ? (
                <TxRow
                  when={timeAgo(status.escrow.createdAt)}
                  label="엄마가 보낸 한도"
                  amountKrw={status.escrow.totalKrw}
                  incoming
                  hash={status.escrow.finishTxHash}
                />
              ) : null}
            </ul>
          </section>
        ) : null}
      </>
    );
  }

  return null;
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
  const pct = limit > 0 ? Math.round((remaining / limit) * 100) : 0;
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
          className="h-full rounded-pill bg-accent transition-all"
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

function ActionResult({
  action,
  kind,
}: {
  action: ActionResponse;
  kind: "finish" | "payment";
}) {
  if (!action.ok) {
    return (
      <div className="mt-5 rounded-input border border-[#fecaca] bg-[#fef2f2] p-4 text-[13px] text-[#c53030]">
        실패: {action.error}
      </div>
    );
  }
  const label = kind === "finish" ? "✓ EscrowFinish 성공" : "✓ Payment 성공";
  return (
    <div className="mt-5 rounded-input border border-[#d6eef7] bg-accent-bg p-4 text-[13px]">
      <div className="mb-2 font-semibold text-accent-dark">{label}</div>
      <div className="space-y-1.5 font-mono text-[12px] text-fg">
        <div>
          <span className="text-text-muted">tx: </span>
          <ExplorerLink hash={action.txHash ?? ""} />
        </div>
        {action.amountKrw != null ? (
          <div>
            <span className="text-text-muted">금액: </span>
            <span className="tabular">{action.amountKrw.toLocaleString("ko-KR")}원</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TxRow({
  when,
  label,
  amountKrw,
  incoming,
  hash,
}: {
  when: string;
  label: string;
  amountKrw: number;
  incoming?: boolean;
  hash: string;
}) {
  const sign = incoming ? "+" : "";
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-4">
      <div className="min-w-0">
        <div className="truncate text-[15px] font-medium text-fg">{label}</div>
        <div className="mt-0.5 text-[11px] text-text-subtle">
          {when} · <ExplorerLink hash={hash} />
        </div>
      </div>
      <div
        className={`font-mono tabular text-[16px] font-bold ${
          incoming ? "text-success" : "text-fg"
        }`}
      >
        {sign}
        {Math.abs(amountKrw).toLocaleString("ko-KR")}원
      </div>
    </li>
  );
}

function ExplorerLink({ hash }: { hash: string }) {
  if (!hash) return <span className="text-text-subtle">—</span>;
  return (
    <a
      href={`https://testnet.xrpl.org/transactions/${hash}`}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-highlight hover:underline"
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

function timeAgo(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}초 전`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  return `${h}시간 전`;
}
