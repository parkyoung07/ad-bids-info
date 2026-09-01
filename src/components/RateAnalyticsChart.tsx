"use client";

import React, { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Target,
  Sparkles,
  Users,
  Percent,
  Calculator,
  Info,
} from "lucide-react";
import { getClientBidStats } from "@/lib/bid-analysis";

interface RateAnalyticsChartProps {
  clientName: string;
  category: string;
  budget: number;
}

export default function RateAnalyticsChart({
  clientName,
  category,
  budget,
}: RateAnalyticsChartProps) {
  const stats = useMemo(() => {
    return getClientBidStats(clientName, category, budget);
  }, [clientName, category, budget]);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-indigo-500/30 p-5 sm:p-7 shadow-xl space-y-6">
      {/* 헤더 타이틀 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>📊 [{clientName}] 과거 낙찰 사정률 통계 & AI 투찰 가이드</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                전기넷·케이비드 모델
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              해당 발주처의 과거 옥외광고 개찰 데이터를 분석하여 낙찰 확률이 가장 높은 황금 투찰 구간을 산출했습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 4대 핵심 지표 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. 평균 낙찰률 */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
            <Percent className="w-3 h-3 text-indigo-400" />
            <span>평균 낙찰률</span>
          </div>
          <p className="text-base sm:text-lg font-black text-indigo-300">
            {stats.avgRate.toFixed(3)}%
          </p>
          <span className="text-[10px] text-slate-500">
            최저 {stats.minRate.toFixed(3)}% ~ 최고 {stats.maxRate.toFixed(3)}%
          </span>
        </div>

        {/* 2. AI 추천 투찰율 (황금 사정률) */}
        <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/40 p-3.5 rounded-xl border border-indigo-500/40">
          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold mb-1">
            <Target className="w-3 h-3 text-amber-400" />
            <span>AI 추천 투찰율</span>
          </div>
          <p className="text-base sm:text-lg font-black text-amber-300">
            {stats.recommendedLowRate.toFixed(3)}% ~ {stats.recommendedHighRate.toFixed(3)}%
          </p>
          <span className="text-[10px] text-slate-400">낙찰 확률 최고 밀집 구간</span>
        </div>

        {/* 3. AI 추천 투찰 예상금액 */}
        <div className="bg-blue-950/30 p-3.5 rounded-xl border border-blue-900/40 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1 text-[11px] text-cyan-300 font-bold mb-1">
            <Calculator className="w-3 h-3 text-cyan-400" />
            <span>AI 추천 투찰가</span>
          </div>
          <p className="text-sm sm:text-base font-black text-white truncate">
            {stats.recommendedLowPrice > 0
              ? `₩${stats.recommendedLowPrice.toLocaleString()}원`
              : "공고문 참조"}
          </p>
          <span className="text-[10px] text-slate-400">
            추정가격 × 권장사정률 기준
          </span>
        </div>

        {/* 4. 평균 경쟁사 수 */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
            <Users className="w-3 h-3 text-emerald-400" />
            <span>평균 경쟁률</span>
          </div>
          <p className="text-base sm:text-lg font-black text-emerald-300">
            {stats.avgBidders}개사 참여
          </p>
          <span className="text-[10px] text-slate-500">동종 옥외광고 입찰 기준</span>
        </div>
      </div>

      {/* 📊 과거 사정률 분포 히스토그램 차트 */}
      <div className="bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>과거 낙찰가 사정률 분포 히스토그램 (참여업체 몰림도)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            총 {stats.matchedCount}건 표본 분석
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {stats.distribution.map((dist, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="font-mono text-slate-400">{dist.label}</span>
                  {dist.isHotZone && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                      🔥 황금 구간 (추천)
                    </span>
                  )}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {dist.percentage}% ({dist.count}건)
                </span>
              </div>

              {/* 진행률 바 */}
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dist.isHotZone
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm shadow-amber-500/40"
                      : "bg-indigo-600/70"
                  }`}
                  style={{ width: `${Math.max(dist.percentage, 5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 💡 AI 발주처 특화 수주 코칭 노트 */}
      <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4 text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>발주처 특성 분석 AI 투찰 조언</span>
        </div>
        <p className="leading-relaxed text-slate-200 text-xs sm:text-sm">
          {stats.aiStrategyNote}
        </p>
        <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
          <Info className="w-3 h-3 text-slate-500" />
          <span>※ 본 권장 투찰율은 과거 낙찰 데이터에 기반한 확률 통계이며, 최종 투찰 금액 결정은 귀사의 원가 및 이윤율을 고려하여 신중히 결정하시기 바랍니다.</span>
        </p>
      </div>
    </div>
  );
}
