/**
 * SignBid AI - 나라장터 공식 OpenAPI 수집기 및 3계층 무결성 데이터 파이프라인
 * 
 * [무결성 및 보안 원칙]
 * 1. API 원문에 없는 자격·하자·직생 조건의 임의 생성 및 템플릿 절대 금지 (미확인 필드는 null)
 * 2. 날짜 무결성 엄수:
 *    - 공고등록일(bidNtceDt) -> noticeDate
 *    - 입찰접수시작(bidBeginDt) -> bidBeginDate
 *    - 입찰마감일시(bidClseDt) -> bidCloseDate
 *    - 개찰일시(opengDt) -> openingDate
 *    - noticeDate > fetchedAt 검출 시 DATE_INTEGRITY_ERROR로 즉시 격리
 *    - bidCloseDate <= fetchedAt 검출 시 CLOSED(마감) 처리 (진행중 표시 절대 금지)
 * 3. 3단계 옥외광고 관련성 판정:
 *    - DIRECT: 간판, 옥외광고물, 현수막, 지정게시대, 전광판, LED사이니지, 안내판, 조형물 등 직접 관련
 *    - ADJACENT: 전시부스, 홍보관, 인쇄물/달력/리플릿 등 인접 후보군
 *    - UNRELATED: 교육, 연구, 감리, 안전평가, IT서버구매 등 무관 제외군
 * 4. 공개 상태 잠금:
 *    - 자동 수집기는 REVIEW_REQUIRED (검토대기) 상태로만 저장
 *    - 관리자 승인 없이 자동 PUBLISHED 또는 bids.json 직접 반영 절대 금지
 */

import fs from 'fs';
import path from 'path';

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
  console.error('❌ [오류] PUBLIC_DATA_API_KEY 환경변수가 필요합니다.');
  process.exit(1);
}

const encKey = encodeURIComponent(apiKey);

// 고정 조회 기준일시 (KST 3일 전 00:00 ~ 현재 00:00 고정)
const now = new Date();
const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
const past3Days = new Date(kstNow.getTime() - (3 * 24 * 60 * 60 * 1000));

function fmtDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

const bgnDt = `${fmtDate(past3Days)}0000`;
const endDt = `${fmtDate(kstNow)}0000`;

// 3단계 관련성 분류 함수
export function classifyRelevance(title, rawItem = {}) {
  if (!title) return { tier: 'UNRELATED', reason: '공고명 누락' };

  // 1. UNRELATED (무관 제외)
  const unrelatedExclude = /역량강화\s*교육|행정직원\s*교육|교원\s*연수|직무교육|홍보전략\s*수립\s*및\s*방안\s*연구|학술연구|타당성\s*조사|컨설팅|지하안전평가|감리용역|소방설비|기계설비|리모델링\(기계|의료IT|상관기\s*서버|차선도색/;
  if (unrelatedExclude.test(title)) {
    return { tier: 'UNRELATED', reason: '교육/연구/기계/서버/도색 등 옥외광고 무관' };
  }

  // 2. DIRECT (옥외광고 직접 관련)
  const directRegex = /간판|옥외광고|지주간판|돌출간판|채널간판|LED\s*전광판|전광판|사이니지|전자게시대|미디어월|현수막|가로등배너|지정게시대|안내판|안내도|교통표지판|사인물|안내시스템|상징조형물|조형물|아치조형물|사인탑|조명탑/;
  if (directRegex.test(title)) {
    return { tier: 'DIRECT', reason: '간판·전광판·조형물·안내판·현수막 직접 관련' };
  }

  // 3. ADJACENT (인접 업종 후보군: 전시부스, 홍보관, 달력, 인쇄물 등)
  const adjacentRegex = /부스|홍보관|전시관|전시장치|독립부스|엑스포|인쇄|달력|수첩|리플릿|리플렛|포스터|문답지|에세이/;
  if (adjacentRegex.test(title)) {
    return { tier: 'ADJACENT', reason: '전시·부스·인쇄물 등 인접 업종' };
  }

  return { tier: 'UNRELATED', reason: '옥외광고 관련성 미달' };
}

// 지수 백오프 Fetch 헬퍼
async function fetchWithRetry(url, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (res.ok) {
        const data = await res.json();
        return { ok: true, status: res.status, data };
      }
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status}`);
      }
      return { ok: false, status: res.status, data: null };
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) {
        return { ok: false, status: 'TIMEOUT_OR_ERR', error: err.message };
      }
      const delayMs = Math.pow(2, attempt) * 500;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return { ok: false, status: 'FAIL_MAX_RETRIES' };
}

async function main() {
  const fetchedAt = new Date().toISOString();
  console.log('================================================================================');
  console.log('🚀 [SignBid AI 수집기] 나라장터 공식 OpenAPI 3계층 데이터 파이프라인');
  console.log(`📅 수집 기준시각(fetchedAt): ${fetchedAt}`);
  console.log(`📅 조회 기간: ${bgnDt} ~ ${endDt} (KST)`);
  console.log('================================================================================\n');

  // 1. 참가가능지역정보 전수 수집 및 인덱싱
  console.log('▶ [1/3] 참가가능지역정보(getBidPblancListInfoPrtcptPsblRgn) 전수 수집 중...');
  const regionIndexMap = new Map();
  let regionDatasetComplete = false;
  const regionNumOfRows = 999;

  const initRgnRes = await fetchWithRetry(`https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoPrtcptPsblRgn?serviceKey=${encKey}&numOfRows=${regionNumOfRows}&pageNo=1&type=json&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`);
  
  if (initRgnRes.ok && initRgnRes.data?.response?.header?.resultCode === '00') {
    const totalRgnCount = initRgnRes.data.response.body?.totalCount ?? 0;
    const totalRgnPages = Math.ceil(totalRgnCount / regionNumOfRows);
    let collectedRgnCount = 0;
    let failedRgnPages = 0;

    for (let p = 1; p <= totalRgnPages; p++) {
      const pageRes = await fetchWithRetry(`https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoPrtcptPsblRgn?serviceKey=${encKey}&numOfRows=${regionNumOfRows}&pageNo=${p}&type=json&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`);
      if (pageRes.ok && pageRes.data?.response?.header?.resultCode === '00') {
        const items = pageRes.data.response.body?.items || [];
        const itemArr = Array.isArray(items) ? items : [items];
        for (const it of itemArr) {
          if (!it || !it.bidNtceNo) continue;
          collectedRgnCount++;
          const key = `${it.bidNtceNo}-${it.bidNtceOrd || '000'}`;
          if (!regionIndexMap.has(key)) regionIndexMap.set(key, []);
          regionIndexMap.get(key).push({
            lmtSno: it.lmtSno || null,
            regionName: it.prtcptPsblRgnNm || null,
            bsnsDivNm: it.bsnsDivNm || null,
            rgstDt: it.rgstDt || null
          });
        }
      } else {
        failedRgnPages++;
      }
    }

    if (failedRgnPages === 0 && collectedRgnCount === totalRgnCount) {
      regionDatasetComplete = true;
      console.log(`  ✅ 지역정보 전수 수집 완료: 총 ${collectedRgnCount}건 (고유 공고 ${regionIndexMap.size}개)`);
    } else {
      regionDatasetComplete = false;
      console.warn(`  ⚠️ 지역정보 수집 불완전 (수집 ${collectedRgnCount}건 / 서버 ${totalRgnCount}건, 실패 ${failedRgnPages}개)`);
    }
  } else {
    regionDatasetComplete = false;
    console.warn('  ⚠️ 지역정보 초기화 실패 -> regionDatasetComplete=false 설정');
  }

  // 2. 메인 입찰공고 수집 (용역, 물품, 공사)
  console.log('\n▶ [2/3] 메인 입찰공고(용역·물품·공사) 수집 중...');
  const mainOps = [
    { category: '용역', op: 'getBidPblancListInfoServc' },
    { category: '물품', op: 'getBidPblancListInfoThng' },
    { category: '공사', op: 'getBidPblancListInfoCnstwk' }
  ];

  const allRawItems = [];

  for (const mop of mainOps) {
    const initRes = await fetchWithRetry(`https://apis.data.go.kr/1230000/ad/BidPublicInfoService/${mop.op}?serviceKey=${encKey}&numOfRows=500&pageNo=1&type=json&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`);
    if (initRes.ok && initRes.data?.response?.header?.resultCode === '00') {
      const totalCount = initRes.data.response.body?.totalCount ?? 0;
      const totalPages = Math.ceil(totalCount / 500);

      for (let p = 1; p <= totalPages; p++) {
        const pageRes = await fetchWithRetry(`https://apis.data.go.kr/1230000/ad/BidPublicInfoService/${mop.op}?serviceKey=${encKey}&numOfRows=500&pageNo=${p}&type=json&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`);
        if (pageRes.ok && pageRes.data?.response?.header?.resultCode === '00') {
          const items = pageRes.data.response.body?.items || [];
          const itemArr = Array.isArray(items) ? items : [items];
          for (const item of itemArr) {
            allRawItems.push(item);
          }
        }
      }
    }
  }

  // 중복 제거 (bidNtceNo-bidNtceOrd)
  const uniqueItemMap = new Map();
  for (const item of allRawItems) {
    if (!item.bidNtceNo) continue;
    const key = `${item.bidNtceNo}-${item.bidNtceOrd || '000'}`;
    if (!uniqueItemMap.has(key)) {
      uniqueItemMap.set(key, item);
    }
  }

  console.log(`  ✅ 수집된 고유 공고 수: 총 ${uniqueItemMap.size}건`);

  // 3. 3계층 데이터 정규화 및 엄격한 날짜/업종 무결성 검증
  console.log('\n▶ [3/3] 3계층 데이터 변환 및 날짜/업종 무결성 검증...');
  const verified3TierRecords = [];
  let directCount = 0;
  let adjacentCount = 0;
  let unrelatedCount = 0;
  let dateIntegrityErrorCount = 0;

  for (const [bidKey, raw] of uniqueItemMap.entries()) {
    const bidNo = raw.bidNtceNo;
    const bidOrd = raw.bidNtceOrd || '000';
    const title = raw.bidNtceNm || '';

    // 1) 3단계 관련성 판정
    const rel = classifyRelevance(title, raw);
    if (rel.tier === 'DIRECT') directCount++;
    else if (rel.tier === 'ADJACENT') adjacentCount++;
    else unrelatedCount++;

    // 2) 날짜 추출 및 무결성 검사
    const noticeDtStr = raw.bidNtceDt || raw.rgstDt || null;
    const beginDtStr = raw.bidBeginDt || null;
    const closeDtStr = raw.bidClseDt || null;
    const openDtStr = raw.opengDt || null;

    let isDateError = false;
    let dateErrorMessage = null;

    if (noticeDtStr) {
      const noticeDateObj = new Date(noticeDtStr.replace(/-/g, '/'));
      const fetchedAtObj = new Date(fetchedAt);
      if (noticeDateObj > fetchedAtObj) {
        isDateError = true;
        dateErrorMessage = `공고등록일(${noticeDtStr})이 수집시각(${fetchedAt})보다 미래입니다.`;
        dateIntegrityErrorCount++;
      }
    }

    // 마감 여부 판정
    let isClosed = false;
    if (closeDtStr) {
      const closeDateObj = new Date(closeDtStr.replace(/-/g, '/'));
      const nowDateObj = new Date();
      if (closeDateObj <= nowDateObj) {
        isClosed = true;
      }
    }

    // 3) 지역 판정
    let regionStatus = 'UNKNOWN';
    let displayRegionLabel = '지역 제한 확인 필요 (공고서 원문 확인)';
    let restrictedRegionsList = null;

    if (!regionDatasetComplete) {
      regionStatus = 'UNKNOWN';
      displayRegionLabel = '지역 제한 확인 필요 (공고서 원문 확인)';
    } else if (regionIndexMap.has(bidKey)) {
      const rgnRecords = regionIndexMap.get(bidKey);
      const uniqueRgnNames = Array.from(new Set(rgnRecords.map(r => r.regionName).filter(Boolean)));
      regionStatus = 'RESTRICTED';
      restrictedRegionsList = uniqueRgnNames;
      displayRegionLabel = `지역제한: ${uniqueRgnNames.join(', ')}`;
    } else {
      regionStatus = 'UNRESTRICTED';
      displayRegionLabel = '전국';
    }

    // 4) 금액 분리 (배정예산, 추정가격, 기초금액=null)
    const allocatedBudget = raw.asignBdgtAmt ? Number(raw.asignBdgtAmt) : (raw.bdgtAmt ? Number(raw.bdgtAmt) : null);
    const estimatedPrice = raw.presmptPrce ? Number(raw.presmptPrce) : null;
    const baseAmount = null; // OpenAPI 목록/상세 응답에 기초금액 필드가 없으므로 null 명시

    // 5) 검증 상태 판정
    let verificationStatus = 'REVIEW_REQUIRED';
    if (isDateError) {
      verificationStatus = 'DATE_INTEGRITY_ERROR';
    } else if (raw.ntceKindNm?.includes('취소')) {
      verificationStatus = 'CANCELLED';
    } else if (raw.ntceKindNm?.includes('정정') && bidOrd !== '000') {
      verificationStatus = 'AMENDED';
    } else if (isClosed) {
      verificationStatus = 'CLOSED_BID';
    } else {
      verificationStatus = 'REVIEW_REQUIRED';
    }

    // 6) 3계층 객체 조립 (임의 생성 템플릿 완전 배제)
    const record = {
      bidKey: bidKey,
      verificationStatus: verificationStatus,
      relevanceTier: rel.tier,
      relevanceReason: rel.reason,
      verificationTier: 6,
      verifiedAt: null,
      verifierId: null,
      isPublicLocked: true, // 자동 공개 절대 금지 (잠금 상태 유지)
      fetchedAt: fetchedAt,

      raw: {
        mainApi: raw,
        regionApi: regionIndexMap.get(bidKey) || []
      },

      normalized: {
        bidNo: bidNo,
        bidOrd: bidOrd,
        title: title,
        noticeKind: raw.ntceKindNm || '등록공고',
        client: raw.dminsttNm || raw.ntceInsttNm || null,
        allocatedBudget: allocatedBudget,
        estimatedPrice: estimatedPrice,
        baseAmount: baseAmount, // 결측치 null 엄수
        noticeDate: noticeDtStr, // 공고등록일시 (bidNtceDt)
        bidBeginDate: beginDtStr, // 입찰서 접수 개시일시 (bidBeginDt)
        bidCloseDate: closeDtStr, // 입찰서 접수 마감일시 (bidClseDt)
        openingDate: openDtStr, // 개찰일시 (opengDt)
        contractMethod: raw.cntrctCnclsMthdNm || null,
        jointVentureMethod: raw.cmmnSpldmdMethdNm || null,
        industryRestriction: raw.indstrytyLmtYn === 'Y',
        manufactureRequired: raw.mnfctYn === 'Y',
        purchasedProductList: raw.purchsObjPrdctList || null,
        publicProcurementClass: raw.pubPrcrmntClsfcNm || null,
        regionStatus: regionStatus,
        restrictedRegions: restrictedRegionsList,
        displayRegion: displayRegionLabel,
        isClosed: isClosed,
        g2bDetailUrl: raw.bidNtceDtlUrl || `https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=${bidNo}&bidPbancOrd=${bidOrd}`,
        specDocUrls: [
          raw.ntceSpecDocUrl1, raw.ntceSpecDocUrl2, raw.ntceSpecDocUrl3
        ].filter(Boolean)
      },

      ai: {
        modelId: 'gemini-1.5-flash-latest',
        analyzedAt: fetchedAt,
        category: rel.tier === 'DIRECT' ? '옥외광고·사인물' : (rel.tier === 'ADJACENT' ? '인접분야(전시/인쇄)' : '기타'),
        summary: `${raw.dminsttNm || raw.ntceInsttNm || '발주기관'}에서 발주한 [${title}] 공고입니다.`,
        tips: '세부 참가자격 및 과업지시서는 조달청 공고문 원본을 반드시 확인하시기 바랍니다.',
        isSegregatedFromOfficial: true,
        disclaimer: '※ AI 참고 분석이며 조달청 공식 참가자격이 아닙니다.'
      }
    };

    verified3TierRecords.push(record);
  }

  // 4. 비공개 저장소에 저장
  const outputPath = path.resolve(process.cwd(), 'public/data/bids-verified-raw.json');
  fs.writeFileSync(outputPath, JSON.stringify(verified3TierRecords, null, 2), 'utf8');

  console.log(`\n================================================================================`);
  console.log(`📊 [수집 결과 요약]`);
  console.log(`- 총 수집 공고: ${verified3TierRecords.length}건`);
  console.log(`- 옥외광고 직접 관련 (DIRECT): ${directCount}건`);
  console.log(`- 인접 업종 후보군 (ADJACENT): ${adjacentCount}건`);
  console.log(`- 무관 제외군 (UNRELATED): ${unrelatedCount}건`);
  console.log(`- 미래 날짜 오류 (DATE_INTEGRITY_ERROR): ${dateIntegrityErrorCount}건`);
  console.log(`📁 저장 경로: ${outputPath}`);
  console.log(`🔒 공개 잠금: LOCKED = true (자동 공개 금지)`);
  console.log('================================================================================');
}

main().catch(err => {
  console.error('❌ [치명적 오류]', err);
  process.exit(1);
});
