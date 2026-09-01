"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  X,
  Calculator,
  Copy,
  Check,
  Building2,
  Banknote,
  ShieldCheck,
  Zap,
  Scale,
  Sliders,
  TrendingUp,
} from "lucide-react";

interface BidCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: {
    id: string;
    title: string;
    client: string;
    budget: number;
    budgetText: string;
    category: string;
    location: string;
  };
}

const LOWER_RATES = [
  { label: "지자체 용역·공사 (87.745%)", rate: 87.745 },
  { label: "조달청 물품제조 (84.245%)", rate: 84.245 },
  { label: "중기간 경쟁제품 (87.995%)", rate: 87.995 },
  { label: "소액수의 계약 (88.000%)", rate: 88.0 },
];

export default function BidCalculatorModal({
  isOpen,
  onClose,
  bid,
}: BidCalculatorModalProps) {
  // 기초금액 (기본값: 공고 배정예산)
  const [basePrice, setBasePrice] = useState<number>(bid.budget || 50000000);
  // 낙찰하한율
  const [lowerRate, setLowerRate] = useState<number>(87.745);
  // A값 (국민건강보험, 국민연금 등 공제항목) 적용 여부 및 금액
  const [hasAValue, setHasAValue] = useState<boolean>(false);
  const [aValue, setAValue] = useState<number>(Math.round(bid.budget * 0.035));
  // 사정률 미세조정 슬라이더 (-3.00% ~ +3.00%, 기본값: 0.00%)
  const [rateAdjustment, setRateAdjustment] = useState<number>(0.0);

  const [copiedType, setCopiedType] = useState<string | null>(null);

  // 1. 예정가격 산출 (기초금액 * (100 + 사정률) / 100)
  const estimatedPrice = useMemo(() => {
    return Math.round(basePrice * (1 + rateAdjustment / 100));
  }, [basePrice, rateAdjustment]);

  // 2. 투찰금액 계산 공식
  const calculateBidPrice = useCallback(
    (targetRate: number) => {
      if (hasAValue && aValue > 0) {
        const netBase = Math.max(0, estimatedPrice - aValue);
        return Math.round(netBase * (targetRate / 100) + aValue);
      }
      return Math.round(estimatedPrice * (targetRate / 100));
    },
    [estimatedPrice, hasAValue, aValue]
  );

  // 3대 전략 추천가
  const safeRate = Number((lowerRate + 0.25).toFixed(3));
  const safePrice = useMemo(() => calculateBidPrice(safeRate), [calculateBidPrice, safeRate]);

  const aggressiveRate = Number((lowerRate + 0.08).toFixed(3));
  const aggressivePrice = useMemo(() => calculateBidPrice(aggressiveRate), [calculateBidPrice, aggressiveRate]);

  const goldenRate = Number((lowerRate + 0.155).toFixed(3));
  const goldenPrice = useMemo(() => calculateBidPrice(goldenRate), [calculateBidPrice, goldenRate]);

  const absoluteFloorPrice = useMemo(() => calculateBidPrice(lowerRate), [calculateBidPrice, lowerRate]);

  if (!isOpen) return null;

  const handleCopy = (price: number, typeName: string) => {
    navigator.clipboard.writeText(price.toString());
    setCopiedType(typeName);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* 상단 모달 헤더 */}
        <div className="bg-slate-950 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <Calculator className="w-5 h-5 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  AI 1순위 최적 투찰 금액 정밀 계산기
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  G2B 정밀 공식
                </span>
              </div>
              <p className="text-xs text-slate-400">
                복수예비가격 사정률과 A값(국민연금 등)을 반영하여 1원 단위 최적가를 산출합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 요약 바 */}
        <div className="bg-amber-950/30 px-5 sm:px-6 py-2.5 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              발주처: <strong className="text-white font-bold">{bid.client}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Banknote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              추정가격: <strong className="text-amber-300 font-bold">{bid.budgetText}</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline truncate max-w-xs">
            {bid.title}
          </span>
        </div>

        {/* 메인 설정 및 결과 영역 */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-950/60">
          {/* 1. 입력 설정 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs">
            {/* 기초금액 입력 */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span>💰 기초금액 (공고 확정금액)</span>
                <span className="text-[10px] text-slate-500 font-normal">부가세 포함</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                  원
                </span>
              </div>
            </div>

            {/* 낙찰하한율 선택 */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                🎯 낙찰 하한율 기준
              </label>
              <select
                value={lowerRate}
                onChange={(e) => setLowerRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {LOWER_RATES.map((r) => (
                  <option key={r.rate} value={r.rate}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* A값 (비투찰 공제항목) 토글 */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasAValue}
                    onChange={(e) => setHasAValue(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 bg-slate-950 border-slate-700 cursor-pointer"
                  />
                  <span>A값(국민연금, 건강보험, 노인장기요양, 퇴직공제부금) 적용 공고</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  ※ 공고문에 A값이 고시된 경우 체크
                </span>
              </div>

              {hasAValue && (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-200">
                  <span className="text-slate-400 shrink-0">고시된 A값 합계:</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={aValue}
                      onChange={(e) => setAValue(Number(e.target.value))}
                      placeholder="공고문의 A값 합계 입력"
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                      원
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 사정률 미세조정 슬라이더 */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>예상 사정률(기초금액 대비 ±2~3%) 시뮬레이션:</span>
                </span>
                <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {rateAdjustment >= 0 ? `+${rateAdjustment.toFixed(2)}%` : `${rateAdjustment.toFixed(2)}%`} (사정률 {(100 + rateAdjustment).toFixed(2)}%)
                </span>
              </div>

              <input
                type="range"
                min={-2.0}
                max={2.0}
                step={0.05}
                value={rateAdjustment}
                onChange={(e) => setRateAdjustment(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-2.00% (최저 예가)</span>
                <span>0.00% (기초금액 일치)</span>
                <span>+2.00% (최고 예가)</span>
              </div>
            </div>
          </div>

          {/* 2. 3대 전략 추천 투찰가 결과 카드 그리드 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>AI 빅데이터 전략별 3대 추천 투찰 금액</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* 1) ⚡ 공격형 (1등 정조준) */}
              <div className="bg-slate-900 border border-orange-500/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-orange-400 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" /> 1등 정조준
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      투찰률 {aggressiveRate}%
                    </span>
                  </div>

                  <h5 className="text-sm font-black text-white group-hover:text-orange-300 transition-colors">
                    공격형 1등 도전가
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    경쟁률이 높을 때 하한가 직상단 0.08% 초근접 투찰
                  </p>

                  <div className="pt-2 text-lg sm:text-xl font-mono font-black text-orange-300 tracking-tight">
                    ₩{aggressivePrice.toLocaleString()}원
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(aggressivePrice, "aggressive")}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-orange-500/15 hover:bg-orange-500 text-orange-300 hover:text-slate-950 border border-orange-500/30 transition-all cursor-pointer"
                >
                  {copiedType === "aggressive" ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> 복사 완료!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> 금액 복사
                    </>
                  )}
                </button>
              </div>

              {/* 2) ⚖️ 황금 밸런스 (AI 추천) */}
              <div className="bg-gradient-to-b from-slate-900 to-indigo-950/60 border-2 border-indigo-500 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg">
                  AI 추천 BEST
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      <Scale className="w-2.5 h-2.5" /> 황금 밸런스
                    </span>
                    <span className="text-[11px] font-mono text-indigo-300 font-bold">
                      투찰률 {goldenRate}%
                    </span>
                  </div>

                  <h5 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">
                    황금 밸런스 AI 추천가
                  </h5>
                  <p className="text-[11px] text-slate-300">
                    지자체 3개년 평균 사정률(87.90%) 빅데이터 가중치 적용
                  </p>

                  <div className="pt-2 text-lg sm:text-xl font-mono font-black text-indigo-200 tracking-tight">
                    ₩{goldenPrice.toLocaleString()}원
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(goldenPrice, "golden")}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {copiedType === "golden" ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> 복사 완료!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> 금액 복사
                    </>
                  )}
                </button>
              </div>

              {/* 3) 🛡️ 안전형 (탈락 방지) */}
              <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-emerald-400 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" /> 탈락 방지
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      투찰률 {safeRate}%
                    </span>
                  </div>

                  <h5 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                    안전형 표준 투찰가
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    하한가 미달 탈락 위험을 원천 배제하는 안정적 수주 구간
                  </p>

                  <div className="pt-2 text-lg sm:text-xl font-mono font-black text-emerald-300 tracking-tight">
                    ₩{safePrice.toLocaleString()}원
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(safePrice, "safe")}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 transition-all cursor-pointer"
                >
                  {copiedType === "safe" ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> 복사 완료!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> 금액 복사
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 3. 하한선 경고 & 가이드 */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center justify-between font-mono">
              <span>⚠️ 절대 투찰 하한선 금액:</span>
              <span className="text-red-400 font-bold">
                ₩{absoluteFloorPrice.toLocaleString()}원 미만 시 자동 탈락 (하한율 {lowerRate}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ※ 복사하신 금액을 나라장터(G2B) 투찰서의 &lsquo;투찰금액&rsquo; 란에 그대로 붙여넣기(Ctrl+V) 하시면 됩니다.
            </p>
          </div>
        </div>

        {/* 하단 닫기 */}
        <div className="bg-slate-950 px-5 sm:px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
