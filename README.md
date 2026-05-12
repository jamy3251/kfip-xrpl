# XRP·Family — KFIP 2026

> 베트남 부모님이 보낸 돈, 3.2초 안에 한국 카드 잔액으로.
> XRPL 위에 세운 가족 송금·결제 즉시 실행.

한국 거주 외국인 유학생·근로자와 본국 가족 사이의 송금-결제 채널을 XRPL의 **Escrow + crypto-condition** 위에 올린 인프라. KFIP 2026 지원 프로젝트.

## v0.1 (현재)

랜딩 페이지 + 부모/자녀 UI 스켈레톤. XRPL 트랜잭션은 아직 mock — 실 통신은 v0.2.

| 라우트 | 상태 | 비고 |
|------|------|------|
| `/` | 작동 | D-remix 디자인 적용 랜딩 + 라이브 터미널 위젯(mock 데이터) |
| `/parent` | 스켈레톤 UI | 한도 설정 폼, 입력 비활성 |
| `/child` | 스켈레톤 UI | 잔액 카드 + 결제 버튼, 액션 비활성 |
| `lib/xrpl.ts` | 함수 시그니처 | `makeCondition`, `createMonthlyEscrow`, `finishEscrow` 컴파일은 됨, UI 미연결 |

## 시작하기

```bash
bun install      # 한번만
bun dev          # http://localhost:3000
```

옵션: 베트남어 마이크로카피 검수, 디자인 토큰 조정, 데모 환율 변경 등은 `DESIGN.md`와 `lib/config.ts` 참고.

## 빌드 / 타입 체크

```bash
bun run build    # next build (정적 prerender, TypeScript, ESLint 모두 확인)
bunx tsc --noEmit
```

## 환경 변수

`.env.example` 복사해 `.env.local`로 사용. v0.1은 실제로 필요 없음 (UI mock).

```bash
cp .env.example .env.local
```

v0.2부터 `KFIP_PARENT_SEED`, `KFIP_CHILD_SEED`가 필요. 테스트넷 wallet은 `lib/xrpl.ts`의 `fundFromFaucet()`으로 생성 가능.

## 디자인 시스템

`DESIGN.md`에 D-remix 토큰 전체 명시. 색상·타이포·여백 변경은 그 문서를 먼저 업데이트.

원본 의사결정 로그:
- `~/.gstack/projects/jamy3251-git-remote-repo/User-master-design-20260512-113055.md` (office-hours 설계 doc)
- `~/.gstack/projects/jamy3251-git-remote-repo/designs/kfip-landing-20260512/approved.json` (디자인 변형 선택)

## 아키텍처 (계획)

```
브라우저 (자녀 폰)
   ↓ 결제 요청 + preimage
Vercel Serverless API route
   ↓ EscrowFinish 서명 + 제출
XRPL Testnet
   ↓ 트랜잭션 검증 + 잔액 이전
브라우저 ← 잔액 갱신
```

핵심 원칙: **private key는 절대 클라이언트에 노출되지 않음.** 모든 서명은 `lib/xrpl.ts`를 호출하는 API route에서 수행, seed는 환경변수.

## 로드맵

- **v0.1 (현재)** — UI 스켈레톤 + 디자인 시스템 + 컴파일 클린
- **v0.2** — XRPL 테스트넷 실제 연결: EscrowCreate (부모) → EscrowFinish (자녀) 라운드트립
- **v0.3** — Hero 터미널 라이브 데이터, QR 결제 mock 가맹점, 잔액 polling
- **v0.4** — 시연 영상 녹화, Vercel 배포, Milgram 페이지 임베드
- **post-KFIP** — 베트남 측 합법 진입 채널 (Remitano 등) 파트너십, KYC, 모바일 네이티브

## KFIP 지원 산출물

- 라이브 데모 (Vercel URL)
- 30~60초 시연 영상
- Milgram 회사·팀 소개 + 프로젝트 소개 페이지
- 베트남 유학생 인터뷰 최소 1건 (정성 인용)
- 디자인 doc + 사업계획서

## 라이선스

미정 (KFIP 마감 후 결정). 현재는 비공개.

## 컨택

jamy3251@gmail.com
