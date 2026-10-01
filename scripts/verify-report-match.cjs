/**
 * Test: 보고서와 bids.json 간 1:1 필드 완전 일치 자동 검증 테스트
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const bidsPath = path.join(__dirname, '../public/data/bids.json');
const reportJsonPath = path.join(__dirname, '../docs/verification/automated_report_table.json');

if (!fs.existsSync(bidsPath) || !fs.existsSync(reportJsonPath)) {
  console.error('❌ bids.json 또는 automated_report_table.json 이 존재하지 않습니다.');
  process.exit(1);
}

const allBids = JSON.parse(fs.readFileSync(bidsPath, 'utf8'));
const reportData = JSON.parse(fs.readFileSync(reportJsonPath, 'utf8'));

console.log('================================================================================');
console.log('🧪 [단위 테스트] 보고서와 bids.json 100% 필드 일치 무결성 검증');
console.log('================================================================================\n');

const candidateBids = allBids.slice(18);
const reportBids = [...reportData.activeCandidates, ...reportData.closedCandidates];

let errors = 0;

if (candidateBids.length !== reportBids.length) {
  console.error(`❌ [불일치] 후보 공고 수 불일치: bids.json (${candidateBids.length}) vs 보고서 (${reportBids.length})`);
  errors++;
}

candidateBids.forEach((b, i) => {
  const r = reportBids.find(item => item.id === b.id);
  if (!r) {
    console.error(`❌ [누락] 보고서에 공고 [${b.id}] 누락`);
    errors++;
    return;
  }

  // 1. 공고번호 일치 검증
  if (b.id !== r.id) {
    console.error(`❌ [불일치] ID 불일치: ${b.id} vs ${r.id}`);
    errors++;
  }
  // 2. 제목 일치 검증
  if (b.title !== r.title) {
    console.error(`❌ [불일치] 제목 불일치 [${b.id}]: '${b.title}' vs '${r.title}'`);
    errors++;
  }
  // 3. 기관 일치 검증
  if (b.client !== r.client) {
    console.error(`❌ [불일치] 기관 불일치 [${b.id}]: '${b.client}' vs '${r.client}'`);
    errors++;
  }
  // 4. 업종분류 일치 검증
  if (b.category !== r.category) {
    console.error(`❌ [불일치] 업종분류 불일치 [${b.id}]: '${b.category}' vs '${r.category}'`);
    errors++;
  }
  // 5. 마감일시 일치 검증
  if (b.bidCloseDate !== r.bidCloseDate) {
    console.error(`❌ [불일치] 마감일시 불일치 [${b.id}]: '${b.bidCloseDate}' vs '${r.bidCloseDate}'`);
    errors++;
  }
  // 6. 금액 일치 검증
  if (b.budgetText !== r.budgetText) {
    console.error(`❌ [불일치] 금액 불일치 [${b.id}]: '${b.budgetText}' vs '${r.budgetText}'`);
    errors++;
  }
  // 7. 상태 일치 검증
  if (b.status !== r.status) {
    console.error(`❌ [불일치] 상태 불일치 [${b.id}]: '${b.status}' vs '${r.status}'`);
    errors++;
  }
  // 8. 공식 URL 일치 검증
  if (b.officialUrl !== r.officialUrl) {
    console.error(`❌ [불일치] 공식 URL 불일치 [${b.id}]: '${b.officialUrl}' vs '${r.officialUrl}'`);
    errors++;
  }
});

if (errors > 0) {
  console.error(`\n❌ [검증 실패] 총 ${errors}건의 필드 불일치 검출`);
  process.exit(1);
} else {
  console.log(`✅ [검증 통과] 10개 후보 공고의 8개 필수 필드(id, title, client, category, bidCloseDate, budgetText, status, officialUrl) 100% 완전 일치 확인\n`);
  console.log('================================================================================');
  console.log('🎉 [테스트 완료] 보고서-bids.json 필드 무결성 검증 100% 통과');
  console.log('================================================================================');
}
