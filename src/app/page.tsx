"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  Flame,
  FileText,
  Sparkles,
  MessageCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import bidsData from "../../public/data/bids.json";
import SubscribeModal from "@/components/SubscribeModal";
import BidFilter, { FilterState } from "@/components/BidFilter";
import BidCard, { BidItem } from "@/components/BidCard";
import { computeBidTimeStatus, getKSTToday } from "@/utils/dateUtils";

const INITIAL_FILTERS: FilterState = {
  category: "전체",
  location: "전국",
  deadline: "all",
  contractType: "계약유형 전체",
  budgetRange: "all",
  sourceOrigin: "all",
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<"dDay" | "budgetDesc" | "budgetAsc" | "newest">("dDay");
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [viewTab, setViewTab] = useState<"active" | "null_close" | "closed" | "bookmarks">("active");
  const [mounted, setMounted] = useState(false);

  // 브라우저 마운트 시점 기록 및 로컬스토리지 북마크 불러오기
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("ad_bids_bookmarks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBookmarkedIds(parsed);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("ad_bids_bookmarks", JSON.stringify(next));
      } catch {
        // safe fallback
      }
      return next;
    });
  };

  const allBids = useMemo(() => {
    const raw = (bidsData as unknown as BidItem[]) || [];
    // 8대 최소 공개조건을 충족한 자동수집 후보 공고 통과
    return raw.filter((b: any) => {
      const hasId = Boolean(b.id && (b.announcementNo || b.id.split("-")[0]));
      const hasTitle = Boolean(b.title && b.title.trim() !== "");
      const hasClient = Boolean(b.client && b.client.trim() !== "");
      const hasOfficialUrl = Boolean(
        b.officialUrl || b.sourceDetailUrl || b.linkUrl
      ) && !["https://www.g2b.go.kr", "https://www.g2b.go.kr/", "https://www.s2b.kr"].includes(b.officialUrl || b.sourceDetailUrl || b.linkUrl);
      const isNotConflictOrRejected = !["REJECTED", "CANCELLED", "DATA_CONFLICT", "NEEDS_REVIEW", "REVIEW_REQUIRED", "PENDING_MANUAL_CHECK", "HELD"].includes(
        b.validation?.status || b.verificationStatus || b.validationStatus || b.status || ""
      );
      return hasId && hasTitle && hasClient && hasOfficialUrl && isNotConflictOrRejected;
    });
  }, []);

  // 전체 공고에 한국 표준시(KST) 실시간 마감 상태 및 D-Day 동적 부착
  const bidsWithTimeStatus = useMemo(() => {
    return allBids.map((b) => {
      const timeStatus = computeBidTimeStatus(
        b.bidCloseDate,
        b.endDate,
        b.isClosed,
        b.status
      );
      return {
        ...b,
        realtimeDDay: timeStatus.dDay,
        realtimeIsExpired: timeStatus.isExpired,
        realtimeIsUrgent: timeStatus.isUrgent,
        realtimeIsTodayClose: timeStatus.isTodayClose,
        realtimeDDayText: timeStatus.dDayText,
        realtimeBadgeText: timeStatus.statusBadgeText,
      };
    });
  }, [allBids]);

  // 1. 새로 발견한 후보 (공식 마감일 확인됨 & 마감 시각 미도래)
  const activeCandidateBids = useMemo(() => {
    return bidsWithTimeStatus.filter(
      (b) => !b.isDemo && b.status !== "DEMO 예시" && b.realtimeDDay !== null && !b.realtimeIsExpired
    );
  }, [bidsWithTimeStatus]);

  // 2. 마감일 확인 필요 (마감일이 null이거나 미기재된 공고: 임의 마감/진행 분류 금지)
  const nullCloseBids = useMemo(() => {
    return bidsWithTimeStatus.filter(
      (b) => !b.isDemo && b.status !== "DEMO 예시" && (b.realtimeDDay === null || !b.bidCloseDate)
    );
  }, [bidsWithTimeStatus]);

  // 3. 공식 마감 (공식 마감일 확인됨 & 마감 시각 경과)
  const closedCandidateBids = useMemo(() => {
    return bidsWithTimeStatus.filter(
      (b) => !b.isDemo && b.status !== "DEMO 예시" && b.realtimeDDay !== null && b.realtimeIsExpired
    );
  }, [bidsWithTimeStatus]);

  // 현재 탭에 따른 기본 대상 리스트
  const currentTabBids = useMemo(() => {
    if (viewTab === "null_close") return nullCloseBids;
    if (viewTab === "closed") return closedCandidateBids;
    if (viewTab === "bookmarks") {
      return bidsWithTimeStatus.filter((b) => bookmarkedIds.includes(b.id));
    }
    return activeCandidateBids;
  }, [viewTab, activeCandidateBids, nullCloseBids, closedCandidateBids, bidsWithTimeStatus, bookmarkedIds]);

  // 필터링 및 정렬
  const filteredBids = useMemo(() => {
    return currentTabBids
      .filter((bid) => {
        // 1. 업종 필터 (4대 분야 1:1 정확 일치)
        if (filters.category !== "전체") {
          if (bid.category !== filters.category) return false;
        }

        // 2. 지역 필터
        if (filters.location !== "전국") {
          const loc = bid.location || "";
          const matchLoc =
            loc.includes(filters.location) ||
            bid.client.includes(filters.location) ||
            bid.title.includes(filters.location);
          if (!matchLoc) return false;
        }

        // 3. 마감일 필터 (실시간 KST 계산 D-Day 기준)
        if (filters.deadline === "d3" && (bid.realtimeDDay === null || bid.realtimeDDay > 3)) return false;
        if (filters.deadline === "d7" && (bid.realtimeDDay === null || bid.realtimeDDay > 7)) return false;
        if (filters.deadline === "d14" && (bid.realtimeDDay === null || bid.realtimeDDay > 14)) return false;

        // 4. 계약유형 필터
        if (filters.contractType !== "계약유형 전체") {
          if (!bid.bidType.includes(filters.contractType)) return false;
        }

        // 5. 예산 필터
        const budgetVal = bid.budget || 0;
        if (filters.budgetRange === "under50m" && budgetVal > 50000000) return false;
        if (filters.budgetRange === "under100m" && budgetVal > 100000000) return false;
        if (filters.budgetRange === "over100m" && budgetVal < 100000000) return false;

        // 6. 출처(발주 채널) 필터
        if (filters.sourceOrigin && filters.sourceOrigin !== "all") {
          const url = (bid.officialUrl || bid.sourceDetailUrl || bid.linkUrl || "").toLowerCase();
          const src = (bid.source || bid.sourceApi || "").toLowerCase();

          if (filters.sourceOrigin === "g2b") {
            if (!url.includes("g2b.go.kr") && !src.includes("나라장터")) return false;
          }
          if (filters.sourceOrigin === "s2b") {
            if (!url.includes("s2b.kr") && !src.includes("학교장터") && !src.includes("s2b")) return false;
          }
          if (filters.sourceOrigin === "kapt") {
            if (!url.includes("k-apt.go.kr") && !src.includes("k-apt") && !src.includes("kapt")) return false;
          }
          if (filters.sourceOrigin === "onbid") {
            if (!url.includes("onbid.co.kr") && !src.includes("온비드") && !src.includes("onbid")) return false;
          }
          if (filters.sourceOrigin === "assoc_lh") {
            const isAssocLh = src.includes("협회") || src.includes("lh");
            if (!isAssocLh) return false;
          }
        }

        // 7. 검색어 필터
        const q = searchQuery.trim().toLowerCase();
        if (q !== "") {
          const loc = bid.location || "";
          const matchSearch =
            bid.title.toLowerCase().includes(q) ||
            bid.client.toLowerCase().includes(q) ||
            bid.category.toLowerCase().includes(q) ||
            loc.toLowerCase().includes(q) ||
            bid.id.toLowerCase().includes(q) ||
            (bid.aiSummary && bid.aiSummary.toLowerCase().includes(q));
          if (!matchSearch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "dDay") {
          if (a.realtimeDDay === null && b.realtimeDDay === null) return 0;
          if (a.realtimeDDay === null) return 1;
          if (b.realtimeDDay === null) return -1;
          return a.realtimeDDay - b.realtimeDDay;
        }
        if (sortBy === "budgetDesc") return (b.budget || 0) - (a.budget || 0);
        if (sortBy === "budgetAsc") return (a.budget || 0) - (b.budget || 0);
        if (sortBy === "newest") return (b.startDate || "").localeCompare(a.startDate || "");
        return 0;
      });
  }, [currentTabBids, filters, searchQuery, sortBy]);

  // 채널별 실시간 후보 공고 통계
  const channelStats = useMemo(() => {
    return {
      all: allBids.length,
      g2b: allBids.filter(b => (b.source || "").includes("나라장터")).length,
      s2b: allBids.filter(b => {
        const s = (b.source || "");
        const url = (b.officialUrl || b.sourceDetailUrl || b.linkUrl || "").toLowerCase();
        return url.includes("s2b.kr") || s.includes("학교장터") || s.includes("S2B");
      }).length,
      kapt: allBids.filter(b => {
        const s = (b.source || "");
        const url = (b.officialUrl || b.sourceDetailUrl || b.linkUrl || "").toLowerCase();
        return url.includes("k-apt.go.kr") || s.includes("K-apt");
      }).length,
      onbid: allBids.filter(b => {
        const s = (b.source || "");
        const url = (b.officialUrl || b.sourceDetailUrl || b.linkUrl || "").toLowerCase();
        return url.includes("onbid.co.kr") || s.includes("온비드") || s.includes("OnBid");
      }).length,
      assoc_lh: allBids.filter(b => {
        const s = (b.source || "");
        return s.includes("협회") || s.includes("LH");
      }).length,
    };
  }, [allBids]);

  // 4대 핵심 분야별 실시간 공고 수 집계 (정확한 1:1 일치)
  const coreCategoryCounts = useMemo(() => {
    return {
      all: allBids.length,
      manufacturing: allBids.filter(b => b.category === "제작·시공").length,
      publishing: allBids.filter(b => b.category === "인쇄·출판").length,
      equipment: allBids.filter(b => b.category === "출력·인쇄 장비").length,
      materials: allBids.filter(b => b.category === "출력소재·잉크").length,
    };
  }, [allBids]);

  return (
    <div className="flex-1 flex flex-col">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-slate-800 py-5 sm:py-9 px-3 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-2.5 sm:space-y-3.5 relative z-10">
          {/* 상단 신뢰 배지 */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>광고·인쇄 관련 가능성이 있어 자동수집된 공고입니다.</span>
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-400">
              광고 · 인쇄 관련 입찰 기회
            </span>를 빠르게 찾아드립니다.
          </h1>

          {/* 공식 원문 확인 필수 안내문 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-left max-w-2xl mx-auto shadow-inner">
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-400 font-bold">※ SignBid 안내:</strong> 광고·인쇄 관련 가능성이 있어 자동수집된 공고입니다. 참가자격·금액·일정·제출서류는 나라장터 공식 원문에서 최종 확인해 주세요.
            </p>
          </div>

          {/* 통합 검색창 & 카톡 알림 구성 */}
          <div className="pt-1 max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full flex items-center shadow-lg">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="공고명, 발주처, 지역, 품목 검색..."
                className="w-full pl-10 pr-16 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm shadow-inner transition-all min-h-[42px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 transition-colors cursor-pointer"
                >
                  지우기
                </button>
              )}
            </div>

            <button
              onClick={() => setIsSubscribeModalOpen(true)}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-black text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer min-h-[42px]"
            >
              <MessageCircle className="w-4 h-4 fill-[#191919] text-[#191919] shrink-0" />
              <span className="whitespace-nowrap">카톡 무료 알림</span>
            </button>
          </div>

          {/* 🎯 4대 핵심 분야 원클릭 퀵 필터 칩 */}
          <div className="pt-1 max-w-4xl mx-auto">
            <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {/* 전체 */}
              <button
                onClick={() => setFilters({ ...filters, category: "전체" })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  filters.category === "전체"
                    ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <span>🌐 전체보기</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900/90 text-blue-300">
                  {coreCategoryCounts.all}
                </span>
              </button>

              {/* 🏢 제작·시공 */}
              <button
                onClick={() => setFilters({ ...filters, category: "제작·시공" })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  filters.category === "제작·시공"
                    ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <span>🏢 제작·시공</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900/90 text-blue-300">
                  {coreCategoryCounts.manufacturing}
                </span>
              </button>

              {/* 🖨️ 인쇄·출판 */}
              <button
                onClick={() => setFilters({ ...filters, category: "인쇄·출판" })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  filters.category === "인쇄·출판"
                    ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <span>🖨️ 인쇄·출판</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900/90 text-emerald-300">
                  {coreCategoryCounts.publishing}
                </span>
              </button>

              {/* ⚙️ 출력·인쇄 장비 */}
              <button
                onClick={() => setFilters({ ...filters, category: "출력·인쇄 장비" })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  filters.category === "출력·인쇄 장비"
                    ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <span>⚙️ 출력·인쇄 장비</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900/90 text-indigo-300">
                  {coreCategoryCounts.equipment}
                </span>
              </button>

              {/* 🧪 출력소재·잉크 */}
              <button
                onClick={() => setFilters({ ...filters, category: "출력소재·잉크" })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  filters.category === "출력소재·잉크"
                    ? "bg-amber-600 text-white shadow-sm ring-1 ring-amber-400"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <span>🧪 출력소재·잉크</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900/90 text-amber-300">
                  {coreCategoryCounts.materials}
                </span>
              </button>
            </div>
          </div>

          {/* 📡 발주 채널별 실시간 수집 현황 칩 바 */}
          <div className="pt-1.5 flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-1.5 text-xs overflow-x-auto no-scrollbar pb-1 max-w-full">
            <span className="text-[11px] font-bold text-slate-400 px-1 py-1 shrink-0">발주 채널:</span>

            {/* 전체 채널 */}
            <button
              onClick={() => setFilters({ ...filters, sourceOrigin: "all" })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
                filters.sourceOrigin === "all" || !filters.sourceOrigin
                  ? "bg-blue-600 text-white border-blue-400 shadow-blue-600/30 ring-1 ring-blue-400"
                  : "bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
              }`}
            >
              <span>🌐 전체 ({channelStats.all})</span>
            </button>

            {/* 🏛️ 조달청 나라장터 */}
            <button
              onClick={() => setFilters({ ...filters, sourceOrigin: "g2b" })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
                filters.sourceOrigin === "g2b"
                  ? "bg-blue-600 text-white border-blue-400 shadow-blue-600/30 ring-1 ring-blue-400"
                  : "bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/50"
              }`}
            >
              <span>🏛️ 나라장터 ({channelStats.g2b})</span>
            </button>

            {/* 🏫 학교장터 (S2B) · 교육청 */}
            <button
              onClick={() => setFilters({ ...filters, sourceOrigin: "s2b" })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
                filters.sourceOrigin === "s2b"
                  ? "bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/30 ring-1 ring-emerald-400"
                  : "bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50"
              }`}
            >
              <span>🏫 학교·교육기관 (S2B)</span>
            </button>

            {/* 🏢 K-apt · 아파트 */}
            <button
              onClick={() => setFilters({ ...filters, sourceOrigin: "kapt" })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
                filters.sourceOrigin === "kapt"
                  ? "bg-amber-600 text-white border-amber-400 shadow-amber-600/30 ring-1 ring-amber-400"
                  : "bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/50"
              }`}
            >
              <span>🏢 K-apt · 아파트</span>
            </button>

            {/* 💎 캠코 온비드 */}
            <button
              onClick={() => setFilters({ ...filters, sourceOrigin: "onbid" })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
                filters.sourceOrigin === "onbid"
                  ? "bg-purple-600 text-white border-purple-400 shadow-purple-600/30 ring-1 ring-purple-400"
                  : "bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/50"
              }`}
            >
              <span>💎 캠코 온비드</span>
            </button>

            {/* 📢 지자체 · LH */}
            <button
              onClick={() => setFilters({ ...filters, sourceOrigin: "assoc_lh" })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
                filters.sourceOrigin === "assoc_lh"
                  ? "bg-cyan-600 text-white border-cyan-400 shadow-cyan-600/30 ring-1 ring-cyan-400"
                  : "bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/50"
              }`}
            >
              <span>📢 지자체 · LH</span>
            </button>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-4 sm:space-y-5">
        {/* 공고 구분 탭 & 상단 컨트롤 바 */}
        <div className="sticky top-14 sm:top-16 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            {/* 공고 구분 4대 탭 버튼 */}
            <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setViewTab("active")}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] whitespace-nowrap ${
                  viewTab === "active"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>새로 발견한 후보 ({activeCandidateBids.length})</span>
              </button>

              <button
                onClick={() => setViewTab("null_close")}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] whitespace-nowrap ${
                  viewTab === "null_close"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>공식 원문 확인 필요 ({nullCloseBids.length})</span>
              </button>

              <button
                onClick={() => setViewTab("closed")}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] whitespace-nowrap ${
                  viewTab === "closed"
                    ? "bg-slate-800 text-rose-300 border border-rose-600/50"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>공식 마감 ({closedCandidateBids.length})</span>
              </button>

              <button
                id="bookmarks"
                onClick={() => setViewTab("bookmarks")}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] whitespace-nowrap ${
                  viewTab === "bookmarks"
                    ? "bg-slate-800 text-amber-300 border border-amber-500/40"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>⭐ 관심공고 ({bookmarkedIds.length})</span>
              </button>
            </div>

            {/* 우측 정렬 옵션 */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "dDay" | "budgetDesc" | "budgetAsc" | "newest")}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer min-h-[38px] shrink-0 font-medium"
              >
                <option value="dDay">⏱️ 마감순</option>
                <option value="budgetDesc">💰 높은금액</option>
                <option value="budgetAsc">💵 낮은금액</option>
                <option value="newest">📅 최신등록</option>
              </select>
            </div>
          </div>
        </div>

        {/* 검색 필터 컴포넌트 */}
        <BidFilter
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(INITIAL_FILTERS)}
        />

        {/* 공고 카드 목록 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-2">
            <div>
              조회된 공고 <strong className="text-blue-400 font-bold text-sm">{filteredBids.length}</strong>건
            </div>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>한국표준시(KST) 기준 실시간 마감시간 계산</span>
            </div>
          </div>
          <span className="text-slate-500 text-[11px]">
            ※ 공고 세부 조건 및 투찰 시간은 각 공고의 [원문 확인]을 최종 대조하십시오.
          </span>
        </div>

        {/* 공고 카드 그리드 */}
        {filteredBids.length === 0 ? (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center my-6 shadow-sm">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">
              해당 조건의 입찰 후보 공고가 없습니다
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              광고·인쇄 관련 가능성이 있어 자동수집된 공고입니다. 참가자격·금액·일정·제출서류는 나라장터 공식 원문에서 최종 확인해 주세요.
            </p>
            <button
              onClick={() => {
                setFilters(INITIAL_FILTERS);
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-xl text-xs font-semibold border border-blue-500/30 transition-colors"
            >
              전체 조건 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBids.map((bid) => (
              <BidCard
                key={bid.id}
                bid={bid}
                isBookmarked={bookmarkedIds.includes(bid.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>
        )}
      </main>

      {/* 맞춤 알림 신청 모달 */}
      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
      />
    </div>
  );
}

