import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawAll = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/bids-verified-raw.json'), 'utf8'));
const currentBids = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/data/bids.json'), 'utf8'));

// 1. 기존 운영 18건: isVerified: false 및 REVIEW_REQUIRED 표준화
const prod18 = currentBids.slice(0, 18).map(b => ({
  ...b,
  isVerified: false,
  validationStatus: "AUTO_COLLECTED_CANDIDATE",
  validation: {
    status: "REVIEW_REQUIRED",
    isVerified: false,
    verifiedAt: null,
    verifier: null
  }
}));

// 2. 신규 후보 9건 키 목록 (진행)
const activeCandidateKeys = [
  'R26BK01750751-000',
  'R26BK01745608-000',
  'R26BK01745989-000',
  'R26BK01750109-000',
  'R26BK01751430-000',
  'R26BK01748842-000',
  'R26BK01748096-001',
  'R26BK01749040-001',
  'R26BK01749796-000'
];

function classifyCategory(title) {
  const cat1 = /간판|안내판|표찰|현판|현수막게시대|전광판|사이니지|조형물|래핑|랩핑|사인물|안내사인물|안내단말|현황판/;
  if (cat1.test(title)) return '제작·시공';

  const isExam = /시험지|교육자료/.test(title);
  const cat2 = /수첩|달력|책자|보고서|포스터|리플릿|간행물|인쇄|편집디자인|편집\s*및\s*인쇄|홍보물품/;
  if (isExam || cat2.test(title)) return '인쇄·출판';

  const cat3 = /인쇄기|출력기|플로터|커팅기|코팅기|프린터/;
  if (cat3.test(title)) return '출력·인쇄 장비';

  const cat4 = /잉크|원단|시트지|필름|전사지|소재/;
  if (cat4.test(title)) return '출력소재·잉크';

  return '제작·시공';
}

function normalizeFromRaw(rawItem) {
  const m = rawItem.raw?.mainApi || rawItem;
  const bidNo = m.bidNtceNo;
  const bidOrd = m.bidNtceOrd || '000';
  const id = `${bidNo}-${bidOrd}`;
  const title = m.bidNtceNm;
  const client = m.ntceInsttNm || m.dminsttNm || '원문 확인 필요';
  const closeDate = m.bidClseDt;
  const noticeDate = m.bidNtceDt;
  const officialUrl = m.bidNtceDtlUrl || `https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=${bidNo}&bidPbancOrd=${bidOrd}`;
  const category = classifyCategory(title);

  const asignBdgtAmt = m.asignBdgtAmt || null;
  const presmptPrce = m.presmptPrce || null;
  const budgetNum = asignBdgtAmt ? Number(asignBdgtAmt) : (presmptPrce ? Number(presmptPrce) : null);
  const budgetText = asignBdgtAmt
    ? `${Number(asignBdgtAmt).toLocaleString()}원 (배정)`
    : (presmptPrce ? `${Number(presmptPrce).toLocaleString()}원 (추정)` : '원문 확인 필요');

  return {
    id,
    bidNtceNo: bidNo,
    bidNtceOrd: bidOrd,
    announcementNo: bidNo,
    orderNo: bidOrd,
    bidNtceNm: title,
    title,
    officialTitle: title,
    ntceInsttNm: client,
    dminsttNm: m.dminsttNm || client,
    client,
    officialClient: client,
    bidNtceDt: noticeDate,
    noticeDate,
    bidClseDt: closeDate,
    bidCloseDate: closeDate,
    endDate: closeDate,
    asignBdgtAmt,
    presmptPrce,
    budget: budgetNum,
    budgetText,
    cntrctCnclsMthdNm: m.cntrctCnclsMthdNm || '원문 확인 필요',
    contractMethod: m.cntrctCnclsMthdNm || '원문 확인 필요',
    bidNtceDtlUrl: officialUrl,
    officialUrl,
    linkUrl: officialUrl,
    sourceDetailUrl: officialUrl,
    ntceKindNm: m.ntceKindNm || '등록공고',
    status: '진행중',
    isClosed: false,
    urgencyBadge: '자동수집 후보',
    dDay: 1,
    source: '조달청 나라장터(G2B)',
    sourceApi: '조달청 나라장터 OpenAPI',
    category,
    matchedKeyword: category === '인쇄·출판' ? '인쇄' : '전광판',
    tags: [category, '자동수집'],
    validationStatus: 'AUTO_COLLECTED_CANDIDATE',
    isVerified: false,
    validation: {
      status: 'REVIEW_REQUIRED',
      isVerified: false,
      verifiedAt: null,
      verifier: null
    },
    raw: m
  };
}

// 3. 신규 진행 9건 정규화
const normalized9 = activeCandidateKeys.map(k => {
  const found = rawAll.find(r => r.bidKey === k);
  if (!found) {
    throw new Error(`Raw record not found for key: ${k}`);
  }
  return normalizeFromRaw(found);
});

// 4. 신규 마감 1건 (R26BK01751765-000) 정규화
const closedCandidate = {
  id: 'R26BK01751765-000',
  bidNtceNo: 'R26BK01751765',
  bidNtceOrd: '000',
  announcementNo: 'R26BK01751765',
  orderNo: '000',
  bidNtceNm: '2026년 앵커사업 홍보물품 제작·구입',
  title: '2026년 앵커사업 홍보물품 제작·구입',
  officialTitle: '2026년 앵커사업 홍보물품 제작·구입',
  ntceInsttNm: '군산간호대학교산학협력단',
  dminsttNm: '군산간호대학교산학협력단',
  client: '군산간호대학교산학협력단',
  officialClient: '군산간호대학교산학협력단',
  bidNtceDt: '2026-09-30 09:12:00',
  noticeDate: '2026-09-30 09:12:00',
  bidClseDt: '2026-10-01 14:00:00',
  bidCloseDate: '2026-10-01 14:00:00',
  endDate: '2026-10-01 14:00:00',
  asignBdgtAmt: '10108450',
  presmptPrce: '9189500',
  budget: 10108450,
  budgetText: '10,108,450원 (배정)',
  cntrctCnclsMthdNm: '수의계약',
  contractMethod: '수의계약',
  bidNtceDtlUrl: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01751765&bidPbancOrd=000',
  officialUrl: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01751765&bidPbancOrd=000',
  linkUrl: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01751765&bidPbancOrd=000',
  sourceDetailUrl: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01751765&bidPbancOrd=000',
  ntceKindNm: '등록공고',
  status: '마감',
  isClosed: true,
  urgencyBadge: '공식 마감',
  dDay: -1,
  source: '조달청 나라장터(G2B)',
  sourceApi: '조달청 나라장터 OpenAPI',
  category: '인쇄·출판',
  matchedKeyword: '홍보물품',
  tags: ['인쇄·출판', '자동수집'],
  validationStatus: 'AUTO_COLLECTED_CANDIDATE',
  isVerified: false,
  validation: {
    status: 'REVIEW_REQUIRED',
    isVerified: false,
    verifiedAt: null,
    verifier: null
  },
  raw: {
    bidNtceNo: 'R26BK01751765',
    bidNtceOrd: '000',
    bidNtceNm: '2026년 앵커사업 홍보물품 제작·구입',
    ntceInsttNm: '군산간호대학교산학협력단',
    asignBdgtAmt: '10108450',
    presmptPrce: '9189500',
    bidClseDt: '2026-10-01 14:00:00'
  }
};

const all28 = [...prod18, closedCandidate, ...normalized9];

fs.writeFileSync(
  path.join(rootDir, 'public/data/bids.json'),
  JSON.stringify(all28, null, 2),
  'utf8'
);

console.log(`✅ Normalized and saved ${all28.length} bids to public/data/bids.json`);
