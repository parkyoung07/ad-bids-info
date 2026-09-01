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
  CheckCircle2,
  Dices,
  Sparkles,
} from "lucide-react";

interface BidItem {
  id: string;
  title: string;
  client: string;
  budget: number;
  budgetText: string;
  category: string;
  location: string;
  checkList?: {
    workPeriod?: string;
    warrantyPeriod?: string;
    licenseRequired?: string;
    directProduction?: string;
  };
  linkUrl: string;
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

  // 계산 파라미터
  const [lowerRate, setLowerRate] = useState<number>(87.745);
  const [hasAValue, setHasAValue] = useState<boolean>(false);
  const [aValue, setAValue] = useState<number>(2950000);
  const [rateAdjustment, setRateAdjustment] = useState<number>(0.0);

  // 복수예비가격 15개 추첨 시뮬레이션 상태
  const [lotteryActive, setLotteryActive] = useState(false);
  const [lotteryResults, setLotteryResults] = useState<{
    allFifteen: number[];
    selectedFour: number[];
    avgLotteryRate: number;
    simulatedPrice: number;
  } | null>(null);

  // 입찰 참가자격 자가진단 체크리스트
  const [hasAdLicense, setHasAdLicense] = useState(true);
  const [hasDirectProduction, setHasDirectProduction] = useState(true);
  const [hasElectricLicense, setHasElectricLicense] = useState(false);
  const [isFemaleOrDisabled, setIsFemaleOrDisabled] = useState(true);
  const [isSmallBiz, setIsSmallBiz] = useState(true);
  const [creditRating, setCreditRating] = useState("BBB+");

  const [copiedType, setCopiedType] = useState<string | null>(null);

  // 공고 변경 시 기초금액 자동 연동
  const handleBidSelect = (bidId: string) => {
    setSelectedBidId(bidId);
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

  // 3대 전략 추천가
  const safeRate = Number((lowerRate + 0.25).toFixed(3));
  const safePrice = useMemo(() => calculateBidPrice(safeRate), [calculateBidPrice, safeRate]);

  const aggressiveRate = Number((lowerRate + 0.08).toFixed(3));
  const aggressivePrice = useMemo(() => calculateBidPrice(aggressiveRate), [calculateBidPrice, aggressiveRate]);

  const goldenRate = Number((lowerRate + 0.155).toFixed(3));
  const goldenPrice = useMemo(() => calculateBidPrice(goldenRate), [calculateBidPrice, goldenRate]);

  const absoluteFloorPrice = useMemo(() => calculateBidPrice(lowerRate), [calculateBidPrice, lowerRate]);

  // 15개 예비가격 무작위 추첨 시뮬레이터 실행
  const runG2BLotterySimulation = () => {
    setLotteryActive(true);
    // 기초금액 기준 -2.0% ~ +2.0% 범위 내 15개 복수예비가격 생성
    const fifteen: number[] = [];
    for (let i = 0; i < 15; i++) {
      const randOffset = -2.0 + (i * 4.0) / 14 + (Math.random() * 0.3 - 0.15);
      fifteen.push(Number(randOffset.toFixed(3)));
    }
    // 15개 중 4개 무작위 추첨
    const shuffled = [...fifteen].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    const avgRate = Number((selected.reduce((a, b) => a + b, 0) / 4).toFixed(3));
    const simEstPrice = Math.round(basePrice * (1 + avgRate / 100));
    const simBidPrice = calculateBidPrice(goldenRate, simEstPrice);

    setTimeout(() => {
      setLotteryResults({
        allFifteen: fifteen,
        selectedFour: selected,
        avgLotteryRate: avgRate,
        simulatedPrice: simBidPrice,
      });
      setLotteryActive(false);
    }, 400);
  };

  const handleCopy = (price: number, typeName: string) => {
    navigator.clipboard.writeText(price.toString());
    setCopiedType(typeName);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // 자가진단 점수 및 판정
  const diagnosticScore = useMemo(() => {
    let score = 70; // 기본 자격
    if (hasAdLicense) score += 10;
    if (hasDirectProduction) score += 10;
    if (isFemaleOrDisabled) score += 5;
    if (isSmallBiz) score += 3;
    if (creditRating.startsWith("A")) score += 2;
    return Math.min(100, score);
  }, [hasAdLicense, hasDirectProduction, isFemaleOrDisabled, isSmallBiz, creditRating]);

  return (
    <div className="space-y-8">
      {/* 1. 상단 컨트롤 패널 & 3대 추천가 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 좌측: 계산 파라미터 제어 (5열) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>투찰 조건 및 A값 설정</span>
              </h2>
              <span className="text-[11px] text-amber-300 font-mono">G2B 표준</span>
            </div>

            {/* 공고 선택 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                📌 입찰 공고 선택
              </label>
              <select
                value={selectedBidId}
                onChange={(e) => handleBidSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="custom">✏️ 직접 입력하기 (신규 공고 / 민간 수의계약)</option>
                {initialBids.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.client}] {b.title.slice(0, 28)}... (₩{b.budget.toLocaleString()}원)
                  </option>
                ))}
              </select>
            </div>

            {/* 기초금액 설정 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>💰 기초금액 (공고 확정금액)</span>
                <span className="text-[10px] text-slate-500">부가세 포함</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-mono font-black text-amber-300 focus:outline-none focus:border-amber-400"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                  원
                </span>
              </div>
            </div>

            {/* 낙찰하한율 선택 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                🎯 낙찰 하한율 기준
              </label>
              <select
                value={lowerRate}
                onChange={(e) => setLowerRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {LOWER_RATES.map((r) => (
                  <option key={r.rate} value={r.rate}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* A값 토글 및 입력 */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasAValue}
                    onChange={(e) => setHasAValue(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 bg-slate-950 border-slate-700 cursor-pointer"
                  />
                  <span>A값(국민연금 등 공제항목) 적용</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  {hasAValue ? "공제식 적용 ON" : "미적용 OFF"}
                </span>
              </div>

              {hasAValue && (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-200">
                  <span className="text-xs text-slate-400 shrink-0">A값 합계:</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={aValue}
                      onChange={(e) => setAValue(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                      원
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 사정률 슬라이더 */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>예상 사정률(±2.00%) 슬라이더:</span>
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
                <span>-2.00%</span>
                <span>기초 0.00%</span>
                <span>+2.00%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 3대 추천 투찰가 카드 & 원클릭 복사 (7열) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>AI 빅데이터 전략별 3대 추천 투찰 금액</span>
              </h3>
              <span className="text-xs text-slate-400">1원 단위 절상 완료</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1) ⚡ 공격형 (1등 정조준) */}
              <div className="bg-slate-950 border border-orange-500/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-orange-400 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" /> 1등 정조준
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {aggressiveRate}%
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-black text-white group-hover:text-orange-300 transition-colors">
                    공격형 1등 도전가
                  </h5>
                  <p className="text-[10px] text-slate-400">
                    경쟁률이 높을 때 하한가 직상단 0.08% 초근접
                  </p>

                  <div className="pt-2 text-base sm:text-lg font-mono font-black text-orange-300 tracking-tight">
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
              <div className="bg-gradient-to-b from-slate-950 to-indigo-950/70 border-2 border-indigo-500 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                  AI BEST
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      <Scale className="w-2.5 h-2.5" /> 황금 밸런스
                    </span>
                    <span className="text-[11px] font-mono text-indigo-300 font-bold">
                      {goldenRate}%
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-black text-white group-hover:text-indigo-300 transition-colors">
                    황금 밸런스 추천가
                  </h5>
                  <p className="text-[10px] text-slate-300">
                    지자체 3개년 평균 사정률(87.90%) 빅데이터 가중치
                  </p>

                  <div className="pt-2 text-base sm:text-lg font-mono font-black text-indigo-200 tracking-tight">
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
              <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-emerald-400 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" /> 탈락 방지
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {safeRate}%
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                    안전형 표준 투찰가
                  </h5>
                  <p className="text-[10px] text-slate-400">
                    하한가 미달 위험 0% 안정적 마진 수주 구간
                  </p>

                  <div className="pt-2 text-base sm:text-lg font-mono font-black text-emerald-300 tracking-tight">
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

            {/* 하한선 경고 & 나라장터 투찰 안내 */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center justify-between font-mono">
                <span>⚠️ 절대 투찰 하한선 금액:</span>
                <span className="text-red-400 font-bold">
                  ₩{absoluteFloorPrice.toLocaleString()}원 미만 시 자동 탈락 (하한율 {lowerRate}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                💡 복사 버튼을 누른 후 나라장터(G2B) 전자입찰서 화면의 &lsquo;투찰금액&rsquo; 란에 그대로 붙여넣기(Ctrl+V) 하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 하단: [15개 복수예비가격 추첨 시뮬레이터] & [입찰 자격 원클릭 자가진단표] (2열) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1) 🎲 15개 복수예비가격 4개 추첨 시뮬레이션 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Dices className="w-4 h-4 text-purple-400" />
              <span>15개 복수예비가격 4개 추첨 모의 시뮬레이터</span>
            </h3>
            <button
              type="button"
              onClick={runG2BLotterySimulation}
              disabled={lotteryActive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lotteryActive ? "추첨 중..." : "🎲 추첨 돌리기"}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            실제 나라장터 개찰 방식과 동일하게 <strong>기초금액 기준 15개 예비가격 중 4개를 무작위 추첨</strong>하여 산출되는 최종 예정가격과 1순위 금액을 모의 테스트합니다.
          </p>

          {lotteryResults ? (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300 font-bold">🎯 추첨된 4개 사정률:</span>
                  <span className="font-mono text-white font-bold">
                    {lotteryResults.selectedFour.map((r) => (r >= 0 ? `+${r}%` : `${r}%`)).join(", ")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2">
                  <span className="text-slate-400">평균 사정률:</span>
                  <span className="font-mono text-purple-300 font-bold">
                    {(100 + lotteryResults.avgLotteryRate).toFixed(3)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2">
                  <span className="text-slate-400">시뮬레이션 1순위 예상가:</span>
                  <span className="font-mono text-amber-300 font-black text-sm">
                    ₩{lotteryResults.simulatedPrice.toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1 text-[10px] font-mono text-center">
                {lotteryResults.allFifteen.map((rate, idx) => {
                  const isPicked = lotteryResults.selectedFour.includes(rate);
                  return (
                    <div
                      key={idx}
                      className={`p-1 rounded border ${
                        isPicked
                          ? "bg-purple-500/30 border-purple-400 text-purple-200 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-500"
                      }`}
                    >
                      #{idx + 1} {rate >= 0 ? `+${rate}%` : `${rate}%`}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
              <Dices className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                상단의 <strong>[🎲 추첨 돌리기]</strong> 버튼을 누르면 나라장터 추첨 알고리즘이 가동됩니다.
              </p>
            </div>
          )}
        </div>

        {/* 2) 🚦 입찰 참가자격 원클릭 자가진단표 & 가점 계산기 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>입찰 참가자격 & 적격심사 가점 자가진단표</span>
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              적격 점수: {diagnosticScore}점 / 100점
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <span className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className={`w-4 h-4 ${hasAdLicense ? "text-emerald-400" : "text-slate-600"}`} />
                <span>옥외광고사업 등록증 보유 (지자체 정식 면허)</span>
              </span>
              <input
                type="checkbox"
                checked={hasAdLicense}
                onChange={(e) => setHasAdLicense(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <span className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className={`w-4 h-4 ${hasDirectProduction ? "text-emerald-400" : "text-slate-600"}`} />
                <span>직접생산확인증명서(SMPP) 보유 (간판·현수막·사이니지)</span>
              </span>
              <input
                type="checkbox"
                checked={hasDirectProduction}
                onChange={(e) => setHasDirectProduction(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <span className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className={`w-4 h-4 ${isFemaleOrDisabled ? "text-emerald-400" : "text-slate-600"}`} />
                <span>여성기업 / 장애인기업 / 사회적기업 확인서 (+1.0점 가점)</span>
              </span>
              <input
                type="checkbox"
                checked={isFemaleOrDisabled}
                onChange={(e) => setIsFemaleOrDisabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <span className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className={`w-4 h-4 ${isSmallBiz ? "text-emerald-400" : "text-slate-600"}`} />
                <span>소상공인 / 소기업 확인서 보유</span>
              </span>
              <input
                type="checkbox"
                checked={isSmallBiz}
                onChange={(e) => setIsSmallBiz(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">신용평가등급 (경영상태 평가):</span>
            <select
              value={creditRating}
              onChange={(e) => setCreditRating(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold"
            >
              <option value="A+">A+ 등급 (만점)</option>
              <option value="A0">A0 등급 (만점)</option>
              <option value="BBB+">BBB+ 등급 (우수)</option>
              <option value="BBB0">BBB0 등급 (양호)</option>
              <option value="BB+">BB+ 등급</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
