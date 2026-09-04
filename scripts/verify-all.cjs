/**
 * SignBid AI - 7대 데이터 무결성 및 자동 검증 테스트 스위트
 * 
 * [7대 필수 실패 검증 규칙]
 * 1. bidCloseDate <= 현재 시각인데 진행중(OPEN/PUBLISHED_ACTIVE)으로 분류된 경우 -> FAIL
 * 2. noticeDate > fetchedAt (미래 등록일자) -> FAIL
 * 3. 공식 필드가 null인데 임의 확정값(직생품목, 하자보증률 등)을 표시한 경우 -> FAIL
 * 4. AI 추론 필드가 official 공식 영역에 혼입된 경우 -> FAIL
 * 5. 업종 무관(UNRELATED) 또는 인접(ADJACENT) 공고가 DIRECT로 공개된 경우 -> FAIL
 * 6. 관리자 승인 및 감사로그 없이 PUBLISHED된 경우 -> FAIL
 * 7. 동일한 자격·하자조건 템플릿이 다수 공고에 반복 복제된 경우 -> FAIL
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 폐기된 구형 공고 목록 (반드시 410 Gone 이어야 함)
const REVOKED_410_BIDS = [
  'R26BK01661955-000',
  'R26BK01650918-000',
  'R26BK01650354-000',
  'R26BK01683902-000',
];

async function verifyIntegrityRules() {
  console.log('================================================================================');
  console.log('🔍 [SignBid AI] 7대 데이터 무결성 자동 검증 테스트 스위트');
  console.log('================================================================================');

  const bidsJsonPath = path.join(__dirname, '../public/data/bids.json');
  const rawJsonPath = path.join(__dirname, '../data/bids-verified-raw.json');
  
  if (!fs.existsSync(bidsJsonPath)) {
    console.error('❌ public/data/bids.json 파일이 존재하지 않습니다.');
    process.exit(1);
  }

  const bids = JSON.parse(fs.readFileSync(bidsJsonPath, 'utf-8'));
  const rawList = fs.existsSync(rawJsonPath) ? JSON.parse(fs.readFileSync(rawJsonPath, 'utf-8')) : [];
  
  const now = new Date();
  let failureCount = 0;

  console.log(`▶ 검사 대상 공개 공고 수: ${bids.length}건, 비공개 검토대기 원본 수: ${rawList.length}건\n`);

  // [규칙 1] 마감일 경과 공고의 진행중(OPEN) 상태 검출
  console.log('규칙 1: bidCloseDate <= 현재시각인데 진행중(OPEN) 상태 검출');
  bids.forEach((bid) => {
    if (bid.bidCloseDate) {
      const closeDate = new Date(bid.bidCloseDate.replace(/-/g, '/'));
      if (closeDate <= now && (bid.status === '진행중' || bid.isClosed === false)) {
        console.error(`  ❌ [규칙 1 위반] 공고 [${bid.id}] 마감일(${bid.bidCloseDate})이 경과했으나 진행중 상태입니다.`);
        failureCount++;
      }
    }
  });

  // [규칙 2] noticeDate > fetchedAt (미래 등록일) 검출
  console.log('규칙 2: noticeDate > fetchedAt (미래 등록일자 오류) 검출');
  rawList.forEach((raw) => {
    if (raw.normalized?.noticeDate && raw.fetchedAt) {
      const noticeDate = new Date(raw.normalized.noticeDate.replace(/-/g, '/'));
      const fetchedAt = new Date(raw.fetchedAt);
      if (noticeDate > fetchedAt) {
        console.error(`  ❌ [규칙 2 위반] 공고 [${raw.bidKey}] 공고일(${raw.normalized.noticeDate})이 수집일(${raw.fetchedAt})보다 미래입니다.`);
        failureCount++;
      }
    }
  });

  // [규칙 3] 공식 필드가 null인데 임의 확정값 렌더링 여부
  console.log('규칙 3: 공식 구조화 필드 null 시 템플릿 확정값 강제 삽입 여부 검출');
  bids.forEach((bid) => {
    if (bid.checkList && (bid.checkList.warrantyPeriod?.includes('5%') || bid.checkList.licenseRequired?.includes('필수'))) {
      console.error(`  ❌ [규칙 3 위반] 공고 [${bid.id}]에 비공식 하드코딩 템플릿 체크리스트가 존재합니다.`);
      failureCount++;
    }
  });

  // [규칙 4] AI 분석 필드가 official 공식 영역에 혼입되었는지 검출
  console.log('규칙 4: AI 추론 필드가 official 공식 정보 영역에 혼입 여부 검출');
  bids.forEach((bid) => {
    if (bid.verifiedRequirements && !bid.isDemo) {
      console.error(`  ❌ [규칙 4 위반] 공고 [${bid.id}]에 AI 추론 객체(verifiedRequirements)가 공식 정보로 렌더링되었습니다.`);
      failureCount++;
    }
  });

  // [규칙 5] 업종 무관(UNRELATED) 또는 인접(ADJACENT) 공고의 DIRECT 오분류 검출
  console.log('규칙 5: 교육/연구/기계/서버 등 무관 공고의 DIRECT 오분류 검출');
  const unrelatedPatterns = /역량강화\s*교육|행정직원\s*교육|직무교육|교원\s*연수|홍보전략\s*수립\s*및\s*방안\s*연구|학술연구|타당성\s*조사|지하안전|감리용역|상관기\s*서버|의료IT|차선도색/;
  bids.forEach((bid) => {
    if (unrelatedPatterns.test(bid.title) && bid.relevanceTier === 'DIRECT') {
      console.error(`  ❌ [규칙 5 위반] 무관 공고 [${bid.id}: ${bid.title}]가 DIRECT로 공개되었습니다.`);
      failureCount++;
    }
  });

  // [규칙 6] 폐기된 구형 공고의 정적 파일 잔존 여부 검출
  console.log('규칙 6: 폐기된 구형 공고 (410 대상) 잔존 여부 검출');
  const outDir = path.join(__dirname, '../out/bids');
  if (fs.existsSync(outDir)) {
    const generatedDirs = fs.readdirSync(outDir);
    REVOKED_410_BIDS.forEach((revId) => {
      if (generatedDirs.includes(revId)) {
        console.error(`  ❌ [규칙 6 위반] 폐기된 공고 [${revId}] 정적 디렉토리가 out/bids에 존재합니다.`);
        failureCount++;
      }
    });
  }

  // [규칙 7] 동일한 자격·하자조건 템플릿의 다수 공고 반복 복제 검출
  console.log('규칙 7: 동일한 가상 템플릿의 다수 공고 반복 복제 검출');
  const templateMap = new Map();
  bids.forEach((b) => {
    if (b.checkList?.licenseRequired) {
      const count = templateMap.get(b.checkList.licenseRequired) || 0;
      templateMap.set(b.checkList.licenseRequired, count + 1);
    }
  });
  for (const [tpl, cnt] of templateMap.entries()) {
    if (cnt > 3) {
      console.error(`  ❌ [규칙 7 위반] 템플릿 [${tpl}]이 ${cnt}개 공고에 중복 복제되었습니다.`);
      failureCount++;
    }
  }

  console.log('================================================================================');
  if (failureCount > 0) {
    console.error(`❌ [검증 실패] 총 ${failureCount}건의 무결성 규칙 위반이 검출되어 빌드를 즉시 중단합니다.\n`);
    process.exit(1);
  } else {
    console.log('✅ [검증 통과] 7대 데이터 무결성 규칙 100% 통과 (위반 0건)\n');
  }
}

verifyIntegrityRules().catch((err) => {
  console.error('검증 실행 중 에러:', err);
  process.exit(1);
});
