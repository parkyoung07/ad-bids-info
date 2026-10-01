/**
 * Test: 상태 모순(isVerified: true 오남용) 방지 자동 차단 단위 테스트
 */
const assert = require('assert');

function validateBidState(b) {
  const isCandidate = b.validationStatus === 'AUTO_COLLECTED_CANDIDATE' || b.status === 'AUTO_COLLECTED_CANDIDATE';
  const isReviewRequired = b.validation?.status === 'REVIEW_REQUIRED' || b.status === 'REVIEW_REQUIRED';
  const hasNoVerifiedAt = !b.validation?.verifiedAt;
  const hasNoVerifier = !b.validation?.verifier;

  if (b.isVerified === true || b.validation?.isVerified === true) {
    if (isCandidate) {
      throw new Error(`[모순 위반] AUTO_COLLECTED_CANDIDATE + isVerified: true 금지 (${b.id})`);
    }
    if (isReviewRequired) {
      throw new Error(`[모순 위반] REVIEW_REQUIRED + isVerified: true 금지 (${b.id})`);
    }
    if (hasNoVerifiedAt) {
      throw new Error(`[모순 위반] verifiedAt: null + isVerified: true 금지 (${b.id})`);
    }
    if (hasNoVerifier) {
      throw new Error(`[모순 위반] verifier: null + isVerified: true 금지 (${b.id})`);
    }
  }
  return true;
}

console.log('================================================================================');
console.log('🧪 [단위 테스트] 상태 모순 방지 검증 테스트 스위트');
console.log('================================================================================\n');

// 시나리오 1: 정상 자동수집 후보 (isVerified: false) -> PASS
try {
  validateBidState({
    id: 'TEST-001',
    validationStatus: 'AUTO_COLLECTED_CANDIDATE',
    isVerified: false,
    validation: { status: 'REVIEW_REQUIRED', isVerified: false, verifiedAt: null, verifier: null }
  });
  console.log('▶ Test 1: 정상 자동수집 후보 (isVerified: false) -> ✅ PASS');
} catch (e) {
  console.error('▶ Test 1 FAILED:', e.message);
  process.exit(1);
}

// 시나리오 2: AUTO_COLLECTED_CANDIDATE + isVerified: true -> FAIL 차단 검증
try {
  validateBidState({
    id: 'TEST-002',
    validationStatus: 'AUTO_COLLECTED_CANDIDATE',
    isVerified: true,
    validation: { status: 'REVIEW_REQUIRED', isVerified: true, verifiedAt: null, verifier: null }
  });
  console.error('▶ Test 2 FAILED: 차단되지 않음');
  process.exit(1);
} catch (e) {
  console.log('▶ Test 2: AUTO_COLLECTED_CANDIDATE + isVerified: true -> ✅ 차단 성공');
}

// 시나리오 3: REVIEW_REQUIRED + isVerified: true -> FAIL 차단 검증
try {
  validateBidState({
    id: 'TEST-003',
    validationStatus: 'APPROVED',
    isVerified: true,
    validation: { status: 'REVIEW_REQUIRED', isVerified: true, verifiedAt: '2026-10-01', verifier: 'ADMIN' }
  });
  console.error('▶ Test 3 FAILED: 차단되지 않음');
  process.exit(1);
} catch (e) {
  console.log('▶ Test 3: REVIEW_REQUIRED + isVerified: true -> ✅ 차단 성공');
}

// 시나리오 4: verifiedAt: null + isVerified: true -> FAIL 차단 검증
try {
  validateBidState({
    id: 'TEST-004',
    validationStatus: 'APPROVED',
    isVerified: true,
    validation: { status: 'APPROVED', isVerified: true, verifiedAt: null, verifier: 'ADMIN' }
  });
  console.error('▶ Test 4 FAILED: 차단되지 않음');
  process.exit(1);
} catch (e) {
  console.log('▶ Test 4: verifiedAt: null + isVerified: true -> ✅ 차단 성공');
}

// 시나리오 5: verifier: null + isVerified: true -> FAIL 차단 검증
try {
  validateBidState({
    id: 'TEST-005',
    validationStatus: 'APPROVED',
    isVerified: true,
    validation: { status: 'APPROVED', isVerified: true, verifiedAt: '2026-10-01', verifier: null }
  });
  console.error('▶ Test 5 FAILED: 차단되지 않음');
  process.exit(1);
} catch (e) {
  console.log('▶ Test 5: verifier: null + isVerified: true -> ✅ 차단 성공');
}

// 시나리오 6: 정상 관리자 승인 완료 공고 -> PASS
try {
  validateBidState({
    id: 'TEST-006',
    validationStatus: 'APPROVED',
    isVerified: true,
    validation: { status: 'APPROVED', isVerified: true, verifiedAt: '2026-10-01T10:00:00Z', verifier: 'CHAIRMAN' }
  });
  console.log('▶ Test 6: 정상 관리자 승인 완료 공고 (APPROVED + verifier 존재) -> ✅ PASS');
} catch (e) {
  console.error('▶ Test 6 FAILED:', e.message);
  process.exit(1);
}

console.log('\n================================================================================');
console.log('🎉 [테스트 완료] 총 6개 시나리오 100% 통과 (상태 모순 방지 검증 완료)');
console.log('================================================================================');
