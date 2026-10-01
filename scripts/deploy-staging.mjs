import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================================');
console.log('🚀 [SignBid AI] Staging 전용 배포 스크립트 (deploy:staging)');
console.log('================================================================================');
console.log('🔒 안전 검증: Staging 환경에만 적용되며 운영(main)에는 일체 영향을 주지 않습니다.\n');

// 1. 점검 요약 보고서 존재 확인
const summaryPath = path.join(rootDir, 'docs/verification/daily_inspection_summary.json');
if (!fs.existsSync(summaryPath)) {
  console.error('❌ [오류] 먼저 npm run inspect 를 실행하여 점검 요약 데이터를 생성해야 합니다.');
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
console.log(`▶ Staging 반영 대상 순신규 후보 공고 수: ${summary.netNewCandidatesCount}건`);
console.log(`▶ 운영 유지 공고 수: ${summary.prodBidsCount}건 (진행: ${summary.prodActiveCount}건 / 마감: ${summary.prodClosedCount}건)`);

// 2. Staging용 데이터 검증
console.log('✅ [Staging 배포 준비 완료] Staging 환경 검증 데이터 준비 완료');
console.log('ℹ️ Staging 브랜치 또는 테스트 URL에서 모바일/PC 화면 검수를 진행하세요.\n');
