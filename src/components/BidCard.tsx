"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export interface BidItem {
  id: string;
  announcementNo?: string;
  title: string;
  officialTitle?: string;
  category: string;
  client: string;
  budget: number;
  budgetText: string;
  location: string;
  noticeDate?: string;
  bidBeginDate?: string;
  bidCloseDate?: string;
  openingDate?: string;
  startDate: string;
  endDate: string;
  openDate?: string;
  dDay: number | null;
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

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    if (onToggleBookmark) {
      onToggleBookmark(bid.id);
    }
  };

  const isDemo = bid.isDemo || bid.status === "DEMO 예시";
  const isExpired = (bid.dDay !== null && bid.dDay < 0) || bid.isClosed || bid.status === "마감";
  const isUrgent = !isExpired && bid.dDay !== null && bid.dDay <= 3 && bid.dDay >= 0;

  // 상태 배지 렌더링
  const renderStatusBadge = () => {
    if (isDemo) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
          <AlertCircle className="w-3 h-3" />
          DEMO 예시
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
          🔴 입찰 마감
        </span>
      );
    }
    if (bid.dDay === null) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-amber-300 border border-amber-500/40">
          <Clock className="w-3 h-3 text-amber-400" />
          공고문 마감일 확인
        </span>
      );
    }
    if (isUrgent) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-rose-500 text-white shadow-sm shadow-rose-500/30 animate-pulse">
          <Flame className="w-3 h-3 fill-white" />
          마감 D-{bid.dDay}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-blue-300 border border-slate-700">
        <Clock className="w-3 h-3 text-blue-400" />
        진행중 (D-{bid.dDay})
      </span>
    );
  };

  return (
    <div
      className={`bg-slate-900/90 hover:bg-slate-900 border rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between group relative ${
        isDemo ? "border-amber-500/30 bg-amber-950/5" : "border-slate-800 hover:border-blue-500/40"
      }`}
    >
      <div>
        {/* 카드 상단 배지 바 */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {renderStatusBadge()}

            {/* 출처 배지 */}
            <span className="text-[11px] font-medium text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60">
              {bid.source || "조달청 나라장터"}
            </span>

            {/* SignBid 자체 업종 분류 명시 배지 */}
            <span className="text-[11px] font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-400/20">
              SignBid 업종 분류: {bid.category}
            </span>

            {/* 지역 */}
            <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/40">
              <MapPin className="w-2.5 h-2.5 text-slate-400" />
              {bid.location || "전국"}
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

        {/* 공고 제목 (2줄 말줄임) */}
        <Link
          href={`/bids/${bid.id}`}
          className="block text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mb-2.5"
        >
          {bid.title}
        </Link>

        {/* AI 한 줄 요약 박스 (간결화) */}
        {bid.aiSummary && (
          <div className="mb-3 bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 flex items-start gap-2">
            <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed text-slate-300 text-[11px] sm:text-xs">
              {bid.aiSummary}
            </p>
          </div>
        )}

        {/* 핵심 제원: 발주기관, 배정예산, 마감일시 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              발주: <strong className="text-slate-200 font-semibold">{bid.client}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              마감: <strong className={`${isExpired ? "text-slate-400" : "text-rose-400"} font-semibold`}>{bid.endDate ? bid.endDate.substring(0, 16) : "-"}</strong>
            </span>
          </div>

          <div className="flex items-center sm:justify-end gap-1 font-bold text-blue-400">
            <span className="text-slate-400 text-xs font-normal">예산:</span>
            <span>{bid.budgetText}</span>
          </div>
        </div>
      </div>

      {/* 하단 액션 버튼 바 */}
      <div className="pt-3 mt-3 flex items-center justify-between gap-2 border-t border-slate-800/50">
        <span className="text-[10px] text-slate-500 font-mono">
          {bid.id}
        </span>

        <div className="flex items-center gap-1.5">
          {/* DEMO 공고 안내 or 발주시스템 링크 */}
          {isDemo ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-slate-800/40 text-slate-500 border border-slate-800"
              title="본 공고는 기능 설명을 위한 예시 데이터이며 실제 공고가 아닙니다."
            >
              DEMO 예시
            </span>
          ) : (bid.sourceDetailUrl || bid.linkUrl) ? (
            <a
              href={bid.sourceDetailUrl || bid.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <span>조달청 원문</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : null}

          {/* 상세 분석 페이지 링크 */}
          <Link
            href={`/bids/${bid.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20 transition-all"
          >
            <span>상세 보기</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
