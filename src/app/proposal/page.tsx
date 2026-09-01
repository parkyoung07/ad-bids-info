import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Sparkles, Bot } from "lucide-react";
import bidsData from "../../../public/data/bids.json";
import ProposalStudioClient from "./ProposalStudioClient";

export const metadata: Metadata = {
  title: "AI 입찰 제안서 & 과업기획서 생성기 | 옥외광고 입찰 알리미",
  description:
    "조달청 나라장터 및 지자체 옥외광고, 간판, 사이니지 입찰을 위한 전문 6대 표준 제안서와 발표 슬라이드를 30초 만에 AI로 자동 생성하세요.",
};

export default function ProposalPage() {
  const initialBids = (bidsData as unknown as { bids: Array<{ id: string; title: string; client: string; budget: number; budgetText: string; category: string; location: string; checkList?: { workPeriod?: string; warrantyPeriod?: string; licenseRequired?: string; directProduction?: string; }; linkUrl: string; }> }).bids || [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    옥외광고 입찰 알리미
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-400 animate-pulse" />
                    AI 제안서
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  관공서·지자체 입찰 제안서 & 과업기획서 30초 원클릭 자동 생성
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
                  href="/partners"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🤝 협력사·DB
                </Link>
                <Link
                  href="/proposal"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                >
                  ✨ AI 제안서
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
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>건당 300만 원 제안서 외주비 절감 · 관공서 표준 6대 목차 완벽 지원</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight space-y-1">
            <span>입찰 제안서 & 과업기획서 고민 끝!</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300">
              Gemini AI 원클릭 제안서 스튜디오
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            공고를 선택하거나 프로젝트명을 입력하면, <strong>사업 개요부터 디자인 사양, 시공 안전, 3년 하자보증, 원가 견적표</strong>까지 <br className="hidden sm:inline" />
            관공서 심사위원의 마음을 사로잡는 고품질 제안서 초안과 PPT 발표 요약본을 즉시 작성해 드립니다.
          </p>
        </div>
      </section>

      {/* 메인 제안서 생성 인터랙티브 스튜디오 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <ProposalStudioClient initialBids={initialBids} />
      </main>
    </div>
  );
}
