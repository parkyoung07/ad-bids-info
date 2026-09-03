"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Printer,
  AlertTriangle,
  Building2,
  FileCheck2,
  Truck,
  Sparkles,
  Search,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  FileText,
  BadgeCheck,
  CheckSquare,
  Square,
  RotateCcw,
} from "lucide-react";
import bidsData from "../../../public/data/bids.json";

export default function SpecXrayStudioClient() {
  const bids = useMemo(() => bidsData || [], []);
  const [selectedBidId, setSelectedBidId] = useState<string>(bids[0]?.id || "R26BK01650918-000");
  const [activeTab, setActiveTab] = useState<"all" | "compliance" | "materials" | "safety" | "certs">("all");
  const [copied, setCopied] = useState(false);

  // 인터랙티브 필수서류 체크리스트 상태
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    doc1: true,
    doc2: true,
    doc3: true,
    doc4: false,
    doc5: true,
    doc6: false,
    doc7: true,
  });

  const currentBid = useMemo(() => {
    return bids.find((b) => b.id === selectedBidId) || bids[0];
  }, [bids, selectedBidId]);

  const isLed =
    currentBid?.category?.includes("전광판") ||
    currentBid?.category?.includes("사이니지") ||
    currentBid?.title?.includes("전광판") ||
    currentBid?.title?.includes("LED");
  const isBanner =
    currentBid?.category?.includes("현수막") ||
    currentBid?.title?.includes("현수막") ||
    currentBid?.title?.includes("배너");
  const isSign =
    currentBid?.category?.includes("간판") ||
    currentBid?.title?.includes("간판") ||
    currentBid?.category?.includes("조형물");

  // 서류 체크리스트 정의
  const complianceDocs = useMemo(() => {
    const directCode = isLed
      ? "안내전광판(5512240201) / 디지털사이니지"
      : isBanner
      ? "현수막·배너(5512150201)"
      : isSign
      ? "간판(5512190101) / 안내판(5512171801)"
      : "광고대행(8210150101)";

    return [
      { id: "doc1", title: "옥외광고사업 등록증", desc: "시·군·구청 발행 및 유효기간 내 등록증명서", required: true, penalty: "실격" },
      { id: "doc2", title: `직접생산확인증명서 [${directCode}]`, desc: "중소기업유통센터(SMPP) 발행 및 공고 세부품명 10자리 번호 일치", required: true, penalty: "실격" },
      { id: "doc3", title: "중소기업·소상공인 확인서", desc: "중소벤처기업부 발급 유효기간 확인 필수", required: true, penalty: "실격" },
      { id: "doc4", title: "공장등록증 또는 제작시설 증빙", desc: "자사 직접생산 공장 등록증 또는 설비 임대차 확인서", required: true, penalty: "실격" },
      { id: "doc5", title: "기업신용평가등급 확인서", desc: "조달청 제출용 유효 신용평가서 (B0 이상 권장)", required: true, penalty: "감점" },
      { id: "doc6", title: "사용인감계 및 법인/개인 인감증명서", desc: "전자서명 또는 제안서 날인용 최근 3개월 이내 발급분", required: false, penalty: "보완요구" },
      { id: "doc7", title: "국세·지방세·4대보험 완납증명서", desc: "투찰 마감일 기준 미납 없는 유효 완납증명서", required: true, penalty: "계약취소" },
    ];
  }, [isLed, isBanner, isSign]);

  // 실격 위험 방지 룰셋
  const riskRules = useMemo(() => {
    return [
      {
        level: "danger",
        title: "직접생산확인증명서 세부품명 번호 불일치",
        desc: "공고문에 명기된 10자리 세부물품번호와 1자리라도 다를 경우 적격심사 즉시 0점(무효) 처리됩니다.",
        solution: "투찰 전 SMPP 사이트에서 보유 세부품명 번호와 공고 원문 규격을 재대조하세요.",
      },
      {
        level: "danger",
        title: "지역제한(소재지 기준) 관내 사업장 미달",
        desc: `본 공고는 [${currentBid?.location || "지역"}] 소재 기업 제한 공고입니다. 법인등기부상 본점 또는 지사 등록일을 확인하세요.`,
        solution: "공고일 전일부터 계약체결일까지 해당 지역 내 주된 영업소가 유지되어야 합니다.",
      },
      {
        level: "warning",
        title: "복합면허(정보통신/전기공사) 요구 시 단독 투찰 주의",
        desc: isLed ? "LED 전광판/사이니지 사업은 정보통신공사업 면허가 상호 보완 요구될 수 있습니다." : "간판 설치 시 전기 인입 공사 포함 여부를 시방서에서 확인하세요.",
        solution: "단독 면허 부족 시 '협력사 DB'를 통해 공동수급(공동이행) 협정서를 사전 체결하세요.",
      },
      {
        level: "warning",
        title: "안전관리비 및 고소작업 스카이 장비검사증 미구비",
        desc: "중대재해처벌법 강화로 착공계 제출 시 크레인 안전검사증 및 신호수 배치 계획 미비 시 착공 승인이 지연됩니다.",
        solution: "시방서 엑스레이 안전요건 탭을 확인하고 협력 장비업체 서류를 미리 확보하세요.",
      },
    ];
  }, [currentBid, isLed]);

  // 체크 진행률 계산
  const checkedCount = useMemo(() => {
    return Object.values(checkedDocs).filter(Boolean).length;
  }, [checkedDocs]);
  const progressPercent = Math.round((checkedCount / complianceDocs.length) * 100);

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetChecklist = () => {
    setCheckedDocs({
      doc1: false,
      doc2: false,
      doc3: false,
      doc4: false,
      doc5: false,
      doc6: false,
      doc7: false,
    });
  };

  const specData = useMemo(() => {
    return {
      materials: isLed
        ? [
            { name: "LED 디스플레이 모듈", spec: "Pixel Pitch 2.0mm~3.0mm 실내외 겸용 고해상도 SMD 패키지", standard: "KS C 7653 / KC 안전인증" },
            { name: "휘도(밝기) 및 시야각", spec: "최대 6,500cd/㎡ 이상 (야간 자동 디밍 센서 내장), 수평 160° / 수직 140°", standard: "공인 시험기관 성적서" },
            { name: "전원 공급장치 (SMPS)", spec: "고효율 PFC 내장 방우형 300W~400W 모듈 분산 배치", standard: "IP67 방수 / KS 인증" },
            { name: "프레임 및 외함 캐비닛", spec: "알루미늄 다이캐스팅 초경량 슬림 캐비닛 (부식 방지 아노다이징 처리)", standard: "내풍압 45m/s 구조계산서" },
            { name: "통합 제어 CMS 시스템", spec: "클라우드 원격 영상 송출 및 실시간 상태 모니터링 컨트롤러", standard: "GS인증 1등급 소프트웨어" },
          ]
        : isBanner
        ? [
            { name: "원단 재질 및 평량", spec: "고강력 폴리에스터 타포린 및 친환경 PET 배너 원단 (550g/㎡ 이상)", standard: "KFI 공인 방염필증" },
            { name: "인쇄 방식 및 해상도", spec: "UV 6색 듀얼 헤드 1,440dpi 실사출력 (내후성 2년 이상 무변색)", standard: "친환경 그린가드 인증 잉크" },
            { name: "마감 및 가공 방식", spec: "사방 열풍 고주파 융착 + 50cm 간격 아일렛(황동 하도메) 펀칭 + 로프 미싱", standard: "인장강도 120kgf 이상" },
            { name: "게첨 및 고정 부자재", spec: "내부식성 스테인리스(SUS304) 와이어로프(Ø4mm) 및 턴버클 체결", standard: "풍속 25m/s 탈락 방지" },
          ]
        : isSign
        ? [
            { name: "메인 프레임 및 바", spec: "아연도금 갈바륨(GI 1.6T~2.0T) 레이저 정밀 절단 및 옥외용 분체도장", standard: "KS D 3506 규격품" },
            { name: "입체 채널 문자", spec: "알루미늄 1.2T 캡채널 + 일체형 에폭시 면발광 (두께 80mm~100mm)", standard: "난연 1등급 V0 소재" },
            { name: "발광 조명 (LED)", spec: "방수 3구 광확산 렌즈 LED 모듈 (0.72W, 6,500K 쿨화이트, 100lm/W)", standard: "IP68 완전방수 / 삼성칩" },
            { name: "조명 전원 (SMPS)", spec: "정전압 방우형 SMPS (정격출력의 70% 이내 부하 설계 적용)", standard: "KC 전자기적합성 등록" },
            { name: "전면 발광 커버", spec: "수입산 광확산 폴리카보네이트(PC 3.0T) 및 옥외용 조명용 시트", standard: "충격강도 유리 250배" },
          ]
        : [
            { name: "미디어 패널 모니터", spec: "21.5인치 ~ 55인치 상업용 IPS 고휘도 논글레어 디지털 패널 (16:9)", standard: "KC 방송통신기자재 인증" },
            { name: "외함 보호 하우징", spec: "냉간압연강판(SPCC 1.2T) 분체도장 + 강화유리(4.0T) 비산방지 필름", standard: "IK08 충격보호등급" },
            { name: "운영 소프트웨어", spec: "LTE/5G 무선망 기반 클라우드 스케줄링 및 아파트 공지 연동 시스템", standard: "보안 적합성 검증" },
          ],

      safeties: [
        { item: "고소작업 장비", detail: "3.5톤~5톤 스카이 크레인 장비검사 합격증 및 안전인증서 필수 제출" },
        { item: "도로점용 및 통제", detail: "관할 경찰서/구청 도로점용 허가 득 및 보행자 안전통로 펜스(2m) 설치" },
        { item: "안전관리 인력", detail: "신호수 2인 상시 배치, 작업자 안전모·안전벨트(2열 안전로프) 100% 착용" },
        { item: "야간/특수 시공", detail: "유동인구 밀집 지역 심야(22:00~06:00) 작업 준수 및 저소음 발전기 사용" },
      ],

      certs: [
        { title: "한국소방산업기술원(KFI) 방염성적서", desc: "실내외 화재 안전 기준 통과 증빙 (원단 및 합성수지)" },
        { title: "IP67 / IP68 방수·방진 공인 시험성적서", desc: "우천 및 태풍 시 침수 방지 및 누전 차단 성능 확인" },
        { title: "직접생산확인증명서 (SMPP)", desc: "중소기업유통센터 발급 유효 기간 내 증명서" },
        { title: "구조안전확인서 및 내풍압 계산서", desc: "건축구조기술사 날인 45m/s 강풍 안전 검증 (대형 간판·전광판)" },
      ],

      warranty: {
        period: "준공(납품) 검수 완료일로부터 2개년 (전광판/미디어 3년)",
        rate: "하자보수보증금율 5% (서울보증보험 하자이행증권 제출)",
        response: "A/S 접수 후 24시간 이내 현장 출동 및 긴급 복구 원칙",
      },
    };
  }, [isLed, isBanner, isSign]);

  const handleCopyAll = () => {
    if (!currentBid) return;
    const text = `
[🔍 AI 시방서 엑스레이 & 필수서류 매트릭스 리포트]
공고명: ${currentBid.title}
발주처: ${currentBid.client}
배정예산: ${currentBid.budgetText}

■ 1. 📋 필수 제출 서류 및 준비 현황 (${checkedCount}/${complianceDocs.length}건 준비됨):
${complianceDocs.map((d) => `  [${checkedDocs[d.id] ? "완료(O)" : "미비(X)"}] ${d.title} (${d.desc})`).join("\n")}

■ 2. 🚨 실격 방지 체크포인트:
${riskRules.map((r, i) => `  ${i + 1}) [${r.level === "danger" ? "실격위험" : "감점주의"}] ${r.title}\n     - 대책: ${r.solution}`).join("\n")}

■ 3. 🏗️ 시방서 필수 자재 규격:
${specData.materials.map((m, i) => `  ${i + 1}) ${m.name}: ${m.spec} (${m.standard})`).join("\n")}

■ 4. 🛡️ 하자보증: ${specData.warranty.period} (보증금율: ${specData.warranty.rate})
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    SignBid AI
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    시방서 엑스레이 & 컴플라이언스
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  30장짜리 시방서 3초 분석 · AI 필수서류 실격방지 매트릭스
                </p>
              </div>
            </Link>

            {/* 메인 메뉴바 */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Link href="/" className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-colors whitespace-nowrap">
                입찰공고
              </Link>
              <Link href="/calendar" className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-colors whitespace-nowrap">
                📅 캘린더
              </Link>
              <Link href="/prespec" className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-colors whitespace-nowrap">
                🔔 발주예고
              </Link>
              <Link href="/results" className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-colors whitespace-nowrap">
                🏆 낙찰통계
              </Link>
              <Link href="/calculator" className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-colors whitespace-nowrap">
                💰 투찰계산기
              </Link>
              <Link href="/spec-xray" className="px-3 py-2 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                🔍 시방서 엑스레이
              </Link>
              <Link href="/partners" className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-colors whitespace-nowrap">
                🤝 협력사·DB
              </Link>
              <Link href="/proposal" className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-colors whitespace-nowrap">
                ✨ AI제안서
              </Link>
              <Link href="/forms" className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-colors whitespace-nowrap">
                📄 입찰서식
              </Link>
              <Link href="/blog" className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-colors whitespace-nowrap">
                트렌드
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 히어로 바 */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 시방서 엑스레이 & 실격방지 자가진단 (GovDash Style V2.0)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            서류 누락으로 인한 <span className="text-rose-400">아쉬운 실격 0% 방지!</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            복잡한 시방서 규격과 필수 제출 서류 7종을 3초 만에 신호등(🟢/🟡/🔴)으로 자동 추출하고, 실시간으로 자가진단할 수 있습니다.
          </p>

          {/* 공고 선택 드롭다운 */}
          <div className="pt-3 max-w-2xl mx-auto">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3 shadow-xl">
              <span className="text-xs font-bold text-slate-300 shrink-0 flex items-center gap-1.5 pl-2">
                <Search className="w-4 h-4 text-cyan-400" />
                분석할 공고 선택:
              </span>
              <select
                value={selectedBidId}
                onChange={(e) => setSelectedBidId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
              >
                {bids.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.location}] {b.client} - {b.title} ({b.budgetText})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 엑스레이 뷰어 */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
        {/* 공고 요약 카드 */}
        {currentBid && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {currentBid.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentBid.id}
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400">
                배정예산: {currentBid.budgetText}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white">
              {currentBid.title}
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span>발주처: <strong className="text-slate-200">{currentBid.client}</strong></span>
                <span>지역: <strong className="text-slate-200">{currentBid.location}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAll}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "복사 완료!" : "전체 리포트 복사"}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄 / PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            전체 엑스레이 요약
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "compliance"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "bg-slate-900 text-rose-300 hover:bg-slate-800 border border-rose-500/20"
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>📋 필수서류 & 실격방지 매트릭스</span>
          </button>
          <button
            onClick={() => setActiveTab("materials")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "materials"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            자재 및 규격표
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "safety"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            시공 및 안전요건
          </button>
          <button
            onClick={() => setActiveTab("certs")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "certs"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            시험성적서 및 인증
          </button>
        </div>

        {/* 🌟 [1번 과제] AI 필수서류 & 실격방지 매트릭스 (Compliance Matrix) 뷰 */}
        {(activeTab === "all" || activeTab === "compliance") && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            {/* 타이틀 및 상태바 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>📋 AI 컴플라이언스 매트릭스 & 실격 방지 자가진단</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-normal">GovDash 특화</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    체크박스를 클릭해 구비 서류를 점검하세요. 실시간으로 투찰 적합도를 계산합니다.
                  </p>
                </div>
              </div>

              {/* 실시간 적합도 배지 및 진행률 */}
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">서류 준비 현황</span>
                  <span className="text-sm font-bold text-white">
                    <strong className="text-cyan-400">{checkedCount}</strong> / {complianceDocs.length}건 ({progressPercent}%)
                  </span>
                </div>

                <div className="pl-3 border-l border-slate-800">
                  {progressPercent >= 80 ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>🟢 투찰 가능 (안전)</span>
                    </span>
                  ) : progressPercent >= 50 ? (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>🟡 서류 보완 필요</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/40 text-xs font-black flex items-center gap-1">
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                      <span>🔴 실격 위험</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPercent >= 80
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                      : progressPercent >= 50
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* 인터랙티브 7대 필수 서류 체크리스트 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  <span>1) 7대 필수 제출 서류 체크리스트 (클릭하여 체크)</span>
                </h4>
                <button
                  onClick={handleResetChecklist}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>체크 초기화</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {complianceDocs.map((doc) => {
                  const isChecked = !!checkedDocs[doc.id];
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? "bg-emerald-950/20 border-emerald-500/40 text-slate-200"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isChecked ? "text-white" : "text-slate-300"}`}>
                              {doc.title}
                            </span>
                            {doc.required && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                필수
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {doc.desc}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isChecked
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {isChecked ? "준비완료" : `미제출 시 ${doc.penalty}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🚨 실격 방지 룰셋 4대 체크포인트 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>2) 실격(0점 탈락) 방지 핵심 룰셋 (Zero-Tolerance Rules)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {riskRules.map((r, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border space-y-1.5 ${
                      r.level === "danger"
                        ? "bg-rose-950/20 border-rose-500/30"
                        : "bg-amber-950/20 border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold flex items-center gap-1 ${r.level === "danger" ? "text-rose-300" : "text-amber-300"}`}>
                        {r.level === "danger" ? <AlertOctagon className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                        <span>{r.title}</span>
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${r.level === "danger" ? "bg-rose-500 text-white" : "bg-amber-500 text-slate-950"}`}>
                        {r.level === "danger" ? "실격위험" : "감점주의"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {r.desc}
                    </p>

                    <div className="pt-1 text-[11px] text-cyan-300 flex items-start gap-1 font-medium">
                      <span className="text-cyan-400 font-bold shrink-0">💡 대책:</span>
                      <span>{r.solution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 1. 자재 및 규격표 */}
        {(activeTab === "all" || activeTab === "materials") && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                🏗️ 필수 자재 및 핵심 사양 규격표
              </h3>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-inner bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold">
                  <tr>
                    <th className="p-3.5 w-1/4">품목 / 부자재</th>
                    <th className="p-3.5 w-1/2">도면 시방서 명기 사양</th>
                    <th className="p-3.5 w-1/4 text-right">표준 인증 규격</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {specData.materials.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-cyan-300">
                        {m.name}
                      </td>
                      <td className="p-3.5 text-slate-200">
                        {m.spec}
                      </td>
                      <td className="p-3.5 text-right font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                          {m.standard}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. 시공 현장 및 고소작업 안전 요건 */}
        {(activeTab === "all" || activeTab === "safety") && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                ⚠️ 현장 시공 및 고소작업 안전관리 요건
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specData.safeties.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5"
                >
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{s.item}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 필수 제출 시험성적서 */}
        {(activeTab === "all" || activeTab === "certs") && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                📑 착공 및 준공계 필수 첨부 시험성적서
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specData.certs.map((c, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5"
                >
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{c.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 하자보증 및 A/S 조건 */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>4. 🛡️ 사후 하자보증 및 유지관리 책임 기준</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px] mb-1">무상 보증기간</span>
              <strong className="text-white text-sm">{specData.warranty.period}</strong>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px] mb-1">하자보수보증금율</span>
              <strong className="text-indigo-300 text-sm">{specData.warranty.rate}</strong>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px] mb-1">긴급 출동 기준</span>
              <strong className="text-emerald-300 text-sm">{specData.warranty.response}</strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
