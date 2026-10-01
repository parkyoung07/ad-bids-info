# SignBid 최상위 영구 운영 원칙 및 통제 규정

## 1. 프로젝트 목적 및 본질
- **목적:** SignBid의 목적은 광고·인쇄업자가 관련 가능성이 있는 입찰공고를 빠르게 발견하고 공식 원문으로 이동하도록 돕는 무료 경량형 "입찰 기회 레이더"이다.
- **기능 제한:** SignBid가 자체적으로 참가자격, 낙찰 가능성, 투찰가격을 확정하거나 예측하지 않는다.
- **원문 보존:** API 원문 필드는 임의 생성·보정·추정하지 않는다. `null` 값을 0원, 전국, 일반경쟁 등으로 임의 변환하지 않는다.
- **필드 일치:** 공고 제목, 기관, 공고번호, 차수, 마감일, 금액, URL은 공식 API 원문 값을 그대로 보존하여 사용한다.
- **후보 데이터 정의:** 자동수집 결과는 단순 "후보 데이터"이며 "검증 완료 공고"라고 표현하지 않는다.

## 2. 배포 및 승인 통제 (회장님 전결권)
- **Staging 우선 원칙:** 모든 신규 공고 후보와 블로그 글 초안은 반드시 Staging 환경에만 먼저 반영한다.
- **승인 전 통제:** 회장님의 명시적 승인 전에는 `main` 병합, 운영 배포, 블로그 운영 공개, 텔레그램/카카오톡 외부 발송을 절대 금지한다.
- **점검 읽기 전용 원칙:** 일일 점검 명령(`npm run inspect`)은 기본적으로 100% 읽기/분석 전용이어야 하며, 점검 과정에서 자동 커밋, 자동 푸시, 자동 배포, 외부 메시지 발송을 일체 수행하지 않는다.
- **보고 언어 및 증거 의무:** 객관적 완료 증거(커밋 SHA, URL, HTTP 상태코드, 실데이터 건수)가 없으면 '완료', '100%', '완벽', '위반 0건' 등의 단정적 표현을 절대 사용하지 않는다.

## 3. 최우선 운영 원칙 계층 구조
1. 회장님의 당일 명시적 지시
2. 저장소의 `AGENTS.md`
3. `docs/OPERATIONS_POLICY.md`
4. `docs/DAILY_RUNBOOK.md`
5. 기존 자동화 스크립트 및 일반 개발 지시
*(상충 발생 시 상위 규칙을 절대 우선 적용한다.)*

## 4. 확정된 4대 표준 업종 분류
1. **제작·시공:** 간판, 안내판, 표찰·현판, 현수막게시대, 전광판, 디지털사이니지, 조형물, 랩핑, 사인물 제작·설치
2. **인쇄·출판:** 책자, 보고서, 포스터, 리플릿, 카탈로그, 시험지, 홍보물, 편집디자인 및 인쇄
3. **출력·인쇄 장비:** 디지털 인쇄기, 잉크젯 프린터, 대형 출력기, 플로터, 커팅기, 코팅기, 후가공 장비
4. **출력소재·잉크:** 잉크, 토너, 출력용 필름, 시트지, 현수막 원단, 인쇄용지, 코팅필름, 출력 관련 소모재
*(내부 관련성 코드인 DIRECT, ADJACENT, UNRELATED는 공개 분류로 사용하지 않는다.)*

## 5. 마감시한 운영 원칙 및 상태 판정 우선순위
1. **마감시한 판정 (KST 시·분·초 정밀 비교):**
   - `현재시각 < 공식 마감시각`: 진행 중 자동수집 후보 (남은 시간이 짧아도 사전 제외 금지)
   - `현재시각 >= 공식 마감시각`: 공식 마감 (`CLOSED`)
2. **마감 임박 배지 표시:**
   - 24시간 초과: `자동수집 후보`
   - 24시간 이하: `마감 임박`
   - 3시간 이하: `긴급 · 마감 임박`
   - 1시간 이하: `긴급 · 1시간 이내 마감`
3. **마감일 결측 공고:**
   - 공식 마감일시가 없는 공고는 `HOLD_MISSING_DEADLINE`으로 격리 보류하며, `마감일 공식 원문 확인 필요`로 표시한다 (D-day/진행중 임의 부여 금지).
4. **상태 판정 5단계 우선순위:**
   1. 취소공고 ➔ `CANCELLED`
   2. 데이터 충돌 ➔ `DATA_CONFLICT`
   3. 마감일 결측 ➔ `HOLD_MISSING_DEADLINE`
   4. 현재시각 < 마감시각 ➔ `OPEN` (남은 시간에 따른 마감임박 배지 부여)
   5. 현재시각 >= 마감시각 ➔ `CLOSED`

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
