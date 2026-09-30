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

// 2. KST 기준 시각 및 최근 7일 조회 기간
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
console.log(`📡 [SignBid] 조달청 나라장터 공식 18건 후보 정밀 추출 및 Staging 반영`);
console.log(`⏰ 실행 시각(KST): ${kstNowIso}`);
console.log(`================================================================================`);

// 3. 정밀 키워드 매칭 규칙
const EDIT_PHRASES = [
  '편집 디자인', '편집디자인', '편집·디자인', '편집 및 디자인',
  '편집·인쇄', '편집 및 인쇄', '편집 용역', '편집제작', '편집 제작'
];

const CATALOG_QUALIFIERS = ['제작', '인쇄', '디자인', '편집', '홍보물', '발간'];

function checkCatalogCompound(title) {
  if (!title.includes('카탈로그') && !title.includes('카달로그')) return false;
  return CATALOG_QUALIFIERS.some(q => title.includes(q));
}

function checkEditCompound(title) {
  if (title.includes('우편집중국')) return false;
  return EDIT_PHRASES.some(phrase => title.includes(phrase));
}

function checkPrinterCompound(title) {
  if (!title.includes('프린터')) return false;
  if (title.includes('사무용') || title.includes('가정용') || title.includes('복합기') || title.includes('3D') || title.includes('3차원')) return false;
  const qualifiers = ['대형', '산업용', '실사', 'UV', '라텍스', '솔벤트', '인쇄', '출력', '플로터'];
  return qualifiers.some(q => title.includes(q));
}

const BASE_KEYWORDS = {
  '제작·시공': [
    '간판', '표찰', '안내판', '현수막', '배너',
    '전광판', 'LED 전광판', 'LED전광판', '사이니지', '조형물'
  ],
  '인쇄·출판': [
    '인쇄', '인쇄물', '홍보물', '책자', '보고서', '출판',
    '리플릿', '리플렛', '포스터', '브로슈어', '브로셔', '팸플릿', '팜플렛', '전단지'
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

function matchCategoryExact(title) {
  const matched = {
    '출력·인쇄 장비': [],
    '출력소재·잉크': [],
    '제작·시공': [],
    '인쇄·출판': []
  };

  // 장비 검사
  for (const kw of BASE_KEYWORDS['출력·인쇄 장비']) {
    if (title.includes(kw)) matched['출력·인쇄 장비'].push(kw);
  }
  if (checkPrinterCompound(title)) {
    matched['출력·인쇄 장비'].push('특수프린터');
  }

  // 소재 검사
  for (const kw of BASE_KEYWORDS['출력소재·잉크']) {
    if (title.includes(kw)) matched['출력소재·잉크'].push(kw);
  }

  // 제작시공 검사
  for (const kw of BASE_KEYWORDS['제작·시공']) {
    if (title.includes(kw)) matched['제작·시공'].push(kw);
  }

  // 인쇄출판 검사
  for (const kw of BASE_KEYWORDS['인쇄·출판']) {
    if (title.includes(kw)) matched['인쇄·출판'].push(kw);
  }
  if (checkCatalogCompound(title)) {
    matched['인쇄·출판'].push('카탈로그(제작/인쇄)');
  }
  if (checkEditCompound(title)) {
    matched['인쇄·출판'].push('편집디자인/인쇄');
  }

  // 우선순위: 장비 > 소재 > 제작시공 > 인쇄출판
  let primaryCategory = null;
  let primaryKeyword = null;

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

  const allKeywords = [];
  Object.values(matched).forEach(arr => {
    arr.forEach(k => { if (!allKeywords.includes(k)) allKeywords.push(k); });
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

  while (true) {
    const url = `https://apis.data.go.kr/1230000/ad/BidPublicInfoService/${endpoint}?serviceKey=${encKey}&numOfRows=${numOfRows}&pageNo=${pageNo}&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}&type=json`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) break;
      const data = await res.json();
      const body = data?.response?.body;
      const totalCount = body?.totalCount || 0;
      const items = body?.items || [];
      const arr = Array.isArray(items) ? items : (items ? [items] : []);

      arr.forEach(it => { it._apiEndpoint = endpoint; });
      allItems = allItems.concat(arr);

      if (allItems.length >= totalCount || arr.length === 0 || pageNo >= 10) break;
      pageNo++;
    } catch (err) {
      break;
    }
  }

  return allItems;
}

// 5. 단건 재조회 함수
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

  // 고유 공고 맵
  const uniqueKeyMap = new Map();
  for (const item of rawAllItems) {
    const key = `${item.bidNtceNo}-${item.bidNtceOrd}`;
    if (!uniqueKeyMap.has(key)) {
      uniqueKeyMap.set(key, item);
    }
  }
  const uniqueItems = Array.from(uniqueKeyMap.values());

  const KNOWN_CONFLICT_BIDS = ['R26BK01733924-000'];
  const EXCLUDED_MISCLASSIFIED = ['R26BK01746507-000', 'R26BK01745360-000', 'R26BK01736879-000'];

  const candidatePool = [];
  const rejectedList = [];

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

    // 마감일 충돌 공고 제외
    if (KNOWN_CONFLICT_BIDS.includes(bidKey)) {
      rejectedList.push({ bidKey, title, reason: '마감일 충돌 (DATA_CONFLICT 격리)' });
      continue;
    }

    // 명시적 오분류 3건 제외
    if (EXCLUDED_MISCLASSIFIED.includes(bidKey)) {
      rejectedList.push({ bidKey, title, reason: '키워드 오분류 (차량임차 카탈로그 또는 우편집중국)' });
      continue;
    }

    // 정밀 4대 분야 매칭
    const match = matchCategoryExact(title);
    if (!match.isMatched) {
      continue;
    }

    // 취소공고 제외
    if (kind === '취소공고' || title.includes('취소공고')) {
      rejectedList.push({ bidKey, title, reason: '취소공고' });
      continue;
    }

    // 마감일 null 제외
    if (!closeDtStr) {
      rejectedList.push({ bidKey, title, reason: '마감일 null' });
      continue;
    }

    // 실시간 마감 시각 검사
    const closeDate = new Date(closeDtStr.replace(/-/g, '/'));
    if (isNaN(closeDate.getTime()) || closeDate <= kstNow) {
      rejectedList.push({ bidKey, title, reason: `마감일 경과 (${closeDtStr})` });
      continue;
    }

    // 필수 식별자 및 URL 유효성
    if (!no || !ord || !title || !instt || !url || !url.startsWith('https://') || !url.includes(no)) {
      rejectedList.push({ bidKey, title, reason: '필수 필드 또는 공식 URL 불일치' });
      continue;
    }

    // 최근 7일 초과 제외
    if (ntceDtStr) {
      const ntceDate = new Date(ntceDtStr.replace(/-/g, '/'));
      if (!isNaN(ntceDate.getTime()) && ntceDate < past7Days) {
        rejectedList.push({ bidKey, title, reason: `등록일 7일 초과 (${ntceDtStr})` });
        continue;
      }
    }

    candidatePool.push({
      item,
      match,
      bidKey, no, ord, title, instt, closeDtStr, ntceDtStr, url, kind
    });
  }

  console.log(`📊 [1차 필터 통과 후보 수] ${candidatePool.length}건`);
  console.log(`▶ 조달청 OpenAPI 단건 재조회(inqryDiv=2) 1:1 대조 시작...`);

  const finalStagingBids = [];

  for (let i = 0; i < candidatePool.length; i++) {
    const cand = candidatePool[i];
    const single = await fetchG2BSingle(cand.no, cand.ord, cand.item._apiEndpoint);

    if (!single) {
      rejectedList.push({ bidKey: cand.bidKey, title: cand.title, reason: '단건 재조회 실패' });
      continue;
    }

    const sTitle = (single.bidNtceNm || '').trim();
    const sInstt = (single.dminsttNm || single.ntceInsttNm || '').trim();
    const sNo = (single.bidNtceNo || '').trim();
    const sOrd = (single.bidNtceOrd || '').trim();
    const sCloseDt = (single.bidClseDt || '').trim();
    const sNtceDt = (single.bidNtceDt || '').trim();
    const sKind = (single.ntceKindNm || '').trim();
    const sUrl = (single.bidNtceDtlUrl || '').trim();
    const sAsign = single.asignBdgtAmt ? single.asignBdgtAmt.trim() : null;
    const sPresmpt = single.presmptPrce ? single.presmptPrce.trim() : null;
    const sContract = single.cntrctCnclsMthdNm ? single.cntrctCnclsMthdNm.trim() : null;

    if (sTitle !== cand.title || sInstt !== cand.instt || sNo !== cand.no || sOrd !== cand.ord || sCloseDt !== cand.closeDtStr || sKind === '취소공고') {
      rejectedList.push({ bidKey: cand.bidKey, title: cand.title, reason: '단건 재조회 값 불일치' });
      continue;
    }

    const budgetNum = sAsign ? Number(sAsign) : (sPresmpt ? Number(sPresmpt) : null);

    finalStagingBids.push({
      id: `${cand.no}-${cand.ord}`,
      bidNtceNo: cand.no,
      bidNtceOrd: cand.ord,
      bidNtceNm: cand.title,
      title: cand.title,
      officialTitle: cand.title,
      ntceInsttNm: single.ntceInsttNm ? single.ntceInsttNm.trim() : null,
      dminsttNm: single.dminsttNm ? single.dminsttNm.trim() : null,
      client: cand.instt,
      officialClient: cand.instt,
      bidNtceDt: sNtceDt,
      noticeDate: sNtceDt,
      bidClseDt: sCloseDt,
      bidCloseDate: sCloseDt,
      asignBdgtAmt: sAsign,
      presmptPrce: sPresmpt,
      budget: budgetNum,
      budgetText: budgetNum ? `${budgetNum.toLocaleString()}원` : '원문 확인 필요',
      cntrctCnclsMthdNm: sContract,
      contractMethod: sContract,
      bidNtceDtlUrl: sUrl || cand.url,
      officialUrl: sUrl || cand.url,
      linkUrl: sUrl || cand.url,
      sourceDetailUrl: sUrl || cand.url,
      ntceKindNm: sKind || '등록공고',
      status: 'AUTO_COLLECTED_CANDIDATE',
      isClosed: false,
      source: '조달청 나라장터(G2B)',
      sourceApi: '조달청 나라장터 OpenAPI',
      category: cand.match.primaryCategory,
      matchedKeyword: cand.match.primaryKeyword,
      tags: [cand.match.primaryCategory, cand.match.primaryKeyword],
      validation: {
        status: 'AUTO_COLLECTED_CANDIDATE',
        isVerified: true
      },
      raw: {
        bidNtceNo: cand.no,
        bidNtceOrd: cand.ord,
        bidNtceNm: cand.title,
        ntceInsttNm: single.ntceInsttNm || null,
        dminsttNm: single.dminsttNm || null,
        bidNtceDt: sNtceDt,
        bidClseDt: sCloseDt,
        asignBdgtAmt: sAsign,
        presmptPrce: sPresmpt,
        cntrctCnclsMthdNm: sContract,
        bidNtceDtlUrl: sUrl || cand.url,
        ntceKindNm: sKind || null
      }
    });
  }

  // 마감일(bidClseDt) 빠른 순서 정렬
  finalStagingBids.sort((a, b) => {
    const da = new Date((a.bidClseDt || '').replace(/-/g, '/')).getTime() || 0;
    const db = new Date((b.bidClseDt || '').replace(/-/g, '/')).getTime() || 0;
    return da - db;
  });

  console.log(`\n================================================================================`);
  console.log(`🎯 [최종 Staging 반영 대상] 총 ${finalStagingBids.length}건`);
  console.log(`================================================================================`);

  // 분야별 건수
  const catCounts = {
    '제작·시공': finalStagingBids.filter(b => b.category === '제작·시공').length,
    '인쇄·출판': finalStagingBids.filter(b => b.category === '인쇄·출판').length,
    '출력·인쇄 장비': finalStagingBids.filter(b => b.category === '출력·인쇄 장비').length,
    '출력소재·잉크': finalStagingBids.filter(b => b.category === '출력소재·잉크').length
  };
  console.log('분야별 건수:', catCounts);

  // Staging용 bids.json 파일로 저장
  const bidsJsonPath = path.resolve(process.cwd(), 'public/data/bids.json');
  fs.writeFileSync(bidsJsonPath, JSON.stringify(finalStagingBids, null, 2), 'utf8');

  // 비공개 감사 기록 저장
  const auditPath = path.resolve(process.cwd(), 'data/simple-candidate-staging-18.json');
  fs.writeFileSync(auditPath, JSON.stringify({
    executedAtKST: kstNowIso,
    totalStagingCount: finalStagingBids.length,
    categoryCounts: catCounts,
    bids: finalStagingBids,
    rejected: rejectedList
  }, null, 2), 'utf8');

  console.log(`📁 public/data/bids.json (${finalStagingBids.length}건 저장 완료)`);
}

main().catch(err => {
  console.error('❌ 실행 중 에러:', err);
  process.exit(1);
});
