import fs from 'fs';
import path from 'path';

// 1. .env.local 환경변수 읽기
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const l of lines) {
      const m = l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (m) process.env[m[1]] = (m[2] || '').trim();
    }
  }
}
loadEnv();

const apiKey = process.env.PUBLIC_DATA_API_KEY;
if (!apiKey) {
  console.error('❌ PUBLIC_DATA_API_KEY 환경변수가 필요합니다.');
  process.exit(1);
}
const encKey = encodeURIComponent(apiKey);

// 2. KST 기준 시각 및 최근 7일 조회 기간 (YYYYMMDDHHMM)
const now = new Date();
const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
const past7Days = new Date(kstNow.getTime() - (7 * 24 * 60 * 60 * 1000));

function fmtDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

const bgnDt = `${fmtDate(past7Days)}0000`;
const endDt = `${fmtDate(kstNow)}2359`;
const kstNowIso = kstNow.toISOString().replace('Z', '+09:00');

console.log(`================================================================================`);
console.log(`📡 [SignBid] 2026-09-30 조달청 나라장터 공식 공고 전체 후보 조사`);
console.log(`⏰ 실행 시각(KST): ${kstNowIso}`);
console.log(`📅 조회 기간: ${bgnDt} ~ ${endDt}`);
console.log(`================================================================================`);

// 3. 12개 지정 키워드
const TARGET_KEYWORDS = [
  '간판',
  '표찰',
  '안내판',
  '현수막',
  '배너',
  '인쇄',
  '인쇄물',
  '홍보물',
  '전광판',
  'LED 전광판',
  '사이니지',
  '조형물'
];

// 4. API 페이지별 호출 함수
async function fetchG2BAllPages(endpoint) {
  let pageNo = 1;
  let allItems = [];
  const numOfRows = 999;

  console.log(`▶ 호출 엔드포인트: ${endpoint}`);

  while (true) {
    const url = `https://apis.data.go.kr/1230000/ad/BidPublicInfoService/${endpoint}?serviceKey=${encKey}&numOfRows=${numOfRows}&pageNo=${pageNo}&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}&type=json`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) {
        console.error(`  ❌ HTTP 에러 (page ${pageNo}): ${res.status}`);
        break;
      }
      const data = await res.json();
      const body = data?.response?.body;
      const totalCount = body?.totalCount || 0;
      const items = body?.items || [];
      const arr = Array.isArray(items) ? items : (items ? [items] : []);

      // 각 아이템에 endpoint 정보 태깅
      arr.forEach(it => {
        it._apiEndpoint = endpoint;
      });

      allItems = allItems.concat(arr);
      console.log(`  - Page ${pageNo}: ${arr.length}건 수집 (누적 ${allItems.length} / 총 ${totalCount}건)`);

      if (allItems.length >= totalCount || arr.length === 0 || pageNo >= 10) {
        break;
      }
      pageNo++;
    } catch (err) {
      console.error(`  ❌ 호출 실패 (${endpoint} page ${pageNo}):`, err.message);
      break;
    }
  }

  return allItems;
}

async function runInventory() {
  const endpoints = [
    { name: '용역', op: 'getBidPblancListInfoServc' },
    { name: '물품', op: 'getBidPblancListInfoThng' },
    { name: '공사', op: 'getBidPblancListInfoCnstwk' }
  ];

  let rawAllItems = [];
  for (const ep of endpoints) {
    const items = await fetchG2BAllPages(ep.op);
    items.forEach(it => { it._apiType = ep.name; });
    rawAllItems = rawAllItems.concat(items);
  }

  console.log(`\n================================================================================`);
  console.log(`📊 [1단계] 전체 API 수집 건수: ${rawAllItems.length}건`);

  // 중복 공고 (bidNtceNo + bidNtceOrd 기준)
  const uniqueKeyMap = new Map();
  const noticeNoCountMap = new Map();

  for (const item of rawAllItems) {
    const no = (item.bidNtceNo || '').trim();
    const ord = (item.bidNtceOrd || '').trim();
    const key = `${no}-${ord}`;
    if (!uniqueKeyMap.has(key)) {
      uniqueKeyMap.set(key, item);
    }
    if (no) {
      noticeNoCountMap.set(no, (noticeNoCountMap.get(no) || 0) + 1);
    }
  }

  const uniqueItems = Array.from(uniqueKeyMap.values());
  console.log(`📊 [2단계] 고유 공고 수 (공고번호+차수 기준): ${uniqueItems.length}건`);

  // 12개 키워드 필터링 및 각 단계별 집계
  let keywordPassedCount = 0;
  let deadlineExistsCount = 0;
  let notExpiredCount = 0;
  let notCancelledCount = 0;
  let urlExistsCount = 0;

  const keywordPassedItems = [];
  const finalCandidates = [];
  const rejectedItems = [];

  for (const item of uniqueItems) {
    const no = (item.bidNtceNo || '').trim();
    const ord = (item.bidNtceOrd || '').trim();
    const title = (item.bidNtceNm || '').trim();
    const instt = (item.dminsttNm || item.ntceInsttNm || '').trim();
    const url = (item.bidNtceDtlUrl || '').trim();
    const closeDtStr = (item.bidClseDt || '').trim();
    const ntceDtStr = (item.bidNtceDt || '').trim();
    const kind = (item.ntceKindNm || '').trim();

    // 1) 12개 키워드 매칭
    const matchedKws = TARGET_KEYWORDS.filter(kw => title.includes(kw));
    if (matchedKws.length === 0) {
      continue;
    }

    keywordPassedCount++;
    keywordPassedItems.push(item);

    // 제외 사유 추적
    // A. 마감일 null 여부
    if (!closeDtStr) {
      rejectedItems.push({
        no, ord, title, instt, ntceDtStr, closeDtStr,
        reason: '마감일 null',
        apiType: item._apiType,
        endpoint: item._apiEndpoint,
        url
      });
      continue;
    }
    deadlineExistsCount++;

    // B. 마감 시각 경과 여부 (KST 기준)
    const closeDate = new Date(closeDtStr.replace(/-/g, '/'));
    if (isNaN(closeDate.getTime()) || closeDate <= kstNow) {
      rejectedItems.push({
        no, ord, title, instt, ntceDtStr, closeDtStr,
        reason: '이미 마감',
        apiType: item._apiType,
        endpoint: item._apiEndpoint,
        url
      });
      continue;
    }
    notExpiredCount++;

    // C. 취소공고 여부
    if (kind === '취소공고' || title.includes('취소공고')) {
      rejectedItems.push({
        no, ord, title, instt, ntceDtStr, closeDtStr,
        reason: '취소공고',
        apiType: item._apiType,
        endpoint: item._apiEndpoint,
        url
      });
      continue;
    }
    notCancelledCount++;

    // D. 공식 URL 존재 및 유효성
    if (!url || !url.startsWith('https://') || !url.includes(no)) {
      rejectedItems.push({
        no, ord, title, instt, ntceDtStr, closeDtStr,
        reason: '공식 URL 없음 또는 불일치',
        apiType: item._apiType,
        endpoint: item._apiEndpoint,
        url
      });
      continue;
    }
    urlExistsCount++;

    // E. 기관명 존재 여부
    if (!instt) {
      rejectedItems.push({
        no, ord, title, instt, ntceDtStr, closeDtStr,
        reason: '기관 없음',
        apiType: item._apiType,
        endpoint: item._apiEndpoint,
        url
      });
      continue;
    }

    // F. 제목 존재 여부
    if (!title) {
      rejectedItems.push({
        no, ord, title, instt, ntceDtStr, closeDtStr,
        reason: '제목 없음',
        apiType: item._apiType,
        endpoint: item._apiEndpoint,
        url
      });
      continue;
    }

    // G. 최근 7일 이내 등록 여부
    if (ntceDtStr) {
      const ntceDate = new Date(ntceDtStr.replace(/-/g, '/'));
      if (!isNaN(ntceDate.getTime()) && ntceDate < past7Days) {
        rejectedItems.push({
          no, ord, title, instt, ntceDtStr, closeDtStr,
          reason: '최근 7일 초과',
          apiType: item._apiType,
          endpoint: item._apiEndpoint,
          url
        });
        continue;
      }
    }

    // 주 키워드 및 보조 키워드 구분
    const primaryKw = matchedKws[0];
    const secondaryKws = matchedKws.slice(1);

    // 다중 차수 여부 확인
    const isMultiOrd = (noticeNoCountMap.get(no) || 0) > 1;

    finalCandidates.push({
      bidNtceNo: no,
      bidNtceOrd: ord,
      bidNtceNm: title,
      ntceInsttNm: item.ntceInsttNm ? item.ntceInsttNm.trim() : null,
      dminsttNm: item.dminsttNm ? item.dminsttNm.trim() : null,
      client: instt,
      bidNtceDt: ntceDtStr || null,
      bidClseDt: closeDtStr || null,
      asignBdgtAmt: item.asignBdgtAmt ? item.asignBdgtAmt.trim() : null,
      presmptPrce: item.presmptPrce ? item.presmptPrce.trim() : null,
      cntrctCnclsMthdNm: item.cntrctCnclsMthdNm ? item.cntrctCnclsMthdNm.trim() : null,
      bidNtceDtlUrl: url,
      ntceKindNm: kind || '등록공고',
      apiEndpoint: item._apiEndpoint,
      apiType: item._apiType,
      primaryKeyword: primaryKw,
      secondaryKeywords: secondaryKws,
      matchedKeywords: matchedKws,
      isMultiOrd: isMultiOrd,
      collectedAtKST: kstNowIso
    });
  }

  // 마감일(bidClseDt) 빠른 순서대로 정렬
  finalCandidates.sort((a, b) => {
    const da = new Date((a.bidClseDt || '').replace(/-/g, '/')).getTime() || 0;
    const db = new Date((b.bidClseDt || '').replace(/-/g, '/')).getTime() || 0;
    return da - db;
  });

  // 기존 Staging에 표시 중인 5건 ID 확인
  const stagingIds = [
    'R26BK01750803-000',
    'R26BK01750559-000',
    'R26BK01743676-000',
    'R26BK01750219-000',
    'R26BK01750143-000'
  ];

  const existingStagingCount = finalCandidates.filter(b => stagingIds.includes(`${b.bidNtceNo}-${b.bidNtceOrd}`)).length;
  const additionalCandidatesCount = finalCandidates.length - existingStagingCount;

  // 분야별 집계 (10대 카테고리 기준)
  const categoryKeys = [
    '간판',
    '표찰',
    '안내판',
    '현수막',
    '배너',
    '인쇄·인쇄물',
    '홍보물',
    '전광판·LED 전광판',
    '사이니지',
    '조형물'
  ];

  const categoryStats = {};
  categoryKeys.forEach(k => { categoryStats[k] = 0; });

  for (const c of finalCandidates) {
    const title = c.bidNtceNm;
    if (title.includes('간판')) categoryStats['간판']++;
    if (title.includes('표찰')) categoryStats['표찰']++;
    if (title.includes('안내판')) categoryStats['안내판']++;
    if (title.includes('현수막')) categoryStats['현수막']++;
    if (title.includes('배너')) categoryStats['배너']++;
    if (title.includes('인쇄') || title.includes('인쇄물')) categoryStats['인쇄·인쇄물']++;
    if (title.includes('홍보물')) categoryStats['홍보물']++;
    if (title.includes('전광판') || title.includes('LED 전광판')) categoryStats['전광판·LED 전광판']++;
    if (title.includes('사이니지')) categoryStats['사이니지']++;
    if (title.includes('조형물')) categoryStats['조형물']++;
  }

  // 제외 사유별 집계
  const rejectedReasons = [
    '마감일 null',
    '이미 마감',
    '취소공고',
    '공식 URL 없음 또는 불일치',
    '기관 없음',
    '제목 없음',
    '최근 7일 초과',
    '기타'
  ];

  const rejectedStats = {};
  rejectedReasons.forEach(r => { rejectedStats[r] = 0; });

  for (const r of rejectedItems) {
    const reasonKey = rejectedReasons.includes(r.reason) ? r.reason : '기타';
    rejectedStats[reasonKey] = (rejectedStats[reasonKey] || 0) + 1;
  }

  // 다중 차수 공고 추출
  const multiOrdCandidates = finalCandidates.filter(b => b.isMultiOrd);

  // 최종 결과 객체 구성
  const inventoryReport = {
    metadata: {
      executedAtKST: kstNowIso,
      period: { bgnDt, endDt },
      endpoints: endpoints.map(e => e.op),
      totalApiCount: rawAllItems.length,
      uniqueNoticeCount: uniqueItems.length
    },
    funnelSummary: {
      totalApiCount: rawAllItems.length,
      keywordPassedCount: keywordPassedCount,
      deadlineExistsCount: deadlineExistsCount,
      notExpiredCount: notExpiredCount,
      notCancelledCount: notCancelledCount,
      urlExistsCount: urlExistsCount,
      finalCandidatesCount: finalCandidates.length,
      existingStagingCount: existingStagingCount,
      additionalCandidatesCount: additionalCandidatesCount
    },
    categoryStats: categoryStats,
    rejectedStats: rejectedStats,
    finalCandidates: finalCandidates,
    multiOrdCandidates: multiOrdCandidates,
    rejectedItemsSample: rejectedItems.slice(0, 30)
  };

  // 비공개 파일 저장 (data/simple-candidate-inventory-2026-09-30.json)
  const outputPath = path.resolve(process.cwd(), 'data/simple-candidate-inventory-2026-09-30.json');
  fs.writeFileSync(outputPath, JSON.stringify(inventoryReport, null, 2), 'utf8');

  console.log(`\n================================================================================`);
  console.log(`🎉 [조사 완료] 결과 저장: ${outputPath}`);
  console.log(`📊 전체 후보 수: ${finalCandidates.length}건 (기존 Staging 5건 + 추가 후보 ${additionalCandidatesCount}건)`);
  console.log(`================================================================================`);
}

runInventory().catch(err => {
  console.error('❌ 조사 실행 중 오류:', err);
  process.exit(1);
});
