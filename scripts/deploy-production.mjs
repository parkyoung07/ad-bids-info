import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================================');
console.log('🛡️ [SignBid AI] 운영 배포 통제 게이트웨이 (deploy:production)');
console.log('================================================================================');

// 5대 필수 승인 조건 전수 검사
const approvalToken = process.env.CHAIRMAN_APPROVAL_TOKEN;
const approvedCommitSha = process.env.APPROVED_COMMIT_SHA;
const stagingUrl = process.env.STAGING_VERIFIED_URL;
const stagingInspectionConfirmed = process.env.STAGING_INSPECTION_CONFIRMED === 'true';
const targetBidsCount = process.env.TARGET_BIDS_COUNT;

console.log('▶ [1/5] 회장님 명시적 승인 토큰 검증...');
if (!approvalToken || approvalToken.trim() === '') {
  console.error('❌ [운영 배포 거부] 회장님의 명시적 승인 토큰(CHAIRMAN_APPROVAL_TOKEN)이 설정되지 않았습니다.');
  console.error('   -> 회장님의 정식 승인 없이 운영 배포를 진행할 수 없습니다.');
  process.exit(1);
}

console.log('▶ [2/5] 승인 대상 커밋 SHA 검증...');
if (!approvedCommitSha || approvedCommitSha.length < 7) {
  console.error('❌ [운영 배포 거부] 승인 대상 커밋 SHA(APPROVED_COMMIT_SHA)가 누락되었습니다.');
  process.exit(1);
}

console.log('▶ [3/5] Staging 검증 URL 확인...');
if (!stagingUrl || !stagingUrl.startsWith('http')) {
  console.error('❌ [운영 배포 거부] 유효한 Staging 검증 URL(STAGING_VERIFIED_URL)이 누락되었습니다.');
  process.exit(1);
}

console.log('▶ [4/5] Staging 모바일·PC 사전 검수표 확인...');
if (!stagingInspectionConfirmed) {
  console.error('❌ [운영 배포 거부] Staging 화면 사전 검수 확인(STAGING_INSPECTION_CONFIRMED=true)이 완료되지 않았습니다.');
  process.exit(1);
}

console.log('▶ [5/5] 운영 배포 대상 건수 확인...');
if (!targetBidsCount || isNaN(Number(targetBidsCount))) {
  console.error('❌ [운영 배포 거부] 운영 배포 대상 건수(TARGET_BIDS_COUNT)가 지정되지 않았습니다.');
  process.exit(1);
}

console.log('\n✅ [5대 필수 승인 조건 100% 충족] 운영 배포를 안전하게 개시합니다.');
