"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  BellRing,
  Building2,
  MapPin,
  Clock,
  Search,
  Bot,
  ExternalLink,
  Sparkles,
  Banknote,
  FileSearch,
  AlertCircle,
  Radio,
  CheckCircle2,
  Copy,
  Check,
  Send,
  ShieldCheck,
  TrendingUp,
  Filter,
  ArrowRight,
  Flame,
  ChevronRight,
  FileText,
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
  radarStatus: "의견수렴중" | "규격검토" | "발주임박";
  radarStage: number; // 1, 2, 3
  dDay: number;
  linkUrl: string;
  aiSpecSummary: string;
  aiPreparationTips: string;
  winThemeStrategy?: string;
  opinionSuggestion?: string;
}

const CATEGORIES = [
  "전체",
  "간판·조형물",
  "디지털사이니지·전광판",
  "온비드 공공매체권",
  "초·중·고·대학교",
  "현수막·배너",
];

export default function PrespecPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedRadarStage, setSelectedRadarStage] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"dDay" | "budgetDesc" | "newest">("dDay");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState<PrespecItem | null>(null);

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

    const opinionCount = items.filter((i) => i.radarStatus === "의견수렴중").length;
    const imminentCount = items.filter((i) => i.radarStatus === "발주임박").length;

    return {
      totalBudget: totalStr.trim() || "0원",
      totalCount: items.length,
      opinionCount,
      imminentCount,
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

        const matchStage =
          selectedRadarStage === "all" ||
          (selectedRadarStage === "stage1" && item.radarStatus === "의견수렴중") ||
          (selectedRadarStage === "stage2" && item.radarStatus === "규격검토") ||
          (selectedRadarStage === "stage3" && item.radarStatus === "발주임박");

        const q = searchQuery.trim().toLowerCase();
        const matchQuery =
          q === "" ||
          item.title.toLowerCase().includes(q) ||
          item.client.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.aiSpecSummary.toLowerCase().includes(q);

        return matchCat && matchStage && matchQuery;
      })
      .sort((a, b) => {
        if (sortBy === "dDay") return a.dDay - b.dDay;
        if (sortBy === "budgetDesc") return b.budget - a.budget;
        return b.regDate.localeCompare(a.regDate);
      });
  }, [items, selectedCategory, selectedRadarStage, searchQuery, sortBy]);

  const handleCopyOpinion = (item: PrespecItem) => {
    const text = `
[📋 조달청 나라장터 사전규격 의견서 초안]
- 공고(사전규격)명: ${item.title}
- 발주기관: ${item.client}
- 의견 제출 마감: ${item.opinionEndDate}

■ 의견 제출 제안 내용:
${item.opinionSuggestion || item.aiPreparationTips}

■ AI 사전 수주 전략:
${item.winThemeStrategy || "사전 파트너십 및 세부 면허 요건을 점검하세요."}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                    옥외광고 입찰 알리미
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm shadow-cyan-500/10">
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                    발주 예보 레이더
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  본공고 3~14일 전 사전규격 조기 포착 · AI 사전 영업(Capture) 지원
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-1">
              <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <Link
                  href="/"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  입찰공고
                </Link>
                <Link
                  href="/calendar"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-300 hover:text-indigo-200 hover:bg-slate-800 transition-all border border-indigo-500/30 bg-indigo-500/10"
                >
                  📅 캘린더
                </Link>
                <Link
                  href="/prespec"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 border border-cyan-400 shadow-md shadow-cyan-500/30"
                >
                  🔔 발주예고 (레이더)
                </Link>
                <Link
                  href="/results"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
                >
                  🏆 낙찰통계
                </Link>
                <Link
                  href="/calculator"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
                >
                  💰 투찰계산기
                </Link>
                <Link
                  href="/spec-xray"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🔍 시방서 엑스레이
                </Link>
                <Link
                  href="/partners"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🤝 협력사·DB
                </Link>
                <Link
                  href="/proposal"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-300 hover:text-purple-200 hover:bg-slate-800 transition-all border border-purple-500/30 bg-purple-500/10"
                >
                  ✨ AI제안서
                </Link>
                <Link
                  href="/forms"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  📄 입찰서식
                </Link>
                <Link
                  href="/blog"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  트렌드
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 & 레이더 요약 바 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/0 to-slate-950/0 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-bold shadow-lg shadow-cyan-950/50 backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-ping" />
            <span>AI 발주 예보 레이더 (Early Capture Radar V2.0)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            남들보다 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">7일 먼저 포착하는</span> 옥외광고 사전규격
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            본공고가 나라장터에 뜨기 전 사전의견을 제출하여 <strong>자사에 유리한 규격을 유도</strong>하고, <br className="hidden sm:inline" />
            부족한 면허와 협력사를 미리 세팅하여 <strong>수주 확률을 2배 이상 극대화</strong>하세요.
          </p>

          {/* 레이더 상태 3단계 바 */}
          <div className="pt-2 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
                <span className="font-mono font-black text-cyan-300 text-base">01</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-cyan-400 block">1단계: 의견수렴 중</span>
                <span className="text-xs text-slate-300 font-medium">규격 완화 의견서 제출 찬스</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center shrink-0">
                <span className="font-mono font-black text-indigo-300 text-base">02</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-indigo-400 block">2단계: 규격검토 보완</span>
                <span className="text-xs text-slate-300 font-medium">컨소시엄 및 자격 서류 점검</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center shrink-0">
                <span className="font-mono font-black text-rose-300 text-base">03</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-rose-400 block">3단계: 본공고 발주임박</span>
                <span className="text-xs text-slate-300 font-medium">사정률 시뮬레이션 & 투찰 준비</span>
              </div>
            </div>
          </div>

          {/* 핵심 지표 요약 바 */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
              <Banknote className="w-4 h-4 text-cyan-400" />
              <span>예보 총 사업규모: <strong className="text-cyan-300 font-bold">{stats.totalBudget}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
              <BellRing className="w-4 h-4 text-emerald-400" />
              <span>포착된 사전규격: <strong className="text-white font-bold">{stats.totalCount}건</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>발주임박 공고: <strong className="text-rose-400 font-bold">{stats.imminentCount}건</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* 필터 및 검색 컨트롤 */}
        <div className="space-y-4 mb-6">
          {/* 1. 레이더 단계 필터 */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                레이더 단계:
              </span>
              <button
                onClick={() => setSelectedRadarStage("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedRadarStage === "all"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                전체 ({items.length})
              </button>
              <button
                onClick={() => setSelectedRadarStage("stage1")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                  selectedRadarStage === "stage1"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-cyan-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>1단계 의견수렴중 ({stats.opinionCount})</span>
              </button>
              <button
                onClick={() => setSelectedRadarStage("stage2")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedRadarStage === "stage2"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-indigo-300"
                }`}
              >
                2단계 규격검토
              </button>
              <button
                onClick={() => setSelectedRadarStage("stage3")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                  selectedRadarStage === "stage3"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-rose-300"
                }`}
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span>3단계 발주임박 ({stats.imminentCount})</span>
              </button>
            </div>

            {/* 정렬 드롭다운 */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
              >
                <option value="dDay">⏱️ 마감 D-Day 빠른순</option>
                <option value="budgetDesc">💰 예산 높은순</option>
                <option value="newest">📅 최신 공개순</option>
              </select>
            </div>
          </div>

          {/* 2. 카테고리 필터 & 검색바 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-slate-100 text-slate-950 font-bold shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="사전규격명, 지자체, 지역 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* 사전규격 공고 리스트 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
            <span>포착된 사전규격: <strong className="text-cyan-400 font-bold">{filteredItems.length}</strong>건</span>
            <span>※ 본공고 전환 시 실시간 입찰공고 탭으로 자동 이관됩니다.</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400 font-bold">조건에 맞는 사전규격이 없습니다.</p>
              <button
                onClick={() => {
                  setSelectedCategory("전체");
                  setSelectedRadarStage("all");
                  setSearchQuery("");
                }}
                className="text-xs text-cyan-400 underline cursor-pointer"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isImminent = item.radarStatus === "발주임박" || item.dDay <= 1;
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-lg hover:shadow-cyan-500/5 flex flex-col justify-between group space-y-4"
                >
                  {/* 상단 뱃지 및 메타 */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* 상태 뱃지 */}
                      <span
                        className={`text-[11px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                          item.radarStatus === "의견수렴중"
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 animate-pulse"
                            : item.radarStatus === "발주임박"
                            ? "bg-rose-500/20 text-rose-300 border-rose-400/40"
                            : "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                        }`}
                      >
                        <Radio className="w-3 h-3" />
                        <span>{item.radarStatus}</span>
                      </span>

                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-300 flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {item.location}
                      </span>
                    </div>

                    {/* D-Day / 마감 정보 */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full ${
                          isImminent
                            ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-bounce"
                            : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        의견마감 {item.dDay === 0 ? "오늘마감 D-DAY" : `D-${item.dDay}`}
                      </span>
                    </div>
                  </div>

                  {/* 공고명 */}
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-400 transition-colors leading-snug">
                      {item.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2 font-medium">
                      <span>발주기관: <strong className="text-slate-200">{item.client}</strong></span>
                      <span>추정예산: <strong className="text-amber-400 font-bold">{item.budgetText}</strong></span>
                      <span>본공고 예상시기: <strong className="text-indigo-300">{item.expectedBidDate}</strong></span>
                    </div>
                  </div>

                  {/* AI 사전 분석 박스 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                        <Bot className="w-3.5 h-3.5" />
                        <span>AI 사전규격 3초 요약</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {item.aiSpecSummary}
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-800/80 pt-2.5 md:pt-0 md:pl-4">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI 선제 수주 준비 팁 (Win-Theme)</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {item.winThemeStrategy || item.aiPreparationTips}
                      </p>
                    </div>
                  </div>

                  {/* 규격 의견제출 가이드 (의견수렴 중일 때 강조) */}
                  {item.opinionSuggestion && (
                    <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-cyan-300 flex items-center gap-1">
                          <Send className="w-3 h-3 text-cyan-400" />
                          <span>추천 의견제출 포인트:</span>
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {item.opinionSuggestion}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopyOpinion(item)}
                        className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold transition-all flex items-center gap-1 cursor-pointer text-[11px]"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">의견서 복사됨!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>의견서 양식 복사</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 하단 액션 버튼 바 */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      사전규격 등록번호: {item.id} | 의견마감: {item.opinionEndDate}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/spec-xray"
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold transition-all flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>시방서 엑스레이</span>
                      </Link>

                      <Link
                        href="/partners"
                        className="px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 font-bold transition-all flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>사전 협력사 매칭</span>
                      </Link>

                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition-all shadow-md shadow-cyan-600/30 flex items-center gap-1"
                      >
                        <span>나라장터 원문 열기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
