# DESIGN.md — KFIP XRPL Family Payment

승인된 디자인 시스템. **모든 UI 변경은 이 문서와 정합해야 함.** 일탈하려면 먼저 이 문서를 업데이트.

원본 의사결정: `~/.gstack/projects/jamy3251-git-remote-repo/designs/kfip-landing-20260512/approved.json`
선택된 방향: **Variant D-remix** (A의 Toss-급 절제 + C의 XRPL 기술 증거)

---

## Voice & Identity

- **이름:** XRP·Family (placeholder, KFIP 마감 전 확정 권장)
- **태그라인:** "XRPL 위에 세운 가족 송금·결제, 한 번에"
- **VN tagline:** "Tiền mẹ gửi, đến trong 3 giây"
- **타겟 페르소나:** Nguyễn Văn Minh (24세, 베트남 호치민 출신, 서울 유학생). 부모님이 매월 70~120만 원 송금.

## 디자인 톤

화이트 절제 + XRPL 기술 증거 + 베트남어 마이크로카피의 가족 따뜻함.

- **절제:** 토스/애플급 화이트 배경, Pretendard/Noto Sans KR 굵은 헤드라인, 광활한 여백
- **기술 증거:** Live XRPL 테스트넷 터미널 위젯, monospace 메트릭, XRPL blue 단일 accent
- **가족 microcopy:** "Mẹ đã gửi 200,000 KRW" 같은 베트남어 라인이 호기심·따뜻함 트리거

피해야 할 것: 보라/바이올렛 그라데이션, 둥근 카드 그리드, 아이콘-원 데코, 이모지, 카카오톡식 노란 형광.

---

## Color Tokens

```
--color-bg               #ffffff   주 배경
--color-fg               #0a0a0a   주 텍스트
--color-muted-bg         #fafbfc   섹션 배경, 터미널 등
--color-border           #e8ecef   강한 보더
--color-border-subtle    #f0f0f0   약한 보더
--color-text-muted       #666666   부 텍스트
--color-text-subtle      #999999   레이블, 메타

--color-accent           #00aae4   XRPL blue, 단일 핵심 accent
--color-accent-bg        #f7fbfd   accent 배경 (tag pills 등)
--color-accent-border    #d6eef7   accent 보더
--color-accent-dark      #0077a8   accent 진한 변형 (text)
--color-gold             #f7b500   보조 accent (monospace 숫자 강조 시)

--color-success          #0d9c63   성공 상태
--color-highlight        #7a4ec9   tx hash, 코드 강조
```

**규칙:**
- accent는 한 페이지에서 1~2 회만 사용. 절제가 brand voice.
- gold는 monospace 숫자 강조 또는 "Powered by XRPL" 같은 secondary signal에만.
- 다크 변형은 v1.0 이후. 본 PoC는 라이트 only.

---

## Typography

```
--font-sans  : "Noto Sans KR", "Pretendard", "Geist", -apple-system, sans-serif
--font-mono  : "Geist Mono", "JetBrains Mono", "SF Mono", Menlo, monospace
```

### Scale

| 용도 | 크기 | weight | letter-spacing | line-height |
|------|------|--------|---------------|-------------|
| Hero h1 | 62px | 800 | -2.2px | 1.08 |
| Section h2 | 36px | 700 | -1px | 1.15 |
| Section h3 | 18px | 700 | -0.2px | 1.3 |
| Body large | 19px | 400 | 0 | 1.55 |
| Body | 15px | 400 | 0 | 1.5 |
| Caption | 13px | 500 | 0.2px | 1.4 |
| Label uppercase | 11px | 600 | 0.7px | 1.2 |

### Monospace 규칙

- 숫자가 강조 대상일 때 `font-variant-numeric: tabular-nums`
- 트랜잭션 hash는 항상 monospace + `--color-highlight`
- 메트릭 값(3.2초, 0.5%) monospace

---

## Spacing & Layout

- 기본 grid 8px
- 페이지 max-width: 1440px, 좌우 padding 80px (desktop) / 24px (mobile)
- Hero 섹션 vertical padding: 100px top, 60px bottom
- 메트릭 row padding: 60px top, 100px bottom

## Radii

```
--radius-button   12px
--radius-card     14px
--radius-input    8px
--radius-pill     999px
```

---

## Components (intended)

- `<HeroTerminal />` — XRPL testnet WebSocket live tail. v0.1은 mock, v0.3에서 실제 subscribe.
- `<MetricRow />` — 정산 속도·수수료·신용·메인넷 4-column. monospace 숫자.
- `<Microcopy>` — VN/KR 듀얼 라인. 가족 따뜻함의 핵심.
- `<TrustPill />` — 작은 trust signal pill (SWIFT 대비 X배 등).

---

## Tone — Korean copy 가이드

- 단정적, 짧게. "3초 안에 도착해요" (○) vs "최대 3초까지 도착할 수 있습니다" (×)
- 외국인 페르소나 의식: "외국인 유학생·근로자" 명시하되 stigmatize 금지
- 기술 용어는 영문 그대로 (XRPL, Escrow, EscrowFinish). 한국어 번역 시도 금지
- VN microcopy 정확히 검수: 베트남어 사용자 모집해 invariably native 점검

---

## 일탈 시 (DESIGN.md 업데이트 절차)

1. 변경 사유를 PR 또는 commit 메시지에 기재
2. 본 문서를 함께 업데이트
3. KFIP 마감 전 큰 변경은 `/design-review` 1회 권장

본 문서는 v0.1. 변경 이력은 `git log DESIGN.md`로.
