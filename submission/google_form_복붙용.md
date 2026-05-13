# 구글폼 4개 필수 항목 — 그대로 복붙

폼: https://forms.gle/JD5VWxyjAzwtr6HK7

---

## ① 프로젝트 소개

```
[서비스명] XRP·Family
[한 줄 정의] XRP·Family는 한국 거주 외국인 유학생·근로자(특히 동남아 출신)를 위해 본국 가족 송금과 한국 내 결제 사이의 며칠 단위 시간 단절을 XRPL Escrow 기반 "가족 사전 승인 한도"로 해결하는 가족 송금·결제 통합 지갑 서비스입니다.

[해결하는 문제]
한국 등록 외국인 102만 명 중 동남아 출신 약 50만 명은 한국 신용카드 발급이 사실상 불가능하고, 본국 가족 송금은 SWIFT 기준 2~5일 + 5~10% 수수료, 카드/페이 충전까지 추가 1~2일 소요. 그 시간차 동안 친구에게 빌리거나 식사를 거르는 실생활 불편이 매월 1~2회 발생.

[해결 방식]
부모가 베트남에서 XRPL EscrowCreate + crypto-condition으로 자녀 앞으로 월 한도를 사전 약정 → 자녀가 preimage 제출 EscrowFinish로 5초 안에 잔액 수령 → 즉시 가맹점 Payment. 한국 대부업법·여신전문금융업법 적용 영역 밖(가족 내 자금 이체). 신용평가 불필요.

[핵심 차별점]
- SWIFT 대비 정산 속도 2~5일 → 3.2초 (약 100,000배 단축)
- 수수료 5~10% → 0.5% 미만 (10~20배 절감)
- 카드 충전 추가 단계 0 (송금+결제 통합)
- 한국 신용평가 불필요 (외국인 포용)

[XRPL 선택 사유]
1. Native Escrow + crypto-condition → 별도 스마트컨트랙트·audit 0, 이더리움 대비 보일러플레이트 50% 절감
2. 수수료 < $0.0001 → 마이크로 페이먼트 적합
3. 3~5초 컨센서스 종결성 → 실시간 결제 가능
4. Native DEX → 향후 VND↔KRW 환전 경로 직결

[타깃 시장]
1차: 한국 거주 베트남 출신 유학생·근로자 26만+
1차+동남아 확장: 약 50만
3차: 한국 거주 모든 cross-border 송금 의존 인구

[현재 단계] MVP 보유 — 라이브 서비스 작동 중, XRPL Testnet 3-tx 라운드트립 검증 완료, 깃허브 Public 리포 7 commits 35 tests 4044 LOC
```

---

## ② GitHub Repository 링크

```
https://github.com/jamy3251/kfip-xrpl
```

---

## ③ XRPL 지갑 주소

```
rBAAFFZaRrX6V4bsuY7mca1MqizWEhS4aA (XRPL Testnet · 부모 지갑)
https://testnet.xrpl.org/accounts/rBAAFFZaRrX6V4bsuY7mca1MqizWEhS4aA

추가 지갑 (시연 흐름 검증용):
- 자녀: rpgMnxML1uPNeyziDC2tkCUm4Dezu9KJCF (https://testnet.xrpl.org/accounts/rpgMnxML1uPNeyziDC2tkCUm4Dezu9KJCF)
- 가맹점: rEdmw8sxKAzStH6aKJafmHJ9Zd8h4CRZBD (https://testnet.xrpl.org/accounts/rEdmw8sxKAzStH6aKJafmHJ9Zd8h4CRZBD)
```

> 폼 입력란이 단일 주소만 받으면 첫 번째 (부모) 주소만 넣으세요. 셋 다 받으면 위 형식 그대로.

---

## ④ 프로토타입(웹/데모 영상) 링크

```
웹 데모: https://kfip-xrpl-h542.vercel.app (로그인 불필요, 모든 방문자 동일 데모 wallet)
- 가이드 모드: https://kfip-xrpl-h542.vercel.app/?demo=guide (3-step floating overlay)
- 베트남어 버전: https://kfip-xrpl-h542.vercel.app/?lang=vi
- 가맹점 QR: https://kfip-xrpl-h542.vercel.app/merchant

데모 영상: [녹화 후 YouTube unlisted 링크 — 마감 직전 추가]
영상 구성 (30초):
1. (0:03) 랜딩 — 라이브 XRPL Testnet 터미널
2. (0:09~14) /parent → 한도 잠그기 → EscrowCreate tx hash
3. (0:17~24) /child → 한도 받기 → EscrowFinish + 잔액 200,000원
4. (0:24~30) 편의점 15,000원 결제 → Payment tx hash + 185,000원

3개 트랜잭션 모두 testnet.xrpl.org에서 검증 가능.
```
