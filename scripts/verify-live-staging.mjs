import fetch from 'node-fetch';

async function verifyAll() {
  console.log("==================================================");
  console.log("🚀 [SignBid AI] 실서버 최종 무결성 검증");
  console.log("==================================================");

  // 1. Staging Data 검증
  const stagingBidsRes = await fetch('https://staging.ad-bids-info.pages.dev/data/bids.json?t=' + Date.now());
  const stagingBids = await stagingBidsRes.json();
  console.log('1. Staging 전체 공고 건수:', stagingBids.length);

  const categories = { '제작·시공': 0, '인쇄·출판': 0, '출력·인쇄 장비': 0, '출력소재·잉크': 0 };
  for (const b of stagingBids) {
    const cat = b.category;
    if (categories[cat] !== undefined) categories[cat]++;
    else console.log('   ⚠️ 알 수 없는 카테고리:', cat);
  }
  console.log('2. Staging 분야별 건수:');
  console.log('   - 제작·시공:', categories['제작·시공']);
  console.log('   - 인쇄·출판:', categories['인쇄·출판']);
  console.log('   - 출력·인쇄 장비:', categories['출력·인쇄 장비']);
  console.log('   - 출력소재·잉크:', categories['출력소재·잉크']);

  // 2. Staging HTML 검증
  const stagingHtmlRes = await fetch('https://staging.ad-bids-info.pages.dev/?t=' + Date.now());
  const stagingHtml = await stagingHtmlRes.text();
  
  const hasOldNullCloseTab = stagingHtml.includes('공식 원문 확인 필요 (0)') || stagingHtml.includes('공식 원문 확인 필요 (');
  console.log('3. Staging HTML [공식 원문 확인 필요 (0)] 탭 버튼 존재 여부:', hasOldNullCloseTab ? '⚠️ 존재함' : '✅ 0건 (삭제 완료)');
  console.log('4. Staging HTML [진행 중 자동수집 후보] 탭 존재 여부:', stagingHtml.includes('진행 중 자동수집 후보') ? '✅ 정상 노출' : '❌ 누락');
  console.log('5. Staging HTML [공식 마감] 탭 존재 여부:', stagingHtml.includes('공식 마감') ? '✅ 정상 노출' : '❌ 누락');
  console.log('6. Staging HTML [관심공고] 탭 존재 여부:', stagingHtml.includes('관심공고') ? '✅ 정상 노출' : '❌ 누락');

  // 3. 운영 사이트 bids.json 0건 유지 검증
  const prodBidsRes = await fetch('https://signbidai.com/data/bids.json?t=' + Date.now());
  const prodBids = await prodBidsRes.json();
  console.log('7. 운영(Production) 사이트 bids.json 건수:', prodBids.length, prodBids.length === 0 ? '✅ 0건 유지 (안전 격리)' : '❌ 운영 누출 위험');
  console.log('==================================================');
}

verifyAll().catch(err => console.error(err));
