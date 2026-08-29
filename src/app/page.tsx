"use client";

import { useState, useMemo, useEffect } from "react";
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
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
  Tag,
  ExternalLink,
  Bot,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import bidsData from "../../public/data/bids.json";
import metaData from "../../public/data/meta.json";

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
  aiSummary?: string;
  aiTips?: string;
}

// 5가지 도시 옥외광고 테마 배경 이미지 (3일 주기 자동 순차 교체)
const HERO_BACKGROUNDS = [
  {
    id: 1,
    name: "메가시티 미디어 파사드",
    desc: "강남 & 코엑스 K-POP 스퀘어 스타일",
    url: "/images/hero/hero_1_night_facade.jpg",
  },
  {
    id: 2,
    name: "골든아워 선셋 빌보드",
    desc: "석양 도심 스카이라인 & 옥외광고판",
    url: "/images/hero/hero_2_sunset_billboard.jpg",
  },
  {
    id: 3,
    name: "미니멀 하이테크 미디어월",
    desc: "모던 건축물 & 슬림 디지털 사이니지",
    url: "/images/hero/hero_3_minimal_tech.jpg",
  },
  {
    id: 4,
    name: "타임스퀘어 네온 에너지",
    desc: "세계적인 옥외광고 중심지 거리",
    url: "/images/hero/hero_4_vibrant_times_square.jpg",
  },
  {
    id: 5,
    name: "스마트시티 공공 사이니지",
    desc: "스마트 쉘터 & 전자게시대",
    url: "/images/hero/hero_5_smartcity_daylight.jpg",
  },
];

const CATEGORIES = [
  "전체",
  "간판·조형물",
  "디지털사이니지·전광판",
  "실내표찰·현판",
  "차량랩핑·특수",
  "현수막·배너",
  "인쇄·판촉",
];

const LOCATIONS = [
  "전국",
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

function getG2BLink(linkUrl?: string, id?: string) {
  if (linkUrl && linkUrl.startsWith("https://www.g2b.go.kr/link/PNPE027_01/single")) {
    return linkUrl;
  }
  if (id) {
    const cleanId = id.split("-")[0];
    const cleanOrd = id.split("-")[1] || "000";
    return `https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=${cleanId}&bidPbancOrd=${cleanOrd}`;
  }
  return "https://www.g2b.go.kr";
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedLocation, setSelectedLocation] = useState("전국");
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"dDay" | "budgetDesc" | "budgetAsc" | "newest">("dDay");

  // 3일마다 순차적으로 자동 변경되는 배경 인덱스 (기본값: 0)
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    // 1970년 1월 1일 이후 경과된 일수를 3일 단위로 나누어 5개 이미지를 순차 순환
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const autoIndex = Math.floor(daysSinceEpoch / 3) % HERO_BACKGROUNDS.length;
    setCurrentBgIndex(autoIndex);
  }, []);

  const bids: BidItem[] = useMemo(() => {
    return ((bidsData as unknown as BidItem[]) || []).filter((b) => b.dDay >= 0);
  }, []);

  // 카테고리별 건수 계산
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 전체: bids.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== "전체") {
        counts[cat] = bids.filter((b) => {
          if (cat === "디지털사이니지·전광판") {
            return (
              b.category.includes("디지털사이니지") ||
              b.category.includes("전광판") ||
              b.category.includes("사이니지") ||
              /디지털|사이니지|전광판|전자게시대|미디어월|키오스크/.test(b.title)
            );
          }
          return b.category.includes(cat) || cat.includes(b.category);
        }).length;
      }
    });
    return counts;
  }, [bids]);

  // 지역별 건수 계산
  const locationCounts = useMemo(() => {
    const counts: Record<string, number> = { 전국: bids.length };
    LOCATIONS.forEach((loc) => {
      if (loc !== "전국") {
        counts[loc] = bids.filter(
          (b) =>
            b.location.includes(loc) ||
            b.client.includes(loc) ||
            b.title.includes(loc)
        ).length;
      }
    });
    return counts;
  }, [bids]);

  // 필터링 및 정렬 로직
  const filteredBids = useMemo(() => {
    const list = bids.filter((bid) => {
      // 카테고리 필터
      let matchCategory = selectedCategory === "전체";
      if (selectedCategory === "디지털사이니지·전광판") {
        matchCategory =
          bid.category.includes("디지털사이니지") ||
          bid.category.includes("전광판") ||
          bid.category.includes("사이니지") ||
          /디지털|사이니지|전광판|전자게시대|미디어월|키오스크/.test(bid.title);
      } else if (selectedCategory !== "전체") {
        matchCategory =
          bid.category.includes(selectedCategory) ||
          selectedCategory.includes(bid.category);
      }

      // 지역 필터 (17개 광역 시도 전체 지원)
      const matchLocation =
        selectedLocation === "전국" ||
        bid.location.includes(selectedLocation) ||
        bid.client.includes(selectedLocation) ||
        bid.title.includes(selectedLocation);

      // 마감 임박 필터
      const matchUrgent = !onlyUrgent || (bid.dDay <= 3 && bid.dDay >= 0);

      // 검색어 필터 ('전광판', '사이니지', 'LED', '전자게시대', '미디어월' 등 공고명/카테고리/내용 즉시 매칭)
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        query === "" ||
        bid.title.toLowerCase().includes(query) ||
        bid.category.toLowerCase().includes(query) ||
        bid.client.toLowerCase().includes(query) ||
        bid.location.toLowerCase().includes(query) ||
        bid.bidType.toLowerCase().includes(query) ||
        (bid.aiSummary && bid.aiSummary.toLowerCase().includes(query)) ||
        (bid.aiTips && bid.aiTips.toLowerCase().includes(query));

      return matchCategory && matchLocation && matchUrgent && matchQuery;
    });

    return list.sort((a, b) => {
      if (sortBy === "dDay") {
        return a.dDay - b.dDay;
      } else if (sortBy === "budgetDesc") {
        return (b.budget || 0) - (a.budget || 0);
      } else if (sortBy === "budgetAsc") {
        return (a.budget || 0) - (b.budget || 0);
      } else if (sortBy === "newest") {
        return b.startDate.localeCompare(a.startDate);
      }
      return 0;
    });
  }, [bids, selectedCategory, selectedLocation, onlyUrgent, searchQuery, sortBy]);

  // 마감 임박 공고 수
  const urgentCount = useMemo(() => {
    return bids.filter((b) => b.dDay <= 3 && b.dDay >= 0).length;
  }, [bids]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* 상단 헤더 네비게이션 */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* 로고 및 서비스명 (서체 20% 축소) */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/25 ring-1 ring-white/20">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                    옥외광고 입찰 알리미
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                    Gemini AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  조달청 나라장터 공공입찰 맞춤 실시간 수집 · AI 분석
                </p>
              </div>
            </div>

            {/* 네비게이션 메뉴 및 실시간 연동 상태 뱃지 (서체 20% 축소) */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <nav className="flex items-center gap-1 sm:gap-1.5">
                <Link
                  href="/"
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400"
                >
                  입찰공고 목록
                </Link>
                <Link
                  href="/blog"
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  옥외광고 트렌드
                </Link>
              </nav>

              <div className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-sm shadow-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-semibold">{metaData?.activeDate || "오늘"} 실시간</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3일 주기 자동 교체되는 도시 옥외광고 배경 히어로 섹션 */}
      <section className="relative isolate overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-2xl">
        {/* 5가지 테마 배경 이미지 레이어 (3일 주기 자동 전환, z-index 0에서 확실히 렌더링) */}
        {HERO_BACKGROUNDS.map((bg, idx) => (
          <div
            key={bg.id}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0 transform scale-100 ${
              idx === currentBgIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{
              backgroundImage: `url(${bg.url})`,
              backgroundPosition: "center 35%",
            }}
          />
        ))}

        {/* 세련된 다크 비네팅 오버레이 (사진의 도시 불빛과 사이니지는 살리고 글자 가독성은 확보) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/55 to-slate-950 z-0 backdrop-blur-[0.5px]"></div>
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/90 z-0"></div>

        <div className="max-w-4xl mx-auto text-center space-y-3.5 relative z-10">
          {/* 상단 뱃지 (서체 20% 축소: text-[11px]) */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900/90 border border-blue-400/40 text-blue-300 text-[11px] font-semibold backdrop-blur-md shadow-lg">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>제미나이 AI가 옥외광고 공고를 요약하고 핵심 자격을 안내합니다</span>
          </div>

          {/* 메인 타이틀 (서체 약 20~25% 축소: text-xl sm:text-2xl lg:text-3xl) */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug drop-shadow-md">
            놓치면 안 될{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
              간판·전광판·사인물
            </span>{" "}
            입찰정보
          </h1>

          {/* 서브 설명 (서체 20% 축소: text-[11px] sm:text-xs) */}
          <p className="text-[11px] sm:text-xs text-slate-200 max-w-xl mx-auto leading-relaxed drop-shadow">
            공공데이터포털 조달청 나라장터에서 수집된 용역·물품·공사 공고 중 옥외광고 사업자에게 꼭 필요한 정보만 선별하여 제공합니다.
          </p>

          {/* 통합 검색창 (서체 20% 축소: text-xs sm:text-sm) */}
          <div className="pt-1.5 max-w-xl mx-auto">
            <div className="relative flex items-center shadow-2xl">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="공고명, 발주처, 품목(전광판, 사이니지, LED, 전자게시대 등) 검색..."
                className="w-full pl-10 pr-14 py-3 bg-slate-900/95 backdrop-blur-lg border border-slate-600/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm shadow-2xl transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 transition-colors"
                >
                  지우기
                </button>
              )}
            </div>
          </div>

          {/* 통계 요약 바 (서체 20% 축소: text-[11px]) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] text-slate-200">
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-md">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>수집 공고: <strong className="text-white font-bold">{bids.length}건</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-md">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>마감임박 (D-3 이내): <strong className="text-rose-400 font-bold">{urgentCount}건</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI 분석 적용: <strong className="text-cyan-300 font-bold">100%</strong></span>
            </div>
          </div>

          {/* 3일 주기 순차 교체 테마 안내 및 수동 선택 인디케이터 (서체 20% 축소) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[10px] text-slate-300 font-medium flex items-center gap-1 mr-1 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800">
              <ImageIcon className="w-3 h-3 text-blue-400" />
              <span>3일 주기 자동 변경 테마:</span>
            </span>
            {HERO_BACKGROUNDS.map((bg, index) => (
              <button
                key={bg.id}
                onClick={() => setCurrentBgIndex(index)}
                title={`${bg.name} - ${bg.desc}`}
                className={`text-[10px] px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 cursor-pointer backdrop-blur-sm ${
                  currentBgIndex === index
                    ? "bg-blue-600 text-white font-bold border border-blue-400 shadow-md scale-105"
                    : "bg-slate-900/85 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80"
                }`}
              >
                <span>{index + 1}. {bg.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 목록 영역 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 카테고리 탭 & 마감임박 토글 */}
        <div className="space-y-3 mb-5">
          {/* 카테고리 버튼들 (서체 20% 축소: text-[11px] sm:text-xs) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full">
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category;
                const count = categoryCounts[category] || 0;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-950"
                        : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                    }`}
                  >
                    <span>{category}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? "bg-blue-800 text-blue-100"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 마감 임박 & 지역 필터 바 & 정렬 (서체 20% 축소: text-[11px]) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            {/* 지역 필터 (전국 17개 광역시도) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none max-w-full">
              <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1 shrink-0">
                <MapPin className="w-3 h-3 text-blue-400" />
                지역:
              </span>
              {LOCATIONS.map((loc) => {
                const isSelected = selectedLocation === loc;
                const count = locationCounts[loc] || 0;
                return (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`text-[11px] px-2 py-0.5 rounded-md transition-all font-medium shrink-0 flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 border border-indigo-500 font-bold"
                        : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <span>{loc}</span>
                    {count > 0 && (
                      <span
                        className={`text-[9px] px-1 py-0.1 rounded-full font-bold ${
                          isSelected
                            ? "bg-indigo-800 text-indigo-100"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 우측 정렬 및 마감임박 필터 토글 */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="dDay">⏱️ 마감 임박순</option>
                <option value="budgetDesc">💰 예산 높은순</option>
                <option value="budgetAsc">💵 예산 낮은순</option>
                <option value="newest">📅 최신 등록순</option>
              </select>

              <button
                onClick={() => setOnlyUrgent(!onlyUrgent)}
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  onlyUrgent
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <Flame className={`w-3 h-3 ${onlyUrgent ? "text-rose-400 fill-rose-400" : "text-slate-500"}`} />
                <span>마감 임박만 ({urgentCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* 결과 요약 라인 (서체 20% 축소: text-[11px]) */}
        <div className="flex items-center justify-between pb-2.5 mb-4 border-b border-slate-800 text-[11px] text-slate-400">
          <div>
            검색 결과 <strong className="text-blue-400 font-bold text-xs">{filteredBids.length}</strong>건
            {selectedCategory !== "전체" && <span className="ml-1 text-slate-500">[{selectedCategory}]</span>}
            {selectedLocation !== "전국" && <span className="ml-1 text-slate-500">[{selectedLocation}]</span>}
            {searchQuery && <span className="ml-1 text-slate-500">(검색어: &quot;{searchQuery}&quot;)</span>}
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>
              {sortBy === "dDay" && "마감 D-Day 순"}
              {sortBy === "budgetDesc" && "예산 높은순"}
              {sortBy === "budgetAsc" && "예산 낮은순"}
              {sortBy === "newest" && "최신 등록순"}
            </span>
          </div>
        </div>

        {/* 공고 카드 목록 */}
        {filteredBids.length === 0 ? (
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-10 text-center my-6 shadow-xl">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">일치하는 입찰 공고가 없습니다</h3>
            <p className="text-[11px] text-slate-400 mb-4">
              선택한 카테고리나 지역, 검색어 조건을 변경하여 다시 확인해보세요.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("전체");
                setSelectedLocation("전국");
                setOnlyUrgent(false);
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-xs font-semibold border border-blue-500/30 transition-colors"
            >
              전체 필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
            {filteredBids.map((bid) => {
              const isUrgent = bid.dDay <= 3 && bid.dDay >= 0;
              const isExpired = bid.dDay < 0;

              return (
                <div
                  key={bid.id}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-md hover:shadow-blue-500/5 flex flex-col justify-between group"
                >
                  <div>
                    {/* 상단 뱃지 영역 (서체 20% 축소: text-[11px]) */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* 카테고리 뱃지 */}
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-400/20">
                          {bid.category}
                        </span>

                        {/* 지역 뱃지 */}
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700/50">
                          <MapPin className="w-2.5 h-2.5 text-slate-400" />
                          {bid.location}
                        </span>

                        {/* 계약 방식 */}
                        <span className="text-[10px] text-slate-400 bg-slate-800/40 px-1.5 py-0.5 rounded border border-slate-700/30 hidden sm:inline-block">
                          {bid.bidType}
                        </span>
                      </div>

                      {/* D-Day 뱃지 */}
                      <div>
                        {isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-rose-500 text-white shadow-sm shadow-rose-500/30 animate-pulse">
                            <Flame className="w-3 h-3 fill-white" />
                            마감임박 D-{bid.dDay}
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            접수마감
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-blue-300 border border-slate-700">
                            <Clock className="w-3 h-3 text-blue-400" />
                            마감 D-{bid.dDay}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 공고 제목 (서체 20% 축소: text-sm sm:text-base font-bold) */}
                    <Link
                      href={`/bids/${bid.id}`}
                      className="block text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-snug mb-2.5"
                    >
                      {bid.title}
                    </Link>

                    {/* AI 요약 하이라이트 박스 (서체 20% 축소: text-[11px]) */}
                    {bid.aiSummary && (
                      <div className="mb-3 bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center gap-1 text-cyan-400 font-semibold text-[10px]">
                          <Bot className="w-3 h-3" />
                          <span>Gemini AI 핵심 요약</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed pl-4">
                          {bid.aiSummary}
                        </p>
                        {bid.aiTips && (
                          <p className="text-slate-400 text-[10px] pl-4 flex items-start gap-1">
                            <span className="text-amber-400 font-bold shrink-0">TIP:</span>
                            <span>{bid.aiTips}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* 주요 메타 정보 (발주처, 배정예산, 마감일시) (서체 20% 축소: text-[11px]) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2.5 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">발주처: <strong className="text-slate-200 font-semibold">{bid.client}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>마감: <strong className="text-rose-400 font-semibold">{bid.endDate ? bid.endDate.substring(0, 16) : "-"}</strong></span>
                      </div>

                      <div className="flex items-center sm:justify-end gap-1 text-xs font-bold text-blue-400">
                        <span className="text-[11px] text-slate-400 font-normal">예산:</span>
                        <span>{bid.budgetText}</span>
                      </div>
                    </div>
                  </div>

                  {/* 하단 액션 버튼들 (서체 20% 축소: text-[11px]) */}
                  <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-slate-800/50">
                    <span className="text-[10px] text-slate-500 font-mono">
                      공고번호: {bid.id}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={getG2BLink(bid.linkUrl, bid.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      >
                        <span>나라장터 원문</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>

                      <Link
                        href={`/bids/${bid.id}`}
                        className="inline-flex items-center gap-0.5 text-[11px] font-bold px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20 transition-colors"
                      >
                        <span>상세 분석</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 푸터 영역 (서체 20% 축소: text-[11px]) */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-[11px] py-6 px-4 text-center mt-12 space-y-1.5">
        <p className="font-semibold text-slate-300">
          옥외광고 입찰정보 알리미 · 조달청 나라장터 공공데이터 & Google Gemini AI 연계
        </p>
        <p className="text-[10px] text-slate-500">
          본 서비스는 옥외광고 사업자를 위한 공공입찰 편의 서비스이며, 실제 입찰 전 반드시 나라장터 공식 공고문 및 과업지시서를 확인하시기 바랍니다.
        </p>
      </footer>
    </div>
  );
}

