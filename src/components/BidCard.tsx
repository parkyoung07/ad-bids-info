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
  Flag,
  Sparkles,
} from "lucide-react";
import { computeBidTimeStatus } from "@/utils/dateUtils";

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

  // 한국 표준시(Asia/Seoul) 기준 실시간 마감 상태 및 D-Day 동적 계산 (화면 표시 시점 재계산)
  const timeStatus = React.useMemo(() => {
    return computeBidTimeStatus(
      bid.bidCloseDate,
      bid.endDate,
      bid.isClosed,
      bid.status
    );
  }, [bid.bidCloseDate, bid.endDate, bid.isClosed, bid.status]);

  const isDemo = bid.isDemo || bid.status === "DEMO 예시";
  const isExpired = timeStatus.isExpired;
  const isUrgent = timeStatus.isUrgent;

  // 상태 배지 렌더링 (새로운 표시 규칙 적용: 사람이 승인한 공고가 아니므로 VERIFIED/APPROVED 배지 절대 미표시)
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
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
          🔴 공식 마감 (원문 미대조)
        </span>
      );
    }
    if (!timeStatus.isValidDate || timeStatus.dDay === null) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-amber-300 border border-amber-500/40">
          <Clock className="w-3 h-3 text-amber-400" />
          마감일 원문 확인
        </span>
      );
    }
    if (timeStatus.isTodayClose) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-rose-600 text-white shadow-sm shadow-rose-600/30 animate-pulse">
          <Flame className="w-3 h-3 fill-white" />
          오늘 마감 · 원문 미대조 (D-Day)
        </span>
      );
    }
    if (isUrgent) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-rose-500 text-white shadow-sm shadow-rose-500/30 animate-pulse">
          <Flame className="w-3 h-3 fill-white" />
          마감 {timeStatus.dDayText} · 원문 미대조
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        자동수집 후보 · 원문 미대조 ({timeStatus.dDayText})
      </span>
    );
  };

  // 발주 채널별 고유 색상 및 아이콘 배지 렌더링 (도메인 기반 엄격 판정: G2B 링크는 항상 조달청 나라장터)
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

  // 업종별 차별화 배지 렌더링
  const renderCategoryBadge = () => {
    const cat = bid.category || "간판·조형물";
    if (cat.includes("융합")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-black text-purple-200 bg-gradient-to-r from-purple-900/70 to-pink-900/70 px-2.5 py-0.5 rounded border border-purple-400/60 shadow-sm shadow-purple-500/20">
          ⚡ 융합 패키지
        </span>
      );
    }
    if (cat.includes("인쇄") || cat.includes("출판") || cat.includes("홍보물")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
          🖨️ {cat}
        </span>
      );
    }
    if (cat.includes("행사") || cat.includes("축제") || cat.includes("전시")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-fuchsia-300 bg-fuchsia-950/70 px-2 py-0.5 rounded border border-fuchsia-500/40">
          🎪 {cat}
        </span>
      );
    }
    if (cat.includes("전광판") || cat.includes("사이니지")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-500/40">
          💡 {cat}
        </span>
      );
    }
    if (cat.includes("현수막") || cat.includes("배너")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300 bg-teal-950/70 px-2 py-0.5 rounded border border-teal-500/40">
          🚩 {cat}
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
        <Link
          href={`/bids/${bid.id}`}
          className="block text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2 mb-2.5"
        >
          {bid.title}
        </Link>

        {/* 관련 가능성 참고 박스 (AI 판정이 아닌 탐색 참고정보) */}
        {bid.aiSummary && (
          <div className="mb-3 bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 flex items-start gap-2">
            <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-[10px] text-cyan-400 font-semibold block mb-0.5">※ 관련 가능성 참고</span>
              <p className="line-clamp-2 leading-relaxed text-slate-300 text-[11px] sm:text-xs">
                {bid.aiSummary}
              </p>
            </div>
          </div>
        )}

        {/* 발견 키워드 태그 목록 (G2B 공고의 S2B 키워드 혼입 원천 배제) */}
        {(() => {
          const isG2B = (bid.officialUrl || bid.sourceDetailUrl || bid.linkUrl || "").toLowerCase().includes("g2b.go.kr");
          const safeTags = (bid.tags || []).filter(t => !isG2B || (!t.includes("S2B") && !t.includes("학교장터")));
          if (safeTags.length === 0) return null;
          return (
            <div className="flex flex-wrap items-center gap-1 mb-2.5">
              <span className="text-[10px] text-slate-500">관련 키워드:</span>
              {safeTags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-[10px] px-1.5 py-0.2 bg-slate-800/80 text-cyan-300 rounded border border-slate-700/60 font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          );
        })()}

        {/* 핵심 제원: 발주기관, 마감일시, 배정예산(null 시 숨김) */}
        <div className={`grid grid-cols-1 ${hasBudget ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-2 py-2 border-t border-slate-800/80 text-xs text-slate-400`}>
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              발주: <strong className="text-slate-200 font-semibold">{bid.client}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              마감: <strong className={`${isExpired ? "text-slate-400" : "text-rose-400"} font-semibold`}>
                {bid.endDate ? bid.endDate.substring(0, 16) : "마감일 원문 확인"}
              </strong>
            </span>
          </div>

          {hasBudget && (
            <div className="flex items-center sm:justify-end gap-1 font-bold text-cyan-300">
              <span className="text-slate-400 text-xs font-normal">예산:</span>
              <span>{bid.budgetText}</span>
            </div>
          )}
        </div>
      </div>

      {/* 하단 액션 버튼 바 */}
      <div className="pt-3 mt-2 flex items-center justify-between gap-2 border-t border-slate-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="text-[10px] text-slate-500 font-mono">
            {bid.announcementNo || bid.id}
          </span>
          {noticeDateText && (
            <span className="text-[10px] text-slate-500">
              수집: {noticeDateText}
            </span>
          )}
          <button
            type="button"
            onClick={handleReportClick}
            className={`text-[10px] inline-flex items-center gap-0.5 transition-colors cursor-pointer ${
              isReported ? "text-emerald-400 font-bold" : "text-slate-500 hover:text-rose-400"
            }`}
            title="이 공고가 옥외광고·인쇄·행사전시와 무관한 경우 신고해주세요"
          >
            <Flag className="w-2.5 h-2.5" />
            <span>{isReported ? "신고접수" : "오분류 신고"}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 공식 상세 원문 직통 버튼 */}
          {officialDirectUrl ? (
            <a
              href={officialDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-md bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-cyan-100 border border-cyan-700/60 transition-colors shadow-sm"
              title="해당 발주기관 공식 원문 공고 페이지로 직접 이동"
            >
              <span>공식 원문 바로가기</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
          ) : null}

          {/* 간이 요약 상세 링크 */}
          <Link
            href={`/bids/${bid.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20 transition-all"
          >
            <span>상세 보기</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 각 공고 카드 하단 안내문 (사용자 지침 필수 문구) */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/40 text-[10.5px] text-slate-400/90 leading-tight">
        ※ 관련 키워드로 자동수집된 입찰 후보입니다. 실제 참여 전 공식 공고 원문을 확인하세요.
      </div>
    </div>
  );
}

