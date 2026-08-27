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

// 2. 날짜 포맷 (YYYY-MM-DD)
const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const todayStr = `${yyyy}-${mm}-${dd}`;

// 고품질 옥외광고/디지털사이니지 Unsplash 이미지 프리셋
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80'
];

const randomCoverImage = COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];

// API 쿼터 초과 시 활용할 고품질 기본 포스트 생성 함수 (무중단 보장)
function getFallbackPost() {
  const topics = [
    {
      title: `${todayStr} 공공 조달시장 스마트 전자게시대 및 대형 미디어월 입찰 급증 분석`,
      summary: '전국 지자체 현수막 지정게시대의 디지털 전환 및 청사 대형 미디어월 공공 입찰 참여 전략을 정리합니다.',
      category: '디지털사이니지 / 옥외광고 트렌드',
      tags: ['디지털사이니지', '전자게시대', '미디어월', '공공입찰', '옥외광고'],
      content: `## 1. 지자체 옥외광고 인프라의 스마트 디지털화 가속

최근 전국 지자체와 공공기관에서 친환경 탄소중립 및 도시 미관 개선을 위해 기존 아날로그 현수막 지정게시대를 **초고화질 LED 전자게시대**로 교체하는 사업이 빠르게 늘고 있습니다.

또한 시·군·구 청사 로비 및 복합문화공간에 설치되는 **대형 미디어월과 스마트 키오스크** 사업이 억대 규모의 '협상에 의한 계약'으로 대거 발주되고 있습니다.

---

## 2. 옥외광고 사업자가 준비해야 할 핵심 기술 스펙

기존 사인물 및 간판 제작업체가 이러한 디지털 전환 흐름에서 수주 경쟁력을 갖추기 위해서는 다음 3가지 역량이 필수적입니다.

### ① 옥외 방수·방진(IP65 이상) 및 방열 구조체 설계
옥외 디스플레이는 직사광선과 폭우, 혹서에 견딜 수 있도록 5,000 nits 이상의 고휘도 LED 모듈과 내부 발열을 능동적으로 제어하는 쿨링 시스템 설계가 필수입니다.

### ② 콘텐츠 원격 제어 솔루션(CMS) 및 공공데이터 연계
단순 광고 재생을 넘어 날씨, 미세먼지, 재난안전문자 등 지자체 공공 데이터를 실시간 표출하는 소프트웨어 연동 역량이 제안서 평가에서 높은 배점을 받습니다.

### ③ 신속한 A/S 및 무상 하자보수 유지관리 체계
2~3년 무상 하자보증 기간 동안 모듈 픽셀 불량이나 전원 장애 발생 시 24시간 내 대응 가능한 유지보수 네트워크를 갖추어야 합니다.

---

## 3. 공공입찰 참여 시 3대 체크포인트

> **1. 직접생산확인증명서 갱신:** 안내전광판(4321151401), 디지털사이니지(4321190201), 간판(5512190101)  
> **2. 빛공해 방지법 준수:** 야간 조도 자동 조절(디밍) 센서 장착 필수  
> **3. 협상에 의한 계약 대비:** 3D 렌더링 조감도 및 구조 안전진단 계산서 사전 준비

---

*출처: 행정안전부 옥외광고 정책자료 및 조달청 나라장터 공공입찰 분석 종합*`
    },
    {
      title: `${todayStr} 친환경 저전력 LED 채널간판 및 고내구성 차량 랩핑 시공 트렌드`,
      summary: 'ESG 경영과 공공기관 친환경 사인물 발주 기준 강화에 따른 옥외광고 사업자 대응 가이드입니다.',
      category: '간판·조형물 / 차량랩핑',
      tags: ['LED간판', '채널간판', '차량랩핑', '친환경광고', '입찰가이드'],
      content: `## 1. 공공 사인물 및 관용차량 랩핑 시장의 친환경 기준 강화

공공기관 및 지자체 발주 시 환경표지 인증 자재 사용 및 에너지 절감형 LED 모듈 채택을 의무화하는 추세가 뚜렷해지고 있습니다.

또한 관용 승합차, 보건소 순회 진료 버스, 관공서 홍보 차량의 **풀 랩핑(Full Wrapping)** 용역이 정기적으로 발주되며 안정적인 수익원으로 자리잡고 있습니다.

---

## 2. 제작 및 시공 품질 향상 포인트

### ① 친환경 정품 필름 및 솔벤/라텍스 출력
차량 곡면에 장기간 부착되어도 도장면 훼손이 없는 정품 캐스트 필름과 내후성이 우수한 라텍스 출력 방식을 적용해야 준공 검사를 무사히 통과할 수 있습니다.

### ② 고효율 LED 모듈 및 SMPS 안정기 채택
야간 장시간 점등되는 채널간판의 경우 전기안전(KC) 인증 및 고효율 SMPS를 적용하여 화재 위험을 예방하고 전기요금을 대폭 절감할 수 있습니다.

---

## 3. 입찰 성공을 위한 필수 요건

> **1. 옥외광고사업 등록증 및 직접생산확인증명서 필수 지참**  
> **2. 과거 관공서 차량 랩핑 및 대형 사인물 시공 실적 증명원 확보**  
> **3. 시공 후 1년 이상 들뜸 및 변색 방지 품질보증서 발급 체계 마련**

---

*출처: 옥외광고물 등의 관리와 옥외광고산업 진흥에 관한 법률 및 조달청 공고 기준*`
    }
  ];

  const selected = topics[Math.floor(Math.random() * topics.length)];

  return `---
title: "${selected.title}"
date: "${todayStr}"
summary: "${selected.summary}"
category: "${selected.category}"
tags: ${JSON.stringify(selected.tags)}
coverImage: "${randomCoverImage}"
source: "공공데이터포털 및 옥외광고 정책 보도자료 종합"
---

![관련 이미지](${randomCoverImage})

${selected.content}
`;
}

async function generateAdTrendPost() {
  console.log(`🤖 [시작] ${todayStr} 옥외광고 트렌드 분석 블로그 글 생성`);

  let generatedText = '';

  if (GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const prompt = `당신은 대한민국 옥외광고, 디지털사이니지, 사인물, 공공입찰 분야의 최고 수석 시장 분석가이자 전문 테크 라이터입니다.
옥외광고 사업자(간판, LED 전광판, 전자게시대, 실내표찰, 차량랩핑, 현수막, 공공 조형물 제작/시공업체)들이 공공입찰 수주 경쟁력을 높이고 최신 시장 트렌드를 파악할 수 있는 고품질 정보성 블로그 글을 작성해주세요.

[글 작성 요구사항]
1. 주제: 지자체 전자게시대 및 대형 옥외 미디어월, 스마트 키오스크, 친환경 간판 공공 입찰 트렌드
2. 본문 길이: 1,000자 내외의 전문적이고 실용적인 내용
3. 소제목(##), 글머리기호, 인용구(>)를 적절히 활용하여 뛰어난 가독성 확보
4. 옥외광고 사업자 관점에서 실제 도움이 되는 실무 팁 및 입찰 포인트 3가지 포함
5. 하단에 출처 표기 포함

반드시 아래 마크다운 Frontmatter를 포함한 완전한 마크다운 문서로만 출력해주세요.
---
title: (매력적인 제목)
date: "${todayStr}"
summary: (핵심 요약 1~2줄)
category: "디지털사이니지 / 옥외광고 트렌드"
tags: ["옥외광고", "디지털전광판", "전자게시대", "입찰트렌드", "신기술"]
coverImage: "${randomCoverImage}"
source: "공공데이터포털 및 옥외광고 정책 보도자료 종합"
---

![관련 이미지](${randomCoverImage})

(본문...)`;

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
      }
    } catch (apiError) {
      console.warn(`⚠️ [Gemini API 경고] ${apiError.message} -> 고품질 템플릿 기반으로 자동 생성 전환`);
    }
  }

  // API 미응답 또는 실패 시 fallback 템플릿 적용 (배포 무중단 보장)
  if (!generatedText) {
    console.log(`📝 [대체 모드] 고품질 옥외광고 트렌드 분석 리포트를 기반으로 포스트 생성 중...`);
    generatedText = getFallbackPost();
  }

  // 저장 디렉토리 확인
  const postsDir = path.join(process.cwd(), 'src/content/posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // 파일명 결정 (src/content/posts/YYYY-MM-DD-ad-trend.md)
  const filePath = path.join(postsDir, `${todayStr}-ad-trend.md`);
  fs.writeFileSync(filePath, generatedText, 'utf-8');

  console.log(`🎉 [성공] 옥외광고 트렌드 블로그 포스트가 성공적으로 생성되었습니다!`);
  console.log(`📁 저장 경로: ${filePath}`);
}

generateAdTrendPost();
