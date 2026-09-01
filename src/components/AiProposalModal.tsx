"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  Download,
  Building2,
  Banknote,
  Printer,
  FileText,
  Presentation,
  Sliders,
  ChevronRight,
  Zap,
} from "lucide-react";

interface AiProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: {
    id: string;
    title: string;
    client: string;
    budget: number;
    budgetText: string;
    category: string;
    location: string;
    checkList?: {
      workPeriod?: string;
      warrantyPeriod?: string;
      licenseRequired?: string;
      directProduction?: string;
    };
  };
}

const STRENGTH_OPTIONS = [
  "직접생산확인(SMPP) 공장 보유",
  "3년 무상 하자보증 & 24h 긴급AS",
  "KS 방수 LED 모듈 100% 채택",
  "스카이/크레인 장비 및 안전자격 완비",
  "관공서·지자체 1,000건 이상 준공 실적",
  "친환경 고효율 에너지 절감 설계",
];

const CONCEPT_OPTIONS = [
  "도시 경관 조화 & 모던 하이테크",
  "지자체 상징 브랜드 & 품격 디자인",
  "주·야간 시인성 및 주목도 극대화",
  "친환경 탄소중립 & 미니멀 에코",
];

export default function AiProposalModal({
  isOpen,
  onClose,
  bid,
}: AiProposalModalProps) {
  // 제안사 커스텀 정보
  const [companyName, setCompanyName] = useState("(주)한국옥외광고미디어");
  const [repName, setRepName] = useState("홍길동");
  const [selectedConcept, setSelectedConcept] = useState(CONCEPT_OPTIONS[0]);
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([
    STRENGTH_OPTIONS[0],
    STRENGTH_OPTIONS[1],
    STRENGTH_OPTIONS[2],
    STRENGTH_OPTIONS[3],
  ]);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // 뷰 탭: document(공문서 서식) vs slides(PPT 슬라이드 카드)
  const [activeViewTab, setActiveViewTab] = useState<"document" | "slides">("document");
  const [copied, setCopied] = useState(false);
  const [copiedSlideIdx, setCopiedSlideIdx] = useState<number | null>(null);

  const toggleStrength = (s: string) => {
    if (selectedStrengths.includes(s)) {
      setSelectedStrengths(selectedStrengths.filter((item) => item !== s));
    } else {
      setSelectedStrengths([...selectedStrengths, s]);
    }
  };

  // 원가 계산
  const directMaterial = Math.round(bid.budget * 0.44);
  const directLabor = Math.round(bid.budget * 0.26);
  const equipmentCost = Math.round(bid.budget * 0.08);
  const overhead = Math.round(bid.budget * 0.12);
  const vat = Math.round(bid.budget * 0.10);

  // 6대 슬라이드 구조 데이터
  const slideCards = useMemo(() => {
    const workPeriod = bid.checkList?.workPeriod || "계약체결일로부터 30~60일 이내";
    const warranty = bid.checkList?.warrantyPeriod || "준공검사일로부터 3년 (하자보증금율 5%)";

    return [
      {
        slideNum: 1,
        title: "1. 사업 개요 및 제안사 소개",
        subtitle: "과업의 배경 및 제안사의 전문 핵심 역량",
        points: [
          `사업명: ${bid.title}`,
          `발주기관: ${bid.client} / 예산: ${bid.budgetText}`,
          `제안사: ${companyName} (대표: ${repName})`,
          `과업 기간: ${workPeriod}`,
          `핵심 역량: ${selectedStrengths.slice(0, 3).join(", ")}`,
        ],
      },
      {
        slideNum: 2,
        title: "2. 설치 환경 분석 및 특화 전략",
        subtitle: "현장 입지 특성에 최적화된 전략적 접근",
        points: [
          `설치 대상지 [${bid.location}] 주변 보행자 및 차량 동선 분석`,
          `디자인 콘셉트: [${selectedConcept}] 적용으로 기관 정체성 강화`,
          "주·야간 주변 조도 간섭 방지 및 광시야각(160° 이상) 설계",
          "풍하중(순간최대풍속 45m/s 이상) 구조 안전 앙카링 공법",
        ],
      },
      {
        slideNum: 3,
        title: "3. 디자인 & 자재 상세 제작 사양",
        subtitle: "KS 표준 규격 및 고품질 방수·방우 사양",
        points: [
          "프레임: 부식 방지 알루미늄 압출바 및 불소수지 3회 열처리 도장",
          "광원: KS/CE 인증 국내 대기업 정품 방수 LED 모듈(IP68)",
          "전원부: 정전압 방우형 SMPS(효율 90% 이상) + 2중 서지보호기",
          "전기 안전: 개별 누전차단기(30mA, 0.03초) 및 난연 배선관",
        ],
      },
      {
        slideNum: 4,
        title: "4. 시공 프로세스 및 안전관리 계획",
        subtitle: "철저한 무사고 안전 시공 및 공정 단계",
        points: [
          "1단계: 정밀 3D 레이저 실측 및 지자체 인허가(도로점용 등) 완료",
          "2단계: 본사 직영 공장 CNC 정밀 가공 및 24시간 연속 에이징 테스트",
          "3단계: 고소작업 안전검사필 스카이 크레인 투입 및 신호수 2인 상시 배치",
          "4단계: ${bid.client} 담당관 입회 하 조도시운전 및 준공검사 완료",
        ],
      },
      {
        slideNum: 5,
        title: "5. 품질 보증 & 24h 긴급 유지관리 체계",
        subtitle: "준공 후에도 안심할 수 있는 사후 보증 확약",
        points: [
          `무상 하자보증: ${warranty} 동안 100% 무상 수리 및 부품 교체`,
          "24시간 원스톱 긴급출동 A/S 센터 운영 (접수 후 4시간 이내 현장 출동)",
          "분기별 1회 전원부 절연저항 및 구조물 볼트 조임 무상 정기점검",
          "주요 부품(모듈, SMPS) 3년분 예비 비축으로 당일 긴급 조치 완비",
        ],
      },
      {
        slideNum: 6,
        title: "6. 예상 원가 산출 견적서",
        subtitle: "공공조달 적정 원가 배분 가이드",
        points: [
          `1. 직접재료비 (프레임, LED모듈, SMPS 등): ₩${directMaterial.toLocaleString()}원 (44%)`,
          `2. 직접노무비 (제작·시공기술공, 전기공): ₩${directLabor.toLocaleString()}원 (26%)`,
          `3. 고소장비대 (스카이 크레인 등): ₩${equipmentCost.toLocaleString()}원 (8%)`,
          `4. 제경비 및 일반관리비/이윤: ₩${overhead.toLocaleString()}원 (12%)`,
          `5. 부가가치세 (10%): ₩${vat.toLocaleString()}원 (10%)`,
          `합계: ₩${bid.budget.toLocaleString()}원`,
        ],
      },
    ];
  }, [bid, companyName, repName, selectedConcept, selectedStrengths, directMaterial, directLabor, equipmentCost, overhead, vat]);

  // 마크다운 형식의 제안서 본문
  const proposalDocumentText = useMemo(() => {
    const workPeriod = bid.checkList?.workPeriod || "계약체결일로부터 30~60일 이내";
    const warranty = bid.checkList?.warrantyPeriod || "준공검사일로부터 3년 (하자보증금율 5%)";
    const license = bid.checkList?.licenseRequired || "옥외광고사업 등록증 보유";
    const directProd = bid.checkList?.directProduction || "해당 세부품명 직접생산확인증명서 보유";

    return `================================================================================
과 업 수 행 계 획 서  및  입 찰  제 안 서  초 안
[ 사업명 : ${bid.title} ]
================================================================================

제안사: ${companyName} (대표자: ${repName})
발주처: ${bid.client}
제출일: ${new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}

--------------------------------------------------------------------------------
제1장. 사업 개요 및 기본 방침
--------------------------------------------------------------------------------
1.1. 과업 기본 정보
  • 사 업 명 : ${bid.title}
  • 발주기관 : ${bid.client}
  • 배정예산 : ${bid.budgetText} (금 ${bid.budget.toLocaleString()}원)
  • 사업분야 : ${bid.category} (설치지역: ${bid.location})
  • 과업기간 : ${workPeriod}
  • 참가자격 : ${license} / ${directProd}

1.2. 제안사 핵심 강점
${selectedStrengths.map((s, idx) => `  (${idx + 1}) ${s}`).join("\n")}

1.3. 과업 추진 목적
  본 과업은 [${bid.client}]의 품격과 공공 가치를 극대화하고, 이용객 및 시민에게 최상의 시인성과
  안전성을 제공할 수 있는 고품질 [${bid.category}]를 성공적으로 구축하는 데 목적이 있습니다.


--------------------------------------------------------------------------------
제2장. 현장 분석 및 디자인 전략
--------------------------------------------------------------------------------
2.1. 설치 환경 및 시인성 분석
  • 설치 대상지 주변 보행자 및 차량 이동 동선을 정밀 분석하여 최적의 시야각(160° 이상) 확보
  • 주·야간 주변 건축물과의 조도 간섭을 최소화하고 빛공해 방지 가이드라인을 엄격히 준수

2.2. 디자인 및 기획 콘셉트
  • 디자인 방향 : [ ${selectedConcept} ]
  • 발주처의 기관 아이덴티티와 주변 도시 경관이 완벽히 조화되는 모던 & 품격 디자인 적용
  • 눈부심 방지 및 균일한 면발광 디퓨저 광학 설계로 시각적 피로도 감소


--------------------------------------------------------------------------------
제3장. 자재 규격 및 제작 사양서
--------------------------------------------------------------------------------
3.1. 프레임 및 외장 구조
  • 프레임 재질 : 고강도 알루미늄 압출 프레임 및 갈바늄(Galvalume) 1.6T 이상
  • 도장 사양   : 내후성 불소수지 분체도장 (3회 열처리 도장, 염수분무 1,000시간 합격품)
  • 구조 안전   : 순간최대풍속 45m/s 이상 견디는 풍하중 구조 계산서 준수 앙카 시공

3.2. 광원 및 전기 제어 장치
  • LED 광원    : KS/CE 인증 국내 대기업 정품 방수 LED 모듈 (IP68 방수등급, 수명 50,000시간)
  • 전원공급장치: 정전압 방우형 SMPS (효율 90% 이상, KC안전인증, 2중 서지보호 회로 내장)
  • 안전 제어   : 고감도 누전차단기(30mA, 0.03초 이내) 개별 분기 회로 및 난연 배선관 시공


--------------------------------------------------------------------------------
제4장. 시공 프로세스 및 안전관리 계획
--------------------------------------------------------------------------------
4.1. 단계별 세부 공정표
  [1단계 : 현장 정밀 실측 및 디자인 최종 승인 (1~7일차)]
    - 현장 레이저 3D 정밀 실측 및 배선 경로 실사
    - 발주처 담당관 입회 하 원색 컬러 교정(Color Proof) 및 시안 최종 승인

  [2단계 : 본사 공장 직접생산 및 가공 조립 (8~20일차)]
    - 레이저 정밀 가공, 용접, 프레임 도장 및 LED 모듈 모듈화 결선
    - 공장 출하 전 24시간 연속 점등(Burn-in) 및 절연저항 전수 검사 실시

  [3단계 : 현장 반입, 고소작업 및 안착 시공 (21~27일차)]
    - 도로점용허가 취득 및 안전관리책임자 지정
    - 안전검사필 스카이/크레인 장비 투입 및 보행자 안전통제선 / 신호수 2인 상시 배치
    - 화학 앵커볼트 견고 체결 및 수평/수직 오차율 2mm 이내 정밀 부착

  [4단계 : 시운전, 준공검사 및 운영 인계 (28~30일차)]
    - 주/야간 조도 측정 및 전력 효율 측정 데이터 보고서 제출
    - 발주처 검수위원 입회 하 최종 준공검사 완료 및 유지관리 인계서 교부

4.2. 현장 무사고 안전대책
  • 모든 작업자 안전모, 2점식 안전대 착용 및 고소작업차 아웃트리거 지반 보강판 필수 설치
  • 공사 중 발생하는 철거 폐기물은 친환경 지정 폐기물 업체를 통해 전량 적법 처리


--------------------------------------------------------------------------------
제5장. 품질 보증 및 사후관리(A/S) 이행 확약
--------------------------------------------------------------------------------
5.1. 하자보증 기준
  • 하자보증기간 : ${warranty}
  • 보증 범위   : 프레임 부식, LED 모듈 불량, SMPS 전원 불량, 접합부 균열 전액 무상 교체

5.2. 24시간 긴급 A/S 출동 체계
  • 접수 후 4시간 이내 관할 A/S 전담팀 현장 도착
  • 접수 후 24시간 이내 부품 교체 및 정상 점등 복구 완료
  • 비상 예비 부품(모듈, SMPS) 3년분 자체 창고 상시 비축

5.3. 무상 정기점검 서비스
  • 연 2회(상/하반기) 전문 기술 인력 방문 정기 안전점검
  • 볼트 조임 상태, 전원 절연저항 측정, 표면 세척 서비스 무상 제공


--------------------------------------------------------------------------------
제6장. 예상 원가 산출 내역 총괄
--------------------------------------------------------------------------------
  1. 직접재료비 (프레임, 방수 LED, SMPS, 배선자재 등)   : ₩${directMaterial.toLocaleString()}원 (44%)
  2. 직접노무비 (제작 기능공, 시공 기술자, 전기기사)    : ₩${directLabor.toLocaleString()}원 (26%)
  3. 장비임차료 (스카이 크레인 고소작업차, 운송비)      : ₩${equipmentCost.toLocaleString()}원 (8%)
  4. 제경비 및 일반관리비/이윤                           : ₩${overhead.toLocaleString()}원 (12%)
  5. 부가가치세 (10%)                                    : ₩${vat.toLocaleString()}원 (10%)
--------------------------------------------------------------------------------
  합계 금액 (투찰 예산 기준)                            : ₩${bid.budget.toLocaleString()}원

귀 기관([${bid.client}])의 무궁한 발전을 기원하며, 위 과업수행계획서의 모든 사항을 성실히 이행할 것을 서약합니다.
================================================================================`;
  }, [bid, companyName, repName, selectedConcept, selectedStrengths, directMaterial, directLabor, equipmentCost, overhead, vat]);

  if (!isOpen) return null;

  const handleCopyDocument = () => {
    navigator.clipboard.writeText(proposalDocumentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySingleSlide = (slideText: string, idx: number) => {
    navigator.clipboard.writeText(slideText);
    setCopiedSlideIdx(idx);
    setTimeout(() => setCopiedSlideIdx(null), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([proposalDocumentText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `[AI제안서]_${bid.client}_${bid.title.slice(0, 12)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* 1. 상단 모달 헤더 */}
        <div className="bg-slate-950 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  AI 입찰 제안서 & 과업기획서 스튜디오
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm">
                  Gemini AutoRFP PRO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                관공서·학교·지자체 제출용 6대 표준 목차 제안서와 발표 슬라이드를 1초 만에 완성합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 공고 핵심 요약 정보 바 */}
        <div className="bg-indigo-950/40 px-5 sm:px-6 py-3 border-b border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
              발주처: <strong className="text-white font-bold">{bid.client}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
              예산: <strong className="text-amber-300 font-bold">{bid.budgetText}</strong>
            </span>
            <span className="text-slate-400 hidden sm:inline truncate max-w-xs">
              공고: {bid.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-semibold transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>제안사 정보 맞춤설정 {isOptionsOpen ? "닫기 ▲" : "열기 ▼"}</span>
            </button>
          </div>
        </div>

        {/* 3. [옵션 열림 시] 제안사 맞춤 커스텀 패널 */}
        {isOptionsOpen && (
          <div className="bg-slate-950/95 border-b border-slate-800 p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  🏢 제안사 상호명
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="예: (주)한국옥외광고미디어"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  👤 대표자 성명
                </label>
                <input
                  type="text"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* 디자인 콘셉트 선택 */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-400 font-semibold">
                🎨 디자인 & 기획 콘셉트
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CONCEPT_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedConcept(c)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      selectedConcept === c
                        ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 핵심 강점 선택 */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-400 font-semibold">
                🛡️ 제안서 강조 역량 (다중 선택)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STRENGTH_OPTIONS.map((s) => {
                  const isChecked = selectedStrengths.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStrength(s)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        isChecked
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                          : "bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-emerald-400" />}
                      <span>{s}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. 뷰 탭 전환기 (공문서 뷰 vs PPT 슬라이드 뷰) */}
        <div className="bg-slate-950 px-5 sm:px-6 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 inline-flex">
            <button
              onClick={() => setActiveViewTab("document")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeViewTab === "document"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>📄 공문서 전체 서식 뷰</span>
            </button>

            <button
              onClick={() => setActiveViewTab("slides")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeViewTab === "slides"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>🖥️ PPT 발표 슬라이드 뷰 (6장)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>외주비 300만 원 절감 효과</span>
          </div>
        </div>

        {/* 5. 메인 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/70">
          {activeViewTab === "document" ? (
            /* 공문서 전체 뷰 */
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-all shadow-inner border-l-4 border-l-indigo-500">
                {proposalDocumentText}
              </div>
            </div>
          ) : (
            /* PPT 발표 슬라이드 뷰 */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slideCards.map((slide, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3 group transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        SLIDE {slide.slideNum} / 6
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopySingleSlide(
                            `[SLIDE ${slide.slideNum}] ${slide.title}\n${slide.points.map((p) => `• ${p}`).join("\n")}`,
                            idx
                          )
                        }
                        className="text-[11px] text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSlideIdx === idx ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> 복사됨
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <Copy className="w-3 h-3" /> 슬라이드 복사
                          </span>
                        )}
                      </button>
                    </div>

                    <h4 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
                      {slide.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">{slide.subtitle}</p>

                    <div className="pt-2 space-y-1.5 border-t border-slate-800">
                      {slide.points.map((pt, pIdx) => (
                        <p key={pIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. 하단 액션 바 */}
        <div className="bg-slate-950 px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>💡 <strong>한글(HWP)</strong>, <strong>워드</strong>, <strong>파워포인트(PPT)</strong>에 바로 붙여넣으세요.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>인쇄 / PDF 저장</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>텍스트 다운로드 (.txt)</span>
            </button>

            <button
              onClick={handleCopyDocument}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>전체 복사 완료! ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" />
                  <span>전체 클립보드 복사</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
