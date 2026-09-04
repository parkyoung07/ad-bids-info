import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  ArrowLeft,
  Flame,
  ShieldAlert,
  FileCheck2,
  AlertCircle,
  Sparkles,
  Bot,
  ExternalLink,
  Tag,
  Cpu,
  Calculator,
  FileText,
  Calendar,
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
  const isExpired = (bid.dDay !== null && bid.dDay < 0) || bid.isClosed || bid.status === "마감";
  const isUrgent = !isExpired && bid.dDay !== null && bid.dDay <= 3 && bid.dDay >= 0;

  const noticeDateStr = bid.noticeDate || bid.startDate?.substring(0, 10) || "미확인";
  const beginDateStr = bid.bidBeginDate || bid.startDate || "미확인";
  const closeDateStr = bid.bidCloseDate || bid.endDate || "마감일 미기재";
  const openDateStr = bid.openingDate || bid.openDate || "개찰일 미기재";

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
            본 공고는 기능 설명을 위한 예시 데이터이며 실제 공고가 아니며 투찰에 사용할 수 없습니다.
            표시된 자격·금액·일정·서류는 가상 예시이며, 실제 입찰 전 나라장터 원문을 별도로 확인해야 합니다.
          </p>
        </div>
      )}

      {/* 🌟 1. 핵심 공고정보 (Core Info) */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* 상태 배지 */}
            {isDemo ? (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                DEMO 예시
              </span>
            ) : isExpired ? (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
                🔴 입찰 마감
              </span>
            ) : bid.dDay === null ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-amber-300 border border-amber-500/40">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                공고문 마감일 확인
              </span>
            ) : isUrgent ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-black bg-rose-500 text-white shadow-md animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-white" />
                마감 D-{bid.dDay}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-blue-300 border border-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                진행중 (D-{bid.dDay})
              </span>
            )}

            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-600/15 text-blue-300 border border-blue-500/30">
              {bid.category}
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
              <MapPin className="w-3 h-3 text-slate-400" />
              {bid.location || "전국"}
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
              원문 공고명: {bid.officialTitle}
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
            <span className="text-slate-500 block mb-1">데이터 구분</span>
            <strong className="text-blue-300 font-semibold text-sm block">{isDemo ? "DEMO 가상 예시" : (bid.source || "조달청 나라장터")}</strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">사업예산 (배정금액)</span>
            <strong className="text-blue-400 font-bold text-sm block">{bid.budgetText || `${Number(bid.budget || 0).toLocaleString()}원`}</strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">공고등록일</span>
            <strong className="text-slate-200 font-medium block">{noticeDateStr}</strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">투찰 마감일시</span>
            <strong className={`${isExpired ? "text-slate-400" : "text-rose-400"} font-bold block`}>{closeDateStr}</strong>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">계약방법</span>
            <strong className="text-slate-200 font-medium block truncate">{bid.bidType || "제한경쟁 (원문 확인)"}</strong>
          </div>
        </div>

        {/* 조달청 원문 바로가기 링크 */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>수집 기준: <strong className="text-slate-300 font-medium">{bid.lastVerifiedAt?.substring(0, 19) || "조달청 OpenAPI 수집"}</strong></span>
          </div>

          <div>
            {isDemo ? (
              <span className="text-amber-400/80 text-[11px] font-medium">
                💡 DEMO 예시 공고입니다 (투찰 불가)
              </span>
            ) : bid.sourceDetailUrl || bid.linkUrl ? (
              <a
                href={bid.sourceDetailUrl || bid.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow transition-colors"
              >
                <span>조달청 나라장터 원문 열람</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* 🌟 2. 참가자격 자가진단 시뮬레이터 */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            <span>참가 자격 자가진단 (일반적인 점검 예시)</span>
          </h2>
          <span className="text-xs text-amber-300/90 font-medium">
            ※ 일반적인 점검 체크리스트 시뮬레이터 (공식 자격 판정 아님)
          </span>
        </div>

        <BidSimulator
          location={bid.location}
          category={bid.category}
          bidTitle={bid.title}
        />
      </section>

      {/* 🌟 3. 공고 주요 진행 일정 */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <span>{isDemo ? "공고 주요 진행 일정 (가상 예시)" : "공고 주요 진행 일정 (조달청 API 수집)"}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">1. 공고등록일시</span>
            <strong className="text-slate-200 text-sm block">{noticeDateStr}</strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">2. 입찰서 접수시작</span>
            <strong className="text-slate-200 text-sm block truncate">{beginDateStr}</strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">3. 입찰서 접수마감</span>
            <strong className={`${isExpired ? "text-slate-400" : "text-rose-400"} text-sm font-bold block`}>{closeDateStr}</strong>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">4. 개찰일시</span>
            <strong className="text-cyan-300 text-sm block">{openDateStr}</strong>
          </div>
        </div>
      </section>

      {/* 🌟 4. 조달청 공식정보 vs AI 분석 엄격 분리 영역 */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        {/* 섹션 상단 헤더 & 배지 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{isDemo ? "DEMO 요건 및 AI 분석 브리프" : "조달청 API 수집 정보 및 AI 참고 분석"}</span>
                {isDemo ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    DEMO 가상 데이터
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-cyan-500/30">
                    조달청 API 기본정보 수집 완료 · 세부 참가자격 검토 전
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {isDemo
                  ? "DEMO 가정 조건과 AI 분석 참고사항을 구분하여 안내합니다."
                  : "조달청 공식 API 수집 항목과 AI 참고 분석을 엄격히 분리하여 제공합니다."}
              </p>
            </div>
          </div>
        </div>

        {/* 2개 분리 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 영역 1: 조달청 공식 API 구조화 수집 정보 (임의 생성값 절대 배제) */}
          <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-blue-400" />
                <span>{isDemo ? "DEMO 가정 조건" : "조달청 공식 API 수집 항목"}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {isDemo ? "가정 예시" : "공식 API 원문"}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[11px]">업종 및 면허제한 여부:</span>
                <p className="font-semibold text-white">
                  {bid.industryRestriction ? "업종제한 있음 (상세 면허는 공고문 확인 필요)" : "업종제한 미기재 (공고문 확인 필요)"}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">물품 세부품명 / 공공조달 분류:</span>
                <p className="font-semibold text-white">
                  {bid.purchasedProductList || bid.publicProcurementClass || "공고문 확인 필요 (미확인)"}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">참가자격 지역 및 공동수급:</span>
                <p className="font-semibold text-white">
                  {bid.location === "전국" ? "전국 (지역제한 없음)" : `지역제한 (${bid.location})`} /{" "}
                  {bid.jointVentureMethod || "공동수급 방식 공고문 확인 필요"}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">직접생산확인 및 하자보수 요건:</span>
                <p className="font-semibold text-slate-400 italic">
                  공고문 및 과업지시서 직접 확인 필요 (API 구조화 필드 미제공)
                </p>
              </div>

              {/* 분석 근거 표시 */}
              <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                <span className="text-slate-500 font-medium">데이터 출처: </span>
                <span className="text-cyan-300 font-mono">
                  {isDemo ? "DEMO 분석 예시" : "조달청 나라장터 공식 Open API"}
                </span>
              </div>
            </div>
          </div>

          {/* 영역 2: AI 참고 분석 (격리 영역) */}
          <div className="bg-slate-950/80 rounded-xl p-5 border border-cyan-900/40 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI 참고 분석 (별도 분리 영역)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-medium">
                AI 의견
              </span>
            </div>

            {/* AI 주의 안내 배너 */}
            <div className="bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-800/40 text-[11px] text-cyan-200 font-medium">
              ⚠️ AI 참고 분석이며 조달청 공식 참가자격이 아닙니다.
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[11px]">AI 요약 브리프:</span>
                <p className="text-slate-200 leading-relaxed">
                  {bid.aiSummary || "옥외광고 및 사인물 관련 공고입니다."}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">AI 수주 전략 팁:</span>
                <p className="text-slate-200 leading-relaxed">
                  {bid.aiTips || "세부 과업지시서와 참가자격은 반드시 나라장터 원문 공고서를 확인하십시오."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 5. 입찰 준비 도구함 */}
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
            linkUrl: bid.sourceDetailUrl || bid.linkUrl || "",
          }}
        />
      </div>
    </div>
  );
}
