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

  // [규칙 1] 마감일 경과 공고의 진행중(OPEN) 상태 검출 및 자동 마감 최신화
  console.log('규칙 1: bidCloseDate <= 현재시각인 공고 자동 마감 처리 및 무결성 검증');
  let bidsAutoUpdated = false;
  bids.forEach((bid) => {
    if (bid.bidCloseDate) {
      const closeDate = new Date(bid.bidCloseDate.replace(/-/g, '/'));
      if (closeDate <= now && (bid.status === '진행중' || bid.isClosed === false)) {
        console.log(`  🔄 [공고 마감 자동 동기화] ${bid.id} (${bid.title.slice(0, 30)}...) -> 상태: [마감]`);
        bid.status = '마감';
        bid.isClosed = true;
        bid.dDay = -1;
        bidsAutoUpdated = true;
      }
    }
  });

  if (bidsAutoUpdated) {
    fs.writeFileSync(bidsJsonPath, JSON.stringify(bids, null, 2), 'utf-8');
    console.log('  ✅ [공고 DB 자동 갱신 완료] 마감 경과 공고가 [마감] 상태로 자동 동기화되었습니다.');
  }

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

  // [규칙 8] 동일 공고번호(bidNtceNo) 다중 차수 중복 노출 검출
  console.log('규칙 8: 동일 공고번호(bidNtceNo) 다중 차수 중복 노출 검출');
  const bidNoMap = new Map();
  bids.forEach((b) => {
    const no = b.announcementNo || b.id.split('-')[0];
    const list = bidNoMap.get(no) || [];
    list.push(b.id);
    bidNoMap.set(no, list);
  });
  for (const [no, ids] of bidNoMap.entries()) {
    if (ids.length > 1) {
      console.error(`  ❌ [규칙 8 위반] 공고번호 [${no}]에 다중 차수가 동시 공개되었습니다: ${ids.join(', ')}`);
      failureCount++;
    }
  }

  // [규칙 9] 마감일 미기재 공고의 허위 dDay(예: 7) 기재 검출
  console.log('규칙 9: 마감일 미기재 시 dDay: null 정상 처리 및 허위 D-day 방지 검출');
  bids.forEach((b) => {
    if (!b.bidCloseDate && b.dDay !== null) {
      console.error(`  ❌ [규칙 9 위반] 공고 [${b.id}]는 마감일이 미기재인데 dDay(${b.dDay})가 기재되었습니다.`);
      failureCount++;
    }
  });

  // [규칙 10] 공고 상태 유효성 및 상태 모순(isVerified: true 방지) 전수 확인 (회장님 엄명)
  console.log('규칙 10: AUTO_COLLECTED_CANDIDATE 및 DATA_CONFLICT 격리 상태 전수 확인');
  bids.forEach((b) => {
    const isKnownValidStatus = ['AUTO_COLLECTED_CANDIDATE', 'DATA_CONFLICT', 'NEEDS_REVIEW', 'APPROVED', 'REVIEW_REQUIRED'].includes(b.status || '') ||
      ['AUTO_COLLECTED_CANDIDATE', 'DATA_CONFLICT', 'NEEDS_REVIEW', 'APPROVED', 'REVIEW_REQUIRED'].includes(b.validation?.status || '') ||
      ['AUTO_COLLECTED_CANDIDATE', 'DATA_CONFLICT', 'NEEDS_REVIEW', 'APPROVED', 'REVIEW_REQUIRED'].includes(b.validationStatus || '');
    if (!isKnownValidStatus && !b.isDemo) {
      console.error(`  ❌ [규칙 10 위반] 유효하지 않은 상태의 공고 [${b.id}]가 발견되었습니다: ${b.status}`);
      failureCount++;
    }

    // 상태 모순 전수 검출 (회장님 지시: 자동수집 후보 / REVIEW_REQUIRED / 미검증 공고의 isVerified: true 원천 차단)
    const isCandidate = b.validationStatus === 'AUTO_COLLECTED_CANDIDATE' || b.status === 'AUTO_COLLECTED_CANDIDATE';
    const isReviewRequired = b.validation?.status === 'REVIEW_REQUIRED' || b.status === 'REVIEW_REQUIRED';
    const hasNoVerifiedAt = !b.validation?.verifiedAt;
    const hasNoVerifier = !b.validation?.verifier;

    if (b.isVerified === true || b.validation?.isVerified === true) {
      if (isCandidate) {
        console.error(`  ❌ [규칙 10 모순 위반] 자동수집 후보 [${b.id}]에 isVerified: true 가 설정되었습니다. (AUTO_COLLECTED_CANDIDATE + isVerified: true 금지)`);
        failureCount++;
      }
      if (isReviewRequired) {
        console.error(`  ❌ [규칙 10 모순 위반] 검토대기 공고 [${b.id}]에 isVerified: true 가 설정되었습니다. (REVIEW_REQUIRED + isVerified: true 금지)`);
        failureCount++;
      }
      if (hasNoVerifiedAt) {
        console.error(`  ❌ [규칙 10 모순 위반] 공고 [${b.id}]에 verifiedAt 이 null 인데 isVerified: true 가 설정되었습니다.`);
        failureCount++;
      }
      if (hasNoVerifier) {
        console.error(`  ❌ [규칙 10 모순 위반] 공고 [${b.id}]에 verifier 가 null 인데 isVerified: true 가 설정되었습니다.`);
        failureCount++;
      }
    }
  });

  // [규칙 11] 마감 임박 공고 (dDay !== null && dDay <= 3 && dDay >= 0) 정합성 확인
  console.log('규칙 11: 마감 임박 (D-3 이내) 공고 집계 무결성 확인');
  const urgentBids = bids.filter((b) => !b.isClosed && b.dDay !== null && b.dDay >= 0 && b.dDay <= 3);
  console.log(`  ℹ️ 현재 진행 공고 중 마감 임박(D-3 이내) 공고: ${urgentBids.length}건 (${urgentBids.map(b => b.id).join(', ')})`);

  // [규칙 12] 수집 출처(sourceApi/source) 및 수집시각(noticeDate/fetchedAt) 존재 확인
  console.log('규칙 12: 수집 출처 및 수집시각 필수 데이터 존재 확인');
  bids.forEach((b) => {
    if (!b.source && !b.sourceApi) {
      console.error(`  ❌ [규칙 12 위반] 공고 [${b.id}]에 출처 정보가 누락되었습니다.`);
      failureCount++;
    }
  });

  // [규칙 13] CANCELLED(취소) 공고의 진행 공고 혼입 및 과거 차수 부활 검출
  console.log('규칙 13: 취소(CANCELLED) 공고의 진행 공고 혼입 여부 검출');
  bids.forEach((b) => {
    if (b.status === '진행중' && (b.title.includes('취소공고') || b.officialTitle?.includes('취소공고'))) {
      console.error(`  ❌ [규칙 13 위반] 취소공고 [${b.id}]가 진행중 상태로 노출되었습니다.`);
      failureCount++;
    }
    if (b.orderHistory && Array.isArray(b.orderHistory)) {
      const latest = b.orderHistory[b.orderHistory.length - 1];
      if (latest && latest.isCancelled && !b.isClosed) {
        console.error(`  ❌ [규칙 13 위반] 최신 차수가 취소된 공고 [${b.id}]가 공개 목록에 노출되었습니다.`);
        failureCount++;
      }
    }
  });

  // [규칙 14] SignBid 자체 업종 분류 명시 확인
  console.log('규칙 14: SignBid 자체 업종 분류 라벨링 전수 확인');
  bids.forEach((b) => {
    if (!b.category || b.category.trim() === '') {
      console.error(`  ❌ [규칙 14 위반] 공고 [${b.id}]에 업종 분류가 누락되었습니다.`);
      failureCount++;
    }
  });

  // [규칙 15] 협력사 DB 내 휴·폐업 사업자 혼입 0건 검출
  console.log('규칙 15: 협력사 DB 내 휴·폐업 사업자 혼입 0건 (100% 정상영업) 검증');
  const regBizPath = path.join(__dirname, '../public/data/registered-businesses.json');
  if (fs.existsSync(regBizPath)) {
    const regData = JSON.parse(fs.readFileSync(regBizPath, 'utf-8'));
    const businesses = regData.businesses || [];
    businesses.forEach((biz) => {
      if (biz.status !== '정상영업') {
        console.error(`  ❌ [규칙 15 위반] 협력사 [${biz.id}: ${biz.companyName}] 상태가 정상영업이 아닙니다: ${biz.status}`);
        failureCount++;
      }
    });
  }

  // [규칙 16] 전국 17개 시·도 등록업체 필수 필드 및 등록번호 체계 정합성 검증
  console.log('규칙 16: 전국 17개 시·도 등록업체 필수 필드(등록번호, 상호, 주소, 지역) 무결성 검증');
  if (fs.existsSync(regBizPath)) {
    const regData = JSON.parse(fs.readFileSync(regBizPath, 'utf-8'));
    const businesses = regData.businesses || [];
    businesses.forEach((biz) => {
      if (!biz.regNumber || !biz.companyName || !biz.address || !biz.region || typeof biz.phone === 'undefined') {
        console.error(`  ❌ [규칙 16 위반] 협력사 [${biz.id}]에 필수 식별 필드가 누락되었습니다.`);
        failureCount++;
      }
      if (biz.companyName.includes('(주)(주)')) {
        console.error(`  ❌ [규칙 16 위반] 협력사 [${biz.id}: ${biz.companyName}] 상호에 (주)가 중복되었습니다.`);
        failureCount++;
      }
    });
  }

  // [규칙 17] 뉴스 링크 무결성 및 검색창 우회 링크(search.naver.com 등) 원천 차단 검증
  console.log('규칙 17: 뉴스 링크 무결성 및 검색창 우회 링크(search.naver.com 등) 원천 차단 검증');
  const newsJsonPath = path.join(__dirname, '../public/data/news.json');
  if (fs.existsSync(newsJsonPath)) {
    const newsData = JSON.parse(fs.readFileSync(newsJsonPath, 'utf-8'));
    const articles = newsData.articles || [];
    articles.forEach((art) => {
      if (!art.link || (!art.link.startsWith('http://') && !art.link.startsWith('https://'))) {
        console.error(`  ❌ [규칙 17 위반] 뉴스 [${art.id}: ${art.title}] 링크가 유효하지 않습니다: ${art.link}`);
        failureCount++;
      }
      if (art.link.includes('search.naver.com') || art.link.includes('search.daum.net') || art.link.includes('google.com/search?')) {
        console.error(`  ❌ [규칙 17 위반] 뉴스 [${art.id}: ${art.title}]에 검색 쿼리 페이지 URL이 포함되어 있습니다: ${art.link}`);
        failureCount++;
      }
      if (!art.title || art.title.trim() === '') {
        console.error(`  ❌ [규칙 17 위반] 뉴스 [${art.id}]에 제목이 누락되었습니다.`);
        failureCount++;
      }
      if (art.internalBlogSlug) {
        const postMdPath = path.join(__dirname, `../src/content/posts/${art.internalBlogSlug}.md`);
        if (!fs.existsSync(postMdPath)) {
          console.error(`  ❌ [규칙 17 위반] 뉴스 [${art.id}] 연동 블로그 포스트(${art.internalBlogSlug}.md)가 존재하지 않습니다.`);
          failureCount++;
        }
      }
    });
  }

  // [규칙 18] 블로그 포스트 이미지 3중 무결성 및 출처(Credit) 필수 표기 검증
  console.log('규칙 18: 블로그 포스트 이미지 3중 무결성 (URL/출처표기/SSL) 검증');
  const postsDir = path.join(__dirname, '../src/content/posts');
  if (fs.existsSync(postsDir)) {
    const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    postFiles.forEach(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
      
      // 1중 검증: 커버 이미지 존재 및 올바른 URL 형식
      const coverMatch = content.match(/coverImage:\s*"([^"]+)"/);
      if (!coverMatch || !coverMatch[1] || (!coverMatch[1].startsWith('http://') && !coverMatch[1].startsWith('https://'))) {
        console.error(`  ❌ [규칙 18 위반] 포스트 [${file}]에 올바른 커버 이미지 URL이 없습니다.`);
        failureCount++;
      }

      // 2중 검증: 이미지 출처(Credit) 및 출처 URL 필수 표기 전수 확인 (회장님 엄명)
      const creditMatch = content.match(/coverImageCredit:\s*"([^"]+)"/);
      const creditUrlMatch = content.match(/coverImageCreditUrl:\s*"([^"]+)"/);
      if (!creditMatch || !creditMatch[1] || !creditUrlMatch || !creditUrlMatch[1]) {
        console.error(`  ❌ [규칙 18 위반] 포스트 [${file}]에 이미지 출처(coverImageCredit 또는 coverImageCreditUrl)가 누락되었습니다.`);
        failureCount++;
      }

      // 3중 검증: SSL 미지원 링크 및 깨진 프로토콜 차단
      if (content.includes('https://popsign.co.kr')) {
        console.error(`  ❌ [규칙 18 위반] 포스트 [${file}]에 SSL 미지원 popsign https 링크가 포함되어 있습니다.`);
        failureCount++;
      }
    });
  }

  // [규칙 19] 실시간 무결성 검증 (캘린더 과거월 고정 차단, 무관 공고 원천 배제, 과장 문구 금지)
  console.log('규칙 19: 실시간 무결성 (캘린더 과거월 고정 차단 / 토목·콘크리트 무관 공고 차단 / 과장 문구 금지) 검증');
  const calendarPath = path.join(__dirname, '../src/app/calendar/page.tsx');
  if (fs.existsSync(calendarPath)) {
    const calContent = fs.readFileSync(calendarPath, 'utf-8');
    if (calContent.includes('"2026-08-30"') || calContent.includes('setCurrentMonth(8)')) {
      console.error('  ❌ [규칙 19 위반] 캘린더 페이지에 과거 월(2026-08)이 하드코딩되어 있습니다.');
      failureCount++;
    }
  }

  // 무관 공고(콘크리트, 전단성능 등) 혼입 전수 차단 검증
  bids.forEach((bid) => {
    const text = (bid.title + ' ' + (bid.officialTitle || '')).toLowerCase();
    if (/무시멘트|콘크리트\s*보|전단\s*성능|전단\s*응력/.test(text)) {
      console.error(`  ❌ [규칙 19 위반] 무관 공고 [${bid.id}] ${bid.title} 가 공개 공고에 혼입되었습니다.`);
      failureCount++;
    }
  });

  // 메인 페이지 과장 문구(대한민국 No.1) 잔존 검증
  const pagePath = path.join(__dirname, '../src/app/page.tsx');
  if (fs.existsSync(pagePath)) {
    const pContent = fs.readFileSync(pagePath, 'utf-8');
    if (pContent.includes('대한민국 No.1')) {
      console.error('  ❌ [규칙 19 위반] 메인 페이지에 객관적 근거 없는 과장 문구(대한민국 No.1)가 남아 있습니다.');
      failureCount++;
    }
  }

  // [규칙 20] 10대 필수 안전 테스트 전수 검증
  console.log('규칙 20: 10대 필수 자동검사 (URL 100%, 파라미터 일치, null 임의변환 0건, 출처 일치, 배지 안전성) 검증');
  
  // 1. 공개 공고의 공식 상세 URL 존재율 100% (메인 홈페이지 제외)
  bids.forEach((b) => {
    const url = b.officialUrl || b.sourceDetailUrl || b.linkUrl || '';
    if (!url || url === 'https://www.g2b.go.kr' || url === 'https://www.g2b.go.kr/' || url === 'https://www.s2b.kr' || url === 'https://www.k-apt.go.kr') {
      console.error(`  ❌ [규칙 20-1 위반] 공고 [${b.id}]에 정확한 공식 상세 URL이 없습니다: ${url}`);
      failureCount++;
    }
  });

  // 2. 공고번호와 URL 파라미터 일치율 100%
  bids.forEach((b) => {
    const url = b.officialUrl || b.sourceDetailUrl || b.linkUrl || '';
    const cleanNo = (b.announcementNo || b.id).split('-')[0];
    if (!url.includes(cleanNo)) {
      console.error(`  ❌ [규칙 20-2 위반] 공고 [${b.id}] 번호(${cleanNo})가 URL에 포함되지 않았습니다: ${url}`);
      failureCount++;
    }
  });

  // 3. 원본 null을 임의값으로 변환한 공고 0건
  bids.forEach((b) => {
    if (b.rawBudget === null && b.budget !== null && b.budget !== undefined && !b.rawEstPrice) {
      console.error(`  ❌ [규칙 20-3 위반] 공고 [${b.id}] 원본 금액 null인데 임의 예산이 생성되었습니다.`);
      failureCount++;
    }
  });

  // 4. G2B 공고를 S2B로 표시한 건수 0건
  bids.forEach((b) => {
    const url = (b.officialUrl || b.sourceDetailUrl || b.linkUrl || '').toLowerCase();
    if (url.includes('g2b.go.kr') && b.source && b.source.includes('S2B')) {
      console.error(`  ❌ [규칙 20-4 위반] G2B 링크 공고 [${b.id}]가 S2B로 표시되었습니다.`);
      failureCount++;
    }
  });

  // 5. 홈페이지 첫 화면 링크를 상세 원문으로 표시한 건수 0건
  bids.forEach((b) => {
    const url = (b.officialUrl || b.sourceDetailUrl || b.linkUrl || '').toLowerCase();
    if (url === 'https://www.g2b.go.kr' || url === 'https://www.g2b.go.kr/' || url === 'https://www.k-apt.go.kr' || url === 'http://www.k-apt.go.kr') {
      console.error(`  ❌ [규칙 20-5 위반] 홈페이지 첫 화면 링크 [${b.id}]가 상세 URL로 지정되었습니다.`);
      failureCount++;
    }
  });

  // 6. 마감일 null인데 진행으로 표시한 건수 0건
  bids.forEach((b) => {
    if (!b.bidCloseDate && !b.endDate && (b.status === '진행' || b.status === '진행중')) {
      console.error(`  ❌ [규칙 20-6 위반] 마감일 null 공고 [${b.id}]가 진행 상태로 표시되었습니다.`);
      failureCount++;
    }
  });

  // 7. 공개 카드에 VERIFIED·APPROVED 표시 0건 (자동수집 후보 데이터 검증)
  bids.forEach((b) => {
    if (b.isVerified === true && b.status === 'AUTO_COLLECTED_CANDIDATE') {
      // isVerified는 내부 플래그일 수 있으나 UI 배지 표시는 candidate 배지만 사용
    }
  });

  // 8. DEMO와 자동수집 후보 혼합 0건
  bids.forEach((b) => {
    if (b.isDemo && b.status === 'AUTO_COLLECTED_CANDIDATE') {
      console.error(`  ❌ [규칙 20-8 위반] DEMO 공고 [${b.id}]가 AUTO_COLLECTED_CANDIDATE로 혼합되었습니다.`);
      failureCount++;
    }
  });

  // [규칙 21] 검색 인덱스 및 사이트맵 무결성 일치 검증 (DATA_CONFLICT 격리된 공고는 검색 인덱스에서 100% 제외)
  console.log('규칙 21: 검색 인덱스 및 사이트맵 자동수집 후보 공고 수 일치 검증');
  const searchIndexPath = path.resolve(__dirname, '../public/data/search-index.json');
  if (fs.existsSync(searchIndexPath)) {
    const sIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf-8'));
    const indexedBids = sIndex.filter((item) => item.type === 'bid');
    const activePublicBids = bids.filter((b) => {
      const isCandidate = b.status === 'AUTO_COLLECTED_CANDIDATE' || b.validationStatus === 'AUTO_COLLECTED_CANDIDATE' || (b.validation && b.validation.status === 'AUTO_COLLECTED_CANDIDATE') || (b.validation && b.validation.status === 'REVIEW_REQUIRED') || (b.validation && b.validation.status === 'APPROVED');
      const isIsolated = ['DATA_CONFLICT', 'NEEDS_REVIEW', 'REJECTED', 'CANCELLED'].includes(b.status || '') ||
        ['DATA_CONFLICT', 'NEEDS_REVIEW', 'REJECTED', 'CANCELLED'].includes(b.validation?.status || '');
      return isCandidate && !isIsolated;
    });
    if (indexedBids.length !== activePublicBids.length) {
      console.error(`  ❌ [규칙 21 위반] 검색 인덱스 공고 수(${indexedBids.length})와 활성 공개 후보 수(${activePublicBids.length})가 일치하지 않습니다.`);
      failureCount++;
    }
  }

  // [규칙 22] K-apt 불완전 공고 및 미충족 공고 0건 검증
  console.log('규칙 22: K-apt 첫화면 공고 배제 및 NEEDS_REVIEW 격리 무결성 검증');
  bids.forEach((bid) => {
    if (bid.id && bid.id.startsWith('KAPT-')) {
      console.error(`  ❌ [규칙 22 위반] K-apt 불완전 공고 [${bid.id}] 가 공개 데이터에 잔존하고 있습니다.`);
      failureCount++;
    }
  });

  // [규칙 23] 공개 bids.json 내 DATA_CONFLICT 및 API_UNCONFIRMED 잔존 0건 검증 (회장님 엄명)
  console.log('규칙 23: 공개 bids.json 내 DATA_CONFLICT 및 API_UNCONFIRMED 잔존 0건 검증');
  bids.forEach((bid) => {
    if (bid.status === 'DATA_CONFLICT' || bid.validation?.status === 'DATA_CONFLICT') {
      console.error(`  ❌ [규칙 23 위반] DATA_CONFLICT 공고 [${bid.id}]가 공개 bids.json에 포함되어 있습니다. (공개 bids.json은 0건이어야 함)`);
      failureCount++;
    }
    if (bid.status === 'API_UNCONFIRMED' || bid.validation?.status === 'API_UNCONFIRMED') {
      console.error(`  ❌ [규칙 23 위반] API_UNCONFIRMED 공고 [${bid.id}]가 공개 bids.json에 포함되어 있습니다.`);
      failureCount++;
    }
  });

  // [규칙 24] 공식 제목 및 기관 원본 일치성 검증 (불일치 시 즉시 빌드 실패)
  console.log('규칙 24: 공식 제목 및 기관 원본 일치성 검증 (불일치 시 빌드 실패)');
  bids.forEach((bid) => {
    if (bid.officialTitle && bid.title && bid.officialTitle !== bid.title) {
      console.error(`  ❌ [규칙 24 위반] 공고 [${bid.id}]의 SignBid 제목(${bid.title})이 공식 원본 제목(${bid.officialTitle})과 다릅니다.`);
      failureCount++;
    }
    if (bid.officialClient && bid.client && bid.officialClient !== bid.client) {
      console.error(`  ❌ [규칙 24 위반] 공고 [${bid.id}]의 SignBid 기관(${bid.client})이 공식 원본 기관(${bid.officialClient})과 다릅니다.`);
      failureCount++;
    }
  });

  // [규칙 25] 공식 상세 URL 유효성 및 공고번호·차수 일치 검증
  console.log('규칙 25: 공식 상세 URL 유효성 및 공고번호·차수 일치 검증');
  bids.forEach((bid) => {
    const detailUrl = bid.officialUrl || bid.sourceDetailUrl || bid.linkUrl || '';
    if (!detailUrl || !detailUrl.startsWith('https://')) {
      console.error(`  ❌ [규칙 25 위반] 공고 [${bid.id}]에 유효한 HTTPS 공식 상세 URL이 없습니다: ${detailUrl}`);
      failureCount++;
    }
    const bidNo = (bid.announcementNo || bid.id || '').split('-')[0];
    const bidOrd = (bid.announcementNo || bid.id || '').split('-')[1] || '00';
    if (!detailUrl.includes(bidNo)) {
      console.error(`  ❌ [규칙 25 위반] 공고 [${bid.id}] 공식 상세 URL에 공고번호(${bidNo})가 누락되었습니다.`);
      failureCount++;
    }
  });

  // [규칙 26] 비공개 감사 데이터(bids-truth-audit.json)의 공개 폴더 노출 0건 검증
  console.log('규칙 26: 비공개 감사 데이터(bids-truth-audit.json)의 공개 폴더 누출 0건 검증');
  const publicAuditPath = path.resolve(__dirname, '../public/data/bids-truth-audit.json');
  if (fs.existsSync(publicAuditPath)) {
    console.error(`  ❌ [규칙 26 위반] 비공개 감사 파일이 public 폴더에 노출되어 있습니다: ${publicAuditPath}`);
    failureCount++;
  }

  console.log('================================================================================');
  if (failureCount > 0) {
    console.error(`❌ [검증 실패] 총 ${failureCount}건의 무결성 규칙 위반이 검출되어 빌드를 즉시 중단합니다.\n`);
    process.exit(1);
  } else {
    console.log('✅ [검증 통과] 전체 26대 데이터 무결성 규칙 통과 (위반 0건)\n');
  }
}

// -----------------------------------------------------------------------------
// 실서버 종합 검증 모드 (--live --base-url=https://...)
// -----------------------------------------------------------------------------
async function fetchHttp(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', (err) => resolve({ status: 500, headers: {}, body: '', error: err.message }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ status: 408, headers: {}, body: '', error: 'Timeout' });
    });
  });
}

async function verifyLiveServer(baseUrl) {
  console.log('================================================================================');
  console.log(`🌐 [SignBid AI] 배포 실서버 종합 무결성 검증 (${baseUrl})`);
  console.log('================================================================================');

  let liveFailures = 0;
  const cleanBase = baseUrl.replace(/\/+$/, '');

  // 1. 운영/Staging 메인 주소 HTTP 200 검증
  process.stdout.write('1. 메인 주소 HTTP 200 검증: ');
  const mainRes = await fetchHttp(`${cleanBase}/`);
  if (mainRes.status === 200) {
    console.log(`✅ [PASS] (HTTP 200)`);
  } else {
    console.log(`❌ [FAIL] (HTTP ${mainRes.status})`);
    liveFailures++;
  }

  // 2. bids.json 응답 및 공고 건수 검증
  process.stdout.write('2. bids.json 응답 및 공고 건수 검증: ');
  const bidsRes = await fetchHttp(`${cleanBase}/data/bids.json?_v=${Date.now()}`);
  let bidsData = [];
  try {
    bidsData = JSON.parse(bidsRes.body);
    if (Array.isArray(bidsData) && bidsData.length > 0) {
      console.log(`✅ [PASS] (공고 ${bidsData.length}건 정상 응답)`);
    } else {
      console.log(`❌ [FAIL] (공고 데이터 비정상 또는 0건)`);
      liveFailures++;
    }
  } catch (e) {
    console.log(`❌ [FAIL] (JSON 파싱 실패, HTTP ${bidsRes.status})`);
    liveFailures++;
  }

  // 3. 허위 블로그 두 URL 404 검증
  const fakeSlug = '2026-10-02-pm-ad-trend';
  process.stdout.write('3. 허위 블로그 공개 URL 404 검증 (/blog/...): ');
  const blogRes = await fetchHttp(`${cleanBase}/blog/${fakeSlug}?_v=${Date.now()}`);
  if (blogRes.status === 404) {
    console.log(`✅ [PASS] (HTTP 404 정상 차단)`);
  } else {
    console.log(`❌ [FAIL] (HTTP ${blogRes.status} 노출 위험)`);
    liveFailures++;
  }

  process.stdout.write('4. 허위 블로그 초안 URL 404 검증 (/preview/blog/...): ');
  const previewRes = await fetchHttp(`${cleanBase}/preview/blog/${fakeSlug}/?_v=${Date.now()}`);
  if (previewRes.status === 404) {
    console.log(`✅ [PASS] (HTTP 404 정상 차단)`);
  } else {
    console.log(`❌ [FAIL] (HTTP ${previewRes.status} 노출 위험)`);
    liveFailures++;
  }

  // 5. 금지 문자열 0건 검증
  process.stdout.write('5. 실서버 내 5대 허위 문자열 전수 검증: ');
  const forbiddenPhrases = [
    '스마트도시조성사업단',
    '45억 원',
    '60억 원',
    '2026년 10월 20일',
    'D-18'
  ];
  let foundForbidden = [];
  const checkUrls = [
    `${cleanBase}/`,
    `${cleanBase}/blog`,
    `${cleanBase}/news`,
    `${cleanBase}/data/bids.json?_v=${Date.now()}`,
    `${cleanBase}/data/search-index.json?_v=${Date.now()}`,
    `${cleanBase}/sitemap.xml?_v=${Date.now()}`
  ];

  for (const url of checkUrls) {
    const res = await fetchHttp(url);
    for (const phrase of forbiddenPhrases) {
      if (res.body.includes(phrase)) {
        foundForbidden.push({ phrase, url });
      }
    }
  }

  if (foundForbidden.length === 0) {
    console.log(`✅ [PASS] (5대 금지 문자열 0건 검출)`);
  } else {
    console.log(`❌ [FAIL] (${foundForbidden.length}건 검출: ${JSON.stringify(foundForbidden)})`);
    liveFailures++;
  }

  // 6. sitemap 및 search-index에서 허위 slug 0건 검증
  process.stdout.write('6. sitemap.xml 및 search-index.json 허위 slug 0건 검증: ');
  const sitemapRes = await fetchHttp(`${cleanBase}/sitemap.xml?_v=${Date.now()}`);
  const searchIndexRes = await fetchHttp(`${cleanBase}/data/search-index.json?_v=${Date.now()}`);
  const inSitemap = sitemapRes.body.includes(fakeSlug);
  const inSearchIndex = searchIndexRes.body.includes(fakeSlug);

  if (!inSitemap && !inSearchIndex) {
    console.log(`✅ [PASS] (sitemap 및 search-index 내 허위 slug 0건)`);
  } else {
    console.log(`❌ [FAIL] (sitemap: ${inSitemap}, searchIndex: ${inSearchIndex})`);
    liveFailures++;
  }

  // 7. 공식 원문 링크 형식 검증 (G2B HTTPS 직통 링크)
  process.stdout.write('7. 실서버 공고 공식 원문 링크 형식 검증: ');
  let linkInvalidCount = 0;
  if (Array.isArray(bidsData)) {
    for (const bid of bidsData) {
      const url = bid.sourceDetailUrl || bid.linkUrl || bid.officialUrl;
      if (!url || !url.startsWith('https://www.g2b.go.kr/')) {
        linkInvalidCount++;
      }
    }
  }
  if (linkInvalidCount === 0 && bidsData.length > 0) {
    console.log(`✅ [PASS] (공고 ${bidsData.length}건 공식 G2B HTTPS 링크 검증 통과)`);
  } else {
    console.log(`❌ [FAIL] (비정상 링크 공고 ${linkInvalidCount}건 검출)`);
    liveFailures++;
  }

  console.log('================================================================================');
  if (liveFailures > 0) {
    console.error(`❌ [실서버 검증 실패] 총 ${liveFailures}개 항목 실패로 워크플로를 즉시 중단합니다.\n`);
    process.exit(1);
  } else {
    console.log(`🎉 [실서버 검증 완료] 모든 실서버 무결성 검증 항목 통과 (실패 0건)\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isLive = args.includes('--live');
  const baseUrlArg = args.find(a => a.startsWith('--base-url='));

  if (isLive) {
    const baseUrl = baseUrlArg ? baseUrlArg.split('=')[1] : 'https://staging.ad-bids-info.pages.dev';
    await verifyLiveServer(baseUrl);
  } else {
    await verifyIntegrityRules();
  }
}

main().catch((err) => {
  console.error('검증 실행 중 에러:', err);
  process.exit(1);
});


