import { execSync } from "child_process";
import fs from "fs";

function runStep(name, cmd) {
  console.log(`\n================================================================================`);
  console.log(`▶ [실행 단계] ${name}`);
  console.log(`  명령어: ${cmd}`);
  console.log(`================================================================================`);
  try {
    const output = execSync(cmd, { encoding: "utf8", stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(`❌ [오류 발생] ${name} 단계 실패:`, error.message);
    throw error;
  }
}

async function main() {
  console.log("================================================================================");
  console.log("🚀 [SignBid AI] 일일 원스톱 자동화 파이프라인 (One-Stop Daily Pipeline)");
  console.log("   중간 승인 팝업 없이 수집 -> 검증 -> Staging 배포 -> 실서버 DOM 검증까지 100% 자동 완결");
  console.log("================================================================================");

  const startTime = Date.now();

  try {
    // 1. 공고 정규화 및 상태 분리
    runStep("1. 후보 공고 정규화 및 모순 방지", "node scripts/normalize-candidates.mjs");

    // 2. 단위 테스트 실행
    runStep("2. 단위 테스트 (상태 모순 방지 & 차수 처리)", "node scripts/test-validation-contradictions.cjs && node scripts/test-notice-orders.cjs");

    // 3. 100% 원문 일치 보고서 생성 및 무결성 검증
    runStep("3. 자동 보고서 생성 및 8대 필드 1:1 일치 검증", "node scripts/generate-report.mjs && node scripts/verify-report-match.cjs");

    // 4. 빌드 및 26대 무결성 검증
    runStep("4. Next.js 빌드 및 26대 데이터 무결성 검증", "npm run build");

    // 5. Staging 브랜치 커밋 및 푸시
    runStep("5. Staging 브랜치 변경사항 커밋 및 푸시", "git add . && git commit -m \"chore(routine): auto-sync daily bids and staging update [skip ci]\" --allow-empty && git push origin staging");

    // 6. Staging 배포 트리거 및 완료 대기
    runStep("6. GitHub Actions Staging 배포 트리거 및 모니터링", "node scripts/deploy-staging.mjs");

    // 7. 실서버 Rendered DOM 자동 검증
    runStep("7. Cloudflare Staging 실서버 DOM 정밀 검증", "node scripts/verify-full-dom.mjs && node scripts/test-staging-dom.mjs");

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log("\n================================================================================");
    console.log(`🎉 [파이프라인 완결] 총 소요시간: ${elapsed}초`);
    console.log("   Staging 실서버 배포 및 브라우저 DOM 검증이 단 1번의 실행으로 모두 완료되었습니다.");
    console.log("================================================================================");
  } catch (error) {
    console.error("\n❌ 파이프라인 중단: 세부 로그를 확인하여 주십시오.");
    process.exit(1);
  }
}

main();
