import React from "react";
import type { Metadata } from "next";
import bidsData from "../../../public/data/bids.json";
import CalculatorStudioClient from "./CalculatorStudioClient";

export const metadata: Metadata = {
  title: "투찰금액 시뮬레이터 | SignBid AI",
  description:
    "조달청 나라장터 공공입찰 A값 공제식 및 복수예비가격 사정률 기반 예상 투찰금액을 시뮬레이션합니다.",
};

export default function CalculatorPage() {
  const initialBids = (bidsData as unknown as Array<{
    id: string;
    title: string;
    client: string;
    budget: number;
    budgetText: string;
    category: string;
    location: string;
    linkUrl?: string;
  }>) || [];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 상단 안내 */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          예상 투찰금액 시뮬레이터
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          기초금액, 낙찰하한율, A값(국민연금 등 공제액)을 입력하여 예상 사정률별 시뮬레이션 금액을 비교해 보세요.
        </p>
      </div>

      {/* 메인 계산기 클라이언트 */}
      <CalculatorStudioClient initialBids={initialBids} />
    </div>
  );
}
