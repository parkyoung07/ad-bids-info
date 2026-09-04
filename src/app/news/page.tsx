"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Newspaper,
  Sparkles,
  ExternalLink,
  Search,
  TrendingUp,
  Calendar,
  Flame,
  Filter,
  ArrowRight,
  Share2,
  CheckCircle2,
  RefreshCw,
  Building,
  Tag,
  Radio,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  link: string;
  originallink?: string;
  press: string;
  pubDate: string;
  category: string;
  description: string;
}

interface NewsData {
  updatedAt: string;
  totalCount: number;
  isLiveApi: boolean;
  categories: string[];
  articles: NewsItem[];
}

export default function NewsPage() {
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/news.json")
      .then((res) => res.json())
      .then((data: NewsData) => {
        setNewsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load news data:", err);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    return [
      "전체",
      "옥외광고·간판",
      "디지털사이니지",
      "LED전광판",
      "지자체·공공디자인",
      "입찰·정책",
    ];
  }, []);

  const filteredArticles = useMemo(() => {
    if (!newsData || !newsData.articles) return [];
    return newsData.articles.filter((item) => {
      const matchCat =
        selectedCategory === "전체" || item.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.press.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [newsData, selectedCategory, searchQuery]);

  const topNews = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const regularNews =
    filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  const handleShare = (item: NewsItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(item.link || window.location.href);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* 메인 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/60 to-slate-950 border-b border-slate-800 py-10 sm:py-14">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 mb-4 shadow-sm">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                네이버 실시간 뉴스 & 업계 속보
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                옥외광고 · 디지털사이니지 <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  실시간 업계 동향 & 정책 뉴스
                </span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl">
                네이버 포털에서 실시간으로 발행되는 옥외광고, LED 간판, 공공디자인, 지자체 정비사업 뉴스를 엄선하여 가장 빠르게 전달합니다.
              </p>
            </div>

            {/* 검색창 */}
            <div className="w-full md:w-80">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="뉴스 키워드 검색 (예: 사이니지, 간판)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 카테고리 탭 */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    active
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/20"
                      : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60"
                  }`}
                >
                  {cat === "전체" && <Filter className="w-3.5 h-3.5" />}
                  {cat === "옥외광고·간판" && <Building className="w-3.5 h-3.5" />}
                  {cat === "디지털사이니지" && <Sparkles className="w-3.5 h-3.5" />}
                  {cat === "LED전광판" && <Flame className="w-3.5 h-3.5" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
            <p className="text-sm text-slate-400 font-medium">
              네이버 실시간 뉴스를 불러오는 중입니다...
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
            <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">
              검색 조건에 맞는 뉴스가 없습니다
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              다른 검색어를 입력하시거나 카테고리 필터를 변경해 보세요.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("전체");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-xl text-white transition-colors"
            >
              전체 뉴스 보기
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. 오늘의 주요 헤드라인 (Top Breaking News Spotlight) */}
            {topNews && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 p-6 sm:p-8 shadow-xl shadow-black/30 group hover:border-emerald-500/50 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Flame className="w-3.5 h-3.5 text-slate-950 fill-current" />
                        주요 헤드라인
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-emerald-400 border border-emerald-500/20">
                        {topNews.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {topNews.pubDate}
                      </span>
                      <span className="text-xs font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                        📰 {topNews.press}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                      <a
                        href={topNews.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {topNews.title}
                      </a>
                    </h2>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed line-clamp-3">
                      {topNews.description}
                    </p>
                  </div>

                  <div className="flex lg:flex-col items-center gap-3 shrink-0">
                    <a
                      href={topNews.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25 group-hover:scale-105"
                    >
                      <span>네이버 원문 보기</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleShare(topNews)}
                      className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all"
                    >
                      {copiedId === topNews.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">링크 복사됨</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>공유하기</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. 뉴스 카드 그리드 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {regularNews.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 sm:p-6 hover:border-emerald-500/40 hover:bg-slate-900 transition-all duration-200 group shadow-md shadow-black/20"
                >
                  <div className="space-y-3">
                    {/* 카드 헤더 메타정보 */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-emerald-400 border border-emerald-500/20">
                          {item.category}
                        </span>
                        <span className="font-medium text-slate-300">
                          {item.press}
                        </span>
                      </div>
                      <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3" />
                        {item.pubDate.slice(5, 16)}
                      </span>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {item.title}
                      </a>
                    </h3>

                    {/* 요약 내용 */}
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* 카드 푸터 액션 */}
                  <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors group-hover:translate-x-0.5 transform"
                    >
                      <span>기사 원문 읽기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleShare(item)}
                      title="링크 복사"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* 3. 하단 추천 배너 & 키워드 안내 */}
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  실시간 입찰 공고 연계
                </div>
                <h4 className="text-lg font-bold text-white">
                  뉴스 속 주요 프로젝트의 공공입찰 공고가 궁금하신가요?
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  나라장터 실시간 옥외광고, LED 간판, 디지털 사이니지 공고를 바로 확인해 보세요.
                </p>
              </div>
              <Link
                href="/"
                className="shrink-0 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <span>실시간 입찰공고 보러가기</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
