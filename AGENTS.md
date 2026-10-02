<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SignBid 최우선 운영 거버넌스 원칙 (Absolute Rules)

1. **Cloudflare 실측 없는 통계 생성 금지:**
   - Cloudflare API 실측 데이터가 연동되기 전까지 방문자 수, PV, 세션, 유입경로 등 임의 통계 생성을 엄격히 금지하며, 확인 불가 시 반드시 "Cloudflare 실측 미연동 · 방문자 통계 확인 불가"로 명시한다.
2. **G2B 원문 필드 임의 변경 금지:**
   - 공고번호, 차수, 공식 공고명, 발주기관, 공식 마감일시, 공식 상세 URL은 G2B 원문을 100% 보존하며 임의 변환(null을 0원, 전국, 일반경쟁 등으로 대체)을 금지한다.
3. **로컬·Staging·Production 명확한 구분:**
   - 로컬 파일 생성은 "초안 생성", Staging 반영은 "Staging 검수 대기", 실제 운영 배포 및 HTTP 200 확인 시에만 "운영 발행"으로 정의한다.
4. **개발 브랜치 엄격 통제:**
   - 모든 개발 및 수정 작업은 `staging` 또는 전용 `fix/*` 브랜치에서만 진행하며, `main` 브랜치에 직접 수정/커밋/push를 금지한다.
5. **운영 배포 1회 승인 통제:**
   - Production 운영 배포는 회장님의 명시적 승인(`OWNER_APPROVED=true`)을 득한 후 1회에 한하여 실행한다.
6. **승인 전 블로그 초안(draft: true) 보호:**
   - 자동 생성되는 모든 블로그 글은 기본 `draft: true`로 설정하며, 회장님 검수 승인 전까지 운영 블로그 목록, 검색 인덱스, sitemap, RSS, 텔레그램 알림에서 원천 배제한다.
7. **승인 전 외부 알림 발송 금지:**
   - `SEND_TELEGRAM=true`와 `OWNER_APPROVED=true` 두 조건이 모두 충족될 때만 텔레그램/카카오톡을 발송하며, 미충족 시 "승인 전송 보류"로 로컬 기록만 남긴다.
8. **금지 표현 절대 사용 금지:**
   - "100%", "완벽", "무결점", "전수 완료", "정상 가동" 등 단정적·과장된 표현을 일체 사용하지 않는다.

