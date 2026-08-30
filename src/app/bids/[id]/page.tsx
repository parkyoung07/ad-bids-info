import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
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
} from "lucide-react";
import bidsData from "../../../../public/data/bids.json";
import BidDetailActions from "@/components/BidDetailActions";

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
  aiSummary?: string;
  aiTips?: string;
}

// 나라장터 직접 연결 URL 생성 함수
function getG2BLink(linkUrl?: string, id?: string) {
  if (linkUrl && linkUrl.startsWith("https://www.g2b.go.kr/link/PNPE027_01/single")) {
    return linkUrl;
  }
  if (id) {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <Link
              href="/"
              className="flex items-center space-x-2.5 text-white hover:text-blue-400 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm sm:text-base tracking-tight">
                옥외광고 입찰정보 알리미
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <nav className="flex items-center gap-1 sm:gap-1.5">
                <Link
                  href="/"
                  className="px-2 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  입찰공고 목록
                </Link>
                <Link
                  href="/calendar"
                  className="px-2 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-indigo-300 hover:text-indigo-200 hover:bg-slate-800 transition-all border border-indigo-500/30 bg-indigo-500/10"
                >
                  📅 캘린더
                </Link>
                <Link
                  href="/prespec"
                  className="px-2 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🔔 발주 예고
                </Link>
                <Link
                  href="/results"
                  className="px-2 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
                >
                  🏆 낙찰 통계
                </Link>
                <Link
                  href="/blog"
                  className="px-2 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  옥외광고 트렌드
                </Link>
              </nav>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors ml-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>목록으로</span>
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

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>발주처: <strong className="text-slate-200">{bid.client}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>공고등록일: <span className="text-slate-300">{bid.startDate}</span></span>
            </div>
          </div>
        </div>

        {/* Gemini AI 심층 분석 요약 카드 */}
        <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/40 rounded-2xl border border-blue-500/30 p-6 sm:p-8 shadow-xl mb-6">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-blue-500/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Gemini AI 핵심 분석 및 입찰 가이드
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    자동생성
                  </span>
                </h2>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300">
            {/* AI 핵심 요약 */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <p className="text-xs font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                공고 1줄 핵심 요약
              </p>
              <p className="text-slate-200 leading-relaxed text-sm">
                {bid.aiSummary || `${bid.client}에서 발주한 ${bid.title} 건입니다. 나라장터 전자입찰을 통해 참여 가능합니다.`}
              </p>
            </div>

            {/* AI 입찰 팁 */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <p className="text-xs font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                옥외광고 사업자 맞춤 입찰 팁
              </p>
              <p className="text-slate-300 leading-relaxed">
                {bid.aiTips || '참가 전 과업지시서의 자격 요건(옥외광고업, 직접생산확인) 및 제출 서류 마감 기한을 반드시 확인하세요.'}
              </p>
            </div>
          </div>
        </div>

        {/* 나라장터 세부 공고 정보 그리드 */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden mb-6">
          <div className="bg-slate-800/80 px-6 py-4 flex items-center justify-between border-b border-slate-700/60">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-white">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>나라장터 공고 상세 제원</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">조달청 G2B 공공데이터 연계</span>
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
                <p className="text-sm font-semibold text-white">{bid.location} 관내 소재 업체 우선</p>
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
            <h2 className="text-base sm:text-lg font-bold text-white">옥외광고 사업자 필수 참가 자격 안내</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <FileCheck2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">옥외광고사업 등록:</strong> 「옥외광고물 등의 관리와 옥외광고산업 진흥에 관한 법률」 제11조에 따른 옥외광고사업 등록 업체.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <FileCheck2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">직접생산확인증명서 보유:</strong> 해당 세부 품명(간판, 안내판, 현수막, 랩핑 등)에 대한 유효한 직접생산확인증명서를 소지한 중소기업자.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">투찰 전 확인사항:</strong> 본 페이지의 정보는 요약본이므로, 반드시 아래 나라장터 원문 공고의 과업지시서, 시방서, 제안요청서를 확인하신 후 투찰하시기 바랍니다.
              </div>
            </div>
          </div>
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
            bidTitle={bid.title}
            bidCategory={bid.category}
            linkUrl={directG2BUrl}
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
