// scripts/test-governance-rules.cjs
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const rootDir = path.resolve(__dirname, '..');
let testCount = 0;
let passCount = 0;
let failureCount = 0;

function runTest(testName, testFn) {
  testCount++;
  try {
    const result = testFn();
    if (result === true || result === undefined) {
      console.log(`  ✅ [PASS] 테스트 ${testCount}: ${testName}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] 테스트 ${testCount}: ${testName} - ${result}`);
      failureCount++;
    }
  } catch (err) {
    console.error(`  ❌ [FAIL] 테스트 ${testCount}: ${testName} - 에러: ${err.message}`);
    failureCount++;
  }
}

console.log('================================================================================');
console.log('🛡️ [SignBid AI] 10대 운영 거버넌스 및 허위보고 방지 자동 검증 테스트');
console.log('================================================================================\n');

// 1. 하드코딩 트래픽 숫자 검출
runTest('하드코딩 트래픽 숫자(340명, 490회, 2180회 등) 코드베이스 잔존 검출', () => {
  const dailyInspectCode = fs.readFileSync(path.join(rootDir, 'scripts/daily-inspect.mjs'), 'utf-8');
  const forbiddenPatterns = [
    /todayEstimatedUV\s*:\s*340/,
    /todayEstimatedSessions\s*:\s*490/,
    /todayEstimatedPV\s*:\s*2180/,
    /organicSearch\s*:\s*"51\.4%"/,
    /direct\s*:\s*"26\.8%"/,
    /referral\s*:\s*"14\.3%"/,
    /socialChat\s*:\s*"7\.5%"/
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(dailyInspectCode)) {
      return `하드코딩된 트래픽 수치가 scripts/daily-inspect.mjs에 잔존합니다: ${pattern}`;
    }
  }
  return true;
});

// 2. Cloudflare 출처 없는 통계 출력 차단
runTest('Cloudflare API 실측 출처 없는 트래픽 통계의 운영성과 출력 차단', () => {
  const reportPath = path.join(rootDir, 'docs/verification/daily_traffic_and_subscribers_report.json');
  if (fs.existsSync(reportPath)) {
    const data = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    const summary = data.trafficSummary || {};
    if (summary.source !== 'CLOUDFLARE_API') {
      if (summary.status !== 'UNMEASURED' || typeof summary.todayEstimatedUV === 'number') {
        return `실측 출처(CLOUDFLARE_API)가 없음에도 임의의 트래픽 통계 수치가 기재되었습니다.`;
      }
    }
  }
  return true;
});

// 3. draft 없는 자동 생성 글 차단
runTest('생성된 모든 블로그 글의 draft: true 기본 설정 검증', () => {
  const postsDir = path.join(rootDir, 'src/content/posts');
  if (fs.existsSync(postsDir)) {
    const today = new Date().toISOString().slice(0, 10);
    const files = fs.readdirSync(postsDir).filter(f => f.startsWith(today) && f.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
      const { data } = matter(content);
      if (data.draft !== true) {
        return `금일 자동 생성된 글 [${file}]에 draft: true 속성이 누락되었습니다.`;
      }
    }
  }
  return true;
});

// 4. draft 글 검색 인덱스 포함 차단
runTest('draft: true 초안 글의 검색 인덱스(search-index.json) 포함 차단 검증', () => {
  const searchIndexPath = path.join(rootDir, 'public/data/search-index.json');
  if (fs.existsSync(searchIndexPath)) {
    const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf-8'));
    const postsDir = path.join(rootDir, 'src/content/posts');
    const draftSlugs = new Set();
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
      files.forEach(f => {
        const content = fs.readFileSync(path.join(postsDir, f), 'utf-8');
        const { data } = matter(content);
        if (data.draft === true) {
          draftSlugs.add(f.replace(/\.md$/, ''));
        }
      });
    }

    for (const item of searchIndex) {
      if (item.type === 'post' && draftSlugs.has(item.id || item.slug)) {
        return `draft: true인 초안 글 [${item.id || item.slug}]가 검색 인덱스에 포함되었습니다.`;
      }
    }
  }
  return true;
});

// 5. 승인 없는 텔레그램 발송 차단
runTest('회장님 승인(SEND_TELEGRAM=true & OWNER_APPROVED=true) 없는 메시지 발송 차단 검증', () => {
  const dailyInspectCode = fs.readFileSync(path.join(rootDir, 'scripts/daily-inspect.mjs'), 'utf-8');
  if (!dailyInspectCode.includes('!SEND_TELEGRAM || !OWNER_APPROVED')) {
    return `scripts/daily-inspect.mjs에 회장님 명시적 승인 검증 조건(!SEND_TELEGRAM || !OWNER_APPROVED)이 누락되었습니다.`;
  }
  const summaryTelegramCode = fs.readFileSync(path.join(rootDir, 'scripts/send-summary-telegram.mjs'), 'utf-8');
  if (!summaryTelegramCode.includes('!SEND_TELEGRAM || !OWNER_APPROVED')) {
    return `scripts/send-summary-telegram.mjs에 회장님 명시적 승인 검증 조건이 누락되었습니다.`;
  }
  return true;
});

// 6. 승인 없는 Production 배포 차단
runTest('GitHub Actions deploy.yml 내 승인(owner_approved: true) 없는 Production 배포 차단 검증', () => {
  const deployYmlPath = path.join(rootDir, '.github/workflows/deploy.yml');
  const deployYml = fs.readFileSync(deployYmlPath, 'utf-8');
  if (!deployYml.includes('owner_approved') || !deployYml.includes('target_environment == \'production\'')) {
    return `deploy.yml에 회장님 명시적 승인 입력 파라미터 및 프로덕션 배포 통제 조건이 누락되었습니다.`;
  }
  return true;
});

// 7. main 브랜치에서 자동 수정 및 푸시 작업 차단
runTest('스케줄 워크플로의 main 브랜치 자동 커밋 & 푸시 원천 차단 검증', () => {
  const workflowsDir = path.join(rootDir, '.github/workflows');
  const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml'));
  for (const f of files) {
    const content = fs.readFileSync(path.join(workflowsDir, f), 'utf-8');
    if (content.includes('schedule:')) {
      if (content.includes('git push origin main') || content.includes('git push')) {
        return `스케줄 워크플로 [${f}]에 main 브랜치 자동 git push 명령이 포함되어 있습니다.`;
      }
    }
  }
  return true;
});

// 8. 공식 마감시각 도달 시 CLOSED 전환
runTest('공식 마감일시(bidCloseDate <= 현재시각) 도달 공고의 즉시 마감 전환 검증', () => {
  const bidsPath = path.join(rootDir, 'public/data/bids.json');
  if (fs.existsSync(bidsPath)) {
    const bids = JSON.parse(fs.readFileSync(bidsPath, 'utf-8'));
    const now = new Date();
    for (const bid of bids) {
      if (bid.bidCloseDate) {
        const closeDate = new Date(bid.bidCloseDate.replace(/-/g, '/'));
        if (closeDate <= now) {
          if (bid.status !== '마감' || bid.isClosed !== true) {
            return `마감 시각(${bid.bidCloseDate})이 경과한 공고 [${bid.id}]가 마감 상태로 전환되지 않았습니다.`;
          }
        }
      }
    }
  }
  return true;
});

// 9. 로컬 생성과 운영 발행 표현 구분
runTest('스크립트 및 텔레그램 보고 문구에서 로컬 생성과 운영 발행 표현 구분 검증', () => {
  const dailyInspectCode = fs.readFileSync(path.join(rootDir, 'scripts/daily-inspect.mjs'), 'utf-8');
  if (dailyInspectCode.includes('🎉 [발행 성공]')) {
    return `로컬 파일 생성 시점을 '발행 성공'으로 오인하게 만드는 문구가 존재합니다.`;
  }
  if (!dailyInspectCode.includes('초안 생성 완료') && !dailyInspectCode.includes('Staging 검수 대기')) {
    return `로컬 생성 상태를 나타내는 '초안 생성 완료' / 'Staging 검수 대기' 문구가 누락되었습니다.`;
  }
  return true;
});

// 10. “100%·완벽·무결점” 금지어 검출
runTest('보고서 및 텔레그램 메시지 템플릿 내 단정적 금지어(100%, 완벽, 무결점 등) 검출', () => {
  const dailyInspectCode = fs.readFileSync(path.join(rootDir, 'scripts/daily-inspect.mjs'), 'utf-8');
  const forbiddenWords = [
    /100%\s*무결점/,
    /완벽하게\s*완료/,
    /모든\s*문제\s*영구\s*해결/,
    /무결점\s*상태로\s*안전하게\s*가동/
  ];
  for (const pattern of forbiddenWords) {
    if (pattern.test(dailyInspectCode)) {
      return `scripts/daily-inspect.mjs에 금지 표현이 포함되어 있습니다: ${pattern}`;
    }
  }
  return true;
});

console.log('\n================================================================================');
if (failureCount === 0) {
  console.log(`🎉 [테스트 완료] 총 ${testCount}개 운영 거버넌스 테스트 전원 통과 (${passCount}/${testCount})`);
  console.log('================================================================================\n');
  process.exit(0);
} else {
  console.error(`❌ [테스트 실패] 총 ${testCount}개 중 ${failureCount}개 테스트 실패`);
  console.log('================================================================================\n');
  process.exit(1);
}
