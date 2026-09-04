"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  Search,
  Users,
  Percent,
  Banknote,
  AlertCircle,
  Building2,
  HelpCircle,
  X,
  Info,
} from "lucide-react";
import awardData from "../../../public/data/award-results.json";
import { BID_TERMINOLOGY, BidTerminology } from "@/lib/bid-analysis";

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
  isDemo?: boolean;
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

export default function AwardResultsPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "rateAsc" | "budgetDesc">("newest");
  const [selectedTerm, setSelectedTerm] = useState<BidTerminology | null>(null);

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

  const filteredAwards = useMemo(() => {
    return awards
      .filter((item) => {
        const matchCategory =
          selectedCategory === "전체" ||
          item.category.includes(selectedCategory) ||
          selectedCategory.includes(item.category);

        const q = searchQuery.trim().toLowerCase();
        const matchQuery =
          q === "" ||
          item.title.toLowerCase().includes(q) ||
          item.client.toLowerCase().includes(q) ||
          item.winner.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);

        return matchCategory && matchQuery;
      })
      .sort((a, b) => {
        if (sortBy === "rateAsc") return a.rate - b.rate;
        if (sortBy === "budgetDesc") return b.winningBid - a.winningBid;
        return b.openedDate.localeCompare(a.openedDate);
      });
  }, [awards, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            DEMO 예시 · 시뮬레이션 표본 데이터
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          과거 낙찰률 통계 시뮬레이션 (DEMO)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          본 데이터는 사정률 및 투찰 통계 모델 검증을 위한 <strong>DEMO 시뮬레이션 표본</strong>이며, 현재 조달청 공식 개찰 결과 API 실시간 연동을 준비 중입니다.
        </p>
      </div>

      {/* 5대 입찰 용어사전 가이드 바 */}
      <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Info className="w-4 h-4 text-blue-400" />
          <span>입찰 용어 기준 안내:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.keys(BID_TERMINOLOGY).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedTerm(BID_TERMINOLOGY[key])}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <span>{key}</span>
              <HelpCircle className="w-3 h-3 text-slate-500" />
            </button>
          ))}
        </div>
      </div>

      {/* 3대 핵심 요약 지표 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">시뮬레이션 표본 수</span>
          <strong className="text-lg font-bold text-white">{awards.length}건</strong>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">평균 시뮬레이션 낙찰률</span>
          <strong className="text-lg font-bold text-blue-400">{stats.avgRate}%</strong>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">평균 참여업체 수</span>
          <strong className="text-lg font-bold text-emerald-400">{stats.avgBidders}개사</strong>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="공고명, 발주처, 낙찰사 검색..."
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 결과 목록 */}
      <div className="grid grid-cols-1 gap-3">
        {filteredAwards.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-400/20">
                  DEMO 예시
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-300 border border-blue-400/20">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400">{item.location}</span>
                <span className="text-xs text-slate-500 font-mono">{item.id}</span>
              </div>
              <span className="text-xs text-slate-400">
                개찰일시: {item.openedDate}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white">
              {item.title}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">발주기관</span>
                <strong className="text-slate-200">{item.client}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">배정예산</span>
                <strong className="text-slate-200">{item.budgetText}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">낙찰금액 (예시)</span>
                <strong className="text-blue-400 font-bold">{item.winningBidText}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">낙찰률 (참여사)</span>
                <strong className="text-indigo-300 font-bold">{item.rate}% ({item.biddersCount}개사)</strong>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">낙찰사 (예시):</span>
                <strong className="text-white font-semibold">{item.winner}</strong>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                  {item.winnerType}
                </span>
              </div>
              <span className="text-[11px] text-amber-400/80 font-medium">
                DEMO 시뮬레이션 표본
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 용어 도움말 팝업 모달 */}
      {selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3 relative">
            <button
              onClick={() => setSelectedTerm(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Info className="w-4 h-4" />
              <span>{selectedTerm.term}</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="leading-relaxed">
                <strong>정의:</strong> {selectedTerm.definition}
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300">
                <strong>계산식:</strong> {selectedTerm.formula}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong>참고:</strong> {selectedTerm.note}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTerm(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
