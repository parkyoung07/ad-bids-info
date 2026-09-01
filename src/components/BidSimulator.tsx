"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Sparkles,
  Save,
  FileCheck,
  Building,
  Award,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { evaluateQualification, QualificationProfile } from "@/lib/bid-analysis";

interface BidSimulatorProps {
  location: string;
  category: string;
  bidTitle: string;
}

const STORAGE_KEY = "ad_bids_company_profile";

function getSavedBoolean(key: keyof QualificationProfile, defaultValue: boolean): boolean {
  if (typeof window === "undefined") return defaultValue;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed[key] === "boolean") return parsed[key];
    }
  } catch {
    // fallback
  }
  return defaultValue;
}

export default function BidSimulator({
  location,
  category,
  bidTitle,
}: BidSimulatorProps) {
  // 기본 프로필 상태 (로컬 스토리지 lazy 초기화)
  const [hasLicense, setHasLicense] = useState(() => getSavedBoolean("hasLicense", true));
  const [hasDirectProduction, setHasDirectProduction] = useState(() => getSavedBoolean("hasDirectProduction", true));
  const [hasLocationMatch, setHasLocationMatch] = useState(() => getSavedBoolean("hasLocationMatch", true));
  const [hasPastExperience, setHasPastExperience] = useState(() => getSavedBoolean("hasPastExperience", true));
  const [isSaved, setIsSaved] = useState(false);

  const profile: QualificationProfile = useMemo(
    () => ({
      hasLicense,
      hasDirectProduction,
      hasLocationMatch,
      hasPastExperience,
    }),
    [hasLicense, hasDirectProduction, hasLocationMatch, hasPastExperience]
  );

  const evalResult = useMemo(() => {
    return evaluateQualification(profile, location, category);
  }, [profile, location, category]);

  // 프로필 로컬 저장 핸들러
  const handleSaveProfile = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch {
      // safe fallback
    }
  };

  const isNational = location === "전국";
  const isLease = category.includes("매체") || category.includes("임대");

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-emerald-500/30 p-5 sm:p-7 shadow-xl space-y-5 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>📝 입찰 참가자격 원클릭 자가진단표 (적격심사 시뮬레이터)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                실시간 판정
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              사장님의 면허와 보유 서류를 체크하시면, <span className="text-slate-200 font-medium truncate inline-block max-w-[280px] sm:max-w-md align-bottom">[{bidTitle}]</span> 공고에 참여 가능한지 즉시 계산해 드립니다.
            </p>
          </div>
        </div>

        {/* 내 프로필 기억하기 버튼 */}
        <button
          onClick={handleSaveProfile}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-sm"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isSaved ? "저장 완료! ✓" : "내 면허조건 저장"}</span>
        </button>
      </div>

      {/* 실시간 판정 결과 배너 */}
      <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${evalResult.badgeColor}`}>
              {evalResult.statusText}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              적격심사 예상 점수: <strong className="text-white font-bold">{evalResult.score}점</strong> / 100점
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
            {evalResult.summaryAdvice}
          </p>
        </div>

        {/* 점수 게이지 바 */}
        <div className="w-full sm:w-44 shrink-0 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-400">적격 통과율</span>
            <span className={evalResult.score >= 85 ? "text-emerald-400" : evalResult.score >= 70 ? "text-amber-400" : "text-rose-400"}>
              {evalResult.score}%
            </span>
          </div>
          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                evalResult.score >= 85
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : evalResult.score >= 70
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                  : "bg-gradient-to-r from-rose-500 to-red-400"
              }`}
              style={{ width: `${evalResult.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4대 체크리스트 인터랙티브 선택 박스 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. 옥외광고사업 등록증 */}
        <label
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
            hasLicense
              ? "bg-emerald-950/20 border-emerald-500/40 text-slate-200"
              : "bg-slate-950/50 border-slate-800 text-slate-400"
          }`}
        >
          <input
            type="checkbox"
            checked={hasLicense}
            onChange={(e) => setHasLicense(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>옥외광고사업 등록증 보유 (40점)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              관할 지자체 정식 등록 업체 (필수 기본 면허)
            </p>
          </div>
        </label>

        {/* 2. 직접생산확인증명서 */}
        <label
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
            isLease || hasDirectProduction
              ? "bg-emerald-950/20 border-emerald-500/40 text-slate-200"
              : "bg-slate-950/50 border-slate-800 text-slate-400"
          }`}
        >
          <input
            type="checkbox"
            disabled={isLease}
            checked={isLease || hasDirectProduction}
            onChange={(e) => setHasDirectProduction(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer disabled:opacity-50"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isLease ? "직접생산확인 (매체권 면제)" : `직접생산확인증명서 [${category.split("·")[0]}] (30점)`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isLease ? "매체권·임대 공고는 직생 불필요" : "SMPP 공공구매망 발급 유효 증명서"}
            </p>
          </div>
        </label>

        {/* 3. 관내 지역 소재지 일치 */}
        <label
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
            isNational || hasLocationMatch
              ? "bg-emerald-950/20 border-emerald-500/40 text-slate-200"
              : "bg-slate-950/50 border-slate-800 text-slate-400"
          }`}
        >
          <input
            type="checkbox"
            disabled={isNational}
            checked={isNational || hasLocationMatch}
            onChange={(e) => setHasLocationMatch(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer disabled:opacity-50"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {isNational ? "지역 제한 없음 (전국 입찰, 15점)" : `[${location}] 관내 사업장 소재 (15점)`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isNational ? "전국 어디서나 참여 가능" : `사업자등록증상 본점 소재지 (${location})`}
            </p>
          </div>
        </label>

        {/* 4. 최근 3년 유사 시공 실적 */}
        <label
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
            hasPastExperience
              ? "bg-emerald-950/20 border-emerald-500/40 text-slate-200"
              : "bg-slate-950/50 border-slate-800 text-slate-400"
          }`}
        >
          <input
            type="checkbox"
            checked={hasPastExperience}
            onChange={(e) => setHasPastExperience(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>최근 3개년 동종 시공·납품 실적 (15점)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              유사 규모 관공서 또는 민간 시공 완료 실적
            </p>
          </div>
        </label>
      </div>

      {/* 도움말 가이드 */}
      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>[내 면허조건 저장]을 눌러두시면 다른 공고를 보실 때도 자동으로 자격 여부가 진단됩니다.</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setHasLicense(true);
            setHasDirectProduction(true);
            setHasLocationMatch(true);
            setHasPastExperience(true);
          }}
          className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer ml-2"
        >
          <RefreshCw className="w-3 h-3" />
          <span>초기화</span>
        </button>
      </div>
    </div>
  );
}
