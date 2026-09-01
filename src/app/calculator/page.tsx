import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Bot } from "lucide-react";
import bidsData from "../../../public/data/bids.json";
import CalculatorStudioClient from "./CalculatorStudioClient";

export const metadata: Metadata = {
  title: "AI 1순위 최적 투찰가 계산기 & 자격진단 | 옥외광고 입찰 알리미",
  description:
    "조달청 나라장터 공공입찰 A값(국민연금 등)과 복수예비가격 사정률 빅데이터를 반영하여 1등 낙찰 확률이 가장 높은 최적 투찰 금액을 1원 단위로 정밀 계산합니다.",
};

export default function CalculatorPage() {
  const initialBids = (bidsData as unknown as { bids: Array<{ id: string; title: string; client: string; budget: number; budgetText: string; category: string; location: string; checkList?: { workPeriod?: string; warrantyPeriod?: string; licenseRequired?: string; directProduction?: string; }; linkUrl: string; }> }).bids || [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform shrink-0">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 font-black" />
              </div>
              <div className="whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                    옥외광고 입찰 알리미
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    투찰 계산기
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  A값 공제식 & 복수예비가격 사정률 1원 단위 정밀 시뮬레이터
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-1">
              <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <Link
                  href="/"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  입찰공고
                </Link>
                <Link
                  href="/calendar"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-300 hover:text-indigo-200 hover:bg-slate-800 transition-all border border-indigo-500/30 bg-indigo-500/10"
                >
                  📅 캘린더
                </Link>
                <Link
                  href="/prespec"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🔔 발주예고
                </Link>
                <Link
                  href="/results"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
                >
                  🏆 낙찰통계
                </Link>
                <Link
                  href="/calculator"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/25 ring-1 ring-amber-400"
                >
                  💰 투찰계산기
                </Link>
                <Link
                  href="/partners"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🤝 협력사·DB
                </Link>
                <Link
                  href="/proposal"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-300 hover:text-purple-200 hover:bg-slate-800 transition-all border border-purple-500/30 bg-purple-500/10"
                >
                  ✨ AI제안서
                </Link>
                <Link
                  href="/blog"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  트렌드
                </Link>
                <Link
                  href="/news"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-300 hover:text-emerald-200 hover:bg-slate-800 transition-all border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  뉴스
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-xl">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>조달청 국가종합전자조달시스템 표준 산식 완벽 적용 · 1원 단위 최적가 산출</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight space-y-1">
            <span>얼마를 써야 1등을 할까?</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200">
              AI 1순위 최적 투찰 금액 정밀 계산기
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            기초금액과 공고만 선택하면, <strong>A값(국민연금/건강보험 등 공제액)</strong>과 <strong>15개 복수예비가격 사정률(±2~3%)</strong>을 실시간 연산하여 <br className="hidden sm:inline" />
            하한가 탈락 위험을 없애고 1등 낙찰 확률을 극대화하는 <strong>3가지 전략별 맞춤 투찰가</strong>를 즉시 계산해 드립니다.
          </p>
        </div>
      </section>

      {/* 메인 계산기 & 자격진단 인터랙티브 스튜디오 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <CalculatorStudioClient initialBids={initialBids} />
      </main>
    </div>
  );
}
