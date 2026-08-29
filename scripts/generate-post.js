const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// 1. .env.local 환경변수 읽기
function loadEnv() {
  const env = { ...process.cwd };
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
const GEMINI_API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const PEXELS_API_KEY = env.PEXELS_API_KEY || process.env.PEXELS_API_KEY;

// 2. 한국 표준시(KST, UTC+9) 기준 날짜 포맷 (YYYY-MM-DD)
function getKSTDate() {
  const nowUtc = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(nowUtc.getTime() + kstOffset);
}

const kstNow = getKSTDate();
const yyyy = kstNow.getUTCFullYear();
const mm = String(kstNow.getUTCMonth() + 1).padStart(2, '0');
const dd = String(kstNow.getUTCDate()).padStart(2, '0');
const todayStr = `${yyyy}-${mm}-${dd}`;

// 고품질 옥외광고/디지털사이니지/미디어월 기본 이미지 프리셋
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80', // 도심 옥외 대형 LED 전광판
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80', // 대형 빌딩 미디어월 전광판
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80', // 공공 랜드마크 디지털 사이니지
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80', // 스마트시티 미디어 디스플레이
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80'  // 화려한 현대적 상업·공공 LED 사인
];

// Pexels API를 활용한 실시간 고화질 옥외광고 이미지 검색 및 활용 지침 준수 함수
async function getCoverImage(query = '') {
  if (PEXELS_API_KEY && !PEXELS_API_KEY.includes('여기에_PEXELS_API키')) {
    try {
      const keywords = [
        'billboard advertising',
        'digital signage display',
        'city neon billboard night',
        'times square billboard screen',
        'outdoor led display',
        'commercial billboard urban',
        'electronic billboard building'
      ];
      const searchTerm = query || keywords[Math.floor(Math.random() * keywords.length)];
      const page = Math.floor(Math.random() * 4) + 1;
      const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=15&page=${page}&orientation=landscape`;

      const res = await fetch(apiUrl, {
        headers: { Authorization: PEXELS_API_KEY }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
          const pexelsUrl = photo.src.large2x || photo.src.large || photo.src.original;
          const photographer = photo.photographer || 'Pexels Creator';
          const photoPageUrl = photo.url || `https://www.pexels.com/photo/${photo.id}/`;

          console.log(`📸 [Pexels 이미지 연동 성공] 검색어: "${searchTerm}" | 작가: ${photographer}`);
          return {
            url: pexelsUrl,
            credit: `Photo by ${photographer} on Pexels`,
            creditUrl: photoPageUrl
          };
        }
      } else {
        console.warn(`⚠️ [Pexels API 응답 코드 ${res.status}] 기본 프리셋 이미지를 사용합니다.`);
      }
    } catch (err) {
      console.warn(`⚠️ [Pexels API 호출 오류: ${err.message}] 기본 프리셋 이미지를 사용합니다.`);
    }
  }

  // Pexels 키가 없거나 실패 시 기본 프리셋 선택
  const fallbackUrl = COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];
  return {
    url: fallbackUrl,
    credit: 'Photo via Unsplash',
    creditUrl: 'https://unsplash.com'
  };
}

// API 쿼터 초과 시 활용할 고품질 SEO 최적화 기본 포스트 생성 함수 (무중단 보장)
function getFallbackPost(coverData) {
  const topics = [
    {
      title: `[2026 옥외광고 입찰] 지자체 노후 간판 교체 및 실내표찰·스텐현판 발주 총정리 (예산·자격조건 분석)`,
      summary: '전국 지자체 청사 및 공공기관의 실내외 사인물 교체 발주 동향과 옥외광고 사업자가 수주를 위해 반드시 갖춰야 할 직접생산확인 자격 요건을 분석합니다.',
      category: '간판·조형물 / 실내표찰·현판',
      tags: ['옥외광고입찰', '나라장터공고', 'LED간판제작', '실내표찰', '스텐현판', '공공디자인', '직접생산확인', '지자체입찰'],
      content: `> ### 📋 공고 핵심 요약 카드
> - **주요 대상 품목:** LED 채널간판, 층별 종합안내도, 아크릴/스텐 호실표찰, 지주안내탑
> - **발주처 및 지역:** 전국 광역/기초 지자체, 공공의료원, 국립공원공단, 교육청
> - **평균 예산 규모:** 3,000만 원 ~ 1억 5,000만 원 (소액수의 및 제한경쟁 전자입찰)
> - **필수 참가 자격:** 옥외광고사업 등록, 직접생산확인증명서(간판/안내판 세부품명)

---

## 1. 2026년 상반기 공공 사인물 발주 트렌드 변화

전국 공공기관과 지방자치단체의 청사 환경 개선 사업이 본격화되면서 **노후 간판 교체 및 실내 표찰·종합안내 사인시스템** 발주가 급증하고 있습니다.

특히 최근 조달청 나라장터 공고를 살펴보면 다음과 같은 3가지 특징이 두드러집니다:
1. **친환경 저전력 LED 채널간판 의무화:** 에너지 절감형 LED 모듈과 KC 인증 SMPS 안정기 사용이 시방서 기본 규격으로 지정되었습니다.
2. **배리어프리(BF) 및 점자 표찰 확대:** 시각장애인용 점자 안내판 및 유니버설 디자인 규격을 준수한 호실표찰 발주가 필수가 되었습니다.
3. **지역제한 소액수의계약 활성화:** 2천만 원~5천만 원 구간의 여성/장애인/소기업 우대 소액 수의계약이 활발히 집행되고 있습니다.

---

## 2. 옥외광고 사업자 수주 성공을 위한 3대 체크포인트

### ① 직접생산확인증명서 유효기간 및 세부품명 점검
공공입찰 투찰 전 반드시 중소기업유통센터(SMPP)에서 아래 세부품명의 직접생산확인증명서 유효기간을 점검해야 합니다.
- **간판(세부품명번호: 5512190101):** 채널간판, 지주간판 제작 실적
- **안내판/표찰(세부품명번호: 5512171801):** 아크릴/금속 표찰 가공 시설

### ② 시공 도면(CAD/3D 시안) 및 구조안전성 검토서 사전 구비
협상에 의한 계약이나 적격심사 제안서 제출 시 지자체 야간경관 심의 기준에 맞춘 3D 조감도와 태풍 대비 풍압 구조 계산서를 첨부하면 기술평가에서 높은 배점을 획득할 수 있습니다.

### ③ 하자보수 이행보증 및 신속 A/S 체계 구축
공공기관은 납품 후 1~2년 무상 하자보수(A/S) 체계를 엄격히 평가합니다. 권역별 유지보수 출동 프로세스를 제안서에 명시하세요.

---

## 💡 옥외광고 사장님들이 가장 많이 묻는 질문 (FAQ)

**Q1. 옥외광고사업 등록증만 있으면 나라장터 간판 입찰에 참여할 수 있나요?**  
**A.** 단순 옥외광고업 등록 외에도 중소기업자간 경쟁제품 입찰의 경우 **'직접생산확인증명서'**를 반드시 보유해야 유효한 투찰로 인정됩니다.

**Q2. 소액수의계약(2천만 원 이하)은 어떻게 수주하나요?**  
**A.** 나라장터 전자수의 시담 공고를 실시간 모니터링하고, 관내 발주처 담당 부서(도시디자인과, 회계과)에 자사 포트폴리오와 인증 서류를 사전 등록해두는 것이 유리합니다.

---

### 🔗 실시간 유사 입찰공고 바로 확인하기
지금 바로 **[옥외광고 입찰정보 알리미 메인 페이지](/)**에서 지역별·품목별 최신 실시간 공고와 Gemini AI 분석 요약을 무료로 확인하세요!

---

*출처: 공공데이터포털(data.go.kr), 조달청 나라장터(G2B) 옥외광고 입찰공고 분석 종합*

---

**🏷️ 관련 검색 태그:**  
\`#옥외광고입찰\` \`#나라장터공고\` \`#LED간판제작\` \`#실내표찰\` \`#스텐현판\` \`#차량랩핑시공\` \`#디지털사이니지\` \`#공공디자인\``
    },
    {
      title: `[2026 나라장터 공고] 관공서 대형 LED 전광판 및 스마트 전자게시대 입찰 가이드 (직접생산확인·수주팁)`,
      summary: '지자체 현수막 지정게시대의 디지털 전환 및 청사 대형 미디어월 공공입찰 참여 시 필수 점검 사항과 제안서 평가 고득점 전략을 공개합니다.',
      category: '디지털사이니지 / 옥외광고 트렌드',
      tags: ['옥외광고입찰', '나라장터공고', '디지털사이니지', 'LED전광판', '전자게시대', '미디어월', '스마트시티', '공공입찰팁'],
      content: `> ### 📋 공고 핵심 요약 카드
> - **주요 대상 품목:** 옥외형 대형 풀컬러 LED 전광판, 스마트 터치 키오스크, 청사 미디어월
> - **발주처 및 지역:** 전국 지자체, 공사/공단, 대학교 산학협력단, 관광공사
> - **평균 예산 규모:** 8,000만 원 ~ 3억 원 대 (협상에 의한 계약)
> - **필수 참가 자격:** 직접생산확인증명서(안내전광판/디지털사이니지), 정보통신공사업 면허

---

## 1. 옥외광고 시장의 대세, 스마트 전자게시대 공공 발주 확대
 
전국 시·군·구에서 불법 현수막을 줄이고 도시 미관을 개선하기 위해 기존 천 현수막 지정게시대를 **초고화질 LED 전자게시대**로 전면 전환하고 있습니다.

억대 단위의 예산이 책정되는 대형 전광판 입찰 시장을 공략하기 위해 옥외광고 및 사인물 제작업체가 반드시 숙지해야 할 핵심 포인트를 정리해 드립니다.

---

## 2. 입찰 성공을 위한 3대 핵심 기술 요건

### ① 옥외 방수·방진(IP65 이상) 및 고휘도 규격 충족
직사광선 아래에서도 선명한 가독성을 위해 5,000~8,000 nits 이상의 고휘도 모듈과 완벽한 방수·방진 등급 공인시험성적서(KOLAS) 확보가 필수입니다.

### ② 원격 CMS 소프트웨어 및 공공데이터(날씨·재난) 연계
단순 광고 송출을 넘어 지자체 재난안전문자, 버스정보(BIS), 미세먼지 수치를 실시간 표출하는 소프트웨어 연동 역량이 제안서 정성평가 1순위 배점 항목입니다.

### ③ 야간 빛공해 방지(자동 조도 디밍 제어) 시스템
주거지역 빛공해 방지법 규정에 부합하도록 주변 조도에 맞춰 표면 휘도를 자동 감광하는 센서 제어 모듈을 규격서에 명시해야 합니다.

---

## 💡 옥외광고 사장님들이 가장 많이 묻는 질문 (FAQ)

**Q1. 전자게시대 입찰은 어떤 계약 방식으로 발주되나요?**  
**A.** 통상 5천만 원 이상 사업은 **[협상에 의한 계약 (기술능력평가 80% + 입찰가격 20%)]** 방식으로 진행되므로 가격 경쟁보다 제안서 품질과 사후관리 체계가 당락을 결정합니다.

**Q2. LED 전광판 제작 실적이 없는데 컨소시엄 구성이 가능한가요?**  
**A.** 하드웨어 외함 제작에 강점을 가진 옥외광고 업체와 CMS 소프트웨어 전문 IT 기업 간의 **공동수급(공동이행방식)** 입찰 참가가 폭넓게 허용되고 있습니다.

---

### 🔗 실시간 유사 입찰공고 바로 확인하기
지금 바로 **[옥외광고 입찰정보 알리미 메인 페이지](/)**에서 지역별·품목별 최신 실시간 공고와 Gemini AI 분석 요약을 무료로 확인하세요!

---

*출처: 공공데이터포털(data.go.kr), 조달청 나라장터(G2B) 옥외광고 입찰공고 분석 종합*

---

**🏷️ 관련 검색 태그:**  
\`#옥외광고입찰\` \`#나라장터공고\` \`#디지털사이니지\` \`#LED전광판\` \`#전자게시대\` \`#미디어월\` \`#스마트시티\` \`#공공입찰팁\``
    }
  ];

  const selected = topics[Math.floor(Math.random() * topics.length)];

  return `---
title: "${selected.title}"
date: "${todayStr}"
summary: "${selected.summary}"
category: "${selected.category}"
tags: ${JSON.stringify(selected.tags)}
coverImage: "${coverData.url}"
coverImageCredit: "${coverData.credit}"
coverImageCreditUrl: "${coverData.creditUrl}"
source: "공공데이터포털(data.go.kr) 및 조달청 나라장터(G2B) 옥외광고 입찰 분석 종합"
sourceUrl: "https://www.g2b.go.kr"
---

${selected.content}
`;
}

async function generateAdTrendPost() {
  console.log(`🤖 [시작] ${todayStr} 옥외광고 SEO 최적화 트렌드 분석 블로그 글 생성`);

  // 커버 이미지 준비 (Pexels API 검색 또는 기본 프리셋 및 가이드라인 준수)
  const coverData = await getCoverImage();

  let generatedText = '';

  if (GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const prompt = `당신은 대한민국 옥외광고, 디지털사이니지, 사인물, 공공입찰 분야의 최고 수석 시장 분석가이자 SEO 전문 테크 라이터입니다.
네이버, 구글 검색엔진에서 검색량과 유입률이 가장 높은 **롱테일 키워드 결합형 블로그 글**을 작성해주세요.

[글 작성 세부 지침]

1. 제목(Title) 생성 규칙 (매우 중요):
   - 딱딱한 행정 공고명 대신, 검색량이 높고 클릭을 유도하는 매력적인 롱테일 키워드 결합형 제목을 작성하세요.
   - 예시 형태: "[2026 옥외광고 입찰] 지자체 노후 간판 교체 및 실내표찰·스텐현판 발주 총정리 (예산·자격조건 분석)" 또는 "[2026 나라장터 공고] 관공서 대형 LED 전광판 및 스마트 전자게시대 입찰 가이드 (직접생산확인·수주팁)"

2. 프론트매터(Frontmatter) Tags 규격 (6~8개 필수):
   - 실무 검색용 핵심 키워드 6~8개 포함: ["옥외광고입찰", "나라장터공고", "LED간판제작", "실내표찰", "스텐현판", "차량랩핑시공", "디지털사이니지", "공공디자인"]

3. 본문 구성 필수 요소 (순서대로 포함):
   - **[공고 핵심 요약 카드 인포박스]** (인용구 > 마크다운 활용): 주요 품목, 발주처/지역, 예상 예산대, 입찰 마감 D-Day, 필수 자격조건
   - **[본문 1: 최신 공공 발주 시장 트렌드 및 배경 분석]** (소제목 ## 활용)
   - **[본문 2: 옥외광고 사업자 수주 성공을 위한 3대 핵심 실무 체크포인트]** (소제목 ## 및 하위 번호)
   - **[실무 꿀팁 및 참가 자격 FAQ 섹션]** (사장님들이 가장 많이 검색하는 핵심 질문 2개와 명쾌한 답변)
   - **[공고 원문 및 메인 이동 링크]**:
     \`지금 바로 **[옥외광고 입찰정보 알리미 메인 페이지](/)**에서 지역별·품목별 최신 실시간 공고와 Gemini AI 분석 요약을 무료로 확인하세요!\`
   - **[출처 표기]**: \`*출처: 공공데이터포털(data.go.kr), 조달청 나라장터(G2B) 옥외광고 입찰공고 분석 종합*\`
   - **[해시태그 모음 섹션]**: 본문 맨 하단에 복사 가능한 태그 인라인 코드 블록 (\`#옥외광고입찰\` \`#나라장터공고\` ...)

4. 주의사항:
   - 본문 내에 ![이미지](...) 마크다운 태그를 직접 삽입하지 마세요. (상단 coverImage로 자동 표시됩니다)
   - 전체 본문 길이는 1,200자 내외로 전문성과 가독성을 극대화하세요.

반드시 아래 마크다운 Frontmatter를 포함한 완전한 마크다운 텍스트 문서로만 출력해주세요.
---
title: (롱테일 키워드 결합형 매력적인 제목)
date: "${todayStr}"
summary: (업계 종사자를 위한 핵심 요약 1~2줄)
category: "간판·조형물 / 디지털사이니지"
tags: ["옥외광고입찰", "나라장터공고", "LED간판제작", "실내표찰", "스텐현판", "차량랩핑시공", "디지털사이니지", "공공디자인"]
coverImage: "${coverData.url}"
coverImageCredit: "${coverData.credit}"
coverImageCreditUrl: "${coverData.creditUrl}"
source: "공공데이터포털(data.go.kr) 및 조달청 나라장터(G2B) 옥외광고 입찰 분석 종합"
sourceUrl: "https://www.g2b.go.kr"
---

(본문 소제목 및 내용...)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      if (response && response.text) {
        generatedText = response.text.trim();
        if (generatedText.startsWith('```markdown')) {
          generatedText = generatedText.replace(/^```markdown\s*/, '').replace(/\s*```$/, '');
        } else if (generatedText.startsWith('```')) {
          generatedText = generatedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        generatedText = generatedText.trim();

        // Frontmatter에 정확한 이미지 정보 및 크레딧 주입 보장
        if (!generatedText.includes('coverImageCredit:')) {
          generatedText = generatedText.replace(
            /coverImage:\s*"?[^"\n]+"?/,
            `coverImage: "${coverData.url}"\ncoverImageCredit: "${coverData.credit}"\ncoverImageCreditUrl: "${coverData.creditUrl}"`
          );
        }
      }
    } catch (apiError) {
      console.warn(`⚠️ [Gemini API 경고] ${apiError.message} -> SEO 최적화 템플릿 기반으로 자동 생성 전환`);
    }
  }

  // API 미응답 또는 실패 시 fallback 템플릿 적용 (배포 무중단 보장)
  if (!generatedText) {
    console.log(`📝 [대체 모드] SEO 최적화 옥외광고 트렌드 분석 리포트를 기반으로 포스트 생성 중...`);
    generatedText = getFallbackPost(coverData);
  }

  // 저장 디렉토리 확인
  const postsDir = path.join(process.cwd(), 'src/content/posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // 파일명 결정 (src/content/posts/YYYY-MM-DD-ad-trend.md)
  const filePath = path.join(postsDir, `${todayStr}-ad-trend.md`);
  fs.writeFileSync(filePath, generatedText, 'utf-8');

  console.log(`🎉 [성공] SEO 및 트래픽 최적화 블로그 포스트가 성공적으로 생성되었습니다!`);
  console.log(`📁 저장 경로: ${filePath}`);
}

generateAdTrendPost();
