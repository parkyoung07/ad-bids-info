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

// 2. KST 기준 시각 및 7일 조회 기간 (YYYYMMDDHHMM)
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
console.log(`📡 [SignBid] 조달청 나라장터 공식 OpenAPI 단순 직통 수집기 (fix/simple-g2b-exact)`);
console.log(`⏰ 실행 시각(KST): ${kstNowIso}`);
console.log(`📅 조회 기간: ${bgnDt} ~ ${endDt}`);
console.log(`================================================================================`);

// 3. 12개 지정 키워드 (공식 공고명 직접 포함 필수)
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

async function main() {
  const endpoints = [
    'getBidPblancListInfoServc',
    'getBidPblancListInfoThng',
    'getBidPblancListInfoCnstwk'
  ];

  let allItems = [];
  for (const ep of endpoints) {
    const items = await fetchG2BAllPages(ep);
    allItems = allItems.concat(items);
  }

  console.log(`\n================================================================================`);
  console.log(`📊 전체 API 수집 건수: ${allItems.length}건`);

  // 중복 공고번호 제거 (최신 차수 우선)
  const uniqueMap = new Map();
  for (const item of allItems) {
    const key = `${item.bidNtceNo}-${item.bidNtceOrd}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }
  const uniqueItems = Array.from(uniqueMap.values());
  console.log(`📊 고유 공고 수: ${uniqueItems.length}건`);

  // 필터링 및 대조
  const keywordPassed = [];
  const deadlinePassed = [];
  const finalCandidates = [];
  const rejectedList = [];

  for (const item of uniqueItems) {
    const title = (item.bidNtceNm || '').trim();
    const instt = (item.dminsttNm || item.ntceInsttNm || '').trim();
    const no = (item.bidNtceNo || '').trim();
    const ord = (item.bidNtceOrd || '').trim();
    const url = (item.bidNtceDtlUrl || '').trim();
    const closeDtStr = (item.bidClseDt || '').trim();
    const ntceDtStr = (item.bidNtceDt || '').trim();
    const kind = (item.ntceKindNm || '').trim();

    // 1) 12개 키워드 매칭 확인
    const matchedKws = TARGET_KEYWORDS.filter(kw => title.includes(kw));
    if (matchedKws.length === 0) {
      continue; // 키워드 미포함
    }
    keywordPassed.push(item);

    // 2) 취소공고 제외
    if (kind === '취소공고' || title.includes('취소공고')) {
      rejectedList.push({ no, ord, title, reason: '취소공고' });
      continue;
    }

    // 3) 필수 식별자 및 URL 존재 여부
    if (!no || !ord || !title || !instt || !url) {
      rejectedList.push({ no, ord, title, reason: '필수 식별자/기관/URL 누락' });
      continue;
    }

    // 4) URL에 공고번호 포함 여부
    if (!url.includes(no)) {
      rejectedList.push({ no, ord, title, reason: '공식 URL 내 공고번호 불일치' });
      continue;
    }

    // 5) 마감일 null 여부
    if (!closeDtStr) {
      rejectedList.push({ no, ord, title, reason: '마감일(bidClseDt) null' });
      continue;
    }

    // 6) 마감일 경과 여부 (KST 기준)
    const closeDate = new Date(closeDtStr.replace(/-/g, '/'));
    if (isNaN(closeDate.getTime())) {
      rejectedList.push({ no, ord, title, reason: `마감일 형식 오류 (${closeDtStr})` });
      continue;
    }
    if (closeDate <= kstNow) {
      rejectedList.push({ no, ord, title, reason: `마감일 경과 (${closeDtStr} <= ${kstNowIso.slice(0, 19)})` });
      continue;
    }
    deadlinePassed.push(item);

    // 7) 공고등록일 7일 이내 여부
    if (ntceDtStr) {
      const ntceDate = new Date(ntceDtStr.replace(/-/g, '/'));
      if (!isNaN(ntceDate.getTime()) && ntceDate < past7Days) {
        rejectedList.push({ no, ord, title, reason: `등록일 7일 경과 (${ntceDtStr})` });
        continue;
      }
    }

    // 필드 불변 1:1 매핑 객체 생성
    const client = instt;
    const budgetNum = item.asignBdgtAmt ? Number(item.asignBdgtAmt) : null;
    const estNum = item.presmptPrce ? Number(item.presmptPrce) : null;

    finalCandidates.push({
      id: `${no}-${ord}`,
      bidNtceNo: no,
      bidNtceOrd: ord,
      bidNtceNm: title,
      title: title, // UI 호환용 (100% 동일 원본)
      officialTitle: title,
      ntceInsttNm: item.ntceInsttNm ? item.ntceInsttNm.trim() : null,
      dminsttNm: item.dminsttNm ? item.dminsttNm.trim() : null,
      client: client, // UI 호환용 (100% 동일 원본)
      officialClient: client,
      bidNtceDt: ntceDtStr || null,
      noticeDate: ntceDtStr || null,
      bidClseDt: closeDtStr || null,
      bidCloseDate: closeDtStr || null,
      asignBdgtAmt: item.asignBdgtAmt ? item.asignBdgtAmt.trim() : null,
      presmptPrce: item.presmptPrce ? item.presmptPrce.trim() : null,
      budget: budgetNum || estNum || null,
      rawBudget: budgetNum,
      rawEstPrice: estNum,
      cntrctCnclsMthdNm: item.cntrctCnclsMthdNm ? item.cntrctCnclsMthdNm.trim() : null,
      contractMethod: item.cntrctCnclsMthdNm ? item.cntrctCnclsMthdNm.trim() : null,
      bidNtceDtlUrl: url,
      officialUrl: url,
      linkUrl: url,
      sourceDetailUrl: url,
      ntceKindNm: kind || '등록공고',
      status: 'AUTO_COLLECTED_CANDIDATE',
      isClosed: false,
      source: '조달청 나라장터(G2B)',
      sourceApi: '조달청 나라장터 OpenAPI',
      matchedKeyword: matchedKws[0],
      tags: [matchedKws[0]],
      category: matchedKws.includes('전광판') || matchedKws.includes('LED 전광판') || matchedKws.includes('사이니지')
        ? '전광판·디지털사이니지'
        : (matchedKws.includes('인쇄') || matchedKws.includes('인쇄물') || matchedKws.includes('홍보물')
          ? '인쇄·홍보물'
          : '간판·사인물'),
      validation: {
        status: 'AUTO_COLLECTED_CANDIDATE',
        isVerified: true
      },
      raw: {
        bidNtceNo: no,
        bidNtceOrd: ord,
        bidNtceNm: title,
        ntceInsttNm: item.ntceInsttNm || null,
        dminsttNm: item.dminsttNm || null,
        bidNtceDt: ntceDtStr || null,
        bidClseDt: closeDtStr || null,
        asignBdgtAmt: item.asignBdgtAmt || null,
        presmptPrce: item.presmptPrce || null,
        cntrctCnclsMthdNm: item.cntrctCnclsMthdNm || null,
        bidNtceDtlUrl: url,
        ntceKindNm: kind || null
      }
    });
  }

  console.log(`📊 키워드 필터 통과 건수: ${keywordPassed.length}건`);
  console.log(`📊 마감일/등록일/유효성 통과 건수: ${deadlinePassed.length}건`);
  console.log(`📊 최종 후보 공고 건수: ${finalCandidates.length}건`);

  // 등록일시 최신순 정렬
  finalCandidates.sort((a, b) => {
    const da = new Date((a.bidNtceDt || '').replace(/-/g, '/')).getTime() || 0;
    const db = new Date((b.bidNtceDt || '').replace(/-/g, '/')).getTime() || 0;
    return db - da;
  });

  // 최대 5건으로 엄격 제한
  const limited5 = finalCandidates.slice(0, 5);
  console.log(`🎯 최종 Staging 표시 건수 (최대 5건 제한): ${limited5.length}건\n`);

  // Staging용 bids.json 파일로 저장
  const outputPath = path.resolve(process.cwd(), 'public/data/bids.json');
  fs.writeFileSync(outputPath, JSON.stringify(limited5, null, 2), 'utf8');

  // 대조 및 감사용 JSON 파일로도 비공개 저장
  const auditReport = {
    executedAtKST: kstNowIso,
    endpoints: endpoints,
    totalApiCount: allItems.length,
    keywordPassedCount: keywordPassed.length,
    deadlinePassedCount: deadlinePassed.length,
    finalStagingCount: limited5.length,
    displayedBids: limited5.map(b => ({
      id: b.id,
      bidNtceNo: b.bidNtceNo,
      bidNtceOrd: b.bidNtceOrd,
      title: b.title,
      client: b.client,
      bidNtceDt: b.bidNtceDt,
      bidClseDt: b.bidClseDt,
      asignBdgtAmt: b.asignBdgtAmt,
      presmptPrce: b.presmptPrce,
      cntrctCnclsMthdNm: b.cntrctCnclsMthdNm,
      bidNtceDtlUrl: b.bidNtceDtlUrl,
      matchedKeyword: b.matchedKeyword,
      raw: b.raw
    })),
    rejectedBids: rejectedList.slice(0, 30)
  };

  const auditPath = path.resolve(process.cwd(), 'data/staging-simple-audit.json');
  fs.writeFileSync(auditPath, JSON.stringify(auditReport, null, 2), 'utf8');

  console.log(`================================================================================`);
  console.log(`📋 [Staging 표시 공고 ${limited5.length}건 상세 대조표]`);
  console.log(`================================================================================`);
  limited5.forEach((b, idx) => {
    console.log(`[공고 ${idx + 1}] ${b.id}`);
    console.log(`- 공식 제목: ${b.bidNtceNm}`);
    console.log(`- 공식 기관: ${b.client}`);
    console.log(`- 등록일시: ${b.bidNtceDt}`);
    console.log(`- 투찰마감: ${b.bidClseDt}`);
    console.log(`- 배정예산: ${b.asignBdgtAmt ? Number(b.asignBdgtAmt).toLocaleString() + '원' : 'null'}`);
    console.log(`- 추정가격: ${b.presmptPrce ? Number(b.presmptPrce).toLocaleString() + '원' : 'null'}`);
    console.log(`- 계약방법: ${b.cntrctCnclsMthdNm || 'null'}`);
    console.log(`- 공식 URL: ${b.bidNtceDtlUrl}`);
    console.log(`- 발견 키워드: [${b.matchedKeyword}]`);
    console.log(`--------------------------------------------------------------------------------`);
  });
}

main().catch(err => {
  console.error('❌ 실행 중 치명적 오류 발생:', err);
  process.exit(1);
});
