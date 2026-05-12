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

## Vercel 배포

KFIP Milgram 페이지에 임베드할 라이브 URL을 만드는 과정입니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jamy3251/kfip-xrpl&env=KFIP_PARENT_SEED,KFIP_PARENT_ADDRESS,KFIP_CHILD_SEED,KFIP_CHILD_ADDRESS,KFIP_MERCHANT_ADDRESS&envDescription=Run+bun+run+setup%3Awallets+locally+then+paste+the+output&project-name=kfip-xrpl)

⚠️ 위 버튼은 GitHub 리포 `jamy3251/kfip-xrpl`이 존재한다고 가정. 다른 이름으로 푸시하면 README 갱신.

### 1. GitHub 리포 만들고 푸시

```bash
# GitHub에서 jamy3251/kfip-xrpl 같은 빈 리포 만든 뒤
git remote add origin https://github.com/jamy3251/kfip-xrpl.git
git push -u origin master
```

### 2. Vercel import

https://vercel.com/new 에서 위 리포 import. Framework은 자동 감지(Next.js). `vercel.json`이 빌드 명령(`bun run build`)과 지역(`icn1` 서울)을 명시합니다.

### 3. Environment Variables

Vercel 대시보드 → Project Settings → Environment Variables. **로컬에서 `bun run setup:wallets` 한 번 돌려 5줄 출력**한 뒤 그 값을 Production + Preview + Development 모두에 추가:

```
KFIP_PARENT_SEED
KFIP_PARENT_ADDRESS
KFIP_CHILD_SEED
KFIP_CHILD_ADDRESS
KFIP_MERCHANT_ADDRESS
```

⚠️ 이 seed는 testnet 전용이라 노출돼도 실손해는 없지만, 다른 사람이 데모를 망가뜨릴 수 있으니 production만 쓰는 게 안전합니다. 마감 후 새 seed 발급 권장.

### 4. 배포 후

자동 도메인: `https://kfip-xrpl-jamy3251.vercel.app` 비슷한 형태.
- 사용자 정의 도메인을 원하면 Vercel → Settings → Domains에서 추가.
- KFIP 마감 단계는 vercel 서브도메인으로 충분.

### 5. Milgram 임베드

KFIP 프로젝트 소개 페이지에 위 URL을 iframe 또는 링크로 삽입.

## 로드맵

- **v0.1** — UI 스켈레톤 + 디자인 시스템 + 컴파일 클린 ✓
- **v0.2** — XRPL 테스트넷 EscrowCreate → EscrowFinish → Payment 3-tx 라운드트립 ✓
- **v0.3 (현재)** — Live hero terminal (실 XRPL 폴링), CoinGecko 환율 oracle, Vercel 배포 준비, 유닛 테스트 ✓
- **v0.4** — QR 결제 mock 가맹점, 모바일 폴리시, 시연 영상 녹화
- **v0.5** — KV 마이그레이션 (서버리스 cold-start 대응), 멀티 escrow
- **post-KFIP** — 베트남 측 합법 진입 채널 파트너십, KYC, 모바일 네이티브

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
