"use client";

import { useEffect, useState } from "react";

export type ToastType = "error" | "success" | "info";

export interface ToastEvent {
  type: ToastType;
  message: string;
  /** Optional sub-line (e.g. tx hash). */
  detail?: string;
  ttlMs?: number;
}

interface ActiveToast extends ToastEvent {
  id: number;
}

const EVENT = "kfip:toast";

let nextId = 1;

/** Helper for non-component code to fire a toast. */
export function showToast(t: ToastEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastEvent>(EVENT, { detail: t }));
}

export default function Toast() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent<ToastEvent>).detail;
      if (!detail) return;
      const id = nextId++;
      const t: ActiveToast = { ...detail, id };
      setToasts((cur) => [...cur, t]);
      const ttl = detail.ttlMs ?? 4500;
      window.setTimeout(() => {
        setToasts((cur) => cur.filter((x) => x.id !== id));
      }, ttl);
    }
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastCard({ toast }: { toast: ActiveToast }) {
  const palette: Record<ToastType, { bg: string; border: string; fg: string; icon: string }> = {
    error: {
      bg: "bg-[#fef2f2]",
      border: "border-[#fecaca]",
      fg: "text-[#c53030]",
      icon: "⚠",
    },
    success: {
      bg: "bg-accent-bg",
      border: "border-accent-border",
      fg: "text-accent-dark",
      icon: "✓",
    },
    info: {
      bg: "bg-muted",
      border: "border-border",
      fg: "text-fg",
      icon: "ⓘ",
    },
  };
  const p = palette[toast.type];
  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex max-w-[480px] items-start gap-3 rounded-card border ${p.border} ${p.bg} px-4 py-3 text-[13px] shadow-[0_12px_32px_rgba(10,10,10,0.08)]`}
    >
      <span className={`mt-0.5 text-[14px] font-bold ${p.fg}`}>{p.icon}</span>
      <div className="min-w-0 flex-1">
        <div className={`font-semibold ${p.fg}`}>{toast.message}</div>
        {toast.detail ? (
          <div className="mt-1 break-all font-mono text-[11px] text-text-muted">
            {toast.detail}
          </div>
        ) : null}
      </div>
    </div>
  );
}
