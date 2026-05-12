/**
 * Translate XRPL engine_result codes and exception messages into Korean
 * messages the user can actually act on. Pure function — testable without
 * a server-only marker.
 *
 * Reference: https://xrpl.org/docs/references/protocol/transactions/transaction-results
 */

const ENGINE_RESULT_KO: Record<string, string> = {
  tesSUCCESS: "성공",
  tecNO_DST: "받는 사람 계정이 testnet에 없습니다. setup:wallets를 다시 실행하세요.",
  tecNO_DST_INSUF_XRP:
    "받는 사람 계정 미생성 + XRP 부족. 10 XRP 이상 보내야 신규 계정 생성됩니다.",
  tecINSUFFICIENT_RESERVE:
    "XRP 잔액이 Account Reserve 아래로 떨어집니다. setup:wallets로 새로 funding하세요.",
  tecINSUFFICIENT_FUNDS: "잔액 부족 — Escrow에 넣을 XRP가 모자랍니다.",
  tecPATH_DRY: "결제 경로에 유동성이 없습니다.",
  tecNO_PERMISSION: "권한 없음.",
  tecNO_AUTH: "수신자가 발행자 승인을 받지 않았습니다.",
  tecEXPIRED: "트랜잭션이 만료됐습니다. 시간 조건 확인 필요.",
  tecKILLED: "테스트넷 컨디션 검증 실패.",
  tecBAD_AUTH_NONE: "서명이 잘못됐습니다.",

  temBAD_AMOUNT: "잘못된 금액. 1 drop 이상이어야 합니다.",
  temBAD_SEQUENCE: "트랜잭션 순서 잘못됨.",
  temBAD_FEE: "수수료 설정이 잘못됐습니다.",
  temBAD_SIGNATURE: "서명 잘못됨.",
  temINVALID: "트랜잭션 형식 오류.",

  terNO_ACCOUNT: "계정이 ledger에 없습니다. faucet funding 직후라면 몇 초 후 재시도.",
  terPRE_SEQ: "Sequence가 너무 낮음. 잠시 후 재시도.",
  terQUEUED: "queue에 들어감 — 다음 ledger에서 처리됩니다.",
  terRETRY: "일시적 거부 — 재시도하세요.",

  tefMAX_LEDGER: "트랜잭션이 LastLedgerSequence보다 늦게 도착했습니다. 재시도.",
  tefBAD_AUTH: "서명 일치하지 않음.",
  tefPAST_SEQ: "이미 처리된 Sequence입니다.",
};

const MESSAGE_PATTERNS: Array<{
  match: RegExp;
  ko: string;
}> = [
  { match: /actNotFound/i, ko: "계정이 testnet에 없습니다. setup:wallets 재실행." },
  { match: /tooBusy/i, ko: "XRPL 서버가 일시 과부하. 잠시 후 다시 시도하세요." },
  { match: /timed?[\s_-]?out|timeout/i, ko: "응답 시간 초과. 네트워크가 느려요." },
  { match: /ECONNREFUSED|ENOTFOUND/i, ko: "XRPL 노드에 연결 실패. 네트워크 확인." },
  { match: /Faucet error|Rate limit/i, ko: "Faucet rate limit. 5분 후 다시 시도하세요." },
  { match: /401|403|unauthorized|forbidden/i, ko: "인증 거부. KV/Vercel 토큰 확인." },
];

export function humanizeXrplError(input: {
  engineResult?: string;
  message?: string;
}): string {
  if (input.engineResult && ENGINE_RESULT_KO[input.engineResult]) {
    return ENGINE_RESULT_KO[input.engineResult];
  }
  if (input.engineResult) {
    return `XRPL 거부: ${input.engineResult}`;
  }
  if (input.message) {
    for (const p of MESSAGE_PATTERNS) {
      if (p.match.test(input.message)) return p.ko;
    }
    // Trim absurdly long raw error
    return input.message.slice(0, 200);
  }
  return "알 수 없는 오류";
}

/** Decide whether an error is worth a one-shot retry. */
export function isRetryable(input: {
  engineResult?: string;
  message?: string;
}): boolean {
  if (input.engineResult) {
    return ["terRETRY", "terQUEUED", "terPRE_SEQ", "tefMAX_LEDGER"].includes(
      input.engineResult,
    );
  }
  if (input.message) {
    return /tooBusy|timeout|disconnect|ECONNRESET|ETIMEDOUT/i.test(
      input.message,
    );
  }
  return false;
}
