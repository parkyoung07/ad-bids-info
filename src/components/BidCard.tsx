"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  MapPin,
  Clock,
  Flame,
  Bookmark,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Bot,
  Flag,
  Sparkles,
} from "lucide-react";
import { computeBidTimeStatus } from "@/utils/dateUtils";

export interface BidItem {
  id: string;
  announcementNo?: string;
  bidNtceNo?: string;
  bidNtceOrd?: string;
  bidNtceNm?: string;
  title: string;
  officialTitle?: string;
  category: string;
  client: string;
  officialClient?: string;
  budget: number | null;
  budgetText?: string;
  asignBdgtAmt?: string | null;
  presmptPrce?: string | null;
  cntrctCnclsMthdNm?: string | null;
  location?: string;
  noticeDate?: string;
  bidNtceDt?: string | null;
  bidBeginDate?: string;
  bidCloseDate?: string;
  bidClseDt?: string | null;
  openingDate?: string;
  startDate: string;
  endDate: string;
  openDate?: string;
  dDay: number | null;
  realtimeDDay?: number | null;
  realtimeIsExpired?: boolean;
  realtimeIsUrgent?: boolean;
  realtimeIsTodayClose?: boolean;
  realtimeDDayText?: string;
  realtimeBadgeText?: string;
  bidType: string;
  linkUrl?: string;
  source?: string;
  sourceDetailUrl?: string;
  isVerified?: boolean;
  isDemo?: boolean;
  status?: string;
  isClosed?: boolean;
  relevanceTier?: 'DIRECT' | 'ADJACENT' | 'UNRELATED';
  lastVerifiedAt?: string;
  tags?: string[];
  aiSummary?: string;
  aiTips?: string;
  industryRestriction?: boolean;
  purchasedProductList?: string;
  publicProcurementClass?: string;
  jointVentureMethod?: string;
  sourceEvidence?: string;
  signbidCategory?: string;
  orderHistory?: Array<{
    bidOrd: string;
    noticeKind: string;
    noticeDate: string;
    changeReason: string;
    isCancelled: boolean;
    bidKey: string;
  }>;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  validationStatus?: string;
  verificationStatus?: string;
  sourceApi?: string;
  officialUrl?: string;
  validation?: {
    status?: string;
    isVerified?: boolean;
    verifiedAt?: string;
    verifiedBy?: string;
  };
  auditLogId?: string;
  sourceHash?: string;
  approvalReason?: string;
  beforeStatus?: string;
  afterStatus?: string;
}

interface BidCardProps {
  bid: BidItem;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  onOpenSpecXray?: (bid: BidItem) => void;
}

export default function BidCard({
  bid,
  isBookmarked = false,
  onToggleBookmark,
}: BidCardProps) {
  const [saved, setSaved] = useState(isBookmarked);
  const [isReported, setIsReported] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    if (onToggleBookmark) {
      onToggleBookmark(bid.id);
    }
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReported(true);
    try {
      const prev = JSON.parse(localStorage.getItem("signbid_reported_bids") || "[]");
      if (!prev.includes(bid.id)) {
        localStorage.setItem("signbid_reported_bids", JSON.stringify([...prev, bid.id]));
      }
    } catch {}
  };

  // 한국 표준시(Asia/Seoul) 기준 실시간 마감 상태 및 D-Day 동적 계산
  const timeStatus = React.useMemo(() => {
    return computeBidTimeStatus(
      bid.bidCloseDate,
      bid.endDate,
      bid.isClosed,
      bid.status
    );
  }, [bid.bidCloseDate, bid.endDate, bid.isClosed, bid.status]);

  const isDemo = bid.isDemo || bid.status === "DEMO 예시";
  const isExpired = mounted ? timeStatus.isExpired : false;
  const isUrgent = mounted ? timeStatus.isUrgent : false;

  // 상태 배지 렌더링 (서버 렌더링과 클라이언트 초기 일치 및 마운트 후 실시간 반영)
  const renderStatusBadge = () => {
    if (bid.status === "DATA_CONFLICT" || bid.validation?.status === "DATA_CONFLICT") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          데이터 불일치 격리 (비공개)
        </span>
      );
    }
    if (isDemo) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
          <AlertCircle className="w-3 h-3" />
          DEMO 예시
        </span>
      );
    }
    if (!mounted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          자동수집 후보
        </span>
      );
    }
    if (timeStatus.isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
          🔴 공식 마감
        </span>
      );
    }
    if (!timeStatus.isValidDate || timeStatus.dDay === null) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-amber-300 border border-amber-500/40">
          <Clock className="w-3 h-3 text-amber-400" />
          공식 원문 확인 필요
        </span>
      );
    }
    if (timeStatus.isTodayClose) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-rose-600 text-white shadow-sm shadow-rose-600/30 animate-pulse">
          <Flame className="w-3 h-3 fill-white" />
          오늘 마감 (D-Day)
        </span>
      );
    }
    if (timeStatus.isUrgent) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-rose-500 text-white shadow-sm shadow-rose-500/30 animate-pulse">
          <Flame className="w-3 h-3 fill-white" />
          마감 {timeStatus.dDayText}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        자동수집 후보 ({timeStatus.dDayText})
      </span>
    );
  };

  // 발주 채널별 고유 색상 및 아이콘 배지 렌더링
  const renderSourceBadge = () => {
    const url = (bid.officialUrl || bid.sourceDetailUrl || bid.linkUrl || "").toLowerCase();
    const src = bid.source || bid.sourceApi || "";

    if (url.includes("g2b.go.kr")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30">
          🏛️ 조달청 나라장터
        </span>
      );
    }
    if (url.includes("s2b.kr") || src.includes("학교장터") || src.includes("S2B")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
          🏫 학교장터 (S2B)
        </span>
      );
    }
    if (url.includes("k-apt.go.kr") || src.includes("K-apt") || src.includes("kapt")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-300 bg-orange-500/15 px-2 py-0.5 rounded border border-orange-500/30">
          🏢 K-apt
        </span>
      );
    }
    if (url.includes("onbid.co.kr") || src.includes("온비드") || src.includes("OnBid")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30">
          💎 캠코 온비드
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30">
        🏛️ 조달청 나라장터
      </span>
    );
  };

  // 4대 분야별 배지 렌더링
  const renderCategoryBadge = () => {
    const cat = bid.category || "제작·시공";
    if (cat === "출력·인쇄 장비") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-500/40">
          ⚙️ {cat}
        </span>
      );
    }
    if (cat === "출력소재·잉크") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/40">
          🧪 {cat}
        </span>
      );
    }
    if (cat === "인쇄·출판") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
          🖨️ {cat}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-500/40">
        🏢 {cat}
      </span>
    );
  };

  const officialDirectUrl = bid.sourceDetailUrl || bid.officialUrl || bid.linkUrl || "";
  const displayLocation = bid.location ? bid.location : "지역조건 원문 확인";
  const hasBudget = Boolean(bid.budget && bid.budget > 0 && bid.budgetText);
  const noticeDateText = bid.noticeDate || (bid.startDate ? bid.startDate.substring(0, 10) : "");

  return (
    <div
      className={`bg-slate-900/90 hover:bg-slate-900 border rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between group relative ${
        isDemo ? "border-amber-500/30 bg-amber-950/5" : "border-slate-800 hover:border-cyan-500/40"
      }`}
    >
      <div>
        {/* 카드 상단 배지 바 */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {renderStatusBadge()}
            {renderSourceBadge()}
            {renderCategoryBadge()}

            {/* 지역조건 (null 시 임의 '전국' 변환 금지 -> 원문 확인) */}
            <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/40">
              <MapPin className="w-2.5 h-2.5 text-slate-400" />
              {displayLocation}
            </span>
          </div>

          {/* 관심공고 저장 북마크 버튼 */}
          <button
            onClick={handleBookmarkClick}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              saved
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800/60 text-slate-400 hover:text-white border-slate-700"
            }`}
            title={saved ? "관심공고 해제" : "관심공고 저장"}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-amber-400 text-amber-400" : ""}`} />
          </button>
        </div>

        {/* 공고 제목 (원문 그대로 보존) */}
        <a
          href={officialDirectUrl || `/bids/${bid.id}`}
          target={officialDirectUrl ? "_blank" : undefined}
          rel={officialDirectUrl ? "noopener noreferrer" : undefined}
          className="block text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2 mb-2.5"
        >
          {bid.title}
        </a>

        {/* 발견 키워드 태그 목록 (공식 공고명에서 발견된 키워드만 노출) */}
        {(() => {
          const safeTags = (bid.tags || []).filter(Boolean);
          if (safeTags.length === 0) return null;
          return (
            <div className="flex flex-wrap items-center gap-1 mb-2.5">
              <span className="text-[10px] text-slate-500">발견 키워드:</span>
              {safeTags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-cyan-950/80 text-cyan-300 rounded border border-cyan-700/60 font-mono font-semibold">
                  #{tag}
                </span>
              ))}
            </div>
          );
        })()}

        {/* 핵심 제원: 공식 발주기관, 투찰마감일시, 공식 금액 */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-t border-slate-800/80 text-xs text-slate-400`}>
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              기관: <strong className="text-slate-200 font-semibold">{bid.client}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              마감: <strong className={`${isExpired ? "text-slate-400" : "text-rose-400"} font-semibold`}>
                {bid.bidCloseDate || bid.endDate ? (bid.bidCloseDate || bid.endDate).substring(0, 16) : "원문 확인 필요"}
              </strong>
            </span>
          </div>

          <div className="flex items-center sm:justify-end gap-1 font-bold text-cyan-300">
            <span className="text-slate-400 text-xs font-normal">금액:</span>
            <span>
              {bid.asignBdgtAmt
                ? `${Number(bid.asignBdgtAmt).toLocaleString()}원 (배정)`
                : (bid.presmptPrce
                  ? `${Number(bid.presmptPrce).toLocaleString()}원 (추정)`
                  : "원문 확인 필요")}
            </span>
          </div>
        </div>
      </div>

      {/* 하단 식별자 및 공식 원문 직통 버튼 바 */}
      <div className="pt-3 mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/50">
        <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-slate-400 font-mono">
          <span className="font-bold text-slate-300">{bid.id}</span>
          {noticeDateText && <span>등록: {noticeDateText}</span>}
        </div>

        <div className="flex items-center gap-1.5">
          {/* 나라장터 공식 원문 보기 버튼 */}
          {officialDirectUrl ? (
            <a
              href={officialDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-sm shadow-cyan-600/20"
              title="나라장터 공식 원문 페이지로 직접 이동"
            >
              <span>나라장터 공식 원문 보기</span>
              <ExternalLink className="w-3.5 h-3.5 text-white" />
            </a>
          ) : null}
        </div>
      </div>

      {/* 회장님 지시 카드 안내문 (100% 원문 일치) */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/40 text-[10.5px] text-slate-400 leading-tight">
        광고·인쇄 관련 가능성이 있어 자동수집된 공고입니다. 참가자격·금액·일정·제출서류는 나라장터 공식 원문에서 최종 확인해 주세요.
      </div>
    </div>
  );
}

