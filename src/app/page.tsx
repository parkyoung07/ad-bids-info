"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Flame,
  FileText,
  BadgeAlert,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
  Tag,
} from "lucide-react";
import sampleData from "../../public/data/bids-sample.json";

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
}

const CATEGORIES = [
  "전체",
  "간판·조형물",
  "실내표찰·현판",
  "차량랩핑·특수",
  "현수막·배너",
  "인쇄·판촉",
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const bids: BidItem[] = sampleData;

  const filteredBids = useMemo(() => {
    return bids.filter((bid) => {
      const matchCategory =
        selectedCategory === "전체" ||
        bid.category.includes(selectedCategory) ||
        selectedCategory.includes(bid.category);

      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        query === "" ||
        bid.title.toLowerCase().includes(query) ||
        bid.client.toLowerCase().includes(query) ||
        bid.location.toLowerCase().includes(query) ||
        bid.bidType.toLowerCase().includes(query);

      return matchCategory && matchQuery;
    });
  }, [bids, selectedCategory, searchQuery]);

  const urgentCount = useMemo(() => {
    return bids.filter((b) => b.dDay <= 3 && b.dDay >= 0).length;
  }, [bids]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  옥외광고 입찰정보 알리미
                  <span className="text-xs bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">
                    나라장터
                  </span>
                </span>
                <p className="text-xs text-slate-400 hidden sm:block">
                  간판 · 사인물 · 현수막 · 랩핑 맞춤 입찰 공고
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                실시간 연동 중
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 비주얼 및 검색 섹션 */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>오늘의 신규 옥외광고 공고 및 마감 임박 입찰 알림</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            놓치기 쉬운 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">옥외광고·사인물</span> 입찰공고
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            나라장터의 간판, 실내표찰, 차량랩핑, 현수막 공고를 품목별·지역별로 빠르게 확인하세요.
          </p>

          {/* 실시간 검색창 */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="공고명, 발주처, 지역(예: 서울, 세종, 부산)으로 검색..."
                className="w-full pl-12 pr-10 py-3.5 bg-white/10 backdrop-blur-md border border-slate-700/80 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-900/90 text-sm sm:text-base transition-all shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-xs bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded-md"
                >
                  지우기
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* 카테고리 필터 탭 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Tag className="w-4 h-4 text-blue-600" />
              <span>품목별 카테고리</span>
            </div>
            {urgentCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                마감 임박 공고 {urgentCount}건
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-600 ring-offset-2"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* 결과 통계 및 정렬 안내 */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 text-xs sm:text-sm text-slate-500">
          <div>
            총 <strong className="text-blue-600 font-bold">{filteredBids.length}</strong>건의 공고
            {searchQuery && <span className="ml-1 text-slate-400">(검색어: &quot;{searchQuery}&quot;)</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            <span>최신 등록순 정렬</span>
          </div>
        </div>

        {/* 공고 카드 목록 */}
        {filteredBids.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8 shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">검색 결과가 없습니다</h3>
            <p className="text-sm text-slate-500 mb-4">
              검색어나 카테고리 필터를 변경하여 다시 확인해 보세요.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("전체");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              전체 공고 보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            {filteredBids.map((bid) => {
              const isUrgent = bid.dDay <= 3 && bid.dDay >= 0;

              return (
                <div
                  key={bid.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* 상단 뱃지 라인 */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          {bid.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {bid.location}
                        </span>
                        <span className="text-xs text-slate-500 hidden sm:inline-block">
                          {bid.bidType}
                        </span>
                      </div>

                      {/* D-Day 뱃지 */}
                      <div className="flex items-center gap-1.5">
                        {isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500 text-white shadow-sm shadow-rose-500/20 animate-pulse">
                            <Flame className="w-3.5 h-3.5 fill-white" />
                            마감임박 D-{bid.dDay}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                            <Clock className="w-3 h-3 text-slate-500" />
                            D-{bid.dDay}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 공고 제목 */}
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-3">
                      <Link href={`/bids/${bid.id}`}>
                        {bid.title}
                      </Link>
                    </h2>

                    {/* 발주처 및 예산 정보 그리드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-600 bg-slate-50 rounded-xl p-3.5 mb-4 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-slate-500">발주처:</span>
                        <span className="font-medium text-slate-800 truncate">{bid.client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-semibold text-xs">₩</span>
                        <span className="text-slate-500">배정예산:</span>
                        <span className="font-bold text-blue-700">{bid.budgetText}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-slate-500">입찰 마감일:</span>
                        <span className="font-medium text-slate-800">{bid.endDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* 하단 액션 버튼 */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                    <span className="text-xs text-slate-400 font-mono">
                      공고번호: {bid.id}
                    </span>
                    <Link
                      href={`/bids/${bid.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 text-white group-hover:bg-blue-600 transition-all shadow-sm"
                    >
                      <span>상세보기</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>옥외광고 입찰정보 알리미 (Ad Bids Alerter)</span>
            </div>
            <p className="text-slate-400">
              본 서비스는 대한민국 조달청 나라장터(G2B) 공공데이터 Open API를 기반으로 옥외광고 및 사인물 관련 입찰공고를 제공합니다.
            </p>
            <p className="text-slate-500">
              데이터 업데이트 기준: 매일 자동 수집 갱신 | 공고 원문 및 최종 투찰은 나라장터 홈페이지를 반드시 확인하시기 바랍니다.
            </p>
          </div>

          <div className="flex flex-col md:items-end space-y-2 text-slate-500">
            <div className="flex items-center gap-4 text-slate-400 text-xs">
              <a
                href="https://www.g2b.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors underline"
              >
                조달청 나라장터 바로가기
              </a>
              <span>·</span>
              <a
                href="https://www.data.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors underline"
              >
                공공데이터포털
              </a>
            </div>
            <p>© 2026 Ad Bids Alerter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
