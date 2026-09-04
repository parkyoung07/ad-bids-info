"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  X,
  Calculator,
  Copy,
  Check,
  Building2,
  Banknote,
  Sliders,
  Info,
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
  const [aValue, setAValue] = useState<number>(Math.round((bid.budget || 50000000) * 0.035));
  // 사정률 미세조정 슬라이더 (-2.00% ~ +2.00%)
  const [rateAdjustment, setRateAdjustment] = useState<number>(0.0);

  const [copiedType, setCopiedType] = useState<string | null>(null);

  // 1. 예정가격 산출
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

  // 3대 전략 참고금액
  const conservativeRate = Number((lowerRate + 0.25).toFixed(3));
  const conservativePrice = useMemo(() => calculateBidPrice(conservativeRate), [calculateBidPrice, conservativeRate]);

  const aggressiveRate = Number((lowerRate + 0.08).toFixed(3));
  const aggressivePrice = useMemo(() => calculateBidPrice(aggressiveRate), [calculateBidPrice, aggressiveRate]);

  const medianRate = Number((lowerRate + 0.155).toFixed(3));
  const medianPrice = useMemo(() => calculateBidPrice(medianRate), [calculateBidPrice, medianRate]);

  const floorPrice = useMemo(() => calculateBidPrice(lowerRate), [calculateBidPrice, lowerRate]);

  if (!isOpen) return null;

  const handleCopy = (price: number, typeName: string) => {
    navigator.clipboard.writeText(price.toString());
    setCopiedType(typeName);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* 상단 모달 헤더 */}
        <div className="bg-slate-950 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                예상 투찰금액 시뮬레이터
              </h3>
              <p className="text-xs text-slate-400">
                A값 공제식 및 복수예비가격 사정률 기반 참고금액 계산
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
        <div className="bg-slate-950/80 px-5 sm:px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              발주처: <strong className="text-white">{bid.client}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Banknote className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              추정가격: <strong className="text-blue-300">{bid.budgetText}</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 truncate max-w-xs">
            {bid.title}
          </span>
        </div>

        {/* 메인 설정 및 결과 영역 */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 고정 안내문 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Info className="w-4 h-4" />
              <span>투찰금액 참고 시뮬레이션 안내</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-400">
              본 계산 결과는 사용자가 입력한 기초금액, 낙찰하한율, A값 및 예상 사정률을 기반으로 한 참고용 시뮬레이션입니다. 실제 예정가격과 적격심사 결과를 보장하지 않습니다.
            </p>
          </div>

          {/* 파라미터 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                기초금액
              </label>
              <input
                type="number"
                value={basePrice || ""}
                onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                낙찰하한율
              </label>
              <select
                value={lowerRate}
                onChange={(e) => setLowerRate(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                {LOWER_RATES.map((item) => (
                  <option key={item.rate} value={item.rate}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* A값 */}
            <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAValue}
                  onChange={(e) => setHasAValue(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">A값 (공제액) 적용 공고</span>
              </label>
              {hasAValue && (
                <input
                  type="number"
                  value={aValue || ""}
                  onChange={(e) => setAValue(Number(e.target.value) || 0)}
                  placeholder="A값 금액"
                  className="w-44 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              )}
            </div>
          </div>

          {/* 3대 시뮬레이션 결과 카드 */}
          <div className="space-y-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-300 block mb-1">
                  중위 예상 사정률 기준 ({medianRate}%)
                </span>
                <p className="text-lg sm:text-xl font-bold text-white font-mono">
                  ₩{medianPrice.toLocaleString()}원
                </p>
              </div>
              <button
                onClick={() => handleCopy(medianPrice, "median")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedType === "median" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === "median" ? "복사됨" : "금액 복사"}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  보수적 사정률 기준 ({conservativeRate}%)
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-200 font-mono">
                  ₩{conservativePrice.toLocaleString()}원
                </p>
              </div>
              <button
                onClick={() => handleCopy(conservativePrice, "conservative")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedType === "conservative" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === "conservative" ? "복사됨" : "금액 복사"}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  하한선 근접 기준 ({aggressiveRate}%)
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-200 font-mono">
                  ₩{aggressivePrice.toLocaleString()}원
                </p>
              </div>
              <button
                onClick={() => handleCopy(aggressivePrice, "aggressive")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedType === "aggressive" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === "aggressive" ? "복사됨" : "금액 복사"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="bg-slate-950 px-5 sm:px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            법정 낙찰하한선 ({lowerRate}%): <strong className="text-rose-400">₩{floorPrice.toLocaleString()}원</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
