"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Target,
  Users,
  Percent,
  Calculator,
  Info,
  HelpCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { getClientBidStats, BID_TERMINOLOGY, BidTerminology } from "@/lib/bid-analysis";

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
  const [selectedTerm, setSelectedTerm] = useState<BidTerminology | null>(null);

  const stats = useMemo(() => {
    return getClientBidStats(clientName, category, budget);
  }, [clientName, category, budget]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-7 shadow-lg space-y-6">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>과거 낙찰 데이터 통계 분석</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                표본: {stats.matchedCount}건
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {clientName} 및 유사 업종의 공식 개찰·낙찰 결과를 바탕으로 산출된 통계입니다.
            </p>
          </div>
        </div>

        {/* 용어 도움말 버튼들 */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-500 mr-1">용어사전:</span>
          {Object.keys(BID_TERMINOLOGY).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedTerm(BID_TERMINOLOGY[key])}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <span>{key}</span>
              <HelpCircle className="w-2.5 h-2.5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* 표본 5건 미만 안전조치 처리 */}
      {stats.isSampleInsufficient ? (
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-3">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-200">
            {stats.sampleInsufficientMessage}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            확인된 개찰 표본이 5건 미만({stats.matchedCount}건)이므로 통계적 신뢰성을 위해 추천 투찰구간을 제공하지 않습니다. 공고문 내 낙찰하한율 기준을 확인하십시오.
          </p>
        </div>
      ) : (
        <>
          {/* 4대 핵심 지표 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. 평균 낙찰률 */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3 text-indigo-400" />
                  평균 낙찰률
                </span>
                <button
                  onClick={() => setSelectedTerm(BID_TERMINOLOGY["낙찰률"])}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              </div>
              <p className="text-base sm:text-lg font-bold text-indigo-300">
                {stats.avgRate.toFixed(3)}%
              </p>
              <span className="text-[10px] text-slate-500">
                최저 {stats.minRate.toFixed(3)}% ~ 최고 {stats.maxRate.toFixed(3)}%
              </span>
            </div>

            {/* 2. 예상 투찰 참고 구간 */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-blue-400" />
                  예상 사정률 밀집구간
                </span>
                <button
                  onClick={() => setSelectedTerm(BID_TERMINOLOGY["사정률"])}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              </div>
              <p className="text-base sm:text-lg font-bold text-blue-300">
                {stats.recommendedLowRate.toFixed(3)}% ~ {stats.recommendedHighRate.toFixed(3)}%
              </p>
              <span className="text-[10px] text-slate-500">과거 낙찰 집중 분포 대역</span>
            </div>

            {/* 3. 예상금액 참고 시뮬레이션 */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-cyan-400" />
                  예상금액 시뮬레이션
                </span>
                <button
                  onClick={() => setSelectedTerm(BID_TERMINOLOGY["투찰률"])}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm sm:text-base font-bold text-white truncate">
                {stats.recommendedLowPrice > 0
                  ? `₩${stats.recommendedLowPrice.toLocaleString()}원`
                  : "공고문 참조"}
              </p>
              <span className="text-[10px] text-slate-500">
                추정가격 × 참고사정률 연산
              </span>
            </div>

            {/* 4. 평균 입찰 참여업체 수 */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                <Users className="w-3 h-3 text-emerald-400" />
                <span>평균 입찰참여 수</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-emerald-300">
                {stats.avgBidders}개사 참여
              </p>
              <span className="text-[10px] text-slate-500">동종 옥외광고 발주 기준</span>
            </div>
          </div>

          {/* 과거 사정률 분포 히스토그램 차트 */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span>과거 낙찰 사정률 분포 (표본 {stats.matchedCount}건)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                합계: {stats.distribution.reduce((acc, d) => acc + d.count, 0)}건
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {stats.distribution.map((dist, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300 flex items-center gap-1.5">
                      <span className="font-mono text-slate-400 text-[11px]">{dist.label}</span>
                      {dist.isHotZone && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.1 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          다빈도 구간
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {dist.percentage}% ({dist.count}건)
                    </span>
                  </div>

                  {/* 진행률 바 */}
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        dist.isHotZone ? "bg-blue-600" : "bg-slate-700"
                      }`}
                      style={{ width: `${Math.max(dist.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

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
