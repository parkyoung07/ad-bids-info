import fs from 'fs';

const bids = JSON.parse(fs.readFileSync('public/data/bids.json', 'utf8'));
const now = new Date('2026-09-30T17:03:49+09:00');
console.log('현재 KST 기준 시각:', now.toISOString());
console.log('총 공고 수:', bids.length);

let closedCount = 0;
let activeCount = 0;

bids.forEach((b, i) => {
  const close = new Date(b.bidCloseDate);
  const isClosed = close < now;
  if (isClosed) {
    closedCount++;
  } else {
    activeCount++;
  }
  console.log(`[${i + 1}] [${b.category}] ${b.bidNtceNo}-${b.bidNtceOrd} | 마감일시: ${b.bidCloseDate} | 상태: ${isClosed ? '🔴 마감' : '🟢 진행 중'}`);
});

console.log('--------------------------------------------------');
console.log(`진행 중 공고: ${activeCount}건, 마감 공고: ${closedCount}건`);
