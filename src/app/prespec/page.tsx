"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  BellRing,
  Building2,
  Calendar,
  MapPin,
  Clock,
  Search,
  Bot,
  ExternalLink,
  Sparkles,
  Banknote,
  ShieldCheck,
  FileSearch,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import prespecData from "../../../public/data/prespec-bids.json";

export interface PrespecItem {
  id: string;
  title: string;
  category: string;
  client: string;
  budget: number;
  budgetText: string;
  location: string;
  regDate: string;
  opinionEndDate: string;
  expectedBidDate: string;
  linkUrl: string;
  aiSpecSummary: string;
  aiPreparationTips: string;
}

const CATEGORIES = [
  "전체",
  "간판·조형물",
  "디지털사이니지·전광판",
  "매체권·임대",
  "학교·교육",
  "현수막·배너",
];

const LOCATIONS = ["전국", "서울", "경기", "부산", "대전"];

export default function PrespecPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedLocation, setSelectedLocation] = useState("전국");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "budgetDesc" | "opinionDeadline">("newest");

  const items: PrespecItem[] = useMemo(() => {
    return (prespecData as unknown as PrespecItem[]) || [];
  }, []);

  // 통계 계산
  const stats = useMemo(() => {
    const total = items.reduce((acc, cur) => acc + cur.budget, 0);
    const eok = Math.floor(total / 100000000);
    const man = Math.floor((total % 100000000) / 10000);
    let totalStr = "";
    if (eok > 0) totalStr += `${eok.toLocaleString()}억 `;
    if (man > 0) totalStr += `${man.toLocaleString()}만 `;
    totalStr += "원";

    return {
      totalBudget: totalStr.trim() || "0원",
      totalCount: items.length,
      leadTimeDays: 6,
    };
  }, [items]);

  // 필터링 및 검색 로직
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchCat =
          selectedCategory === "전체" ||
          item.category.includes(selectedCategory) ||
          selectedCategory.includes(item.category);

        const matchLoc =
          selectedLocation === "전국" ||
          item.location.includes(selectedLocation) ||
          item.client.includes(selectedLocation);

        const q = searchQuery.trim().toLowerCase();
        const matchQuery =
          q === "" ||
          item.title.toLowerCase().includes(q) ||
          item.client.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.aiSpecSummary.toLowerCase().includes(q);

        return matchCat && matchLoc && matchQuery;
      })
      .sort((a, b) => {
        if (sortBy === "budgetDesc") return b.budget - a.budget;
        if (sortBy === "opinionDeadline") return a.opinionEndDate.localeCompare(b.opinionEndDate);
        return b.regDate.localeCompare(a.regDate);
      });
  }, [items, selectedCategory, selectedLocation, searchQuery, sortBy]);

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
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                    <BellRing className="w-2.5 h-2.5 text-cyan-400 animate-bounce" />
                    발주 예고
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  본공고 3~7일 전 사전규격 공개 · 남보다 빠른 입찰 선점
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
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-md shadow-cyan-500/10"
              >
                🔔 발주 예고
              </Link>
              <Link
                href="/results"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
              >
                🏆 낙찰 통계
              </Link>
              <Link
                href="/blog"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                옥외광고 트렌드
              </Link>
              <Link
                href="/news"
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-300 hover:text-emerald-200 hover:bg-slate-800 transition-all border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                실시간 뉴스
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 & KPI 위젯 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-xl">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <BellRing className="w-3.5 h-3.5 text-cyan-400" />
            <span>정식 입찰 3~7일 전 조달청 사전규격공개 실시간 모니터링</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            남들보다 1주일 빠른 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300">사전규격·발주예고</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            관공서가 본공고를 내기 전 규격을 미리 공개하여 의견을 수렴하는 단계입니다. 자재 수급과 디자인 제안서를 남들보다 먼저 준비하여 낙찰률을 극대화하세요.
          </p>

          {/* 4대 KPI 요약 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Banknote className="w-3.5 h-3.5 text-cyan-400" />
                <span>발주 예고 규모</span>
              </div>
              <p className="text-base sm:text-xl font-black text-cyan-300 truncate">{stats.totalBudget}</p>
              <p className="text-[10px] text-slate-500">본공고 발주 대기 총액</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>평균 사전 리드타임</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-emerald-400">D-5 ~ D-7일</p>
              <p className="text-[10px] text-slate-500">선제적 제안서 준비 기간</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <FileSearch className="w-3.5 h-3.5 text-amber-400" />
                <span>의견 수렴 중 공고</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-amber-400">{stats.totalCount}건</p>
              <p className="text-[10px] text-slate-500">규격 이의신청 및 검토 가능</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI 규격 분석 적용</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-purple-300">100%</p>
              <p className="text-[10px] text-slate-500">핵심 스펙 및 준비 팁 제공</p>
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
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400"
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
                placeholder="사전규격 사업명, 발주처, 규격 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="newest">📅 최신 공개순</option>
                <option value="opinionDeadline">⏱️ 의견마감 임박순</option>
                <option value="budgetDesc">💰 배정예산 높은순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 사전규격 카드 목록 */}
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 sm:p-5 transition-all shadow-md flex flex-col justify-between"
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
                          : "bg-cyan-500/15 text-cyan-300 border-cyan-400/20"
                      }`}
                    >
                      {item.category}
                    </span>

                    <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                      <MapPin className="w-2.5 h-2.5 inline mr-1 text-slate-400" />
                      {item.location}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      사전규격번호: {item.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-md border border-cyan-400/30">
                      <BellRing className="w-3 h-3 text-cyan-400" />
                      본공고 예정: {item.expectedBidDate}
                    </span>
                  </div>
                </div>

                {/* 사업명 */}
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug">
                  {item.title}
                </h3>

                {/* 핵심 정보 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 my-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px]">발주기관 (수요기관)</span>
                    <div className="flex items-center gap-1 font-bold text-slate-200">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{item.client}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">공개일: {item.regDate}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px]">배정 예산 (추정가격)</span>
                    <p className="font-extrabold text-cyan-300 text-sm">{item.budgetText}</p>
                    <p className="text-[10px] text-slate-500">부가가치세 포함</p>
                  </div>

                  <div className="space-y-0.5 sm:text-right">
                    <span className="text-slate-400 text-[10px]">규격 의견등록 마감</span>
                    <p className="font-semibold text-rose-400">{item.opinionEndDate}</p>
                    <p className="text-[10px] text-slate-500">이의신청 및 규격 검토 기한</p>
                  </div>
                </div>

                {/* AI 규격 요약 및 사전 준비 가이드 */}
                <div className="space-y-2 bg-slate-950/50 border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2">
                    <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-cyan-300 font-bold mr-1">사전규격 핵심 요약:</span>
                      <span className="leading-relaxed text-slate-300">{item.aiSpecSummary}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-slate-800/60">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-amber-400 font-bold mr-1">💡 사전 준비 TIP:</span>
                      <span className="leading-relaxed text-slate-300">{item.aiPreparationTips}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 액션 버튼 */}
              <div className="pt-3 mt-2 flex items-center justify-between border-t border-slate-800/40">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-slate-400" />
                  본공고 게시 전 규격 변경이 있을 수 있습니다.
                </span>

                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
                >
                  <span>나라장터 사전규격 원문 및 의견제출</span>
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
