import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Flame,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Layers,
  Banknote,
  Briefcase,
  FileText,
  Sparkles,
  Bot,
  CheckCircle2,
  Zap,
  Tag,
  Award,
  Users2,
  Wrench,
} from "lucide-react";
import bidsData from "../../../../public/data/bids.json";
import BidDetailActions from "@/components/BidDetailActions";
import RateAnalyticsChart from "@/components/RateAnalyticsChart";
import BidSimulator from "@/components/BidSimulator";

export interface BidCheckList {
  licenseRequired?: string;
  directProduction?: string;
  workPeriod?: string;
  warrantyPeriod?: string;
  jointVenture?: string;
  siteBriefing?: string;
  eligibilityStatus?: string;
}

export interface BidItem {
  id: string;
  title: string;
  category: string;
  client: string;
  budget: number;
  budgetText: string;
  location: string;
  startDate: string;
  endDate: string;
  dDay: number;
  bidType: string;
  linkUrl: string;
  tags?: string[];
  aiSummary?: string;
  aiTips?: string;
  checkList?: BidCheckList;
}

// 나라장터 직접 연결 URL 생성 함수
function getG2BLink(linkUrl?: string, id?: string) {
  if (linkUrl && (linkUrl.startsWith("https://www.g2b.go.kr/link/PNPE027_01/single") || linkUrl.startsWith("https://www.onbid.co.kr"))) {
    return linkUrl;
  }
  if (id) {
    if (id.startsWith("ONBID")) {
      return "https://www.onbid.co.kr";
    }
    const cleanId = id.split("-")[0];
    const cleanOrd = id.split("-")[1] || "000";
    return `https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=${cleanId}&bidPbancOrd=${cleanOrd}`;
  }
  return "https://www.g2b.go.kr";
}

// 정적 내보내기(output: 'export')를 위한 params 생성
export async function generateStaticParams() {
  const bids = (bidsData as unknown as BidItem[]) || [];
  return bids.map((bid) => ({
    id: bid.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BidDetailPage({ params }: PageProps) {
  const { id } = await params;
  const bids = (bidsData as unknown as BidItem[]) || [];
  const bid = bids.find((item) => item.id === id);

  if (!bid) {
    notFound();
  }

  const isUrgent = bid.dDay <= 3 && bid.dDay >= 0;
  const isExpired = bid.dDay < 0;
  const directG2BUrl = getG2BLink(bid.linkUrl, bid.id);

  // 기본 체크리스트 값 세팅 (데이터 없을 시 안전 fallback)
  const checkList: BidCheckList = bid.checkList || {
    licenseRequired: "옥외광고사업 등록 (필수)",
    directProduction: `직접생산확인 [${bid.category}] (필수)`,
    workPeriod: "계약일로부터 30~60일 이내",
    warrantyPeriod: "준공검사 완료일로부터 2년 (5%)",
    jointVenture: "공고문 세부 규정 참조",
    siteBriefing: "생략 (설계도서 열람 갈음)",
    eligibilityStatus: "적격 입찰 추천 (신호등 🟢)",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <Link
              href="/"
              className="flex items-center space-x-2 sm:space-x-2.5 text-white hover:text-blue-400 transition-colors shrink-0 group"
            >
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform shrink-0">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div className="whitespace-nowrap">
                <span className="font-bold text-sm sm:text-base tracking-tight">
                  옥외광고 입찰 알리미
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              <nav className="flex items-center gap-1 shrink-0">
                <Link
                  href="/"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  입찰공고
                </Link>
                <Link
                  href="/calendar"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-indigo-300 hover:text-indigo-200 hover:bg-slate-800 transition-all border border-indigo-500/30 bg-indigo-500/10"
                >
                  📅 캘린더
                </Link>
                <Link
                  href="/prespec"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🔔 발주예고
                </Link>
                <Link
                  href="/results"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
                >
                  🏆 낙찰통계
                </Link>
                <Link
                  href="/calculator"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
                >
                  💰 투찰계산기
                </Link>
                <Link
                  href="/spec-xray"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🔍 시방서 엑스레이
                </Link>
                <Link
                  href="/partners"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🤝 협력사·DB
                </Link>
                <Link
                  href="/proposal"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-purple-300 hover:text-purple-200 hover:bg-slate-800 transition-all border border-purple-500/30 bg-purple-500/10"
                >
                  ✨ AI제안서
                </Link>
                <Link
                  href="/forms"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  📄 입찰서식
                </Link>
                <Link
                  href="/blog"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  트렌드
                </Link>
                <Link
                  href="/news"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold text-emerald-300 hover:text-emerald-200 hover:bg-slate-800 transition-all border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  뉴스
                </Link>
              </nav>

              <Link
                href="/"
                className="whitespace-nowrap inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>목록</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 상세 영역 */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* 브레드크럼 네비게이션 */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
          <Link href="/" className="hover:text-blue-400">홈</Link>
          <span>/</span>
          <span className="text-slate-300 font-medium">{bid.category}</span>
          <span>/</span>
          <span className="text-slate-400 font-mono">공고번호 {bid.id}</span>
        </div>

        {/* 상단 메인 헤더 카드 */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {bid.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {bid.location}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                공고번호: {bid.id}
              </span>
            </div>

            {/* D-Day 배지 */}
            {isUrgent ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse">
                <Flame className="w-4 h-4 fill-white" />
                마감임박 D-{bid.dDay}
              </span>
            ) : isExpired ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 text-slate-400 border border-slate-700">
                접수마감
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 text-blue-300 border border-slate-700">
                <Clock className="w-4 h-4 text-blue-400" />
                마감 D-{bid.dDay}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug tracking-tight mb-4">
            {bid.title}
          </h1>

          {/* 태그 뱃지 목록 */}
          {bid.tags && bid.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {bid.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800/90 text-cyan-300 border border-cyan-500/20"
                >
                  <Tag className="w-3 h-3 text-cyan-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>발주처: <strong className="text-slate-200">{bid.client}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>공고등록일: <span className="text-slate-300">{bid.startDate}</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <Banknote className="w-4 h-4 text-blue-400" />
              <span>배정예산: <strong className="text-white font-bold">{bid.budgetText}</strong></span>
            </div>
          </div>
        </div>

        {/* 🌟 [1단계 업그레이드] AI 3초 공고 핵심 요약 & 필수 체크리스트 카드 (RFP 3-Second Brief) */}
        <div className="bg-gradient-to-br from-indigo-950/50 via-slate-900 to-blue-950/50 rounded-2xl border border-indigo-500/40 p-6 sm:p-8 shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* 섹션 타이틀 헤더 */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>🤖 AI 3초 공고 핵심 요약 & 필수 체크리스트</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 animate-pulse">
                    3초 브리프
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  과업지시서와 공고문을 분석하여 사장님이 즉시 확인해야 할 핵심 조건을 추출했습니다.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              {checkList.eligibilityStatus || "적격 입찰 추천 🟢"}
            </span>
          </div>

          {/* 🚦 1. 참가 자격 신호등 4대 체크 (License & Eligibility) */}
          <div className="mb-6">
            <p className="text-xs font-bold text-indigo-300 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>1. 참가 자격 신호등 체크 (내가 들어갈 수 있는 공고인가?)</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 면허 요건 */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">필수 면허/등록</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                </div>
                <p className="text-xs font-bold text-slate-100 line-clamp-2">
                  {checkList.licenseRequired}
                </p>
              </div>

              {/* 직접생산확인 */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">직접생산확인증명</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                </div>
                <p className="text-xs font-bold text-slate-100 line-clamp-2">
                  {checkList.directProduction}
                </p>
              </div>

              {/* 지역 제한 */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">지역 제한 여부</span>
                  <span className={`w-2 h-2 rounded-full ${bid.location === "전국" ? "bg-cyan-400" : "bg-amber-400"} shadow-sm`} />
                </div>
                <p className="text-xs font-bold text-slate-100">
                  {bid.location === "전국" ? "전국 입찰 가능 (지역 무관)" : `${bid.location} 관내 소재 업체`}
                </p>
              </div>

              {/* 공동수급 */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">공동수급(컨소시엄)</span>
                  <span className="w-2 h-2 rounded-full bg-blue-400 shadow-sm" />
                </div>
                <p className="text-xs font-bold text-slate-100 line-clamp-2">
                  {checkList.jointVenture}
                </p>
              </div>
            </div>
          </div>

          {/* 📋 2. 시공 및 계약 핵심 스펙 그리드 (Work Specs) */}
          <div className="mb-6">
            <p className="text-xs font-bold text-cyan-300 mb-3 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>2. 시공 및 납품 조건 핵심 제원</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">공사 / 납품 기한</span>
                  <strong className="text-xs text-white">{checkList.workPeriod}</strong>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">하자보증 기간 / 요율</span>
                  <strong className="text-xs text-amber-300">{checkList.warrantyPeriod}</strong>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <Users2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">현장설명회 / 실측</span>
                  <strong className="text-xs text-white">{checkList.siteBriefing}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 💡 3. AI 핵심 1줄 요약 & 실무 꿀팁 (Summary & Strategic Advice) */}
          <div className="space-y-3 pt-2">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-500/30 shadow-sm">
              <p className="text-xs font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                공고 1줄 핵심 브리핑
              </p>
              <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">
                {bid.aiSummary || `${bid.client}에서 발주한 ${bid.title} 건입니다. 나라장터 전자입찰을 통해 참여 가능합니다.`}
              </p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 shadow-sm">
              <p className="text-xs font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                옥외광고 사업자 맞춤 입찰 성공 팁
              </p>
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                {bid.aiTips || "참가 전 과업지시서의 자격 요건(옥외광고업, 직접생산확인) 및 제출 서류 마감 기한을 반드시 확인하세요."}
              </p>
            </div>
          </div>
        </div>

        {/* 🌟 [2단계 신규] 1. 입찰 참가자격 원클릭 자가진단표 (적격심사 시뮬레이터) */}
        <div className="mb-6">
          <BidSimulator
            location={bid.location}
            category={bid.category}
            bidTitle={bid.title}
          />
        </div>

        {/* 🌟 [2단계 신규] 2. 발주처 과거 낙찰 사정률 통계 & AI 스마트 투찰 가이드 */}
        <div className="mb-6">
          <RateAnalyticsChart
            clientName={bid.client}
            category={bid.category}
            budget={bid.budget}
          />
        </div>

        {/* 나라장터 세부 공고 정보 제원 표 */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden mb-6">
          <div className="bg-slate-800/80 px-6 py-4 flex items-center justify-between border-b border-slate-700/60">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-white">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>조달청 나라장터 공고 상세 제원</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">조달청 G2B 공공데이터 공식 연계</span>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* 발주기관 / 수요기관 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  발주기관 / 수요기관
                </p>
                <p className="text-sm sm:text-base font-bold text-white">{bid.client}</p>
              </div>

              {/* 계약방법 및 입찰방식 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  계약방법 및 입찰방식
                </p>
                <p className="text-sm sm:text-base font-bold text-white">{bid.bidType}</p>
              </div>

              {/* 배정예산 (추정가격) */}
              <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-900/50">
                <p className="text-xs font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-blue-400" />
                  배정예산 (추정가격)
                </p>
                <p className="text-lg sm:text-xl font-black text-blue-300">
                  {bid.budgetText}{" "}
                  {bid.budget > 0 && (
                    <span className="text-xs font-normal text-slate-400">(₩{bid.budget.toLocaleString()}원)</span>
                  )}
                </p>
              </div>

              {/* 입찰서 접수 마감일시 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  입찰서 접수 마감일시
                </p>
                <p className="text-sm sm:text-base font-bold text-rose-400">{bid.endDate}</p>
              </div>

              {/* 지역 제한 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  지역 제한
                </p>
                <p className="text-sm font-semibold text-white">
                  {bid.location === "전국" ? "전국 (지역 제한 없음)" : `${bid.location} 관내 소재 업체 우선`}
                </p>
              </div>

              {/* 주 공종 / 품목분류 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  주 공종 및 품목 분류
                </p>
                <p className="text-sm font-semibold text-white">{bid.category} (제작 및 시공·설치)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 옥외광고 사업자 필수 참가 자격 안내 */}
        <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-lg mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">옥외광고 사업자 필수 법령 및 참가 자격 가이드</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-2.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <FileCheck2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">옥외광고사업 등록증:</strong> 「옥외광고물 등의 관리와 옥외광고산업 진흥에 관한 법률」 제11조에 따른 관할 지자체 옥외광고사업 등록을 필한 업체.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <FileCheck2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">중소기업 직접생산확인증명서:</strong> 중소기업기본법에 따른 소기업·소상공인 또는 중소기업으로서 해당 품목(간판, 안내판, 현수막, LED전광판 등)의 유효한 직접생산확인증명서 소지 필수.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">투찰 전 주의사항:</strong> 본 페이지는 AI 분석 요약본입니다. 반드시 하단의 원문 공고 바로가기를 통해 나라장터의 세부 과업지시서, 설계내역서, 특수조건을 최종 확인하시기 바랍니다.
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 [3단계 신규] 이 공고를 위한 추천 외주/협력사 매칭 배너 */}
        <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 rounded-2xl p-6 border border-cyan-500/30 shadow-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                BuildingConnected 모델
              </span>
              <h3 className="text-base font-bold text-white">
                🤝 이 공고의 크레인·가공·현지시공 협력사가 필요하신가요?
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              [{bid.location}] 및 인근 권역의 검증된 스카이 장비, LED 채널 가공공장, 책임시공팀을 원클릭으로 찾아보세요.
            </p>
          </div>

          <Link
            href="/partners"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25 transition-all shrink-0 cursor-pointer"
          >
            <span>협력사 매칭 보드 바로가기</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        {/* 하단 CTA 버튼 영역 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← 목록으로 돌아가기</span>
          </Link>

          <BidDetailActions
            bid={{
              ...bid,
              linkUrl: directG2BUrl,
              checkList,
            }}
          />
        </div>
      </main>

      {/* 푸터 영역 */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-xs py-8 px-4 text-center mt-12">
        <p>© 2026 옥외광고 입찰정보 알리미 · 조달청 나라장터 공공데이터 & Google Gemini AI 연계</p>
      </footer>
    </div>
  );
}
