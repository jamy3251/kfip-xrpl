"use client";

import { useEffect, useRef, useState } from "react";

export interface QrParseResult {
  label: string;
  amountKrw: number;
  raw: string;
}

interface Props {
  onScan: (parsed: QrParseResult) => void;
  onCancel: () => void;
}

/**
 * Camera-based QR scanner. Closes when the user presses cancel or a valid
 * payment QR is decoded.
 *
 * Expected QR payload formats (in order of preference):
 *   kfip://pay?label=편의점&amount=15000
 *   https://<host>/pay?label=편의점&amount=15000
 *   { "label": "편의점", "amountKrw": 15000 }
 */
export default function QrScanner({ onScan, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<{ stop: () => void; destroy: () => void } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const mod = await import("qr-scanner");
        if (cancelled || !videoRef.current) return;
        const QrScannerCtor = mod.default;
        const instance = new QrScannerCtor(
          videoRef.current,
          (result: { data: string }) => {
            const parsed = parsePayload(result.data);
            if (parsed) {
              instance.stop();
              onScan(parsed);
            }
          },
          {
            preferredCamera: "environment",
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
          },
        );
        scannerRef.current = instance;
        await instance.start();
        if (cancelled) {
          instance.stop();
          instance.destroy();
          return;
        }
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        const msg = (err as Error).message ?? String(err);
        if (/Permission|NotAllowed/i.test(msg)) {
          setError("카메라 권한이 필요합니다. 브라우저 설정에서 허용해주세요.");
        } else if (/no.*camera|NotFound/i.test(msg)) {
          setError("사용 가능한 카메라가 없습니다.");
        } else {
          setError(`스캐너 초기화 실패: ${msg}`);
        }
      }
    }
    start();
    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        s.stop();
        s.destroy();
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-fg/95 p-4 text-bg">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-bold">QR 결제 스캔</h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-input border border-bg/30 px-3 py-1.5 text-[13px] text-bg hover:bg-bg/10"
        >
          닫기
        </button>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden rounded-card border border-bg/20 bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
        />
        {!ready && !error ? (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-bg/70">
            카메라 준비 중…
          </div>
        ) : null}
      </div>
      <div className="mx-auto mt-4 max-w-[480px] text-center text-[12px] text-bg/70">
        가맹점 QR을 카메라에 비추면 자동으로 결제 확인 단계로 넘어갑니다.
      </div>
      {error ? (
        <div className="mx-auto mt-4 max-w-[480px] rounded-input border border-[#fecaca] bg-[#fef2f2] p-3 text-[12px] text-[#c53030]">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function parsePayload(raw: string): QrParseResult | null {
  // 1) Try URL form: kfip://pay?label=X&amount=Y  OR  https://*/pay?label=X&amount=Y
  try {
    const normalised = raw.startsWith("kfip://")
      ? raw.replace("kfip://", "https://kfip.local/")
      : raw;
    const u = new URL(normalised);
    if (u.pathname.endsWith("/pay") || u.pathname === "/pay") {
      const label = u.searchParams.get("label") ?? "";
      const amount = Number(u.searchParams.get("amount") ?? "");
      if (label && amount > 0) {
        return { label, amountKrw: amount, raw };
      }
    }
  } catch {
    // fall through
  }
  // 2) Try JSON form
  try {
    const obj = JSON.parse(raw);
    if (
      obj &&
      typeof obj.label === "string" &&
      typeof obj.amountKrw === "number" &&
      obj.amountKrw > 0
    ) {
      return { label: obj.label, amountKrw: obj.amountKrw, raw };
    }
  } catch {
    // fall through
  }
  return null;
}
