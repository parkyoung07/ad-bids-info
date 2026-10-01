import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const bidsPath = path.join(rootDir, 'public/data/bids.json');
if (!fs.existsSync(bidsPath)) {
  console.error('❌ public/data/bids.json 이 존재하지 않습니다.');
  process.exit(1);
}

const allBids = JSON.parse(fs.readFileSync(bidsPath, 'utf8'));

// 신규 후보 10건 (기존 운영 18건 이후의 10건)
const candidateBids = allBids.slice(18);

// 1. 신규 진행 후보 9건
const activeCandidates = candidateBids.filter(b => !b.isClosed && b.status !== '마감');

// 2. 신규 마감 전환 1건
const closedCandidates = candidateBids.filter(b => b.isClosed || b.status === '마감');

console.log('================================================================================');
console.log('📋 [SignBid AI] public/data/bids.json 100% 원문 기반 자동 공고 보고서');
console.log('================================================================================\n');

console.log('### [신규 진행 후보 9건 자동 생성 보고표]');
console.log('| 번호 | 공고번호(id) | 공고명(title) | 발주기관(client) | 업종분류(category) | 마감일시(bidCloseDate) | 금액(budgetText) | 상태(status) |');
console.log('|:---:|:---|:---|:---|:---|:---|:---|:---:|');

activeCandidates.forEach((b, idx) => {
  console.log(`| ${idx + 1} | \`${b.id}\` | ${b.title} | ${b.client} | ${b.category} | ${b.bidCloseDate} | ${b.budgetText} | ${b.status} |`);
});

console.log('\n### [신규 마감 전환 1건 자동 생성 보고표]');
console.log('| 번호 | 공고번호(id) | 공고명(title) | 발주기관(client) | 업종분류(category) | 공식마감일시(bidCloseDate) | 금액(budgetText) | 상태(status) |');
console.log('|:---:|:---|:---|:---|:---|:---|:---|:---:|');

closedCandidates.forEach((b, idx) => {
  console.log(`| ${idx + 1} | \`${b.id}\` | ${b.title} | ${b.client} | ${b.category} | ${b.bidCloseDate} | ${b.budgetText} | ${b.status} |`);
});

console.log('\n### [공식 원문 URL 대조 목록]');
candidateBids.forEach((b, idx) => {
  console.log(`${idx + 1}. [${b.id}] ${b.title} -> ${b.officialUrl}`);
});

// JSON 출력 파일로도 보관
const outPath = path.join(rootDir, 'docs/verification/automated_report_table.json');
fs.writeFileSync(outPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  activeCandidatesCount: activeCandidates.length,
  closedCandidatesCount: closedCandidates.length,
  activeCandidates,
  closedCandidates
}, null, 2), 'utf8');

console.log(`\n📁 보고서 데이터 저장 완료: docs/verification/automated_report_table.json`);
