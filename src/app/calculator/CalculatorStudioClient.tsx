"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Calculator,
  ShieldCheck,
  Zap,
  Scale,
  Sliders,
  Copy,
  Check,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Info,
  HelpCircle,
} from "lucide-react";
import { BID_TERMINOLOGY, BidTerminology } from "@/lib/bid-analysis";

interface BidItem {
  id: string;
  title: string;
  client: string;
  budget: number;
  budgetText: string;
  category: string;
  location: string;
  linkUrl?: string;
}

interface CalculatorStudioClientProps {
  initialBids: BidItem[];
}

const LOWER_RATES = [
  { label: "지자체 용역·공사 (87.745%)", rate: 87.745 },
  { label: "조달청 물품제조 (84.245%)", rate: 84.245 },
  { label: "중기간 경쟁제품 (87.995%)", rate: 87.995 },
  { label: "소액수의 계약 (88.000%)", rate: 88.0 },
];

export default function CalculatorStudioClient({
  initialBids,
}: CalculatorStudioClientProps) {
  // 공고 선택 or 직접 입력
  const [selectedBidId, setSelectedBidId] = useState<string>(
    initialBids[0]?.id || "custom"
  );
  const [customTitle, setCustomTitle] = useState("2026년도 옥외 간판 및 LED 전광판 제작설치 사업");
  const [customClient, setCustomClient] = useState("경상북도 김천시청");
  const [basePrice, setBasePrice] = useState<number>(85000000);
  const [isDefaultValue, setIsDefaultValue] = useState<boolean>(true);

  // 계산 파라미터
  const [lowerRate, setLowerRate] = useState<number>(87.745);
  const [hasAValue, setHasAValue] = useState<boolean>(false);
  const [aValue, setAValue] = useState<number>(2950000);
  const [rateAdjustment, setRateAdjustment] = useState<number>(0.0);

  const [copiedType, setCopiedType] = useState<string | null>(null);

  // 공고 변경 시 기초금액 자동 연동
  const handleBidSelect = (bidId: string) => {
    setSelectedBidId(bidId);
    setIsDefaultValue(false);
    if (bidId !== "custom") {
      const found = initialBids.find((b) => b.id === bidId);
      if (found) {
        setBasePrice(found.budget);
        setAValue(Math.round(found.budget * 0.035));
      }
    }
  };

  // 1. 예정가격 산출
  const estimatedPrice = useMemo(() => {
    return Math.round(basePrice * (1 + rateAdjustment / 100));
  }, [basePrice, rateAdjustment]);

  // 2. 투찰금액 계산 공식
  const calculateBidPrice = useCallback(
    (targetRate: number, customEstPrice?: number) => {
      const targetEst = customEstPrice !== undefined ? customEstPrice : estimatedPrice;
      if (hasAValue && aValue > 0) {
        const netBase = Math.max(0, targetEst - aValue);
        return Math.round(netBase * (targetRate / 100) + aValue);
      }
      return Math.round(targetEst * (targetRate / 100));
    },
    [estimatedPrice, hasAValue, aValue]
  );

  // 3대 전략 참고금액 산출
  const conservativeRate = Number((lowerRate + 0.25).toFixed(3));
  const conservativePrice = useMemo(() => calculateBidPrice(conservativeRate), [calculateBidPrice, conservativeRate]);

  const aggressiveRate = Number((lowerRate + 0.08).toFixed(3));
  const aggressivePrice = useMemo(() => calculateBidPrice(aggressiveRate), [calculateBidPrice, aggressiveRate]);

  const medianRate = Number((lowerRate + 0.155).toFixed(3));
  const medianPrice = useMemo(() => calculateBidPrice(medianRate), [calculateBidPrice, medianRate]);

  const floorPrice = useMemo(() => calculateBidPrice(lowerRate), [calculateBidPrice, lowerRate]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ⚠️ 고정 법적 면책 안내 배너 (요구사항 1-7 준수) */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs sm:text-sm">
          <Info className="w-4 h-4 shrink-0" />
          <span>투찰금액 시뮬레이터 이용 유의사항</span>
          {isDefaultValue && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              예시 계산
            </span>
          )}
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          본 계산 결과는 사용자가 입력한 <strong>기초금액, 낙찰하한율, A값 및 예상 사정률을 기반으로 한 참고용 시뮬레이션</strong>입니다.
          실제 예정가격과 적격심사 결과를 보장하지 않습니다. 최종 투찰 전 공고별 세부 산식과 A값 공제 대상 여부를 반드시 확인하시기 바랍니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 파라미터 입력 패널 */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>조건 입력 및 설정</span>
          </div>

          {/* 공고 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              적용 공고 선택
            </label>
            <select
              value={selectedBidId}
              onChange={(e) => handleBidSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer min-h-[42px]"
            >
              <option value="custom">직접 기초금액 입력</option>
              {initialBids.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.category}] {b.title.substring(0, 26)}...
                </option>
              ))}
            </select>
          </div>

          {/* 기초금액 */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
              <span>기초금액 (배정예산)</span>
              <span className="text-blue-400 font-bold">
                {basePrice > 0 ? `₩${basePrice.toLocaleString()}원` : "0원"}
              </span>
            </div>
            <input
              type="number"
              value={basePrice || ""}
              onChange={(e) => {
                setBasePrice(Number(e.target.value) || 0);
                setIsDefaultValue(false);
              }}
              placeholder="예: 85000000"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* 낙찰하한율 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              적용 낙찰하한율
            </label>
            <div className="space-y-1.5">
              {LOWER_RATES.map((item) => (
                <label
                  key={item.rate}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    lowerRate === item.rate
                      ? "bg-blue-950/30 border-blue-500/50 text-white font-semibold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="lowerRate"
                      checked={lowerRate === item.rate}
                      onChange={() => {
                        setLowerRate(item.rate);
                        setIsDefaultValue(false);
                      }}
                      className="text-blue-600 focus:ring-0"
                    />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono text-blue-400 font-bold">{item.rate}%</span>
                </label>
              ))}
            </div>
          </div>

          {/* A값 (국민연금 등 공제항목) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                A값 적용 대상 공고인가요?
              </span>
              <button
                type="button"
                onClick={() => {
                  setHasAValue(!hasAValue);
                  setIsDefaultValue(false);
                }}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  hasAValue ? "bg-blue-600" : "bg-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                    hasAValue ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {hasAValue && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>A값 금액 (국민연금/건강보험 등)</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    ₩{aValue.toLocaleString()}원
                  </span>
                </div>
                <input
                  type="number"
                  value={aValue || ""}
                  onChange={(e) => {
                    setAValue(Number(e.target.value) || 0);
                    setIsDefaultValue(false);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            )}
          </div>

          {/* 예상 사정률 슬라이더 */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
              <span>예상 사정률 변동 (±2.0%)</span>
              <span className={`font-mono font-bold ${rateAdjustment >= 0 ? "text-blue-400" : "text-amber-400"}`}>
                {rateAdjustment >= 0 ? `+${rateAdjustment.toFixed(2)}%` : `${rateAdjustment.toFixed(2)}%`}
              </span>
            </div>
            <input
              type="range"
              min="-2.0"
              max="2.0"
              step="0.05"
              value={rateAdjustment}
              onChange={(e) => {
                setRateAdjustment(Number(e.target.value));
                setIsDefaultValue(false);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* 우측: 시뮬레이션 결과 패널 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>예상 투찰금액 시뮬레이션 결과</span>
              </span>
              <span className="text-xs text-slate-400">
                예정가격(추정): <strong className="text-slate-200">₩{estimatedPrice.toLocaleString()}원</strong>
              </span>
            </div>

            {/* 3가지 전략별 시뮬레이션 카드 */}
            <div className="space-y-3">
              {/* 1. 중위 사정률 기준 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-300">
                      중위 예상 사정률 기준 ({medianRate}%)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">
                      평균 수렴형
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(medianPrice.toString(), "median")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedType === "median" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === "median" ? "복사됨" : "금액 복사"}</span>
                  </button>
                </div>
                <p className="text-xl sm:text-2xl font-black text-white font-mono">
                  ₩{medianPrice.toLocaleString()}원
                </p>
                <p className="text-[11px] text-slate-400">
                  과거 다수 발주처의 평균 낙찰 사정률 대역에 맞춘 시뮬레이션 금액입니다.
                </p>
              </div>

              {/* 2. 안전형 사정률 기준 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      보수적 사정률 기준 ({conservativeRate}%)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      안정 수주형
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(conservativePrice.toString(), "conservative")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedType === "conservative" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === "conservative" ? "복사됨" : "금액 복사"}</span>
                  </button>
                </div>
                <p className="text-lg sm:text-xl font-bold text-slate-200 font-mono">
                  ₩{conservativePrice.toLocaleString()}원
                </p>
                <p className="text-[11px] text-slate-400">
                  적격심사 하한선보다 여유를 두어 탈락 위험을 낮추는 보수적 시뮬레이션 금액입니다.
                </p>
              </div>

              {/* 3. 공격형 사정률 기준 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      하한선 초근접 기준 ({aggressiveRate}%)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      가격경쟁형
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(aggressivePrice.toString(), "aggressive")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedType === "aggressive" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === "aggressive" ? "복사됨" : "금액 복사"}</span>
                  </button>
                </div>
                <p className="text-lg sm:text-xl font-bold text-slate-200 font-mono">
                  ₩{aggressivePrice.toLocaleString()}원
                </p>
                <p className="text-[11px] text-slate-400">
                  낙찰하한율 직상단에 위치하여 가격 경쟁력을 높인 시뮬레이션 금액입니다.
                </p>
              </div>
            </div>

            {/* 법정 절대 하한가 알림 */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                법정 낙찰하한 금액 ({lowerRate}% 기준):
              </span>
              <strong className="text-rose-400 font-mono">
                ₩{floorPrice.toLocaleString()}원
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
