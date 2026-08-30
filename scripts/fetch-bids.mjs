import fs from 'fs';
import path from 'path';

// 1. 환경 변수(.env.local) 읽기
function loadEnv() {
  const env = { ...process.env };
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = match[2] || '';
        if (value.endsWith('\r')) value = value.slice(0, -1);
        env[match[1]] = value.trim();
      }
    });
  }
  return env;
}

const env = loadEnv();
const PUBLIC_DATA_API_KEY = env.PUBLIC_DATA_API_KEY || '';
const GEMINI_API_KEY = env.GEMINI_API_KEY || '';

console.log('🚀 [시작] 전국 조달청 나라장터 옥외광고·사인·인쇄 심층 검색 및 AI 분석 파이프라인');

// 2. 한국 표준시(KST, UTC+9) 기준 날짜 계산 (오늘 기준 최근 30일)
function getKSTDate() {
  const nowUtc = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(nowUtc.getTime() + kstOffset);
}

function formatDateString(d) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

const kstNow = getKSTDate();
const todayStr = formatDateString(kstNow);
const pastDate = new Date(kstNow.getTime() - (30 * 24 * 60 * 60 * 1000));
const pastStr = formatDateString(pastDate);

console.log(`📅 검색 기간: ${pastStr} ~ ${todayStr}`);

// 3. 확장 필터링 키워드 (옥외광고, 사인물, 전광판, 사이니지, 인쇄, 랩핑, 조형물, 학교/교육, 온비드 매체권 전 분야 포괄)
const TARGET_KEYWORDS = [
  '간판', '사인', '표찰', '현판', '현수막', '배너', '랩핑', '래핑',
  '안내판', '조형물', '실사출력', '인포메이션', '게시대', '가로등배너',
  '옥외광고', '홍보물', '리플릿', '리플렛', '인쇄', '현수기', '표지판',
  '조명광고', '사인물', '부스', '전시관', '홍보관', '층별안내',
  '게시판', '선거공보', '달력', '다이어리', '간행물', 'CI', 'BI',
  '안내도', '도색', '차량도색', '차량스티커', '안내시설', '경관조명',
  '옥외', '안내시스템', '채널간판', '지주간판', '돌출간판', '아트월',
  '조명탑', '홍보탑', '홍보판', '전광판', '사이니지', '전자게시대',
  '미디어월', '키오스크', 'LED전광판',
  // 학교 및 교육기관 특화 키워드
  '교표', '교훈판', '학교간판', '교실표찰', '전자현수막', '졸업앨범',
  '학교요람', '학교신문', '학습안내판', '강당전광판', '체육관전광판',
  '교내안내판', '교문명판', '교실안내도', '학사안내도', '학교홍보',
  // 옥외광고 매체권·임대·사용수익허가 특화 키워드
  '매체권', '사용수익허가', '광고사업자', '광고대행', '매체운영',
  '지하철광고', '쉘터광고', '가로등현수기', '게시대위탁', '야립간판',
  '전광판임대', '광고물관리'
];

// 무관한 공고 제외 블랙리스트 키워드
const EXCLUDE_KEYWORDS = [
  '뷰티', '미용', '헤어', '네일', '교복', '실험실습', '기자재', '흡진기',
  '청소', '경비', '소탁', '수술', '의료기기'
];

// 예산 한글 변환 함수
function formatKoreanCurrency(amount) {
  if (!amount || isNaN(amount) || amount <= 0) return '금액 미기재';
  const num = Number(amount);
  const eok = Math.floor(num / 100000000);
  const man = Math.floor((num % 100000000) / 10000);
  
  let result = '';
  if (eok > 0) result += `${eok.toLocaleString()}억 `;
  if (man > 0) result += `${man.toLocaleString()}만 `;
  return `${result.trim()}원`;
}

// 지역 추출 함수
function extractLocation(clientName, title) {
  const text = `${clientName} ${title}`;
  const regions = [
    { key: '서울', name: '서울시' },
    { key: '부산', name: '부산시' },
    { key: '대구', name: '대구시' },
    { key: '인천', name: '인천시' },
    { key: '광주', name: '광주시' },
    { key: '대전', name: '대전시' },
    { key: '울산', name: '울산시' },
    { key: '세종', name: '세종시' },
    { key: '경기', name: '경기도' },
    { key: '강원', name: '강원도' },
    { key: '충북', name: '충북' },
    { key: '충남', name: '충남' },
    { key: '전북', name: '전북' },
    { key: '전남', name: '전남' },
    { key: '경북', name: '경북' },
    { key: '경남', name: '경남' },
    { key: '제주', name: '제주도' }
  ];
  for (const r of regions) {
    if (text.includes(r.key)) return r.name;
  }
  return '전국';
}

// D-Day 계산 함수
function calculateDDay(endDateStr) {
  if (!endDateStr) return 7; // 마감일 미기재 시 기본 7일 부여
  try {
    const end = new Date(endDateStr.replace(/-/g, '/'));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const diffTime = endDay - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (e) {
    return 7;
  }
}

// 기본 카테고리 매핑 규칙
function fallbackCategory(title, client = '') {
  const fullText = `${title} ${client}`;
  if (/매체권|사용수익허가|광고사업자|광고대행|매체운영|지하철광고|쉘터광고|가로등현수기|게시대위탁|야립간판|전광판임대|광고물관리/.test(fullText)) {
    return '매체권·임대';
  }
  if (/학교|초등|중학|고등|대학|교육청|교육지원청|유치원|교표|교훈|졸업앨범|학교요람|학습안내/.test(fullText)) {
    return '학교·교육';
  }
  if (/사이니지|전광판|전자게시대|미디어월|키오스크/.test(title)) return '디지털사이니지·전광판';
  if (/간판|조형물|채널|지주|돌출|LED|조명|아트월|경관/.test(title)) return '간판·조형물';
  if (/표찰|현판|호실|안내판|안내도|인포메이션|아크릴|안내시설|게시판|사인시스템/.test(title)) return '실내표찰·현판';
  if (/랩핑|래핑|차량|버스|도색|스티커/.test(title)) return '차량랩핑·특수';
  if (/현수막|배너|게시대|가로등|실사|현수기|부스|전시/.test(title)) return '현수막·배너';
  if (/인쇄|홍보물|리플릿|리플렛|포스터|소식지|책자|팜플렛|발간|달력|다이어리|간행물|CI|BI|브랜드|디자인/.test(title)) return '인쇄·판촉';
  return '간판·조형물';
}

// 4. 제미나이 AI 배치 분석 함수 (10~15개씩 묶어서 안정적으로 분석)
async function batchAnalyzeChunk(bidsChunk) {
  if (!GEMINI_API_KEY || bidsChunk.length === 0) return {};

  const promptInput = bidsChunk.map((b) => ({
    id: b.id,
    title: b.title,
    client: b.client,
    budget: b.budgetText
  }));

  const prompt = `당신은 옥외광고·사인물·전광판·인쇄·매체권입찰 전문 수석 분석가입니다. 아래 공고 목록을 보고 각 공고의 카테고리(간판·조형물, 디지털사이니지·전광판, 실내표찰·현판, 매체권·임대, 학교·교육, 차량랩핑·특수, 현수막·배너, 인쇄·판촉 중 택1), 사업자용 1줄 요약(aiSummary), 참가 팁(aiTips)을 JSON 배열로 작성해주세요.
공고 목록:
${JSON.stringify(promptInput)}

응답 포맷(JSON만 반환):
[{"id": "...", "category": "...", "aiSummary": "...", "aiTips": "..."}]`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        const map = {};
        for (const item of parsed) {
          if (item && item.id) {
            map[item.id] = item;
          }
        }
        return map;
      }
    }
  } catch (err) {
    console.warn(`[Gemini 배치 분석 경고]: ${err.message}`);
  }
  return {};
}

async function batchAnalyzeWithGemini(bids) {
  const chunkSize = 15;
  let allResults = {};
  console.log(`🤖 Gemini AI에게 총 ${bids.length}건 공고 정밀 분석 요청 중...`);

  for (let i = 0; i < bids.length; i += chunkSize) {
    const chunk = bids.slice(i, i + chunkSize);
    const chunkResult = await batchAnalyzeChunk(chunk);
    allResults = { ...allResults, ...chunkResult };
  }
  return allResults;
}

// 5. 캠코 온비드(OnBid) 옥외광고 매체권 입찰 공고 수집 함수
async function fetchOnbidBids() {
  if (!PUBLIC_DATA_API_KEY) return [];
  const encKey = encodeURIComponent(PUBLIC_DATA_API_KEY);
  const onbidBids = [];

  const onbidEndpoints = [
    `http://apis.data.go.kr/B552584/Onbid/UsfInsttPblsalInfoServc/getUsfInsttPblsalInfoList?serviceKey=${encKey}&numOfRows=100&pageNo=1&_type=json`,
    `http://apis.data.go.kr/1160100/service/KamcoPblsalThingInfoServc/getKamcoPblsalThingInfoList?serviceKey=${encKey}&numOfRows=100&pageNo=1&_type=json`
  ];

  for (const url of onbidEndpoints) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = await res.json();
      const items = data.response?.body?.items?.item || data.response?.body?.items || [];
      const itemArr = Array.isArray(items) ? items : [items];

      for (const item of itemArr) {
        if (!item) continue;
        const title = item.CLTR_NM || item.PBCT_CLTR_NM || item.bidNtceNm || '';
        const client = item.ORG_NM || item.DPSL_INST_NM || '온비드(한국자산관리공사)';
        if (
          TARGET_KEYWORDS.some(kw => title.includes(kw)) &&
          !EXCLUDE_KEYWORDS.some(ex => title.includes(ex))
        ) {
          const endDate = item.PBCT_CLSE_DTM || item.PBCT_TO_DTM || `${todayStr.substring(0,4)}-${todayStr.substring(4,6)}-${todayStr.substring(6,8)} 18:00:00`;
          const dDay = calculateDDay(endDate);
          if (dDay < 0) continue;

          const budgetNum = Number(item.MIN_BID_PRC || item.APPRSL_AMT || 0);
          const cleanId = `ONBID-${item.PLNM_NO || item.CLTR_NO || item.PBCT_NO || Math.floor(Math.random() * 1000000)}`;

          onbidBids.push({
            id: cleanId,
            title: title,
            client: client,
            budget: budgetNum,
            budgetText: formatKoreanCurrency(budgetNum),
            location: extractLocation(client, title),
            startDate: item.PBCT_BEGN_DTM ? item.PBCT_BEGN_DTM.substring(0, 10) : todayStr,
            endDate: endDate,
            dDay: dDay,
            bidType: '온비드 공매/임대 입찰',
            linkUrl: 'https://www.onbid.co.kr'
          });
        }
      }
    } catch (e) {
      // 시스템 연동 대기 중이거나 예외 발생 시 안전하게 건너뜀
    }
  }

  if (onbidBids.length > 0) {
    console.log(`📡 온비드(OnBid) 광고 매체권 공고 ${onbidBids.length}건 수집 완료!`);
  }
  return onbidBids;
}

// 6. 메인 데이터 수집 실행 함수
async function fetchLiveBids() {
  const encKey = encodeURIComponent(PUBLIC_DATA_API_KEY);
  const ops = [
    { name: '용역', code: 'getBidPblancListInfoServc' },
    { name: '물품', code: 'getBidPblancListInfoThng' },
    { name: '공사', code: 'getBidPblancListInfoCnstwk' }
  ];

  const rawMatchedBids = [];

  if (PUBLIC_DATA_API_KEY) {
    for (const op of ops) {
      console.log(`📡 나라장터 [${op.name}] 심층 공고 수집 중...`);
      // 최대 8페이지까지 깊게 탐색
      for (let page = 1; page <= 8; page++) {
        const url = `http://apis.data.go.kr/1230000/ad/BidPublicInfoService/${op.code}?serviceKey=${encKey}&numOfRows=100&pageNo=${page}&inqryDiv=1&inqryBgnDt=${pastStr}0000&inqryEndDt=${todayStr}2359&type=json`;
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
          const data = await res.json();
          const items = data.response?.body?.items || [];
          if (!items.length) break;

          for (const item of items) {
            const title = item.bidNtceNm || '';
            if (
              TARGET_KEYWORDS.some((kw) => title.includes(kw)) &&
              !EXCLUDE_KEYWORDS.some((ex) => title.includes(ex))
            ) {
              const dDay = calculateDDay(item.bidClseDt);
              // 마감 기한이 지난 공고(dDay < 0)는 수집 대상에서 완전히 제외
              if (dDay < 0) {
                continue;
              }

              const budgetNum = Number(item.asignBdgtAmt || item.presmptPrce || item.bsnsBdgtAmt || 0);
              const cleanId = `${item.bidNtceNo}-${item.bidNtceOrd || '000'}`;
              
              rawMatchedBids.push({
                id: cleanId,
                title: item.bidNtceNm,
                client: item.dminsttNm || item.ntceInsttNm || '공공기관',
                budget: budgetNum,
                budgetText: formatKoreanCurrency(budgetNum),
                location: extractLocation(item.dminsttNm || item.ntceInsttNm || '', title),
                startDate: item.bidNtceDt ? item.bidNtceDt.substring(0, 10) : todayStr,
                endDate: item.bidClseDt || `${todayStr.substring(0,4)}-${todayStr.substring(4,6)}-${todayStr.substring(6,8)} 18:00:00`,
                dDay: dDay,
                bidType: item.cntrctCnclsMthdNm || '일반경쟁',
                linkUrl: item.bidNtceDtlUrl || `https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=${item.bidNtceNo}&bidPbancOrd=${item.bidNtceOrd || '000'}`
              });
            }
          }
        } catch (err) {
          console.warn(`[${op.name}] p${page} 수집 건너뜀: ${err.message}`);
          break;
        }
      }
    }

    // 온비드 공고 추가 수집
    console.log(`📡 온비드(OnBid) 공공 매체권 공고 수집 중...`);
    const onbidItems = await fetchOnbidBids();
    rawMatchedBids.push(...onbidItems);
  }

  // 중복 제거 및 마감 지난 공고 엄격 필터링
  const uniqueLiveBids = Array.from(new Map(rawMatchedBids.map(b => [b.id, b])).values())
    .filter(b => b.dDay >= 0);
  console.log(`✨ 실시간 활성 공고 수집 결과: 총 ${uniqueLiveBids.length}건 발굴 (마감 공고 자동 제외)`);

  // 샘플 기준 데이터와 병합 (실제 유효 번호 유지)
  const samplePath = path.resolve(process.cwd(), 'public/data/bids-sample.json');
  let sampleData = [];
  if (fs.existsSync(samplePath)) {
    try {
      sampleData = JSON.parse(fs.readFileSync(samplePath, 'utf-8')).filter(s => calculateDDay(s.endDate) >= 0);
    } catch (e) {}
  }

  const combined = [...uniqueLiveBids];
  for (const s of sampleData) {
    if (!combined.some(c => c.id === s.id || c.title === s.title)) {
      combined.push({
        ...s,
        dDay: calculateDDay(s.endDate)
      });
    }
  }

  // 만약 API 키 부재 등으로 수집된 신규 데이터가 없으면 기존 저장된 bids.json 데이터를 보존
  if (combined.length === 0) {
    const existingPath = path.resolve(process.cwd(), 'public/data/bids.json');
    if (fs.existsSync(existingPath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
        combined.push(...existingData);
        console.log(`📦 기존 저장된 bids.json 데이터(${existingData.length}건)를 안전하게 유지합니다.`);
      } catch (e) {}
    }
  }

  // 최종 활성 공고만 필터링
  const activeOnly = combined.filter(b => b.dDay >= 0);

  // 6. Gemini AI 일괄 분석 적용
  const aiResults = await batchAnalyzeWithGemini(activeOnly);

  const finalBids = activeOnly.map(b => {
    const ai = aiResults[b.id];
    return {
      ...b,
      category: ai?.category || b.category || fallbackCategory(b.title, b.client),
      aiSummary: ai?.aiSummary || b.aiSummary || `${b.client}에서 발주한 ${b.title} 공고입니다. 나라장터 전자입찰을 통해 참여 가능합니다.`,
      aiTips: ai?.aiTips || b.aiTips || '입찰 참가 전 과업지시서 및 옥외광고사업자 등록 요건을 확인하세요.'
    };
  });

  // 정렬 (D-Day 마감 임박 순 및 최신 공고 순)
  finalBids.sort((a, b) => {
    if (a.dDay !== b.dDay) return a.dDay - b.dDay;
    return (b.budget || 0) - (a.budget || 0);
  });

  // 7. bids.json 및 meta.json 저장
  const outputPath = path.resolve(process.cwd(), 'public/data/bids.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalBids, null, 2), 'utf-8');
  console.log(`\n🎉 성공: 총 ${finalBids.length}건의 활성 입찰 공고 데이터가 저장되었습니다!`);
  console.log(`📁 파일 경로: ${outputPath}`);

  const metaPath = path.resolve(process.cwd(), 'public/data/meta.json');
  fs.writeFileSync(metaPath, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    totalCount: finalBids.length,
    activeDate: `${kstNow.getUTCFullYear()}년 ${kstNow.getUTCMonth() + 1}월 ${kstNow.getUTCDate()}일`,
    liveBidsCount: uniqueLiveBids.length
  }, null, 2), 'utf-8');
}

fetchLiveBids().catch((err) => {
  console.error('❌ 실행 중 에러 발생:', err);
  process.exit(1);
});
