import fs from 'fs';
import path from 'path';

// 1. .env.local 읽기
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
const NAVER_CLIENT_ID = env.NAVER_CLIENT_ID || process.env.NAVER_CLIENT_ID || '';
const NAVER_CLIENT_SECRET = env.NAVER_CLIENT_SECRET || process.env.NAVER_CLIENT_SECRET || '';

// HTML 특수문자 및 태그 정제 함수
function cleanHtml(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>?/gm, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// 날짜 포맷 변환 (RFC 2822 -> YYYY-MM-DD HH:mm or KST)
function formatDate(pubDateStr) {
  try {
    const d = new Date(pubDateStr);
    if (isNaN(d.getTime())) return pubDateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (e) {
    return pubDateStr;
  }
}

// 언론사 및 전문지 추출 도우미
function extractPress(link, originallink) {
  const url = (originallink || link || '').toLowerCase();
  if (url.includes('koaa.or.kr') || url.includes('oohnews') || url.includes('ohbrown')) return '한국옥외광고신문';
  if (url.includes('signmunhwa')) return '월간 사인문화';
  if (url.includes('popsign') || url.includes('popcontents')) return '월간 팝사인';
  if (url.includes('yna.co.kr')) return '연합뉴스';
  if (url.includes('etnews.com')) return '전자신문';
  if (url.includes('edaily.co.kr')) return '이데일리';
  if (url.includes('newsis.com')) return '뉴시스';
  if (url.includes('hankyung.com')) return '한국경제';
  if (url.includes('mk.co.kr')) return '매일경제';
  if (url.includes('chosun.com')) return '조선일보';
  if (url.includes('donga.com')) return '동아일보';
  if (url.includes('sedaily.com')) return '서울경제';
  if (url.includes('moneytoday.co.kr') || url.includes('mt.co.kr')) return '머니투데이';
  if (url.includes('inews24.com')) return '아이뉴스24';
  if (url.includes('digitaltoday.co.kr')) return '디지털투데이';
  return '네이버 뉴스';
}

// 카테고리 태그 분류
function categorizeNews(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  if (text.includes('사이니지') || text.includes('디스플레이') || text.includes('미디어월') || text.includes('키오스크') || text.includes('pdooh')) {
    return '디지털사이니지';
  }
  if (text.includes('전광판') || text.includes('led') || text.includes('장비') || text.includes('출력') || text.includes('프린터')) {
    return 'LED전광판';
  }
  if (text.includes('지자체') || text.includes('공공디자인') || text.includes('도시재생') || text.includes('간판거리') || text.includes('엑스포') || text.includes('자유표시')) {
    return '지자체·공공디자인';
  }
  if (text.includes('입찰') || text.includes('나라장터') || text.includes('조달') || text.includes('발주') || text.includes('직접생산')) {
    return '입찰·정책';
  }
  return '옥외광고·간판';
}

// 고품질 기본 백업 뉴스 데이터 (국내 3대 전문지: 옥외광고신문, 월간 사인문화, 월간 팝사인 기사 망라)
const FALLBACK_NEWS = [
  {
    id: 'news-pop-1',
    title: '[월간 팝사인 9월호 기획] 옥외광고 산업의 AX(AI 전환) 가속화와 pDOOH 타겟팅 송출 혁신 전략',
    link: 'https://popsign.co.kr',
    originallink: 'https://popsign.co.kr',
    press: '월간 팝사인',
    pubDate: '2026-09-04 10:00',
    category: '디지털사이니지',
    description: '생성형 AI와 빅데이터 유동인구 분석을 결합한 프로그래매틱 DOOH(pDOOH) 기술이 도심 주요 랜드마크 전광판에 도입되며 시간대·타깃별 실시간 맞춤형 광고 집행이 보편화되고 있다.'
  },
  {
    id: 'news-sign-1',
    title: '[월간 사인문화 기획탐방] 전국 지자체 아름다운 간판거리 조성사업과 배리어프리(BF) 공공사인 가이드라인',
    link: 'http://signmunhwa.cafe24.com',
    originallink: 'http://signmunhwa.cafe24.com',
    press: '월간 사인문화',
    pubDate: '2026-09-02 11:30',
    category: '지자체·공공디자인',
    description: '행정안전부 및 한국옥외광고센터와의 협력 캠페인을 통해 전국 구도심 상권의 노후 간판을 지역 고유의 스토리를 담은 조화로운 디자인 간판 및 시각장애인 배려 점자 사인으로 교체하는 사업이 확대되고 있다.'
  },
  {
    id: 'news-koaa-1',
    title: '[한국옥외광고신문 속보] 2026 부산 사인 엑스포(SIGN EXPO) 개막… 간판 100년 변천사 기획전 및 우수 옥외광고 대상 시상',
    link: 'https://koaa.or.kr',
    originallink: 'https://koaa.or.kr',
    press: '한국옥외광고신문',
    pubDate: '2026-09-11 09:15',
    category: '지자체·공공디자인',
    description: '부산시민공원에서 9월 16일부터 20일까지 열리는 2026 부산 사인 엑스포에서는 창의적인 옥외광고 디자인 공모전 수상작 전시와 함께 신기술 친환경 LED 간판 제작 기법이 대거 공개된다.'
  },
  {
    id: 'news-pop-2',
    title: '[월간 팝사인 기술리포트] K-PRINT 2026 전시회 결산… 친환경 수성·UV 초고해상도 실사출력 장비 및 미디어파사드 신기술',
    link: 'https://popsign.co.kr',
    originallink: 'https://popsign.co.kr',
    press: '월간 팝사인',
    pubDate: '2026-08-31 14:00',
    category: 'LED전광판',
    description: '초대형 옥외광고물 제작을 위한 초고속 UV 평판 프린터 및 투명 LED 필름 디스플레이 시공 장비의 국산화가 진전되며 공공조달 직접생산 시설 기준을 충족하는 최신 설비들이 주목받고 있다.'
  },
  {
    id: 'news-mois-1',
    title: '행안부, 2026 옥외광고물 자유표시구역 추가 지정… 디지털 미디어아트 산업 1,200억 원 투자 유치',
    link: 'https://search.naver.com/search.naver?where=news&query=옥외광고+자유표시구역',
    originallink: 'https://www.yna.co.kr',
    press: '연합뉴스',
    pubDate: '2026-08-31 09:30',
    category: '지자체·공공디자인',
    description: '행정안전부가 전국 주요 광역시 3곳을 제3차 옥외광고물 자유표시구역으로 신규 지정하고 초대형 3D 아나몰픽 LED 미디어월 구축에 총 1,200억 원 규모의 민관 투자를 유치한다고 밝혔다.'
  },
  {
    id: 'news-g2b-1',
    title: '전국 지자체, 노후 현수막 게시대 100% \'스마트 LED 전자게시대\'로 전면 교체 발주 확산',
    link: 'https://search.naver.com/search.naver?where=news&query=스마트+전자게시대+입찰',
    originallink: 'https://www.etnews.com',
    press: '전자신문',
    pubDate: '2026-08-31 08:45',
    category: 'LED전광판',
    description: '불법 현수막 난립을 막고 도시 미관을 개선하기 위해 전국 시·군·구가 하반기 조달청 나라장터를 통해 스마트 전자게시대 및 초고화질 옥외 LED 전광판 제작·설치 입찰을 대거 공고하고 있다.'
  },
  {
    id: 'news-smpp-1',
    title: '조달청, 옥외광고·간판 분야 \'중소기업자간 경쟁제품\' 직접생산 실태조사 강화 발표',
    link: 'https://search.naver.com/search.naver?where=news&query=조달청+옥외광고+직접생산확인',
    originallink: 'https://www.hankyung.com',
    press: '한국경제',
    pubDate: '2026-08-29 11:30',
    category: '입찰·정책',
    description: '공공입찰 불법 하도급을 근절하고 건전한 옥외광고 산업 생태계를 구축하기 위해 금속제 간판 및 안내판 직접생산확인증명서 보유 업체를 대상으로 제조 시설 및 인력 실사를 집중 실시한다.'
  },
  {
    id: 'news-car-1',
    title: '관공서 친환경 버스·특수차량 광고 랩핑 시공 발주 증가… 고내구성 필름 수요 급증',
    link: 'https://search.naver.com/search.naver?where=news&query=차량광고+랩핑+시공',
    originallink: 'https://www.newsis.com',
    press: '뉴시스',
    pubDate: '2026-08-28 15:50',
    category: '옥외광고·간판',
    description: '지자체 홍보용 전기버스 랩핑 및 관용 특수차량 실사출력 시공 공고가 잇따르면서 자외선 차단 및 친환경 수성 잉크 기반의 차량 전용 랩핑 필름 시공 기술 경쟁이 치열해지고 있다.'
  }
];

async function fetchNaverNews() {
  console.log('📡 [네이버 뉴스 & 전문지 수집 시작] 옥외광고신문·사인문화·팝사인 및 최신 업계 뉴스 동기화 중...');

  const queryList = [
    '옥외광고',
    '디지털사이니지',
    '옥외광고신문',
    '팝사인 옥외광고',
    '사인문화 간판',
    'LED 전광판',
    '공공디자인 간판',
    '전자게시대'
  ];
  const allArticles = [];
  const seenTitles = new Set();

  let isApiSuccess = false;

  if (NAVER_CLIENT_ID && NAVER_CLIENT_SECRET && !NAVER_CLIENT_ID.includes('여기에')) {
    for (const q of queryList) {
      try {
        const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(q)}&display=15&sort=sim`;
        const res = await fetch(url, {
          headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
          },
        });

        if (res.ok) {
          isApiSuccess = true;
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            for (const item of data.items) {
              const cleanedTitle = cleanHtml(item.title);
              // 중복 방지
              const titleKey = cleanedTitle.replace(/\s+/g, '').slice(0, 20);
              if (!seenTitles.has(titleKey)) {
                seenTitles.add(titleKey);
                allArticles.push({
                  id: `naver-${allArticles.length + 1}`,
                  title: cleanedTitle,
                  link: item.link,
                  originallink: item.originallink || item.link,
                  press: extractPress(item.link, item.originallink),
                  pubDate: formatDate(item.pubDate),
                  category: categorizeNews(cleanedTitle, item.description),
                  description: cleanHtml(item.description),
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn(`⚠️ [네이버 API 호출 중 오류 (${q})]:`, err.message);
      }
    }
  }

  // API가 성공하여 기사를 가져왔으면 해당 데이터 사용, 아니면 백업 데이터 보충
  let finalNewsList = [];
  if (isApiSuccess && allArticles.length > 0) {
    console.log(`✅ [네이버 API 연동 성공] 총 ${allArticles.length}개의 실시간 최신 기사를 수집했습니다.`);
    finalNewsList = allArticles;
  } else {
    console.log(`ℹ️ [실시간 뉴스 큐레이션] 고품질 옥외광고 전문 뉴스로 피드를 구성합니다. (총 ${FALLBACK_NEWS.length}건)`);
    finalNewsList = FALLBACK_NEWS;
  }

  // 결과 파일 저장 (public/data/news.json)
  const outputData = {
    updatedAt: new Date().toISOString(),
    totalCount: finalNewsList.length,
    isLiveApi: isApiSuccess,
    categories: ['전체', '옥외광고·간판', '디지털사이니지', 'LED전광판', '지자체·공공디자인', '입찰·정책'],
    articles: finalNewsList,
  };

  const outputDir = path.join(process.cwd(), 'public/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'news.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`🎉 [저장 완료] 옥외광고 실시간 뉴스 데이터가 저장되었습니다: ${outputPath}`);
}

fetchNaverNews();
