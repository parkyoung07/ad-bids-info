"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  Flame,
  FileText,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Radio,
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
  const [viewTab, setViewTab] = useState<"active" | "closed" | "demo" | "bookmarks">("active");

  // 로컬스토리지 북마크 불러오기
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("ad_bids_bookmarks");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setBookmarkedIds(parsed);
          }
        }
      } catch {
        // fallback
      }
    }, 0);
    return () => clearTimeout(timer);
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
    return (bidsData as unknown as BidItem[]) || [];
  }, []);

  // 전체 공고에 한국 표준시(KST) 실시간 마감 상태 및 D-Day 동적 부착 (화면 표시 시점 실시간 계산)
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

  // 1. 실시간 진행 공고 (마감 시각 미도래: realtimeIsExpired === false)
  const activeVerifiedBids = useMemo(() => {
    return bidsWithTimeStatus.filter(
      (b) => !b.isDemo && b.status !== "DEMO 예시" && !b.realtimeIsExpired
    );
  }, [bidsWithTimeStatus]);

  // 2. 마감된 공고 (마감 시각 경과 또는 마감 상태: realtimeIsExpired === true)
  const closedVerifiedBids = useMemo(() => {
    return bidsWithTimeStatus.filter(
      (b) => !b.isDemo && b.status !== "DEMO 예시" && b.realtimeIsExpired
    );
  }, [bidsWithTimeStatus]);

  // 3. DEMO 가상 예시 공고
  const demoBids = useMemo(() => {
    return bidsWithTimeStatus.filter((b) => b.isDemo || b.status === "DEMO 예시");
  }, [bidsWithTimeStatus]);

  // 마감 임박 공고 수 (진행 공고 중 D-3 이내 실시간 계산)
  const todayUrgentCount = useMemo(() => {
    return activeVerifiedBids.filter((b) => b.realtimeIsUrgent).length;
  }, [activeVerifiedBids]);

  // 현재 탭에 따른 기본 대상 리스트
  const currentTabBids = useMemo(() => {
    if (viewTab === "closed") return closedVerifiedBids;
    if (viewTab === "demo") return demoBids;
    if (viewTab === "bookmarks") {
      return bidsWithTimeStatus.filter((b) => bookmarkedIds.includes(b.id));
    }
    return activeVerifiedBids;
  }, [viewTab, activeVerifiedBids, closedVerifiedBids, demoBids, bidsWithTimeStatus, bookmarkedIds]);

  // 필터링 및 정렬
  const filteredBids = useMemo(() => {
    return currentTabBids
      .filter((bid) => {
        // 1. 업종 필터
        if (filters.category !== "전체") {
          const matchCat =
            bid.category.includes(filters.category) || filters.category.includes(bid.category);
          if (!matchCat) return false;
        }

        // 2. 지역 필터
        if (filters.location !== "전국") {
          const matchLoc =
            bid.location.includes(filters.location) ||
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
        if (filters.budgetRange === "under50m" && bid.budget > 50000000) return false;
        if (filters.budgetRange === "under100m" && bid.budget > 100000000) return false;
        if (filters.budgetRange === "over100m" && bid.budget < 100000000) return false;

        // 6. 출처(발주 채널) 필터
        if (filters.sourceOrigin && filters.sourceOrigin !== "all") {
          const src = bid.source || "";
          if (filters.sourceOrigin === "g2b" && !src.includes("나라장터")) return false;
          if (filters.sourceOrigin === "s2b" && !src.includes("학교장터") && !src.includes("S2B")) return false;
          if (filters.sourceOrigin === "kapt" && !src.includes("K-apt") && !src.includes("공동주택") && !src.includes("아파트")) return false;
          if (filters.sourceOrigin === "onbid" && !src.includes("온비드") && !src.includes("OnBid")) return false;
          if (filters.sourceOrigin === "assoc_lh" && !src.includes("협회") && !src.includes("LH")) return false;
        }

        // 7. 검색어 필터
        const q = searchQuery.trim().toLowerCase();
        if (q !== "") {
          const matchSearch =
            bid.title.toLowerCase().includes(q) ||
            bid.client.toLowerCase().includes(q) ||
            bid.category.toLowerCase().includes(q) ||
            bid.location.toLowerCase().includes(q) ||
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

  // 채널별 실시간 진행 공고 통계
  const channelStats = useMemo(() => {
    return {
      g2b: activeVerifiedBids.filter(b => (b.source || "").includes("나라장터")).length,
      s2b: activeVerifiedBids.filter(b => (b.source || "").includes("학교장터") || (b.source || "").includes("S2B")).length,
      kapt: activeVerifiedBids.filter(b => (b.source || "").includes("K-apt") || (b.source || "").includes("공동주택") || (b.source || "").includes("아파트")).length,
      onbid: activeVerifiedBids.filter(b => (b.source || "").includes("온비드") || (b.source || "").includes("OnBid")).length,
      assoc_lh: activeVerifiedBids.filter(b => (b.source || "").includes("협회") || (b.source || "").includes("LH")).length,
    };
  }, [activeVerifiedBids]);

  // 4대 핵심 비주얼 미디어 분야별 실시간 공고 수 집계
  const coreCategoryCounts = useMemo(() => {
    return {
      all: activeVerifiedBids.length,
      fusion: activeVerifiedBids.filter(b => b.category.includes("융합")).length,
      print: activeVerifiedBids.filter(b => b.category.includes("인쇄") || b.category.includes("출판") || b.category.includes("홍보물")).length,
      event: activeVerifiedBids.filter(b => b.category.includes("행사") || b.category.includes("축제") || b.category.includes("전시")).length,
      outdoor: activeVerifiedBids.filter(b => b.category.includes("간판") || b.category.includes("조형물") || b.category.includes("현수막") || b.category.includes("표지판") || b.category.includes("안내판")).length,
      signage: activeVerifiedBids.filter(b => b.category.includes("전광판") || b.category.includes("사이니지")).length,
    };
  }, [activeVerifiedBids]);

  return (
    <div className="flex-1 flex flex-col">
      {/* 히어로 섹션 (모바일 초슬림 & PC 황금 균형 최적화) */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-slate-800 py-5 sm:py-9 px-3 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-2.5 sm:space-y-3.5 relative z-10">
          {/* 상단 신뢰 배지 */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-[11px] sm:text-xs font-semibold shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>실시간 조달청·공공기관 검증 공고</span>
          </div>

          {/* 메인 헤드라인 (간결하고 직관적인 타이틀) */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              옥외광고 · 인쇄 · 행사전시
            </span>{" "}
            공공입찰
          </h1>

          {/* 보조 설명 (간결화) */}
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            나라장터 · 온비드 · 학교장터 실시간 맞춤 수집 및 분석
          </p>

          {/* 통합 검색창 */}
          <div className="pt-1 max-w-xl mx-auto">
            <div className="relative flex items-center shadow-lg">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="공고명, 발주처, 지역, 품목을 검색하세요"
                className="w-full pl-10 pr-16 py-2.5 sm:py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm shadow-inner transition-all min-h-[42px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 transition-colors"
                >
                  지우기
                </button>
              )}
            </div>
          </div>

          {/* 대표 3대 행동 버튼 (진행공고 · 마감임박 · 카톡알림 1줄 완벽 정렬) */}
          <div className="pt-1 max-w-xl mx-auto grid grid-cols-3 gap-1.5 sm:gap-2.5">
            <button
              onClick={() => {
                setViewTab("active");
                setFilters(INITIAL_FILTERS);
                setSearchQuery("");
              }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-3 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[40px] ${
                viewTab === "active" && filters.deadline !== "d3"
                  ? "bg-blue-600 text-white ring-1 ring-blue-400 shadow-blue-500/20"
                  : "bg-slate-950/90 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="truncate">진행 ({activeVerifiedBids.length})</span>
            </button>

            <button
              onClick={() => {
                setViewTab("active");
                setFilters({ ...INITIAL_FILTERS, deadline: "d3" });
              }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer min-h-[40px] ${
                filters.deadline === "d3"
                  ? "bg-rose-600 text-white ring-1 ring-rose-400 shadow-rose-500/20"
                  : "bg-slate-950/90 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">마감임박 ({todayUrgentCount})</span>
            </button>

            <button
              onClick={() => setIsSubscribeModalOpen(true)}
              className="flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-3 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-black text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer min-h-[40px]"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-[#191919] text-[#191919] shrink-0" />
              <span className="truncate">카톡 알림</span>
            </button>
          </div>

          {/* 🎯 4대 핵심 분야 원클릭 공고 탐색 (슬림하고 깔끔한 원라인 알약형 탭) */}
          <div className="pt-1.5 max-w-4xl mx-auto">
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

              {/* 🖨️ 인쇄·출판 */}
              <button
                onClick={() => setFilters({ ...filters, category: "인쇄·출판·홍보물" })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  filters.category === "인쇄·출판·홍보물"
                    ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <span>🖨️ 인쇄·출판</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900/90 text-emerald-300">
                  {coreCategoryCounts.print}
                </span>
              </button>

              {/* 🎪 행사·전시 */}
              <button
                onClick={() => setFilters({ ...filters, category: "행사·축제·전시" })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  filters.category === "행사·축제·전시"
                    ? "bg-fuchsia-600 text-white shadow-sm ring-1 ring-fuchsia-400"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <span>🎪 행사·전시</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900/90 text-fuchsia-300">
                  {coreCategoryCounts.event}
                </span>
              </button>

              {/* 🏢 간판·조형물 */}
              <button
                onClick={() => setFilters({ ...filters, category: "간판·조형물" })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  filters.category === "간판·조형물"
                    ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <span>🏢 간판·조형</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900/90 text-blue-300">
                  {coreCategoryCounts.outdoor}
                </span>
              </button>

              {/* 💡 디지털사이니지 */}
              <button
                onClick={() => setFilters({ ...filters, category: "디지털사이니지·전광판" })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  filters.category === "디지털사이니지·전광판"
                    ? "bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <span>💡 전광판</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900/90 text-cyan-300">
                  {coreCategoryCounts.signage}
                </span>
              </button>

              {/* ⚡ 융합 패키지 */}
              <button
                onClick={() => setFilters({ ...filters, category: "융합 패키지" })}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  filters.category === "융합 패키지"
                    ? "bg-purple-600 text-white shadow-sm ring-1 ring-purple-400"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <span>⚡ 융합</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900/90 text-purple-300">
                  {coreCategoryCounts.fusion}
                </span>
              </button>
            </div>
          </div>

          {/* 발주 채널별 실시간 수집 현황 띠 배너 (실제 운영 채널 명시) */}
          <div className="pt-2 flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2 text-xs overflow-x-auto no-scrollbar pb-1 max-w-full">
            <span className="text-[11px] font-bold text-slate-400 px-2 py-1 shrink-0">발주 채널:</span>
            <div className="inline-flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-blue-500/40 text-blue-300 shrink-0 shadow-sm">
              <span>🏛️ 조달청 나라장터</span>
              <strong className="text-white font-black">{channelStats.g2b}건 운영중</strong>
            </div>
            <div className="inline-flex items-center gap-1 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400 shrink-0">
              <span>🏫 학교장터(S2B)</span>
              <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1 py-0.5 rounded font-medium">연동 준비중</span>
            </div>
            <div className="inline-flex items-center gap-1 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400 shrink-0">
              <span>🏢 K-apt 아파트</span>
              <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1 py-0.5 rounded font-medium">연동 준비중</span>
            </div>
            <div className="inline-flex items-center gap-1 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400 shrink-0">
              <span>💎 캠코 온비드</span>
              <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1 py-0.5 rounded font-medium">연동 준비중</span>
            </div>
            <div className="inline-flex items-center gap-1 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400 shrink-0">
              <span>📢 협회·LH</span>
              <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1 py-0.5 rounded font-medium">연동 준비중</span>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 공고 구분 탭 & 상단 컨트롤 바 (PC 상단 Sticky 고정 & 모바일 가로 스와이프 최적화) */}
        <div className="sticky top-14 sm:top-16 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* 공고 구분 탭 버튼 (모바일 가로 스와이프) */}
            <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <button
                onClick={() => setViewTab("active")}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] whitespace-nowrap ${
                  viewTab === "active"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                <span>진행 공고 ({activeVerifiedBids.length})</span>
              </button>

              <button
                onClick={() => setViewTab("closed")}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] whitespace-nowrap ${
                  viewTab === "closed"
                    ? "bg-slate-800 text-rose-300 border border-rose-600/50"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <Clock className="w-4 h-4 text-slate-400" />
                <span>마감 공고 ({closedVerifiedBids.length})</span>
              </button>

              <button
                onClick={() => setViewTab("demo")}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] whitespace-nowrap ${
                  viewTab === "demo"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <AlertCircle className="w-4 h-4 text-amber-300" />
                <span>기능 미리보기 DEMO ({demoBids.length})</span>
              </button>

              <button
                id="bookmarks"
                onClick={() => setViewTab("bookmarks")}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] whitespace-nowrap ${
                  viewTab === "bookmarks"
                    ? "bg-slate-800 text-amber-300 border border-amber-500/40"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>⭐ 관심공고 ({bookmarkedIds.length})</span>
              </button>
            </div>

            {/* 우측 PC/모바일 즉시 필터링 검색창 & 정렬 옵션 */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex-1 sm:w-44 md:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="공고 즉시 필터링..."
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[38px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "dDay" | "budgetDesc" | "budgetAsc" | "newest")}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer min-h-[38px] shrink-0"
              >
                <option value="dDay">⏱️ 마감순</option>
                <option value="budgetDesc">💰 높은금액</option>
                <option value="budgetAsc">💵 낮은금액</option>
                <option value="newest">📅 최신등록</option>
              </select>
            </div>
          </div>
        </div>

        {/* DEMO 탭 안내 배너 */}
        {viewTab === "demo" && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-amber-300 font-bold block">DEMO 예시 데이터 안내</strong>
              <p className="leading-relaxed">
                본 공고는 기능 설명을 위한 예시 데이터이며 실제 입찰에 사용할 수 없습니다.
                표시된 자격·금액·일정·서류는 가상 예시이며, 실제 입찰 전 나라장터 원문을 별도로 확인해야 합니다.
              </p>
            </div>
          </div>
        )}

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
              <span>한국표준시(KST) 기준 실시간 마감시간 재계산 중</span>
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
              해당 탭에 일치하는 입찰 공고가 없습니다
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              선택한 업종, 지역, 마감일 필터 또는 검색어 조건을 변경하여 다시 확인해보세요.
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
