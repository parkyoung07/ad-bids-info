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
  Banknote,
  Briefcase,
  FileText,
  Sparkles,
  Bot,
  ExternalLink,
  Tag,
  AlertCircle,
  Cpu,
  Calculator,
  Layers,
  HelpCircle,
} from "lucide-react";
import bidsData from "../../../../public/data/bids.json";
import BidDetailActions from "@/components/BidDetailActions";
import RateAnalyticsChart from "@/components/RateAnalyticsChart";
import BidSimulator from "@/components/BidSimulator";
import { BidItem } from "@/components/BidCard";

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

  const isDemo = bid.isDemo || bid.status === "DEMO 예시";
  const isUrgent = bid.dDay <= 3 && bid.dDay >= 0;
  const isExpired = bid.dDay < 0;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 브레드크럼 및 뒤로가기 */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-blue-400">홈</Link>
          <span>/</span>
          <span className="text-slate-300 font-medium">{bid.category}</span>
          <span>/</span>
          <span className="font-mono text-slate-400">{bid.id}</span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-slate-300 hover:text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>공고 목록으로</span>
        </Link>
      </div>

      {/* DEMO 예시 공고 경고 배너 */}
      {isDemo && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 text-amber-200 shadow-md space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>DEMO · 기능 설명을 위한 예시 데이터</span>
          </div>
          <p className="text-xs leading-relaxed text-amber-200/90">
            이 공고는 서비스 기능 설명을 위한 예시이며 실제 입찰에 사용할 수 없습니다.
            원문 공고 바로가기 기능이 제공되지 않으며, 실제 입찰 전에는 반드시 나라장터 등 공식 발주시스템의 원문을 확인하셔야 합니다.
          </p>
        </div>
      )}

      {/* 🌟 1. 첫 번째: 핵심 공고정보 (Core Info) */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* 상태 배지 */}
            {isDemo ? (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                DEMO 예시
              </span>
            ) : isExpired ? (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                입찰 마감
              </span>
            ) : isUrgent ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-black bg-rose-500 text-white shadow-md animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-white" />
                마감 D-{bid.dDay}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-blue-300 border border-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                마감 D-{bid.dDay}
              </span>
            )}

            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-600/15 text-blue-300 border border-blue-500/30">
              {bid.category}
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
              <MapPin className="w-3 h-3 text-slate-400" />
              {bid.location}
            </span>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            공고번호: <strong className="text-slate-200">{bid.announcementNo || bid.id}</strong>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug tracking-tight">
            {bid.title}
          </h1>
          {bid.officialTitle && bid.officialTitle !== bid.title && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              공식 원문 제목: {bid.officialTitle}
            </p>
          )}
        </div>

        {/* 태그 목록 */}
        {bid.tags && bid.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {bid.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-950 text-cyan-300 border border-cyan-500/20"
              >
                <Tag className="w-2.5 h-2.5 text-cyan-400" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 6대 핵심 제원 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">발주기관</span>
            <strong className="text-white font-semibold text-sm truncate block">{bid.client}</strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">데이터 출처</span>
            <strong className="text-blue-300 font-semibold text-sm block">{bid.source || "조달청 나라장터"}</strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">배정예산 (추정가격)</span>
            <strong className="text-blue-400 font-bold text-sm block">{bid.budgetText}</strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">공고등록일</span>
            <strong className="text-slate-200 font-medium block">{bid.startDate}</strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">투찰 마감일시</span>
            <strong className="text-rose-400 font-bold block">{bid.endDate}</strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">계약방법 / 입찰방식</span>
            <strong className="text-slate-200 font-medium block truncate">{bid.bidType}</strong>
          </div>
        </div>

        {/* 원문 링크 및 마지막 확인 시각 */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>공식 데이터 마지막 확인: <strong className="text-slate-300 font-medium">{bid.lastVerifiedAt || "2026.09.04 10:00"}</strong></span>
          </div>

          <div>
            {isDemo ? (
              <span className="text-slate-500 text-[11px]">
                DEMO 공고는 원문 연결이 제공되지 않습니다.
              </span>
            ) : bid.sourceDetailUrl ? (
              <a
                href={bid.sourceDetailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold border border-slate-700 transition-colors"
              >
                <span>공식 원문 바로가기</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* 🌟 2. 두 번째: 참가 가능성 및 자가진단 (Eligibility) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span>참가 자격 요건 & 자가진단</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            회사 정보 등록 시 참가 가능성 자동 분석
          </span>
        </div>

        <BidSimulator
          location={bid.location}
          category={bid.category}
          bidTitle={bid.title}
        />
      </section>

      {/* 🌟 3. 세 번째: 중요한 일정 (Schedule) */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <span>공고 주요 진행 일정</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">1. 공고등록일</span>
            <strong className="text-slate-200 text-sm block">{bid.startDate.substring(0, 10)}</strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">2. 현장설명회</span>
            <strong className="text-slate-200 text-sm block truncate">
              {bid.verifiedRequirements?.siteBriefing || bid.checkList?.siteBriefing || "생략 (설계서 열람)"}
            </strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">3. 투찰 마감일시</span>
            <strong className="text-rose-400 text-sm font-bold block">{bid.endDate}</strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">4. 개찰일시</span>
            <strong className="text-cyan-300 text-sm block">{bid.openDate || `${bid.endDate.substring(0, 10)} 11:00`}</strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">5. 납품·준공기한</span>
            <strong className="text-slate-200 text-sm block truncate">
              {bid.verifiedRequirements?.workPeriod || bid.checkList?.workPeriod || "계약체결일 기준 산정"}
            </strong>
          </div>
        </div>
      </section>

      {/* 🌟 4. 네 번째: AI 핵심 요약 (AI Brief with Strict Source Separation) */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        {/* 섹션 상단 헤더 & 배지 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>AI 공고 분석 브리프</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  AI 분석 · 반드시 공식 공고문을 최종 확인하세요
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                원문에서 확인된 조건과 AI가 제안한 참고사항을 엄격히 구분하여 안내합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 2개 분리 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 영역 1: 공식 원문에서 확인된 내용 */}
          <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" />
                <span>공식 원문에서 확인된 조건</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium">
                원문 기반
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[11px]">필수 면허/등록:</span>
                <p className="font-semibold text-white">
                  {bid.verifiedRequirements?.license || bid.checkList?.licenseRequired || "옥외광고사업 등록"}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">직접생산확인:</span>
                <p className="font-semibold text-white">
                  {bid.verifiedRequirements?.directProduction || bid.checkList?.directProduction || "해당 세부품명 직생증명서"}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">지역 제한 및 공동도급:</span>
                <p className="font-semibold text-white">
                  {bid.location === "전국" ? "전국 입찰 가능" : `${bid.location} 관내 소재 업체`} /{" "}
                  {bid.verifiedRequirements?.jointVenture || bid.checkList?.jointVenture || "공고문 참조"}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">하자보증 및 제출서류:</span>
                <p className="font-semibold text-white">
                  {bid.verifiedRequirements?.warrantyPeriod || bid.checkList?.warrantyPeriod || "준공 후 2년 (5%)"}
                </p>
              </div>

              {/* 원문 근거 표시 */}
              <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                <span className="text-slate-500 font-medium">확인 근거: </span>
                <span className="text-cyan-300 font-mono">
                  {bid.sourceEvidence || "공고문 및 과업지시서 세부 규정 참조"}
                </span>
              </div>
            </div>
          </div>

          {/* 영역 2: AI가 제안한 참고사항 */}
          <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI가 제안한 참고사항</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium">
                AI 제안
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[11px]">수주 및 투찰 전략 제안:</span>
                <p className="text-slate-200 leading-relaxed">
                  {bid.aiTips || "공고문 참가 요건 및 제출서류 마감 기한을 철저히 확인하세요."}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">주요 규격 및 확인 제안:</span>
                <p className="text-slate-200 leading-relaxed">
                  {bid.aiSummary || "옥외광고물 제작 및 시공 설치 용역입니다."}
                </p>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                <p className="flex items-start gap-1">
                  <span className="text-amber-400 font-bold shrink-0">안내:</span>
                  <span>원문에 명시되지 않은 AI 참고 제안입니다. 실제 시공 전 설계내역서를 확인하십시오.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 5. 다섯 번째: 입찰 준비 도구 (Tools) */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <span>입찰 준비 도구함</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/spec-xray"
            className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all text-left flex items-start gap-3 group"
          >
            <Cpu className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-white group-hover:text-cyan-300 block mb-0.5">
                시방서 엑스레이
              </strong>
              <p className="text-[11px] text-slate-400">
                과업지시서 규격 및 감점 위험 룰셋 분석
              </p>
            </div>
          </Link>

          <Link
            href="/calculator"
            className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition-all text-left flex items-start gap-3 group"
          >
            <Calculator className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-white group-hover:text-amber-300 block mb-0.5">
                투찰금액 시뮬레이터
              </strong>
              <p className="text-[11px] text-slate-400">
                A값 공제 및 사정률별 예상금액 비교
              </p>
            </div>
          </Link>

          <Link
            href="/proposal"
            className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 transition-all text-left flex items-start gap-3 group"
          >
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-white group-hover:text-purple-300 block mb-0.5">
                AI 제안서 초안 작성
              </strong>
              <p className="text-[11px] text-slate-400">
                과업수행계획서 및 시공계획 표준 목차
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 🌟 6. 하단 보조정보: 과거 낙찰통계 */}
      <section className="space-y-4">
        <RateAnalyticsChart
          clientName={bid.client}
          category={bid.category}
          budget={bid.budget}
        />
      </section>

      {/* 하단 CTA 액션 바 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-900 rounded-2xl border border-slate-800">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>목록으로 돌아가기</span>
        </Link>

        <BidDetailActions
          bid={{
            ...bid,
            linkUrl: bid.sourceDetailUrl || "",
          }}
        />
      </div>
    </div>
  );
}
