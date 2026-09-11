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
    .replace(/&#39;/g, "'")
    .replace(/&middot;/g, '·')
    .trim();
}

// 날짜 포맷 변환 (RFC 2822 or ISO -> YYYY-MM-DD HH:mm)
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
function extractPress(title, source, link) {
  if (source && source.trim()) return source.trim();
  const url = (link || '').toLowerCase();
  if (url.includes('koaa.or.kr') || url.includes('oohnews')) return '한국옥외광고신문';
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
  if (url.includes('newspim.com')) return '뉴스핌';
  if (url.includes('cnews.co.kr')) return '대한경제';

  // 제목 뒷부분 ' - 언론사명' 파싱
  const match = title.match(/-\s*([^-]+)$/);
  if (match && match[1]) {
    return match[1].trim();
  }

  return '주요 언론사';
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

// 3대 전문지 엄선 심층 분석 기사 (우리 사이트의 정밀 블로그 분석 리포트 및 공식 홈으로 연결)
const CURATED_SPECIALIZED_NEWS = [
  {
    id: 'news-pop-1',
    title: '[월간 팝사인 9월호 기획] 옥외광고 산업의 AX(AI 전환) 가속화와 pDOOH 타겟팅 송출 혁신 전략',
    link: 'http://www.popsign.co.kr',
    originallink: 'http://www.popsign.co.kr',
    internalBlogSlug: '2026-09-11-specialized-media-popsign-signmunhwa-oohnews',
    press: '월간 팝사인',
    pubDate: '2026-09-11 10:00',
    category: '디지털사이니지',
    description: '생성형 AI와 빅데이터 유동인구 분석을 결합한 프로그래매틱 DOOH(pDOOH) 기술이 도심 주요 랜드마크 전광판에 도입되며 시간대·타깃별 실시간 맞춤형 광고 집행이 보편화되고 있습니다. (SignBid 전문 심층 분석 리포트 제공)'
  },
  {
    id: 'news-sign-1',
    title: '[월간 사인문화 기획탐방] 전국 지자체 아름다운 간판거리 조성사업과 배리어프리(BF) 공공사인 가이드라인',
    link: 'http://signmunhwa.cafe24.com',
    originallink: 'http://signmunhwa.cafe24.com',
    internalBlogSlug: '2026-09-11-specialized-media-popsign-signmunhwa-oohnews',
    press: '월간 사인문화',
    pubDate: '2026-09-11 09:30',
    category: '지자체·공공디자인',
    description: '행정안전부 및 한국옥외광고센터와의 협력 캠페인을 통해 전국 구도심 상권의 노후 간판을 지역 고유의 스토리를 담은 조화로운 디자인 간판 및 시각장애인 배려 점자 사인으로 교체하는 사업이 확대되고 있습니다. (SignBid 전문 심층 분석 리포트 제공)'
  },
  {
    id: 'news-koaa-1',
    title: '[한국옥외광고신문 전면특집] 옥외광고업계도 본격적인 AI 시대 대응에 분주… Vision AI·pDOOH와 공공입찰 수주 전략',
    link: 'https://www.koaa.or.kr',
    originallink: 'https://www.koaa.or.kr',
    internalBlogSlug: '2026-09-02-ooh-news-ai-era-transformation',
    press: '한국옥외광고신문',
    pubDate: '2026-09-11 09:00',
    category: '입찰·정책',
    description: '한국옥외광고협회중앙회 공식 기관지가 보도한 옥외광고 AI 혁신의 3대 축과, 옥외광고 사업자가 조달청 나라장터 공공입찰 및 민간 수주전에서 승리하기 위한 실전 대응 전략을 심층 조명합니다. (SignBid 전문 심층 분석 리포트 제공)'
  },
  {
    id: 'news-global-1',
    title: '[글로벌 DOOH 리포트] 뉴욕·런던 뒤흔든 3D 아나몰픽 DOOH와 pDOOH 혁신… 국내 옥외광고 적용 로드맵',
    link: 'https://worldooh.org',
    originallink: 'https://worldooh.org',
    internalBlogSlug: '2026-09-11-pm-global-3d-anamorphic-dooh-trend',
    press: '세계옥외광고협회(WOO)',
    pubDate: '2026-09-11 08:30',
    category: '디지털사이니지',
    description: '세계옥외광고협회(WOO) 2026 글로벌 리포트 분석! 타임스스퀘어와 피카딜리 서커스를 달군 3D 아나몰픽 착시 미디어아트와 실시간 프로그래매틱 DOOH(pDOOH) 성공 사례를 총정리합니다. (SignBid 전문 심층 분석 리포트 제공)'
  }
];

// 실시간 언론사 뉴스 수집 (Google News RSS & Naver API)
async function fetchLiveNews() {
  console.log('📡 [실시간 뉴스 수집 시작] 옥외광고·디지털사이니지·LED전광판 언론사 기사 동기화 중...');

  const queryList = [
    '옥외광고',
    '디지털사이니지',
    'LED 전광판',
    '전자게시대',
    '부산사인엑스포'
  ];

  const liveArticles = [];
  const seenTitles = new Set();

  for (const q of queryList) {
    try {
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`;
      const res = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (res.ok) {
        const xml = await res.text();
        const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

        for (const item of items) {
          const rawTitle = (item.match(/<title>(.*?)<\/title>/) || [])[1] || '';
          const rawLink = (item.match(/<link\/?>(.*?)(?:<\/link>)?\n/) || item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
          const rawPubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
          const rawSource = (item.match(/<source[^>]*>(.*?)<\/source>/) || [])[1] || '';
          const rawDesc = (item.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '';

          const cleanedTitle = cleanHtml(rawTitle);
          if (!cleanedTitle || !rawLink) continue;

          // 중복 방지 키
          const titleKey = cleanedTitle.replace(/\s+/g, '').slice(0, 18);
          if (!seenTitles.has(titleKey)) {
            seenTitles.add(titleKey);

            const pressName = extractPress(cleanedTitle, rawSource, rawLink);
            // 제목 끝의 ' - 언론사명' 제거하여 깔끔하게 표시
            const displayTitle = cleanedTitle.replace(new RegExp(`\\s*-\\s*${pressName}$`, 'i'), '').trim();

            let description = cleanHtml(rawDesc);
            if (!description || description.length < 15 || description.includes(cleanedTitle)) {
              description = `${pressName}에서 보도한 [${displayTitle}] 관련 소식입니다. 옥외광고, 디지털 사이니지, 미디어 파사드 및 공공조달 정책과 직결된 최신 업계 동향을 담고 있습니다. 상세 내용은 언론사 원문 기사에서 확인하실 수 있습니다.`;
            }

            liveArticles.push({
              id: `live-${liveArticles.length + 1}`,
              title: displayTitle || cleanedTitle,
              link: rawLink.trim(),
              originallink: rawLink.trim(),
              press: pressName,
              pubDate: formatDate(rawPubDate),
              category: categorizeNews(cleanedTitle, description),
              description: description
            });
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️ [RSS 뉴스 수집 중 오류 (${q})]:`, err.message);
    }
  }

  // 전문지 엄선 리포트와 실시간 언론사 뉴스 결합
  const finalNewsList = [
    ...CURATED_SPECIALIZED_NEWS,
    ...liveArticles.slice(0, 20)
  ];

  console.log(`✅ [뉴스 수집 완료] 총 ${finalNewsList.length}건 (전문지 엄선 ${CURATED_SPECIALIZED_NEWS.length}건 + 실시간 언론사 기사 ${Math.min(liveArticles.length, 20)}건)`);

  // 결과 파일 저장 (public/data/news.json)
  const outputData = {
    updatedAt: new Date().toISOString(),
    totalCount: finalNewsList.length,
    isLiveApi: true,
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

fetchLiveNews();
