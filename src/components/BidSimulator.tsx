"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  Save,
  Building,
  FileCheck,
  MapPin,
  Award,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  UserCheck,
} from "lucide-react";
import {
  evaluateQualification,
  QualificationProfile,
  QualificationResult,
} from "@/lib/bid-analysis";

interface BidSimulatorProps {
  location: string;
  category: string;
  bidTitle: string;
}

const STORAGE_KEY = "ad_bids_company_profile";

export default function BidSimulator({
  location,
  category,
  bidTitle,
}: BidSimulatorProps) {
  // 사용자가 등록한 회사 정보가 있는지 여부
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasLicense, setHasLicense] = useState(false);
  const [hasDirectProduction, setHasDirectProduction] = useState(false);
  const [hasLocationMatch, setHasLocationMatch] = useState(false);
  const [hasPastExperience, setHasPastExperience] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // 로컬 스토리지에서 프로필 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setIsRegistered(true);
          setHasLicense(!!parsed.hasLicense);
          setHasDirectProduction(!!parsed.hasDirectProduction);
          setHasLocationMatch(!!parsed.hasLocationMatch);
          setHasPastExperience(!!parsed.hasPastExperience);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  const profile: QualificationProfile | null = useMemo(() => {
    if (!isRegistered) return null;
    return {
      isRegisteredUser: true,
      hasLicense,
      hasDirectProduction,
      hasLocationMatch,
      hasPastExperience,
    };
  }, [isRegistered, hasLicense, hasDirectProduction, hasLocationMatch, hasPastExperience]);

  const evalResult: QualificationResult = useMemo(() => {
    return evaluateQualification(profile, location, category);
  }, [profile, location, category]);

  // 프로필 로컬 저장 핸들러
  const handleSaveProfile = () => {
    try {
      const dataToSave = {
        hasLicense,
        hasDirectProduction,
        hasLocationMatch,
        hasPastExperience,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setIsRegistered(true);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch {
      // safe fallback
    }
  };

  const handleResetProfile = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setIsRegistered(false);
      setHasLicense(false);
      setHasDirectProduction(false);
      setHasLocationMatch(false);
      setHasPastExperience(false);
    } catch {
      // fallback
    }
  };

  const isNational = location === "전국";
  const isLease = category.includes("매체") || category.includes("임대");

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-7 shadow-lg space-y-5">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>참가자격 자가진단 (일반적인 점검 예시)</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${evalResult.badgeColor}`}>
                {evalResult.statusText}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              회사의 면허·조건을 입력하여 일반적인 필수 점검항목을 사전에 시뮬레이션합니다.
            </p>
          </div>
        </div>

        {/* 내 프로필 기억하기 버튼 */}
        <div className="flex items-center gap-2">
          {isRegistered && (
            <button
              onClick={handleResetProfile}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          )}

          <button
            onClick={handleSaveProfile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? "저장 완료! ✓" : "내 회사정보 저장"}</span>
          </button>
        </div>
      </div>

      {/* 법적 고지 및 일반 점검 예시 안내 배너 */}
      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-amber-300 font-semibold">일반적인 점검 예시 안내:</strong> 본 자가진단표는 입찰 참가 전 일반적으로 점검해야 할 주요 요건을 사전 체크해보는 <span className="text-slate-200 underline">참고용 예시 시뮬레이터</span>이며 조달청의 공식 자격 심사 결과가 아닙니다. 실제 입찰 참여 전 반드시 조달청 공고문 원문과 과업지시서를 확인하십시오.
        </p>
      </div>

      {/* 판정 결과 배너 (미등록 시 판정 보류 표시) */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          evalResult.isPending
            ? "bg-slate-950 border-slate-800 text-slate-300"
            : evalResult.status === "HIGH"
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
            : evalResult.status === "NEEDS_CONFIRM"
            ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
            : "bg-rose-950/20 border-rose-500/30 text-rose-200"
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${evalResult.badgeColor}`}>
              {evalResult.statusText}
            </span>
            {evalResult.score !== undefined && !evalResult.isPending && (
              <span className="text-xs text-slate-400 font-mono">
                진단 점수: <strong className="text-white font-bold">{evalResult.score}점</strong> / 100점
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed pt-0.5">
            {evalResult.summaryAdvice}
          </p>
        </div>
      </div>

      {/* 4대 체크리스트 인터랙티브 선택 박스 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. 옥외광고사업 등록증 */}
        <label
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
            hasLicense
              ? "bg-blue-950/20 border-blue-500/40 text-slate-200"
              : "bg-slate-950 border-slate-800 text-slate-400"
          }`}
        >
          <input
            type="checkbox"
            checked={hasLicense}
            onChange={(e) => {
              setHasLicense(e.target.checked);
              setIsRegistered(true);
            }}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>옥외광고사업 등록증 보유</span>
            </div>
            <p className="text-[11px] text-slate-400">
              관할 지자체 정식 등록 (필수 기본 면허)
            </p>
          </div>
        </label>

        {/* 2. 직접생산확인증명서 */}
        <label
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
            isLease || hasDirectProduction
              ? "bg-blue-950/20 border-blue-500/40 text-slate-200"
              : "bg-slate-950 border-slate-800 text-slate-400"
          }`}
        >
          <input
            type="checkbox"
            disabled={isLease}
            checked={isLease || hasDirectProduction}
            onChange={(e) => {
              setHasDirectProduction(e.target.checked);
              setIsRegistered(true);
            }}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer disabled:opacity-50"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isLease ? "직접생산확인 (매체권 면제)" : `직접생산확인 [${category.split("·")[0]}]`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isLease ? "매체권·임대 공고는 직생 불필요" : "SMPP 공공구매종합정보망 발급 유효 증명서"}
            </p>
          </div>
        </label>

        {/* 3. 관내 지역 소재지 일치 */}
        <label
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
            isNational || hasLocationMatch
              ? "bg-blue-950/20 border-blue-500/40 text-slate-200"
              : "bg-slate-950 border-slate-800 text-slate-400"
          }`}
        >
          <input
            type="checkbox"
            disabled={isNational}
            checked={isNational || hasLocationMatch}
            onChange={(e) => {
              setHasLocationMatch(e.target.checked);
              setIsRegistered(true);
            }}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer disabled:opacity-50"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {isNational ? "전국 입찰 (지역 제한 없음)" : `[${location}] 관내 사업장 소재`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isNational ? "지역 무관 참여 가능" : `사업자등록증상 본점 소재지 (${location})`}
            </p>
          </div>
        </label>

        {/* 4. 최근 3년 유사 시공 실적 */}
        <label
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
            hasPastExperience
              ? "bg-blue-950/20 border-blue-500/40 text-slate-200"
              : "bg-slate-950 border-slate-800 text-slate-400"
          }`}
        >
          <input
            type="checkbox"
            checked={hasPastExperience}
            onChange={(e) => {
              setHasPastExperience(e.target.checked);
              setIsRegistered(true);
            }}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>최근 3년 동종 시공·납품 실적</span>
            </div>
            <p className="text-[11px] text-slate-400">
              유사 규모 관공서 또는 민간 준공 실적 증명
            </p>
          </div>
        </label>
      </div>

      {/* 고정 안내문 */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {evalResult.legalNotice}
        </p>
      </div>
    </div>
  );
}
