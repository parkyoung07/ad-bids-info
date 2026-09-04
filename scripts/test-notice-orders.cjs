/**
 * SignBid AI - 공고 차수 처리 (정상, 정정, 취소) 단위 테스트 스위트
 * 
 * [테스트 목적]
 * 1. 최신 차수가 정상(등록) 공고일 때 -> 정상 대표 노출
 * 2. 최신 차수가 정정(변경) 공고일 때 -> 최신 차수 대표 노출 및 이전 차수 이력 보존
 * 3. 최신 차수가 취소 공고일 때 -> 전체 CANCELLED 처리 및 과거 차수 부활 절대 금지
 * 4. 동일 공고번호(bidNtceNo) 중복 노출 차단 검증
 * 5. CANCELLED 공고가 진행 목록에 포함되지 않음을 검증
 */

const assert = require('assert');

// 공고 차수 판정 및 선별 엔진 함수
function processBidOrders(bidsRaw) {
  const groupedByNo = new Map();
  for (const item of bidsRaw) {
    const bidNo = item.bidNtceNo;
    if (!groupedByNo.has(bidNo)) {
      groupedByNo.set(bidNo, []);
    }
    groupedByNo.get(bidNo).push(item);
  }

  const publishedBids = [];
  const cancelledBids = [];

  for (const [bidNo, items] of groupedByNo.entries()) {
    // 차수 오름차순 정렬
    items.sort((a, b) => a.bidOrd.localeCompare(b.bidOrd));

    // 차수 이력 구성
    const orderHistory = items.map(it => {
      const isCancel = it.ntceKindNm.includes('취소') || it.title.includes('취소') || it.cancelNtceYn === 'Y';
      return {
        bidOrd: it.bidOrd,
        noticeKind: it.ntceKindNm,
        noticeDate: it.noticeDate,
        changeReason: it.changeReason || (isCancel ? '공고 취소' : (it.bidOrd === '000' ? '최초 등록' : '내용 변경/정정')),
        isCancelled: isCancel,
        bidKey: `${it.bidNtceNo}-${it.bidOrd}`
      };
    });

    const latestItem = items[items.length - 1];
    const latestHistory = orderHistory[orderHistory.length - 1];

    if (latestHistory.isCancelled) {
      // 최신 차수가 취소공고인 경우: 전체 CANCELLED 처리 (과거 차수 절대 부활 금지)
      cancelledBids.push({
        bidNtceNo: bidNo,
        status: 'CANCELLED',
        cancelledAtOrd: latestHistory.bidOrd,
        orderHistory
      });
      continue;
    }

    // 최신 차수가 정상 또는 정정공고인 경우
    publishedBids.push({
      ...latestItem,
      status: 'PUBLISHED',
      isLatestOrder: true,
      orderHistory
    });
  }

  return { publishedBids, cancelledBids };
}

function runOrderUnitTests() {
  console.log('================================================================================');
  console.log('🧪 [SignBid AI] 정상·정정·취소 공고 차수 처리 단위 테스트 실행');
  console.log('================================================================================');

  let passedTests = 0;

  // [테스트 1] 정상 등록공고 단일 차수 처리
  console.log('\n▶ Test 1: 정상 등록공고 단일 차수 처리');
  const mockNormal = [
    {
      bidNtceNo: 'TEST-NORMAL-001',
      bidOrd: '000',
      ntceKindNm: '등록공고',
      title: '2026년 LED 전광판 설치공사',
      noticeDate: '2026-09-01 10:00:00',
      cancelNtceYn: 'N'
    }
  ];
  const res1 = processBidOrders(mockNormal);
  assert.strictEqual(res1.publishedBids.length, 1, '정상 공고가 1건 노출되어야 합니다.');
  assert.strictEqual(res1.publishedBids[0].bidOrd, '000', '000 차수가 노출되어야 합니다.');
  assert.strictEqual(res1.cancelledBids.length, 0, '취소 목록에 없어야 합니다.');
  console.log('  ✅ [PASS] 정상 등록공고 단일 차수 대표 노출 성공');
  passedTests++;

  // [테스트 2] 등록 -> 정정(변경) 공고 다중 차수 처리
  console.log('\n▶ Test 2: 등록 -> 정정(변경) 공고 다중 차수 처리 및 최신 대표 노출');
  const mockAmendment = [
    {
      bidNtceNo: 'TEST-CHG-002',
      bidOrd: '000',
      ntceKindNm: '등록공고',
      title: '국도변 상징조형물 제작 설치공사',
      noticeDate: '2026-09-01 10:00:00',
      cancelNtceYn: 'N'
    },
    {
      bidNtceNo: 'TEST-CHG-002',
      bidOrd: '001',
      ntceKindNm: '변경공고',
      title: '[변경공고] 국도변 상징조형물 제작 설치공사 (기간 연장)',
      noticeDate: '2026-09-02 15:00:00',
      changeReason: '입찰 참가서류 제출 기간 3일 연장',
      cancelNtceYn: 'N'
    }
  ];
  const res2 = processBidOrders(mockAmendment);
  assert.strictEqual(res2.publishedBids.length, 1, '공고번호당 단 1건만 노출되어야 합니다.');
  assert.strictEqual(res2.publishedBids[0].bidOrd, '001', '최신 정정차수인 001이 노출되어야 합니다.');
  assert.strictEqual(res2.publishedBids[0].orderHistory.length, 2, '모든 차수(000, 001) 이력이 보존되어야 합니다.');
  assert.strictEqual(res2.publishedBids[0].orderHistory[0].noticeKind, '등록공고');
  assert.strictEqual(res2.publishedBids[0].orderHistory[1].noticeKind, '변경공고');
  console.log('  ✅ [PASS] 구 차수(000) 배제, 최신 정정차수(001) 채택 및 전체 이력(2건) 보존 성공');
  passedTests++;

  // [테스트 3] 등록 -> 정정 -> 취소 공고 처리 (과거 차수 부활 방지)
  console.log('\n▶ Test 3: 등록 -> 정정 -> 취소 공고 처리 및 과거 차수 부활 원천 금지');
  const mockCancel = [
    {
      bidNtceNo: 'TEST-CNC-003',
      bidOrd: '000',
      ntceKindNm: '등록공고',
      title: '시민공원 안내판 제작 구매',
      noticeDate: '2026-09-01 10:00:00',
      cancelNtceYn: 'N'
    },
    {
      bidNtceNo: 'TEST-CNC-003',
      bidOrd: '001',
      ntceKindNm: '변경공고',
      title: '[변경] 시민공원 안내판 제작 구매',
      noticeDate: '2026-09-02 11:00:00',
      cancelNtceYn: 'N'
    },
    {
      bidNtceNo: 'TEST-CNC-003',
      bidOrd: '002',
      ntceKindNm: '취소공고',
      title: '[취소공고] 시민공원 안내판 제작 구매',
      noticeDate: '2026-09-03 09:00:00',
      changeReason: '발주기관 사업 계획 취소에 따른 입찰 무효',
      cancelNtceYn: 'Y'
    }
  ];
  const res3 = processBidOrders(mockCancel);
  assert.strictEqual(res3.publishedBids.length, 0, '취소된 공고번호는 진행/공개 목록에 절대 포함되지 않아야 합니다.');
  assert.strictEqual(res3.cancelledBids.length, 1, 'CANCELLED 목록으로 격리되어야 합니다.');
  assert.strictEqual(res3.cancelledBids[0].cancelledAtOrd, '002', '최신 취소 차수가 002여야 합니다.');
  assert.strictEqual(res3.cancelledBids[0].orderHistory.length, 3, '취소 전 000, 001 및 002 전체 이력이 보존되어야 합니다.');
  console.log('  ✅ [PASS] 최신 취소 차수 감지 즉시 전체 CANCELLED 처리, 과거 차수(000, 001) 부활 원천 차단 확인');
  passedTests++;

  // [테스트 4] 동일 공고번호 다중 차수 노출 금지 assertion
  console.log('\n▶ Test 4: 동일 공고번호(bidNtceNo) 다중 차수 동시 노출 금지 검증');
  const allPublished = [...res1.publishedBids, ...res2.publishedBids];
  const seenNos = new Set();
  let hasDuplicate = false;
  for (const b of allPublished) {
    if (seenNos.has(b.bidNtceNo)) {
      hasDuplicate = true;
      break;
    }
    seenNos.add(b.bidNtceNo);
  }
  assert.strictEqual(hasDuplicate, false, '진행 목록에 동일 공고번호가 중복 노출되면 안 됩니다.');
  console.log('  ✅ [PASS] 진행 목록 내 동일 공고번호 중복 노출 0건 검증 통과');
  passedTests++;

  // [테스트 5] CANCELLED 공고가 진행 목록에 포함되지 않음을 교차 검증
  console.log('\n▶ Test 5: CANCELLED 공고의 진행 목록 혼입 금지 검증');
  const cancelledKeys = res3.cancelledBids.map(c => c.bidNtceNo);
  const leakedToPublished = allPublished.filter(p => cancelledKeys.includes(p.bidNtceNo));
  assert.strictEqual(leakedToPublished.length, 0, '취소 공고가 진행 목록에 누출되면 안 됩니다.');
  console.log('  ✅ [PASS] CANCELLED 공고의 진행 목록 혼입 0건 검증 통과');
  passedTests++;

  console.log('================================================================================');
  console.log(`🎉 [단위 테스트 완료] 총 ${passedTests}개 시나리오 100% 통과 (실패 0건)`);
  console.log('================================================================================\n');
}

runOrderUnitTests();
