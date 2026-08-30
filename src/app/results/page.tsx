"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Trophy,
  Building2,
  Calendar,
  MapPin,
  TrendingUp,
  Search,
  Bot,
  ExternalLink,
  Users,
  Percent,
  Banknote,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import awardData from "../../../public/data/award-results.json";

export interface AwardItem {
  id: string;
  title: string;
  category: string;
  client: string;
  budget: number;
  budgetText: string;
  winningBid: number;
  winningBidText: string;
  rate: number;
  winner: string;
  winnerType: string;
  biddersCount: number;
  openedDate: string;
  location: string;
  linkUrl: string;
  aiAnalysis?: string;
}

const CATEGORIES = [
  "전체",
  "간판·조형물",
  "디지털사이니지·전광판",
  "매체권·임대",
  "학교·교육",
  "차량랩핑·특수",
  "현수막·배너",
];

const LOCATIONS = ["전국", "서울", "경기", "인천", "부산", "대구", "전북", "경북", "충북"];

export default function AwardResultsPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedLocation, setSelectedLocation] = useState("전국");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "rateAsc" | "budgetDesc">("newest");

  const awards: AwardItem[] = useMemo(() => {
    return (awardData as unknown as AwardItem[]) || [];
  }, []);

  // 통계 계산
  const stats = useMemo(() => {
    if (awards.length === 0) return { avgRate: 0, totalAmount: "0원", avgBidders: 0 };
    const avgR = (awards.reduce((acc, cur) => acc + cur.rate, 0) / awards.length).toFixed(2);
    const total = awards.reduce((acc, cur) => acc + cur.winningBid, 0);
    const avgB = (awards.reduce((acc, cur) => acc + cur.biddersCount, 0) / awards.length).toFixed(1);

    const eok = Math.floor(total / 100000000);
    const man = Math.floor((total % 100000000) / 10000);
    let totalStr = "";
    if (eok > 0) totalStr += `${eok.toLocaleString()}억 `;
    if (man > 0) totalStr += `${man.toLocaleString()}만 `;
    totalStr += "원";

    return {
      avgRate: avgR,
      totalAmount: totalStr.trim(),
      avgBidders: avgB,
    };
  }, [awards]);

  // 필터링 및 검색 로직
  const filteredAwards = useMemo(() => {
    return awards
      .filter((item) => {
        const matchCategory =
          selectedCategory === "전체" ||
          item.category.includes(selectedCategory) ||
          selectedCategory.includes(item.category);

        const matchLocation =
          selectedLocation === "전국" ||
          item.location.includes(selectedLocation) ||
          item.client.includes(selectedLocation);

        const q = searchQuery.trim().toLowerCase();
        const matchQuery =
          q === "" ||
          item.title.toLowerCase().includes(q) ||
          item.client.toLowerCase().includes(q) ||
          item.winner.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);

        return matchCategory && matchLocation && matchQuery;
      })
      .sort((a, b) => {
        if (sortBy === "rateAsc") return a.rate - b.rate;
        if (sortBy === "budgetDesc") return b.winningBid - a.winningBid;
        return b.openedDate.localeCompare(a.openedDate);
      });
  }, [awards, selectedCategory, selectedLocation, searchQuery, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    옥외광고 입찰 알리미
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">
                    <Trophy className="w-2.5 h-2.5 text-amber-400" />
                    낙찰 통계
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  조달청 나라장터 & 온비드 실시간 개찰 결과 · 낙찰률 분석
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-1.5">
              <Link
                href="/"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                입찰공고 목록
              </Link>
              <Link
                href="/calendar"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-300 hover:text-indigo-200 hover:bg-slate-800 transition-all border border-indigo-500/30 bg-indigo-500/10"
              >
                📅 캘린더
              </Link>
              <Link
                href="/prespec"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
              >
                🔔 발주 예고
              </Link>
              <Link
                href="/results"
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-md shadow-amber-500/10"
              >
                🏆 낙찰 통계
              </Link>
              <Link
                href="/blog"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                옥외광고 트렌드
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 & KPI 위젯 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-xl">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>최근 옥외광고·간판·사이니지·매체권 최종 낙찰가율 & 경쟁률 리포트</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            얼마를 써야 낙찰될까? <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-300">실시간 낙찰 분석</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            나라장터 및 온비드 개찰 결과를 바탕으로, 1순위 낙찰 업체의 투찰률(%)과 참가 업체 수, AI 합격 요인 분석을 제공합니다.
          </p>

          {/* 4대 KPI 요약 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>평균 낙찰가율</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-amber-400">{stats.avgRate}%</p>
              <p className="text-[10px] text-slate-500">투찰하한선 87.745% 부근</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                <span>분석 낙찰 총액</span>
              </div>
              <p className="text-base sm:text-xl font-black text-emerald-300 truncate">{stats.totalAmount}</p>
              <p className="text-[10px] text-slate-500">누적 개찰 계약 기준</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>평균 경쟁률</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-blue-400">{stats.avgBidders} : 1</p>
              <p className="text-[10px] text-slate-500">공고당 평균 투찰사</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>직접생산 보유사</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-cyan-300">84.5%</p>
              <p className="text-[10px] text-slate-500">중소기업 적격심사 통과율</p>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 목록 영역 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
        {/* 필터 바 */}
        <div className="space-y-3">
          {/* 카테고리 탭 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 ring-2 ring-amber-400"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 검색 및 정렬 */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="공고명, 낙찰업체명, 발주처 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="newest">📅 최신 개찰일순</option>
                <option value="budgetDesc">💰 낙찰금액 높은순</option>
                <option value="rateAsc">📉 낙찰률 낮은순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 개찰 결과 카드 목록 */}
        <div className="grid grid-cols-1 gap-4">
          {filteredAwards.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 sm:p-5 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                {/* 상단 뱃지 라인 */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                        item.category.includes("매체") || item.category.includes("임대")
                          ? "bg-amber-500/15 text-amber-300 border-amber-400/20"
                          : item.category.includes("학교") || item.category.includes("교육")
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/20"
                          : item.category.includes("디지털") || item.category.includes("전광판")
                          ? "bg-purple-500/15 text-purple-300 border-purple-400/20"
                          : "bg-blue-500/15 text-blue-300 border-blue-400/20"
                      }`}
                    >
                      {item.category}
                    </span>

                    <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                      <MapPin className="w-2.5 h-2.5 inline mr-1 text-slate-400" />
                      {item.location}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      공고: {item.id}
                    </span>
                  </div>

                  {/* 낙찰률 하이라이트 뱃지 */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                      투찰률 {item.rate}%
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      경쟁 {item.biddersCount}개사
                    </span>
                  </div>
                </div>

                {/* 공고명 */}
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug">
                  {item.title}
                </h3>

                {/* 최종 낙찰자 & 금액 정보 박스 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 my-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px]">최종 1순위 낙찰자</span>
                    <div className="flex items-center gap-1 font-bold text-amber-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{item.winner}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{item.winnerType}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px]">최종 낙찰금액</span>
                    <p className="font-extrabold text-white text-sm">{item.winningBidText}</p>
                    <p className="text-[10px] text-slate-500">배정예산: {item.budgetText}</p>
                  </div>

                  <div className="space-y-0.5 sm:text-right">
                    <span className="text-slate-400 text-[10px]">발주기관 & 개찰일</span>
                    <p className="font-semibold text-slate-300 truncate">{item.client}</p>
                    <p className="text-[10px] text-slate-500">{item.openedDate}</p>
                  </div>
                </div>

                {/* AI 낙찰 분석 인사이트 */}
                {item.aiAnalysis && (
                  <div className="bg-blue-950/20 border border-blue-800/40 rounded-lg p-2.5 text-[11px] text-slate-300 flex items-start gap-2">
                    <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-cyan-300 font-bold mr-1">AI 낙찰 분석:</span>
                      <span className="leading-relaxed">{item.aiAnalysis}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 하단 버튼 */}
              <div className="pt-3 mt-2 flex items-center justify-end border-t border-slate-800/40">
                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline font-semibold"
                >
                  <span>원문 개찰결과 확인</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
