import React from "react";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import bidsData from "../../../public/data/bids.json";
import ProposalStudioClient from "./ProposalStudioClient";

export const metadata: Metadata = {
  title: "AI 입찰 제안서 작성 스튜디오 | SignBid AI",
  description:
    "공공입찰 공고 요건과 기업 정보를 기반으로 표준 과업 제안서 초안 작성을 보조하는 AI 스튜디오입니다.",
};

export default function ProposalPage() {
  const initialBids = (bidsData as unknown as { bids: Array<{ id: string; title: string; client: string; budget: number; budgetText: string; category: string; location: string; checkList?: { workPeriod?: string; warrantyPeriod?: string; licenseRequired?: string; directProduction?: string; }; linkUrl: string; }> }).bids || [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-slate-800 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-4xl mx-auto space-y-3 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-950 border border-slate-700 text-slate-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI 입찰 제안서 & 과업기획서 작성 보조 스튜디오</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            공고 맞춤형{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300">
              표준 입찰 제안서 초안 작성
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            공고의 규격 요건과 기업의 증빙 가능한 실적 및 보유 면허를 기반으로 <strong>사업 개요, 시공 및 안전관리, 사후관리 표준 목차 초안</strong>을 체계적으로 구성합니다.
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
