"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BellRing,
  Building2,
  MapPin,
  Clock,
  Search,
  Bot,
  ExternalLink,
  Sparkles,
  Radio,
  Copy,
  Check,
  Send,
  ShieldCheck,
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
  radarStage: number;
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
    const text = `[📋 조달청 나라장터 사전규격 의견서 초안]
- 공고(사전규격)명: ${item.title}
- 발주기관: ${item.client}
- 의견 제출 마감: ${item.opinionEndDate}

■ 의견 제출 제안 내용:
${item.opinionSuggestion || item.aiPreparationTips}

■ AI 사전 수주 전략:
${item.winThemeStrategy || "사전 파트너십 및 세부 면허 요건을 점검하세요."}`.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 상단 타이틀 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-400/30">
            <Radio className="w-3 h-3 text-cyan-400" />
            나라장터 사전규격 조기 포착
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          발주예고 및 사전규격 공개
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          본공고 게시 3~14일 전 사전규격 공개 사업을 조기 확인하고 규격 의견제출 및 사전 준비를 진행하세요.
        </p>
      </div>

      {/* 3대 핵심 요약 지표 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">발주예정 사업 수</span>
          <strong className="text-lg font-bold text-white">{stats.totalCount}건</strong>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">총 예상 사업예산</span>
          <strong className="text-lg font-bold text-blue-400">{stats.totalBudget}</strong>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">의견수렴 진행 중</span>
          <strong className="text-lg font-bold text-cyan-400">{stats.opinionCount}건</strong>
        </div>
      </div>

      {/* 필터 및 검색 바 */}
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

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="사전규격명, 발주처 검색..."
            className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 발주예고 카드 목록 */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-400/30">
                  {item.radarStatus}
                </span>
                <span className="text-xs text-slate-400">{item.category}</span>
                <span className="text-xs text-slate-500 font-mono">{item.location}</span>
              </div>
              <span className="text-xs font-bold text-rose-400">
                의견마감: {item.opinionEndDate} (D-{item.dDay})
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {item.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2 font-medium">
                <span>발주기관: <strong className="text-slate-200">{item.client}</strong></span>
                <span>추정예산: <strong className="text-blue-400 font-bold">{item.budgetText}</strong></span>
                <span>본공고 예상: <strong className="text-cyan-300">{item.expectedBidDate}</strong></span>
              </div>
            </div>

            {/* AI 요약 & 팁 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                  <Bot className="w-3.5 h-3.5" />
                  <span>사전규격 핵심 요약</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {item.aiSpecSummary}
                </p>
              </div>

              <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-3">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>사전 수주 준비 팁</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {item.winThemeStrategy || item.aiPreparationTips}
                </p>
              </div>
            </div>

            {/* 하단 액션 */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                사전규격 등록번호: {item.id}
              </span>

              <div className="flex items-center gap-2">
                {item.opinionSuggestion && (
                  <button
                    onClick={() => handleCopyOpinion(item)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === item.id ? "복사됨" : "의견서 양식 복사"}</span>
                  </button>
                )}

                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1"
                >
                  <span>나라장터 원문 열기</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
