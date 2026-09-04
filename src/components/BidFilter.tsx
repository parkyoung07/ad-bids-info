"use client";

import React, { useState } from "react";
import {
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Building,
  MapPin,
  Calendar,
  Briefcase,
  Layers,
} from "lucide-react";

export interface FilterState {
  category: string;
  location: string;
  deadline: string; // "all" | "d3" | "d7" | "d14"
  contractType: string;
  // 상세 필터
  clientType?: string;
  budgetRange?: string; // "all" | "under50m" | "under100m" | "over100m"
  licenseReq?: string;
  directProdReq?: string;
  jointVenture?: string;
  sourceOrigin?: string;
}

interface BidFilterProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

const CATEGORIES = [
  "전체",
  "간판·조형물",
  "디지털사이니지·전광판",
  "초·중·고·대학교",
  "아파트·승강기광고",
  "온비드 공공매체권",
  "현수막·배너",
  "차량랩핑·특수",
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

const DEADLINES = [
  { label: "마감일 전체", value: "all" },
  { label: "3일 이내 (마감임박)", value: "d3" },
  { label: "7일 이내", value: "d7" },
  { label: "14일 이내", value: "d14" },
];

const CONTRACT_TYPES = [
  "계약유형 전체",
  "제한경쟁",
  "일반경쟁",
  "소액수의",
  "협상에 의한 계약",
  "적격심사",
];

export default function BidFilter({ filters, onChange, onReset }: BidFilterProps) {
  const [showDetailed, setShowDetailed] = useState(false);

  // 활성화된 태그 목록 계산
  const activeTags: { key: keyof FilterState; label: string; value: string }[] = [];

  if (filters.category !== "전체") {
    activeTags.push({ key: "category", label: "업종", value: filters.category });
  }
  if (filters.location !== "전국") {
    activeTags.push({ key: "location", label: "지역", value: filters.location });
  }
  if (filters.deadline !== "all") {
    const dObj = DEADLINES.find((d) => d.value === filters.deadline);
    activeTags.push({ key: "deadline", label: "마감일", value: dObj?.label || filters.deadline });
  }
  if (filters.contractType !== "계약유형 전체") {
    activeTags.push({ key: "contractType", label: "유형", value: filters.contractType });
  }
  if (filters.budgetRange && filters.budgetRange !== "all") {
    const bLabel =
      filters.budgetRange === "under50m"
        ? "5천만원 이하"
        : filters.budgetRange === "under100m"
        ? "1억원 이하"
        : "1억원 이상";
    activeTags.push({ key: "budgetRange", label: "예산", value: bLabel });
  }
  if (filters.sourceOrigin && filters.sourceOrigin !== "all") {
    activeTags.push({ key: "sourceOrigin", label: "출처", value: filters.sourceOrigin });
  }

  const removeTag = (key: keyof FilterState) => {
    if (key === "category") onChange({ ...filters, category: "전체" });
    if (key === "location") onChange({ ...filters, location: "전국" });
    if (key === "deadline") onChange({ ...filters, deadline: "all" });
    if (key === "contractType") onChange({ ...filters, contractType: "계약유형 전체" });
    if (key === "budgetRange") onChange({ ...filters, budgetRange: "all" });
    if (key === "sourceOrigin") onChange({ ...filters, sourceOrigin: "all" });
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg space-y-4">
      {/* 4대 기본 필터 행 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* 1. 업종 필터 */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            업종 분류
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer min-h-[40px]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 2. 지역 필터 (드롭다운으로 정리) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            지역 선택
          </label>
          <select
            value={filters.location}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer min-h-[40px]"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc === "전국" ? "전국 (지역 전체)" : `${loc} 관내`}
              </option>
            ))}
          </select>
        </div>

        {/* 3. 마감일 필터 */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            마감일
          </label>
          <select
            value={filters.deadline}
            onChange={(e) => onChange({ ...filters, deadline: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer min-h-[40px]"
          >
            {DEADLINES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* 4. 계약유형 필터 */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            계약유형
          </label>
          <select
            value={filters.contractType}
            onChange={(e) => onChange({ ...filters, contractType: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer min-h-[40px]"
          >
            {CONTRACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 상세조건 토글 버튼 및 초기화 */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
        <button
          type="button"
          onClick={() => setShowDetailed(!showDetailed)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span>{showDetailed ? "상세조건 접기 ▲" : "상세조건 더보기 ▼"}</span>
        </button>

        {activeTags.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>필터 전체 초기화</span>
          </button>
        )}
      </div>

      {/* 상세 필터 확장 영역 */}
      {showDetailed && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              예산 규모
            </label>
            <select
              value={filters.budgetRange || "all"}
              onChange={(e) => onChange({ ...filters, budgetRange: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">예산 전체</option>
              <option value="under50m">5,000만원 이하 (소액)</option>
              <option value="under100m">1억원 이하</option>
              <option value="over100m">1억원 이상 (대형)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              발주 출처 구분
            </label>
            <select
              value={filters.sourceOrigin || "all"}
              onChange={(e) => onChange({ ...filters, sourceOrigin: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">출처 전체</option>
              <option value="조달청 나라장터">조달청 나라장터 (G2B)</option>
              <option value="온비드">온비드 (공공자산)</option>
              <option value="K-apt 공동주택관리정보시스템">K-apt (아파트)</option>
              <option value="학교장터 S2B">학교장터 (S2B)</option>
            </select>
          </div>
        </div>
      )}

      {/* 선택된 조건 태그 칩 표시 */}
      {activeTags.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-800/60">
          <span className="text-[11px] text-slate-500 font-medium mr-1">선택 조건:</span>
          {activeTags.map((tag) => (
            <span
              key={tag.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600/15 text-blue-300 border border-blue-500/30"
            >
              <span>{tag.value}</span>
              <button
                type="button"
                onClick={() => removeTag(tag.key)}
                className="hover:text-white transition-colors cursor-pointer"
                title={`${tag.value} 필터 해제`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
