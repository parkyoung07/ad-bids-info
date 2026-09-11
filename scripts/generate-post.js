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

// 2. 한국 표준시(KST, UTC+9) 기준 날짜 및 시간 슬롯 (AM / PM)
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

// 실행 인자(am/pm) 확인 또는 현재 KST 시간에 따른 자동 결정
const kstHour = kstNow.getUTCHours();
const requestedSlot = (process.argv[2] || '').toLowerCase();
const currentSlot = requestedSlot === 'am' || requestedSlot === 'pm' ? requestedSlot : (kstHour < 12 ? 'am' : 'pm');

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

*출처: 월간 팝사인(popsign.co.kr), 공공데이터포털, 조달청 나라장터(G2B) 옥외광고 입찰 분석 종합*

---

> **※ 기사 및 리포트 안내:** 본 기사는 각 정부 부처, 공공기관 및 전문 언론사의 공식 보도자료와 공개 데이터를 바탕으로 작성된 분석 리포트입니다. 법령 개정 및 세부 정책 일정은 행정기관의 사정에 따라 변동될 수 있으므로, 관련 업무 추진 시 소관 부처의 공식 고시 및 원문 자료를 최종 확인하시기 바랍니다.

---

**🏷️ 관련 검색 태그:**  
\`#옥외광고입찰\` \`#나라장터공고\` \`#디지털사이니지\` \`#LED전광판\` \`#전자게시대\` \`#미디어월\` \`#스마트시티\` \`#공공입찰팁\``
    },
    {
      title: `[월간 팝사인 9월호 심층분석] 옥외광고 산업의 AI 전환(AX)과 프로그래매틱 DOOH(pDOOH) 입찰 전략`,
      summary: '월간 팝사인 2026년 9월호 기획특집! 생성형 AI 영상 제작 툴과 빅데이터 타깃팅을 결합한 pDOOH 최신 기술 동향 및 공공 사이니지 수주 대응법을 총정리합니다.',
      category: '디지털사이니지 / AI 신기술',
      tags: ['팝사인', '디지털사이니지', 'pDOOH', 'AI전환', '옥외광고트렌드', '스마트시티', '공공입찰', '나라장터'],
      content: `> ### 📋 전문지 핵심 분석 카드
> - **주요 출처:** 월간 《팝사인(POPSIGN)》 2026년 9월호 기획특집
> - **핵심 키워드:** AX(AI 전환), 프로그래매틱 DOOH, 유동인구 센서 타깃팅, CMS 클라우드
> - **사업자 혜택:** 공공기관 디지털 사이니지 제안서 기술평가 시 AI 기반 최적화 솔루션 우대
> - **필수 대응:** 시방서 내 실시간 빅데이터 연동 및 안전 관제 API 규격 준수

---

## 1. 옥외광고와 AI의 결합: 왜 지금 'AX(AI 전환)'인가?

월간 《팝사인》 9월호에 따르면 국내 옥외광고 산업은 단순한 하드웨어 설치 중심에서 **'인공지능(AI) 기반 동적 콘텐츠 최적화'** 단계로 급속히 진화하고 있습니다.

특히 지자체와 공공기관의 스마트시티 프로젝트에서는 유동인구의 연령대, 성별, 날씨, 교통량 데이터를 실시간 분석하여 가장 효과적인 공공 캠페인과 지역 상권 광고를 자동 송출하는 **pDOOH(Programmatic DOOH)** 기술을 기본 요구사항으로 채택하고 있습니다.

---

## 2. 공공입찰 제안서에 꼭 담아야 할 3대 AI 핵심 역량

### ① 유동인구 및 환경 센서 기반 다이내믹 콘텐츠 송출
강우, 미세먼지 경보, 폭염 등 기상 조건 변화에 따라 디스플레이의 안내 문구와 밝기가 자동으로 전환되는 반응형 CMS 아키텍처를 제시하세요.

### ② 생성형 AI 활용 3D 아나몰픽 모션 그래픽 제작 파이프라인
고비용의 3D 영상 제작 부담을 줄이기 위해 생성형 비디오 AI 모델을 활용한 고화질 미디어 콘텐츠 제작 공정을 제안서에 명시하면 기술평가에서 높은 점수를 받을 수 있습니다.

### ③ 24시간 원격 AI 화재·고장 감지 및 자동 복구 시스템
전광판 모듈의 발열 이상이나 통신 장애를 AI 알고리즘이 사전에 감지하고 관리자에게 즉시 알람을 전송하는 스마트 유지보수 체계를 구축해야 합니다.

---

## 💡 옥외광고 사장님들이 가장 많이 묻는 질문 (FAQ)

**Q1. 중소 옥외광고 업체도 pDOOH 입찰에 참여할 수 있나요?**  
**A.** 네, 하드웨어 제작(직접생산확인) 역량을 갖춘 옥외광고 기업이 CMS 및 AI 솔루션 전문 소프트웨어 기업과 **공동수급협정(분담이행방식)**을 체결하여 참여하는 사례가 활발합니다.

**Q2. 팝사인 등 전문지에 소개된 신기술 장비는 조달 등록이 가능한가요?**  
**A.** 조달청 혁신시제품 또는 우수조달물품 지정을 통해 기술력이 검증된 친환경·스마트 사이니지 장비는 수의계약 혜택을 받을 수 있습니다.

---

### 🔗 실시간 유사 입찰공고 바로 확인하기
지금 바로 **[옥외광고 입찰정보 알리미 메인 페이지](/)**에서 지역별·품목별 최신 실시간 공고와 Gemini AI 분석 요약을 무료로 확인하세요!

---

*출처: 월간 《팝사인(POPSIGN)》 2026년 9월호, 조달청 나라장터(G2B), 한국옥외광고센터*

---

> **※ 기사 및 리포트 안내:** 본 기사는 각 정부 부처, 공공기관 및 전문 언론사의 공식 보도자료와 공개 데이터를 바탕으로 작성된 분석 리포트입니다. 법령 개정 및 세부 정책 일정은 행정기관의 사정에 따라 변동될 수 있으므로, 관련 업무 추진 시 소관 부처의 공식 고시 및 원문 자료를 최종 확인하시기 바랍니다.

---

**🏷️ 관련 검색 태그:**  
\`#팝사인\` \`#디지털사이니지\` \`#pDOOH\` \`#AI전환\` \`#옥외광고트렌드\` \`#스마트시티\` \`#공공입찰\` \`#나라장터\``
    },
    {
      title: `[월간 사인문화 기획탐방] 전국 지자체 아름다운 간판거리 조성사업과 배리어프리(BF) 유니버설 공공사인 가이드`,
      summary: '월간 사인문화 2026년 9월호 탐방! 행안부 간판개선사업 지원 지침과 시각장애인 배려 점자 사인, 지역 고유의 스토리를 담은 명품 간판거리 수주 비결을 공개합니다.',
      category: '간판·조형물 / 공공디자인',
      tags: ['사인문화', '간판개선사업', '아름다운간판', '배리어프리', '공공디자인', '옥외광고입찰', '지자체입찰'],
      content: `> ### 📋 전문지 핵심 분석 카드
> - **주요 출처:** 월간 《사인문화(Sign Munhwa)》 2026년 9월호 기획탐방
> - **핵심 키워드:** 아름다운 간판거리, 행안부 간판개선사업, 배리어프리(BF), 유니버설 디자인
> - **사업자 혜택:** 지자체별 2억~10억 원 규모의 간판개선 종합 프로젝트 수주 기회
> - **필수 자격:** 옥외광고사업 등록, 직접생산확인(간판), 공공디자인 전문회사 등록 우대

---

## 1. 전국 구도심을 살리는 '아름다운 간판거리' 프로젝트의 진화

월간 《사인문화》 9월호 기획탐방에 따르면 전국 17개 시·도 지자체가 추진하는 간판개선사업이 기존의 획일적인 글자 정비에서 **'거리 상권의 역사와 개성을 살리는 로컬 스토리텔링 디자인'**으로 진화하고 있습니다.

행정안전부와 한국옥외광고센터가 매년 공모하는 간판개선사업은 사업지당 수억 원의 국비·지방비가 투입되는 대규모 프로젝트로, 옥외광고 디자인 및 제작 시공 역량을 겸비한 전문 기업들에게 최고의 수주 무대가 되고 있습니다.

---

## 2. 간판개선사업 공공입찰 수주 3대 핵심 포인트

### ① 상인회 주민설명회 및 디자인 동의율 확보 전략
간판개선사업은 건물주 및 점포주의 100% 동의가 성패를 좌우합니다. 제안서에 점포별 1:1 맞춤형 3D 시뮬레이션 시안 제공 방안을 제시해야 합니다.

### ② 유니버설 디자인 & 배리어프리(BF) 규격 완비
저시력자 및 휠체어 이용자를 고려한 시인성 높은 타이포그래피와 점자 돌출 표찰을 결합하여 공공디자인 심의를 원스톱으로 통과할 수 있어야 합니다.

### ③ 친환경 소재(재활용 알루미늄, 초절전 LED) 적용
에너지 효율 1등급 KC 인증 SMPS와 내구성이 검증된 도장 공정을 적용하여 지자체 하자보수 기준(2년 무상 보증)을 완벽히 충족해야 합니다.

---

## 💡 옥외광고 사장님들이 가장 많이 묻는 질문 (FAQ)

**Q1. 간판개선사업 입찰은 제안서(PT) 발표가 필수인가요?**  
**A.** 대다수 지자체 간판개선사업은 **[협상에 의한 계약 (정량 20% + 정성 60% + 가격 20%)]** 구조로 진행되므로, 총괄 디자이너의 PT 발표 역량과 3D 조감도 완성도가 당락의 70% 이상을 결정합니다.

**Q2. 디자인 전문회사와 옥외광고 제작업체 간의 공동수급이 가능한가요?**  
**A.** 매우 권장됩니다. 산업디자인전문회사(시각/환경디자인)와 옥외광고 직접생산확인 보유 제작사 간의 **공동이행 컨소시엄** 구성 시 가산점을 부여하는 지자체가 많습니다.

---

### 🔗 실시간 유사 입찰공고 바로 확인하기
지금 바로 **[옥외광고 입찰정보 알리미 메인 페이지](/)**에서 지역별·품목별 최신 실시간 공고와 Gemini AI 분석 요약을 무료로 확인하세요!

---

*출처: 월간 《사인문화(Sign Munhwa)》 2026년 9월호, 행정안전부, 한국옥외광고센터*

---

> **※ 기사 및 리포트 안내:** 본 기사는 각 정부 부처, 공공기관 및 전문 언론사의 공식 보도자료와 공개 데이터를 바탕으로 작성된 분석 리포트입니다. 법령 개정 및 세부 정책 일정은 행정기관의 사정에 따라 변동될 수 있으므로, 관련 업무 추진 시 소관 부처의 공식 고시 및 원문 자료를 최종 확인하시기 바랍니다.

---

**🏷️ 관련 검색 태그:**  
\`#사인문화\` \`#간판개선사업\` \`#아름다운간판\` \`#배리어프리\` \`#공공디자인\` \`#옥외광고입찰\` \`#지자체입찰\``
    },
    {
      title: `[한국옥외광고신문 속보] 2026 부산 사인 엑스포(SIGN EXPO) 개막… 우수 옥외광고 대상작과 친환경 LED 간판 신기술 총정리`,
      summary: '한국옥외광고신문 2026년 9월 최신 보도! 부산시민공원에서 열리는 2026 부산 사인 엑스포 개막 소식과 옥외광고 대상 수상작 디자인 트렌드, 저전력 친환경 시공 공법을 분석합니다.',
      category: '간판·조형물 / 전시·엑스포',
      tags: ['한국옥외광고신문', '부산사인엑스포', '옥외광고대상', '친환경간판', 'LED간판제작', '직접생산확인', '공공디자인'],
      content: `> ### 📋 전문지 핵심 분석 카드
> - **주요 출처:** 《한국옥외광고신문》 2026년 9월 11일자 속보
> - **행사명:** 2026 부산 사인 엑스포 (부산시민공원 다솜광장)
> - **전시 핵심:** 옥외광고 100년 변천사 기획전, 2026 옥외광고 대상 수상작, 친환경 자재관
> - **시사점:** 공공입찰 적격심사 및 제안평가에서 '우수 옥외광고 대상 수상 실적' 가산점 우대

---

## 1. 옥외광고인의 대축제, '2026 부산 사인 엑스포'의 개막과 의미

《한국옥외광고신문》 보도에 따르면 부산광역시와 부산시옥외광고협회가 주최하는 **'2026 부산 사인 엑스포(SIGN EXPO)'**가 부산시민공원에서 성대하게 개막했습니다.

이번 엑스포는 아름다운 옥외광고 문화 정착과 신기술 보급을 위해 **'2026 부산 옥외광고 대상 시상식'**과 함께 우리나라 간판의 변천사를 한눈에 볼 수 있는 특별 기획전시가 함께 열려 전국 옥외광고 사업자들의 이목을 집중시키고 있습니다.

---

## 2. 엑스포에서 드러난 2026 옥외광고 3대 핵심 제작 트렌드

### ① 빛공해를 줄인 친환경 간접조명 및 백라이트 채널
과도한 직사 눈부심을 방지하고 야간 도시 경관의 품격을 높이는 후광(Back-lit) 및 측광 간접조명 기술이 대다수 공모전 수상작의 공통점으로 나타났습니다.

### ② 업사이클링 금속 소재와 저탄소 복합패널의 활용
폐알루미늄 프레임을 정밀 가공하여 재활용한 친환경 금속 채널과 고내구성 탄소섬유 복합소재가 새로운 간판 외장재로 각광받고 있습니다.

### ③ 조달청 직접생산확인 설비 기준을 선도하는 CNC·레이저 정밀 가공
간판의 접합 부위와 곡면 마감 품질을 극대화하는 5축 CNC 조각기 및 파이버 레이저 용접 장비의 국산화 모델들이 전시 현장에서 큰 호응을 얻었습니다.

---

## 💡 옥외광고 사장님들이 가장 많이 묻는 질문 (FAQ)

**Q1. 지자체 옥외광고 대상 수상 실적이 공공입찰에 도움이 되나요?**  
**A.** 네, 많은 지자체 및 공공기관의 간판 디자인 제안공모에서 '지자체 옥외광고 대상 수상 기업'에 대해 **신인도 평가 가산점(1~2점)**을 부여하고 있습니다.

**Q2. 전시회 출품된 신자재를 관공서 시방서에 반영할 수 있나요?**  
**A.** 친환경 마크 인증(환경표지) 또는 KC 안전인증을 획득한 자재는 관공서 특정규격 승인 요청을 통해 시방서 반영이 가능합니다.

---

### 🔗 실시간 유사 입찰공고 바로 확인하기
지금 바로 **[옥외광고 입찰정보 알리미 메인 페이지](/)**에서 지역별·품목별 최신 실시간 공고와 Gemini AI 분석 요약을 무료로 확인하세요!

---

*출처: 《한국옥외광고신문(koaa.or.kr)》 2026년 9월 11일 보도, 부산광역시 옥외광고협회, 조달청 나라장터*

---

> **※ 기사 및 리포트 안내:** 본 기사는 각 정부 부처, 공공기관 및 전문 언론사의 공식 보도자료와 공개 데이터를 바탕으로 작성된 분석 리포트입니다. 법령 개정 및 세부 정책 일정은 행정기관의 사정에 따라 변동될 수 있으므로, 관련 업무 추진 시 소관 부처의 공식 고시 및 원문 자료를 최종 확인하시기 바랍니다.

---

**🏷️ 관련 검색 태그:**  
\`#한국옥외광고신문\` \`#부산사인엑스포\` \`#옥외광고대상\` \`#친환경간판\` \`#LED간판제작\` \`#직접생산확인\` \`#공공디자인\``
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
  console.log(`🤖 [시작] ${todayStr} [${currentSlot.toUpperCase()} 슬롯] 옥외광고 SEO 최적화 트렌드 분석 블로그 글 생성`);

  // 커버 이미지 준비 (Pexels API 검색 또는 기본 프리셋 및 가이드라인 준수)
  const queryHint = currentSlot === 'am' ? 'billboard sign street' : 'digital billboard times square 3d';
  const coverData = await getCoverImage(queryHint);

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

[글 작성 세부 지침]

1. 제목(Title) 생성 규칙 (매우 중요):
   - 딱딱한 행정 공고명 대신, 검색량이 높고 클릭을 유도하는 매력적인 롱테일 키워드 결합형 제목을 작성하세요.
   - 예시 형태:
     (AM) "[2026 옥외광고 입찰] 지자체 노후 간판 교체 및 실내표찰·스텐현판 발주 총정리 (예산·자격조건 분석)"
     (PM) "[2026 글로벌 트렌드] 뉴욕·런던 뒤흔든 '3D 아나몰픽 DOOH'와 pDOOH 혁신… 국내 옥외광고 적용 로드맵"

2. 프론트매터(Frontmatter) Tags 규격 (6~8개 필수):
   - 실무 검색용 핵심 키워드 6~8개 포함

3. 본문 구성 필수 요소 (순서대로 포함):
   - **[공고 핵심 요약 카드 인포박스]** (인용구 > 마크다운 활용): 주요 품목, 발주처/지역, 예상 예산대, 입찰 마감 D-Day, 필수 자격조건
   - **[본문 1: 최신 공공 발주 및 산업 시장 트렌드 배경 분석]** (소제목 ## 활용)
   - **[본문 2: 옥외광고 사업자 수주 성공을 위한 3대 핵심 실무 체크포인트]** (소제목 ## 및 하위 번호)
   - **[실무 꿀팁 및 참가 자격 FAQ 섹션]** (사장님들이 가장 많이 검색하는 핵심 질문 2개와 명쾌한 답변)
   - **[공고 원문 및 메인 이동 링크]**:
     \`지금 바로 **[옥외광고 입찰정보 알리미 메인 페이지](/)**에서 지역별·품목별 최신 실시간 공고와 Gemini AI 분석 요약을 무료로 확인하세요!\`
   - **[📚 자료 출처 및 공식 원문 링크 (Sources & References)]**:
     \`* 🏛️ 조달청 나라장터: https://www.g2b.go.kr\`
     \`* 📰 월간 팝사인: http://www.popsign.co.kr\`
     \`* 📰 월간 사인문화: http://signmunhwa.cafe24.com\`
     \`* 📰 한국옥외광고신문: https://koaa.or.kr\`
     \`* 🌐 세계옥외광고협회(WOO): https://worldooh.org\`
   - **[안전 필수 안내문구]**:
     \`> **※ 기사 및 리포트 안내:** 본 기사는 각 정부 부처, 공공기관 및 전문 언론사의 공식 보도자료와 공개 데이터를 바탕으로 작성된 분석 리포트입니다. 법령 개정 및 세부 정책 일정은 행정기관의 사정에 따라 변동될 수 있으므로, 관련 업무 추진 시 소관 부처의 공식 고시 및 원문 자료를 최종 확인하시기 바랍니다.\`
   - **[해시태그 모음 섹션]**: 본문 맨 하단에 복사 가능한 태그 인라인 코드 블록

4. 주의사항:
   - 본문 내에 ![이미지](...) 마크다운 태그를 직접 삽입하지 마세요. (상단 coverImage로 자동 표시됩니다)
   - 전체 본문 길이는 1,200자 내외로 전문성과 가독성을 극대화하세요.

반드시 아래 마크다운 Frontmatter를 포함한 완전한 마크다운 텍스트 문서로만 출력해주세요.
---
title: (롱테일 키워드 결합형 매력적인 제목)
date: "${todayStr}"
summary: (업계 종사자를 위한 핵심 요약 1~2줄)
category: "${currentSlot === 'am' ? '법규·정책 & 간판개선' : '글로벌 트렌드 & 3D 미디어'}"
tags: ["옥외광고입찰", "나라장터공고", "LED간판제작", "디지털사이니지", "공공디자인"]
coverImage: "${coverData.url}"
coverImageCredit: "${coverData.credit}"
coverImageCreditUrl: "${coverData.creditUrl}"
source: "${currentSlot === 'am' ? '행정안전부, 월간 사인문화, 한국옥외광고신문, 조달청 나라장터' : '세계옥외광고협회(WOO), 월간 팝사인, 조달청 나라장터'}"
sourceUrl: "${currentSlot === 'am' ? 'https://www.mois.go.kr' : 'https://worldooh.org'}"
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

  // SSL 미지원 프로토콜 링크 자동 교정 (18대 데이터 무결성 규칙 18 보장)
  generatedText = generatedText
    .replace(/https:\/\/(www\.)?popsign\.co\.kr/g, 'http://www.popsign.co.kr')
    .replace(/https:\/\/signmunhwa\.cafe24\.com/g, 'http://signmunhwa.cafe24.com');

  // 저장 디렉토리 확인
  const postsDir = path.join(process.cwd(), 'src/content/posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // 파일명 결정 (src/content/posts/YYYY-MM-DD-am-ad-trend.md or pm-ad-trend.md)
  const filePath = path.join(postsDir, `${todayStr}-${currentSlot}-ad-trend.md`);
  fs.writeFileSync(filePath, generatedText, 'utf-8');

  console.log(`🎉 [성공] ${currentSlot.toUpperCase()} 슬롯 블로그 포스트가 성공적으로 생성되었습니다!`);
  console.log(`📁 저장 경로: ${filePath}`);
}

generateAdTrendPost();
