"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  Calendar,
  Clock,
  Flame,
  FileText,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import bidsData from "../../public/data/bids.json";
import SubscribeModal from "@/components/SubscribeModal";
import BidFilter, { FilterState } from "@/components/BidFilter";
import BidCard, { BidItem } from "@/components/BidCard";

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
  const [viewTab, setViewTab] = useState<"verified" | "demo" | "bookmarks">("verified");

  // 로컬스토리지 북마크 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ad_bids_bookmarks");
      if (saved) {
        setBookmarkedIds(JSON.parse(saved));
      }
    } catch {
      // fallback
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
    return (bidsData as unknown as BidItem[]) || [];
  }, []);

  // 검증된 실제 공고와 DEMO 공고 분리
  const verifiedBids = useMemo(() => {
    return allBids.filter((b) => !b.isDemo && b.status !== "DEMO 예시");
  }, [allBids]);

  const demoBids = useMemo(() => {
    return allBids.filter((b) => b.isDemo || b.status === "DEMO 예시");
  }, [allBids]);

  // 오늘 마감 공고 수
  const todayUrgentCount = useMemo(() => {
    return verifiedBids.filter((b) => b.dDay === 0 || b.dDay === 1).length;
  }, [verifiedBids]);

  // 현재 탭에 따른 기본 대상 리스트
  const currentTabBids = useMemo(() => {
    if (viewTab === "demo") return demoBids;
    if (viewTab === "bookmarks") {
      return allBids.filter((b) => bookmarkedIds.includes(b.id));
    }
    return verifiedBids;
  }, [viewTab, verifiedBids, demoBids, allBids, bookmarkedIds]);

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

        // 3. 마감일 필터
        if (filters.deadline === "d3" && bid.dDay > 3) return false;
        if (filters.deadline === "d7" && bid.dDay > 7) return false;
        if (filters.deadline === "d14" && bid.dDay > 14) return false;

        // 4. 계약유형 필터
        if (filters.contractType !== "계약유형 전체") {
          if (!bid.bidType.includes(filters.contractType)) return false;
        }

        // 5. 예산 필터
        if (filters.budgetRange === "under50m" && bid.budget > 50000000) return false;
        if (filters.budgetRange === "under100m" && bid.budget > 100000000) return false;
        if (filters.budgetRange === "over100m" && bid.budget < 100000000) return false;

        // 6. 출처 필터
        if (filters.sourceOrigin && filters.sourceOrigin !== "all") {
          if (bid.source !== filters.sourceOrigin) return false;
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
        if (sortBy === "dDay") return a.dDay - b.dDay;
        if (sortBy === "budgetDesc") return (b.budget || 0) - (a.budget || 0);
        if (sortBy === "budgetAsc") return (a.budget || 0) - (b.budget || 0);
        if (sortBy === "newest") return b.startDate.localeCompare(a.startDate);
        return 0;
      });
  }, [currentTabBids, filters, searchQuery, sortBy]);

  return (
    <div className="flex-1 flex flex-col">
      {/* 히어로 섹션 (단일 고정 B2B 테마 & 단순화된 구조) */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-slate-800 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          {/* 상단 신뢰 배지 */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-950 border border-slate-700 text-slate-300 text-xs font-semibold shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>조달청 나라장터 공식 연계 · 신뢰할 수 있는 옥외광고 입찰 정보</span>
          </div>

          {/* 메인 헤드라인 (명확한 가치 제안) */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            우리 회사가 참여할 수 있는{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              옥외광고 입찰
            </span>
            만 찾아드립니다
          </h1>

          {/* 보조 설명 */}
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            나라장터·온비드·K-apt·학교 발주공고를 수집하고, 참가자격과 마감일을 AI가 쉽게 정리합니다.
          </p>

          {/* 통합 검색창 */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center shadow-lg">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="공고명, 발주처, 지역, 품목을 검색하세요"
                className="w-full pl-10 pr-16 py-3.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm shadow-inner transition-all min-h-[44px]"
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

          {/* 대표 3대 행동 버튼 */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => {
                setViewTab("verified");
                setFilters(INITIAL_FILTERS);
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>맞춤 공고 찾기</span>
            </button>

            <button
              onClick={() => {
                setViewTab("verified");
                setFilters({ ...INITIAL_FILTERS, deadline: "d3" });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer min-h-[44px]"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>오늘 마감 공고 ({todayUrgentCount}건)</span>
            </button>

            <button
              onClick={() => setIsSubscribeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 font-bold text-xs sm:text-sm border border-amber-500/30 transition-all cursor-pointer min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 text-amber-400" />
              <span>무료 맞춤 알림 신청</span>
            </button>
          </div>

          {/* 검증된 공고 통계 요약 바 */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>검증된 진행 공고: <strong className="text-white font-bold">{verifiedBids.length}건</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>마감 임박: <strong className="text-rose-400 font-bold">{todayUrgentCount}건</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>공식 데이터 마지막 확인: <strong className="text-slate-300 font-medium">2026.09.04 10:00</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 공고 구분 탭 (검증된 실제 공고 vs DEMO 예시 공고 vs 관심공고) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab("verified")}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                viewTab === "verified"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <span>검증된 실제 공고 ({verifiedBids.length})</span>
            </button>

            <button
              onClick={() => setViewTab("demo")}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                viewTab === "demo"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <AlertCircle className="w-4 h-4 text-amber-300" />
              <span>기능 미리보기 DEMO ({demoBids.length})</span>
            </button>

            <button
              id="bookmarks"
              onClick={() => setViewTab("bookmarks")}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                viewTab === "bookmarks"
                  ? "bg-slate-800 text-amber-300 border border-amber-500/40"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>⭐ 관심공고 ({bookmarkedIds.length})</span>
            </button>
          </div>

          {/* 우측 정렬 옵션 */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 hidden sm:inline">정렬:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "dDay" | "budgetDesc" | "budgetAsc" | "newest")}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer min-h-[38px]"
            >
              <option value="dDay">⏱️ 마감 임박순</option>
              <option value="budgetDesc">💰 예산 높은순</option>
              <option value="budgetAsc">💵 예산 낮은순</option>
              <option value="newest">📅 최신 등록순</option>
            </select>
          </div>
        </div>

        {/* DEMO 탭 안내 배너 (DEMO 선택 시 노출) */}
        {viewTab === "demo" && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-amber-300 font-bold block">DEMO 예시 데이터 안내</strong>
              <p className="leading-relaxed">
                이 영역의 공고는 서비스 기능 설명을 위한 예시 데이터이며 실제 입찰에 사용할 수 없습니다.
                공식 원문 링크가 비활성화되어 있으므로 화면 구성 및 AI 분석 기능 체험용으로만 참조하시기 바랍니다.
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
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <div>
            조회된 공고 <strong className="text-blue-400 font-bold text-sm">{filteredBids.length}</strong>건
          </div>
          <span className="text-slate-500 text-[11px]">
            ※ 세부 시방서 및 법정 자격 요건은 각 공고의 [상세 분석]을 확인하세요.
          </span>
        </div>

        {/* 공고 카드 그리드 */}
        {filteredBids.length === 0 ? (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center my-6 shadow-sm">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">
              일치하는 입찰 공고가 없습니다
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              선택한 업종, 지역, 마감일 필터 또는 검색어 조건을 변경하여 다시 확인해보세요.
            </p>
            <button
              onClick={() => {
                setFilters(INITIAL_FILTERS);
                setSearchQuery("");
                setViewTab("verified");
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
