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
console.log(`📡 [SignBid] 2026-09-30 조달청 나라장터 확장 4대 분야 전수 조사 및 단건 재조회`);
console.log(`⏰ 실행 시각(KST): ${kstNowIso}`);
console.log(`📅 조회 기간: ${bgnDt} ~ ${endDt}`);
console.log(`================================================================================`);

// 3. 4대 대분류 키워드 정의
const CATEGORY_KEYWORDS = {
  '제작·시공': [
    '간판', '표찰', '안내판', '현수막', '배너',
    '전광판', 'LED 전광판', 'LED전광판', '사이니지', '조형물'
  ],
  '인쇄·출판': [
    '인쇄', '인쇄물', '홍보물', '책자', '보고서', '편집', '출판',
    '리플릿', '리플렛', '카탈로그', '카달로그', '포스터',
    '브로슈어', '브로셔', '팸플릿', '팜플렛', '전단지'
  ],
  '출력·인쇄 장비': [
    '인쇄기', '디지털인쇄기', '디지털 인쇄기', '컬러인쇄기', '컬러 인쇄기',
    '잉크젯 인쇄기', '잉크젯인쇄기', '풀로터리인쇄기', '풀로터리 인쇄기',
    '옵셋인쇄기', '옵셋 인쇄기', '윤전기',
    '실사출력기', '실사 출력기', '대형출력기', '대형 출력기',
    '대형프린터', '대형 프린터', 'UV프린터', 'UV 프린터',
    '라텍스프린터', '라텍스 프린터', '플로터', '커팅플로터', '커팅 플로터',
    '재단기', '코팅기', '라미네이터'
  ],
  '출력소재·잉크': [
    '실사출력용', '실사 출력용', '출력용 잉크', '출력용잉크',
    '인쇄용 잉크', '인쇄용잉크', 'UV 잉크', 'UV잉크',
    '솔벤트 잉크', '솔벤트잉크', '에코솔벤트 잉크', '에코솔벤트잉크',
    '라텍스 잉크', '라텍스잉크', '안료 잉크', '안료잉크',
    '염료 잉크', '염료잉크', '잉크 카트리지', '잉크카트리지',
    '배너원단', '배너 원단', '현수막원단', '현수막 원단',
    '출력원단', '출력 원단', '점착시트', '점착 시트',
    '광고용 시트', '광고용시트', '시트지', '인쇄용지', '출력용지',
    '라미네이팅 필름', '라미네이팅필름', '코팅필름', '보호필름',
    '전사지', '합성지', '백릿필름', '백릿 필름', '캔버스 원단', '캔버스원단'
  ]
};

// 프린터 복합 조건 검사 함수
function checkPrinterCompound(title) {
  if (!title.includes('프린터')) return false;
  // 일반 사무용 복합기/가정용 제외
  if (title.includes('사무용') || title.includes('가정용') || title.includes('복합기')) return false;
  const qualifiers = ['대형', '산업용', '실사', 'UV', '라텍스', '솔벤트', '인쇄', '출력', '플로터'];
  return qualifiers.some(q => title.includes(q));
}

// 제목 기반 4대 분야 매칭 함수
function matchCategories(title) {
  const matched = {
    '출력·인쇄 장비': [],
    '출력소재·잉크': [],
    '제작·시공': [],
    '인쇄·출판': []
  };

  // 장비 매칭
  for (const kw of CATEGORY_KEYWORDS['출력·인쇄 장비']) {
    if (title.includes(kw)) matched['출력·인쇄 장비'].push(kw);
  }
  if (checkPrinterCompound(title)) {
    matched['출력·인쇄 장비'].push('특수프린터');
  }

  // 소재·잉크 매칭
  for (const kw of CATEGORY_KEYWORDS['출력소재·잉크']) {
    if (title.includes(kw)) matched['출력소재·잉크'].push(kw);
  }

  // 제작·시공 매칭
  for (const kw of CATEGORY_KEYWORDS['제작·시공']) {
    if (title.includes(kw)) matched['제작·시공'].push(kw);
  }

  // 인쇄·출판 매칭
  for (const kw of CATEGORY_KEYWORDS['인쇄·출판']) {
    if (title.includes(kw)) matched['인쇄·출판'].push(kw);
  }

  // 우선순위 결정: 장비 > 소재 > 제작시공 > 인쇄출판
  let primaryCategory = null;
  let primaryKeyword = null;
  let allKeywords = [];

  if (matched['출력·인쇄 장비'].length > 0) {
    primaryCategory = '출력·인쇄 장비';
    primaryKeyword = matched['출력·인쇄 장비'][0];
  } else if (matched['출력소재·잉크'].length > 0) {
    primaryCategory = '출력소재·잉크';
    primaryKeyword = matched['출력소재·잉크'][0];
  } else if (matched['제작·시공'].length > 0) {
    primaryCategory = '제작·시공';
    primaryKeyword = matched['제작·시공'][0];
  } else if (matched['인쇄·출판'].length > 0) {
    primaryCategory = '인쇄·출판';
    primaryKeyword = matched['인쇄·출판'][0];
  }

  Object.values(matched).forEach(arr => {
    allKeywords = allKeywords.concat(arr);
  });

  return {
    isMatched: primaryCategory !== null,
    primaryCategory,
    primaryKeyword,
    allKeywords,
    matchedDetail: matched
  };
}

// 4. API 목록 수집 함수
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

// 5. 단건 재조회 함수 (inqryDiv=2)
async function fetchG2BSingle(no, ord, endpoint) {
  const url = `https://apis.data.go.kr/1230000/ad/BidPublicInfoService/${endpoint}?serviceKey=${encKey}&numOfRows=10&pageNo=1&type=json&inqryDiv=2&bidNtceNo=${no}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.response?.body?.items;
    if (!items) return null;
    const arr = Array.isArray(items) ? items : [items];
    const exact = arr.find(it => it.bidNtceNo === no && it.bidNtceOrd === ord);
    return exact || arr.find(it => it.bidNtceNo === no) || null;
  } catch (err) {
    return null;
  }
}

async function main() {
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
  console.log(`📊 [전체 API 수집] ${rawAllItems.length}건`);

  // 고유 공고 맵
  const uniqueKeyMap = new Map();
  for (const item of rawAllItems) {
    const key = `${item.bidNtceNo}-${item.bidNtceOrd}`;
    if (!uniqueKeyMap.has(key)) {
      uniqueKeyMap.set(key, item);
    }
  }
  const uniqueItems = Array.from(uniqueKeyMap.values());
  console.log(`📊 [고유 공고 (공고번호+차수)] ${uniqueItems.length}건`);

  // 키워드별 분류 카운트
  let existingKwCount = 0; // 기존 12개 키워드 매칭 수
  let equipKwCount = 0;    // 장비 키워드 추가 매칭 수
  let matKwCount = 0;      // 소재 키워드 추가 매칭 수

  const keywordPassedCandidates = [];
  const rejectedItems = [];

  // 마감일 충돌 격리 대상 공고
  const KNOWN_CONFLICT_BIDS = ['R26BK01733924-000'];

  for (const item of uniqueItems) {
    const no = (item.bidNtceNo || '').trim();
    const ord = (item.bidNtceOrd || '').trim();
    const title = (item.bidNtceNm || '').trim();
    const instt = (item.dminsttNm || item.ntceInsttNm || '').trim();
    const url = (item.bidNtceDtlUrl || '').trim();
    const closeDtStr = (item.bidClseDt || '').trim();
    const ntceDtStr = (item.bidNtceDt || '').trim();
    const kind = (item.ntceKindNm || '').trim();
    const bidKey = `${no}-${ord}`;

    // 4대 대분류 키워드 매칭
    const catMatch = matchCategories(title);
    if (!catMatch.isMatched) {
      continue;
    }

    // 키워드 집계
    const isExistingKw = catMatch.matchedDetail['제작·시공'].length > 0 ||
      catMatch.matchedDetail['인쇄·출판'].some(k => ['인쇄', '인쇄물', '홍보물'].includes(k));
    const isEquipKw = catMatch.matchedDetail['출력·인쇄 장비'].length > 0;
    const isMatKw = catMatch.matchedDetail['출력소재·잉크'].length > 0;

    if (isExistingKw) existingKwCount++;
    if (isEquipKw) equipKwCount++;
    if (isMatKw) matKwCount++;

    // 1) 마감일 충돌 격리 공고 (R26BK01733924-000 등)
    if (KNOWN_CONFLICT_BIDS.includes(bidKey)) {
      rejectedItems.push({
        bidKey, no, ord, title, instt, ntceDtStr, closeDtStr,
        reason: '마감일 충돌 (DATA_CONFLICT 격리: 외부 대조 결과와 목록 마감일시 불일치)',
        apiType: item._apiType, endpoint: item._apiEndpoint, url
      });
      continue;
    }

    // 2) 취소공고 제외
    if (kind === '취소공고' || title.includes('취소공고')) {
      rejectedItems.push({
        bidKey, no, ord, title, instt, ntceDtStr, closeDtStr,
        reason: '취소공고',
        apiType: item._apiType, endpoint: item._apiEndpoint, url
      });
      continue;
    }

    // 3) 마감일 null 제외
    if (!closeDtStr) {
      rejectedItems.push({
        bidKey, no, ord, title, instt, ntceDtStr, closeDtStr,
        reason: '마감일 null',
        apiType: item._apiType, endpoint: item._apiEndpoint, url
      });
      continue;
    }

    // 4) 이미 마감 제외 (KST 기준)
    const closeDate = new Date(closeDtStr.replace(/-/g, '/'));
    if (isNaN(closeDate.getTime()) || closeDate <= kstNow) {
      rejectedItems.push({
        bidKey, no, ord, title, instt, ntceDtStr, closeDtStr,
        reason: `이미 마감 (${closeDtStr} <= ${kstNowIso.slice(0, 19)})`,
        apiType: item._apiType, endpoint: item._apiEndpoint, url
      });
      continue;
    }

    // 5) 필수 식별자 및 URL 유효성
    if (!no || !ord || !title || !instt || !url || !url.startsWith('https://') || !url.includes(no)) {
      rejectedItems.push({
        bidKey, no, ord, title, instt, ntceDtStr, closeDtStr,
        reason: '식별자/기관/공식URL 누락 또는 파라미터 불일치',
        apiType: item._apiType, endpoint: item._apiEndpoint, url
      });
      continue;
    }

    // 6) 최근 7일 이내 등록 여부
    if (ntceDtStr) {
      const ntceDate = new Date(ntceDtStr.replace(/-/g, '/'));
      if (!isNaN(ntceDate.getTime()) && ntceDate < past7Days) {
        rejectedItems.push({
          bidKey, no, ord, title, instt, ntceDtStr, closeDtStr,
          reason: `최근 7일 초과 (${ntceDtStr})`,
          apiType: item._apiType, endpoint: item._apiEndpoint, url
        });
        continue;
      }
    }

    keywordPassedCandidates.push({
      item,
      catMatch,
      bidKey,
      no, ord, title, instt, closeDtStr, ntceDtStr, url, kind
    });
  }

  console.log(`\n================================================================================`);
  console.log(`📊 [마감 전 1차 통과 후보 수] ${keywordPassedCandidates.length}건`);
  console.log(`================================================================================`);
  console.log(`▶ 1차 통과 후보에 대해 조달청 공식 OpenAPI 단건 재조회(inqryDiv=2) 실행 중...`);

  // 6. 단건 재조회 (inqryDiv=2) 대조
  const finalVerifiedCandidates = [];

  for (let i = 0; i < keywordPassedCandidates.length; i++) {
    const cand = keywordPassedCandidates[i];
    const singleData = await fetchG2BSingle(cand.no, cand.ord, cand.item._apiEndpoint);

    if (!singleData) {
      rejectedItems.push({
        bidKey: cand.bidKey, no: cand.no, ord: cand.ord, title: cand.title, instt: cand.instt,
        reason: '단건 재조회(inqryDiv=2) 결과 없음 (조회 실패)',
        apiType: cand.item._apiType, endpoint: cand.item._apiEndpoint, url: cand.url
      });
      console.log(`  ❌ [${i + 1}/${keywordPassedCandidates.length}] ${cand.bidKey}: 단건 재조회 실패`);
      continue;
    }

    // 10대 필드 대조
    const sTitle = (singleData.bidNtceNm || '').trim();
    const sInstt = (singleData.dminsttNm || singleData.ntceInsttNm || '').trim();
    const sNo = (singleData.bidNtceNo || '').trim();
    const sOrd = (singleData.bidNtceOrd || '').trim();
    const sCloseDt = (singleData.bidClseDt || '').trim();
    const sNtceDt = (singleData.bidNtceDt || '').trim();
    const sKind = (singleData.ntceKindNm || '').trim();
    const sUrl = (singleData.bidNtceDtlUrl || '').trim();
    const sAsign = singleData.asignBdgtAmt ? singleData.asignBdgtAmt.trim() : null;
    const sPresmpt = singleData.presmptPrce ? singleData.presmptPrce.trim() : null;
    const sContract = singleData.cntrctCnclsMthdNm ? singleData.cntrctCnclsMthdNm.trim() : null;

    // 대조 검증
    const isTitleMatch = sTitle === cand.title;
    const isInsttMatch = sInstt === cand.instt;
    const isNoMatch = sNo === cand.no && sOrd === cand.ord;
    const isCloseDtMatch = sCloseDt === cand.closeDtStr;
    const isKindNotCancelled = sKind !== '취소공고' && !sTitle.includes('취소공고');

    // 마감 시각 재확인
    const sCloseDate = new Date(sCloseDt.replace(/-/g, '/'));
    const isStillActive = !isNaN(sCloseDate.getTime()) && sCloseDate > kstNow;

    if (!isTitleMatch || !isInsttMatch || !isNoMatch || !isCloseDtMatch || !isKindNotCancelled || !isStillActive) {
      rejectedItems.push({
        bidKey: cand.bidKey, no: cand.no, ord: cand.ord, title: cand.title, instt: cand.instt,
        reason: `단건 재조회 값 불일치 또는 취소/마감 감지 (제목일치:${isTitleMatch}, 기관일치:${isInsttMatch}, 마감일일치:${isCloseDtMatch}, 취소여부:${isKindNotCancelled}, 활성여부:${isStillActive})`,
        apiType: cand.item._apiType, endpoint: cand.item._apiEndpoint, url: cand.url
      });
      console.log(`  ❌ [${i + 1}/${keywordPassedCandidates.length}] ${cand.bidKey}: 단건 재조회 불일치로 제외`);
      continue;
    }

    console.log(`  ✅ [${i + 1}/${keywordPassedCandidates.length}] ${cand.bidKey}: 단건 재조회 100% 일치 통과 [${cand.catMatch.primaryCategory}]`);

    finalVerifiedCandidates.push({
      category: cand.catMatch.primaryCategory,
      bidNtceNo: cand.no,
      bidNtceOrd: cand.ord,
      bidKey: cand.bidKey,
      bidNtceNm: cand.title,
      ntceInsttNm: singleData.ntceInsttNm ? singleData.ntceInsttNm.trim() : null,
      dminsttNm: singleData.dminsttNm ? singleData.dminsttNm.trim() : null,
      client: cand.instt,
      bidNtceDt: sNtceDt,
      bidClseDt: sCloseDt,
      asignBdgtAmt: sAsign,
      presmptPrce: sPresmpt,
      cntrctCnclsMthdNm: sContract,
      bidNtceDtlUrl: sUrl || cand.url,
      ntceKindNm: sKind || '등록공고',
      primaryKeyword: cand.catMatch.primaryKeyword,
      allMatchedKeywords: cand.catMatch.allKeywords,
      apiEndpoint: cand.item._apiEndpoint,
      apiType: cand.item._apiType,
      collectedAtKST: kstNowIso,
      singleVerifiedAtKST: new Date().toISOString()
    });
  }

  // 마감일(bidClseDt) 빠른 순서대로 정렬
  finalVerifiedCandidates.sort((a, b) => {
    const da = new Date((a.bidClseDt || '').replace(/-/g, '/')).getTime() || 0;
    const db = new Date((b.bidClseDt || '').replace(/-/g, '/')).getTime() || 0;
    return da - db;
  });

  // 분야별 통계
  const categoryFinalStats = {
    '제작·시공': finalVerifiedCandidates.filter(b => b.category === '제작·시공').length,
    '인쇄·출판': finalVerifiedCandidates.filter(b => b.category === '인쇄·출판').length,
    '출력·인쇄 장비': finalVerifiedCandidates.filter(b => b.category === '출력·인쇄 장비').length,
    '출력소재·잉크': finalVerifiedCandidates.filter(b => b.category === '출력소재·잉크').length
  };

  // 제외 사유별 통계
  const rejectedStats = {};
  rejectedItems.forEach(r => {
    const reasonPrefix = r.reason.split('(')[0].trim();
    rejectedStats[reasonPrefix] = (rejectedStats[reasonPrefix] || 0) + 1;
  });

  // 최종 결과 JSON 객체 구성
  const fullReport = {
    metadata: {
      executedAtKST: kstNowIso,
      period: { bgnDt, endDt },
      endpoints: endpoints.map(e => e.op),
      totalApiCount: rawAllItems.length,
      uniqueCount: uniqueItems.length
    },
    funnelSummary: {
      totalApiCount: rawAllItems.length,
      existingKwCandidatesCount: existingKwCount,
      equipKwCandidatesCount: equipKwCount,
      materialKwCandidatesCount: matKwCount,
      activeBeforeSingleCheckCount: keywordPassedCandidates.length,
      singleCheckPassedCount: finalVerifiedCandidates.length,
      finalTotalCandidatesCount: finalVerifiedCandidates.length
    },
    categoryFinalStats,
    rejectedStats,
    finalVerifiedCandidates,
    rejectedItems
  };

  // 비공개 파일 저장 (data/simple-candidate-inventory-2026-09-30-v2.json)
  const outputPath = path.resolve(process.cwd(), 'data/simple-candidate-inventory-2026-09-30-v2.json');
  fs.writeFileSync(outputPath, JSON.stringify(fullReport, null, 2), 'utf8');

  console.log(`\n================================================================================`);
  console.log(`🎉 [확장 조사 및 단건 재조회 완료]`);
  console.log(`📁 비공개 결과 저장: ${outputPath}`);
  console.log(`📊 최종 검증 완료 후보 수: 총 ${finalVerifiedCandidates.length}건`);
  console.log(`  - 제작·시공: ${categoryFinalStats['제작·시공']}건`);
  console.log(`  - 인쇄·출판: ${categoryFinalStats['인쇄·출판']}건`);
  console.log(`  - 출력·인쇄 장비: ${categoryFinalStats['출력·인쇄 장비']}건`);
  console.log(`  - 출력소재·잉크: ${categoryFinalStats['출력소재·잉크']}건`);
  console.log(`================================================================================`);
}

main().catch(err => {
  console.error('❌ 실행 중 치명적 오류:', err);
  process.exit(1);
});
