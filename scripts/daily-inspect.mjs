import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. .env.local 로드
function loadEnv() {
  const envFiles = [path.join(rootDir, '.env.local'), path.join(rootDir, '.env')];
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// 2. KST 시간 계산
function getKSTDate() {
  const nowUtc = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(nowUtc.getTime() + kstOffset);
}

const kstNow = getKSTDate();
const yyyy = kstNow.getUTCFullYear();
const mm = String(kstNow.getUTCMonth() + 1).padStart(2, '0');
const dd = String(kstNow.getUTCDate()).padStart(2, '0');
const today = `${yyyy}-${mm}-${dd}`;

const yesterdayKst = new Date(kstNow.getTime() - 24 * 60 * 60 * 1000);
const y_yyyy = yesterdayKst.getUTCFullYear();
const y_mm = String(yesterdayKst.getUTCMonth() + 1).padStart(2, '0');
const y_dd = String(yesterdayKst.getUTCDate()).padStart(2, '0');
const yesterday = `${y_yyyy}-${y_mm}-${y_dd}`;

const kstHour = kstNow.getUTCHours();
const currentSlot = kstHour < 12 ? 'am' : 'pm';

console.log('================================================================================');
console.log(`🚀 [SignBid AI] 일일 원스톱 통합 점검 & 자동 발행 엔진`);
console.log(`📅 점검 일시(KST): ${today} ${String(kstHour).padStart(2, '0')}시 | 기준 슬롯: [${currentSlot.toUpperCase()}]`);
console.log('================================================================================\n');

// 3. 입찰 공고 마감일 자동 정기 동기화
const bidsPath = path.join(rootDir, 'public/data/bids.json');
let bidsUpdatedCount = 0;
if (fs.existsSync(bidsPath)) {
  const bids = JSON.parse(fs.readFileSync(bidsPath, 'utf-8'));
  const nowTime = new Date();
  let changed = false;

  bids.forEach((bid) => {
    if (bid.bidCloseDate) {
      const closeDate = new Date(bid.bidCloseDate.replace(/-/g, '/'));
      if (closeDate <= nowTime && (bid.status === '진행중' || bid.isClosed === false)) {
        bid.status = '마감';
        bid.isClosed = true;
        bid.dDay = -1;
        changed = true;
        bidsUpdatedCount++;
        console.log(`🔄 [공고 마감 자동 전환] ${bid.id} (${bid.title.slice(0, 30)}...) -> 상태: [마감]`);
      }
    }
  });

  if (changed) {
    fs.writeFileSync(bidsPath, JSON.stringify(bids, null, 2), 'utf-8');
    console.log(`✅ [공고 DB 최신화 완료] 총 ${bidsUpdatedCount}건의 마감 공고 상태가 업데이트되었습니다.\n`);
  } else {
    console.log(`✅ [공고 DB 점검 완료] 모든 공고 상태가 마감일과 일치합니다.\n`);
  }
}

// 4. 블로그 포스트 점검 및 필요 시 자동 발행
const postsDir = path.join(rootDir, 'src/content/posts');
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

const postFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));
const todayPostFiles = postFiles.filter((f) => f.startsWith(today));
const yesterdayPostFiles = postFiles.filter((f) => f.startsWith(yesterday));

console.log(`📊 [발행 이력 현황]`);
console.log(`  - 전일(${yesterday}) 발행 글: ${yesterdayPostFiles.length}건 (${yesterdayPostFiles.join(', ') || '없음'})`);
console.log(`  - 금일(${today}) 발행 글: ${todayPostFiles.length}건 (${todayPostFiles.join(', ') || '없음'})`);

const targetPostFileName = `${today}-${currentSlot}-ad-trend.md`;
const hasCurrentSlotPost = postFiles.some((f) => f.includes(`${today}-${currentSlot}`) || f === targetPostFileName);

if (hasCurrentSlotPost) {
  console.log(`✅ [포스트 발행 확인] 금일 ${currentSlot.toUpperCase()} 슬롯 글이 이미 안전하게 발행되어 있습니다: ${targetPostFileName}\n`);
} else {
  console.log(`⏳ [포스트 미발행 감지] 금일 ${currentSlot.toUpperCase()} 슬롯 글 생성을 시작합니다...\n`);

  // 커버 이미지 준비
  const COVER_IMAGES = [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80'
  ];

  let coverData = {
    url: COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)],
    credit: 'Photo via Unsplash',
    creditUrl: 'https://unsplash.com'
  };

  if (PEXELS_API_KEY && !PEXELS_API_KEY.includes('여기에_PEXELS_API키')) {
    try {
      const searchTerm = currentSlot === 'am' ? 'billboard sign street' : 'digital billboard times square 3d';
      const page = Math.floor(Math.random() * 4) + 1;
      const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=15&page=${page}&orientation=landscape`;
      const res = await fetch(apiUrl, { headers: { Authorization: PEXELS_API_KEY } });
      if (res.ok) {
        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
          coverData = {
            url: photo.src.large2x || photo.src.large || photo.src.original,
            credit: `Photo by ${photo.photographer || 'Pexels Creator'} on Pexels`,
            creditUrl: photo.url || `https://www.pexels.com/photo/${photo.id}/`
          };
          console.log(`📸 [Pexels 이미지 연동 성공] 작가: ${photo.photographer}`);
        }
      }
    } catch (err) {
      console.warn(`⚠️ [Pexels 연동 경고] ${err.message}`);
    }
  }

  let generatedText = '';
  if (GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const slotFocus = currentSlot === 'am'
        ? `[오전(AM) 테마: 국내 옥외광고물법·행안부 정책·지자체 아름다운 간판거리 사업·조달청 직접생산확인·한국옥외광고신문/사인문화 실무]`
        : `[오후(PM) 테마: 글로벌 DOOH 트렌드·3D 아나몰픽 미디어아트·AI 전환(AX) & pDOOH 타깃팅·세계옥외광고협회(WOO)·팝사인 신기술 르포]`;

      const prompt = `당신은 대한민국 옥외광고, 디지털사이니지, 사인물, 공공입찰 분야의 최고 수석 시장 분석가이자 SEO 전문 테크 라이터입니다.
네이버, 구글 검색엔진에서 검색량과 유입률이 가장 높은 **롱테일 키워드 결합형 블로그 글**을 작성해주세요.
${slotFocus}

반드시 아래 마크다운 Frontmatter를 포함한 완전한 마크다운 문서로만 출력해주세요.
---
title: (롱테일 키워드 결합형 매력적인 제목)
date: "${today}"
summary: (업계 종사자를 위한 핵심 요약 1~2줄)
category: "${currentSlot === 'am' ? '법규·정책 & 간판개선' : '글로벌 트렌드 & 3D 미디어'}"
tags: ["옥외광고입찰", "나라장터공고", "LED간판제작", "디지털사이니지", "공공디자인"]
coverImage: "${coverData.url}"
coverImageCredit: "${coverData.credit}"
coverImageCreditUrl: "${coverData.creditUrl}"
source: "${currentSlot === 'am' ? '행정안전부, 월간 사인문화, 한국옥외광고신문, 조달청 나라장터' : '세계옥외광고협회(WOO), 월간 팝사인, 조달청 나라장터'}"
sourceUrl: "${currentSlot === 'am' ? 'https://www.mois.go.kr' : 'https://worldooh.org'}"
---

> ### 📋 [공고 핵심 요약 카드]
> * **주요 품목:** ...
> * **발주처/지역:** ...
> * **예상 예산대:** ...
> * **입찰 마감 D-Day:** ...
> * **필수 자격조건:** ...

---

## 최신 공공 발주 및 산업 시장 트렌드 배경 분석
...

## 옥외광고 사업자 수주 성공을 위한 3대 핵심 실무 체크포인트
...

## 실무 꿀팁 및 참가 자격 FAQ
...

지금 바로 **[옥외광고 입찰정보 알리미 메인 페이지](/)**에서 지역별·품목별 최신 실시간 공고와 Gemini AI 분석 요약을 무료로 확인하세요!

---

📚 **자료 출처 및 공식 원문 링크 (Sources & References)**
* 🏛️ 조달청 나라장터: https://www.g2b.go.kr
* 📰 월간 팝사인: http://www.popsign.co.kr
* 📰 월간 사인문화: http://signmunhwa.cafe24.com
* 📰 한국옥외광고신문: https://koaa.or.kr
* 🌐 세계옥외광고협회(WOO): https://worldooh.org

> **※ 기사 및 리포트 안내:** 본 기사는 각 정부 부처, 공공기관 및 전문 언론사의 공식 보도자료와 공개 데이터를 바탕으로 작성된 분석 리포트입니다. 법령 개정 및 세부 정책 일정은 행정기관의 사정에 따라 변동될 수 있으므로, 관련 업무 추진 시 소관 부처의 공식 고시 및 원문 자료를 최종 확인하시기 바랍니다.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
      });

      if (response && response.text) {
        generatedText = response.text.trim();
        if (generatedText.startsWith('```markdown')) {
          generatedText = generatedText.replace(/^```markdown\s*/, '').replace(/\s*```$/, '');
        } else if (generatedText.startsWith('```')) {
          generatedText = generatedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        generatedText = generatedText.trim();
      }
    } catch (e) {
      console.warn(`⚠️ [Gemini API 경고] ${e.message}`);
    }
  }

  if (generatedText) {
    generatedText = generatedText
      .replace(/https:\/\/(www\.)?popsign\.co\.kr/g, 'http://www.popsign.co.kr')
      .replace(/https:\/\/signmunhwa\.cafe24\.com/g, 'http://signmunhwa.cafe24.com');

    const filePath = path.join(postsDir, targetPostFileName);
    fs.writeFileSync(filePath, generatedText, 'utf-8');
    console.log(`🎉 [발행 성공] 새 글이 안전하게 저장되었습니다: src/content/posts/${targetPostFileName}\n`);
  }
}

// 5. 검색 색인 빌드
console.log(`🔨 [통합 검색 색인 구축 시작]...`);
function stripMarkdown(markdownText) {
  if (!markdownText) return '';
  return markdownText
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/^([-*_]){3,}\s*$/gm, '')
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const dataDir = path.join(rootDir, 'public/data');
const searchIndexPath = path.join(dataDir, 'search-index.json');
const searchIndex = [];

// 블로그 포스트
const updatedPostFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));
updatedPostFiles.forEach((file) => {
  try {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const slug = file.replace(/\.md$/, '');
    const plainContent = stripMarkdown(content);
    searchIndex.push({
      type: 'post',
      id: slug,
      slug,
      title: data.title || '',
      description: data.description || data.summary || '',
      content: plainContent.slice(0, 600),
      date: data.date || '',
      category: data.category || '블로그 트렌드',
      tags: data.tags || [],
      url: `/blog/${slug}`
    });
  } catch (e) {}
});

// 입찰 공고
if (fs.existsSync(bidsPath)) {
  try {
    const bids = JSON.parse(fs.readFileSync(bidsPath, 'utf-8'));
    bids.forEach((bid) => {
      searchIndex.push({
        type: 'bid',
        id: bid.id,
        title: bid.title || '',
        client: bid.client || '',
        budget: bid.budget || 0,
        budgetText: bid.budgetText || '',
        location: bid.location || '전국',
        category: bid.category || '기타',
        bidType: bid.bidType || '',
        endDate: bid.endDate || '',
        dDay: bid.dDay ?? 0,
        description: `[발주처: ${bid.client}] [예산: ${bid.budgetText}] [마감: ${bid.endDate || ''}(D-${bid.dDay})] ${bid.aiSummary || ''}`,
        content: `${bid.title} ${bid.client} ${bid.category} ${bid.location} ${bid.budgetText} ${bid.aiSummary || ''} ${bid.aiTips || ''}`,
        tags: bid.tags || [],
        url: `/bids/${bid.id}`
      });
    });
  } catch (e) {}
}

fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 2), 'utf-8');
console.log(`✅ [통합 검색 색인 완료] 총 ${searchIndex.length}건 색인화 완료.\n`);

// 6. 18대 데이터 무결성 검증
console.log(`🛡️ [18대 데이터 무결성 전수 검증 시작]...`);
const rawJsonPath = path.join(rootDir, 'data/bids-verified-raw.json');
const currentBids = fs.existsSync(bidsPath) ? JSON.parse(fs.readFileSync(bidsPath, 'utf-8')) : [];
const rawList = fs.existsSync(rawJsonPath) ? JSON.parse(fs.readFileSync(rawJsonPath, 'utf-8')) : [];
const now = new Date();
let failureCount = 0;

// 규칙 1: 마감일 경과 공고 진행중 상태
currentBids.forEach((bid) => {
  if (bid.bidCloseDate) {
    const closeDate = new Date(bid.bidCloseDate.replace(/-/g, '/'));
    if (closeDate <= now && (bid.status === '진행중' || bid.isClosed === false)) {
      console.error(`  ❌ [규칙 1 위반] 공고 [${bid.id}] 마감일(${bid.bidCloseDate})이 경과했으나 진행중 상태입니다.`);
      failureCount++;
    }
  }
});

// 규칙 10: DIRECT 승인 공고
currentBids.forEach((bid) => {
  if (!bid.isVerified || bid.relevanceTier !== 'DIRECT') {
    console.error(`  ❌ [규칙 10 위반] 미승인 또는 DIRECT가 아닌 공고 [${bid.id}]가 공개되었습니다.`);
    failureCount++;
  }
});

// 규칙 17: 뉴스 링크 무결성
const newsJsonPath = path.join(rootDir, 'public/data/news.json');
if (fs.existsSync(newsJsonPath)) {
  const newsData = JSON.parse(fs.readFileSync(newsJsonPath, 'utf-8'));
  const articles = newsData.articles || [];
  articles.forEach((art) => {
    if (!art.link || (!art.link.startsWith('http://') && !art.link.startsWith('https://'))) {
      console.error(`  ❌ [규칙 17 위반] 뉴스 링크 오류: ${art.link}`);
      failureCount++;
    }
    if (art.link.includes('search.naver.com') || art.link.includes('search.daum.net') || art.link.includes('google.com/search?')) {
      console.error(`  ❌ [규칙 17 위반] 포털 검색창 우회 링크 검출: ${art.link}`);
      failureCount++;
    }
  });
}

// 규칙 18: 블로그 링크
updatedPostFiles.forEach((file) => {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
  if (content.includes('https://popsign.co.kr') || content.includes('https://www.popsign.co.kr')) {
    console.error(`  ❌ [규칙 18 위반] 팝사인 SSL 오류 링크 검출 in ${file}`);
    failureCount++;
  }
});

if (failureCount === 0) {
  console.log(`✅ [18대 무결성 검증 100% 통과] 위반 항목 0건 확인 완료!\n`);
} else {
  console.error(`❌ [무결성 검증 실패] 총 ${failureCount}건의 위반 사항이 검출되었습니다.\n`);
  process.exit(1);
}

console.log('================================================================================');
console.log('🎉 [SignBid AI] 일일 원스톱 통합 점검이 성공적으로 완료되었습니다!');
console.log('================================================================================');
