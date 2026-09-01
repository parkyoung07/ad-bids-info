"use client";

import React, { useState } from "react";
import { MessageCircle, ExternalLink, Sparkles, Calculator } from "lucide-react";
import SubscribeModal from "@/components/SubscribeModal";
import AiProposalModal from "@/components/AiProposalModal";
import BidCalculatorModal from "@/components/BidCalculatorModal";

interface BidDetailActionsProps {
  bid: {
    id: string;
    title: string;
    client: string;
    budget: number;
    budgetText: string;
    category: string;
    location: string;
    linkUrl: string;
    checkList?: {
      workPeriod?: string;
      warrantyPeriod?: string;
      licenseRequired?: string;
      directProduction?: string;
    };
  };
}

export default function BidDetailActions({ bid }: BidDetailActionsProps) {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
        {/* 1. AI 1순위 최적 투찰가 계산기 버튼 */}
        <button
          onClick={() => setIsCalculatorOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 border border-amber-300/40 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
        >
          <Calculator className="w-4 h-4 font-black" />
          <span>💰 1순위 추천 투찰가 계산기</span>
        </button>

        {/* 2. AI 제안서 초안 생성 버튼 */}
        <button
          onClick={() => setIsProposalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>AI 제안서 초안 생성</span>
        </button>

        {/* 3. 카톡 알림 신청 버튼 */}
        <button
          onClick={() => setIsSubscribeOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-md"
        >
          <MessageCircle className="w-4 h-4 fill-amber-300" />
          <span>카톡 마감 알림</span>
        </button>

        {/* 4. 원문 공고문 바로가기 */}
        <a
          href={bid.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105 active:scale-95"
        >
          <span>원문 공고문</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        defaultBidTitle={bid.title}
        defaultCategory={bid.category}
      />

      <AiProposalModal
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        bid={bid}
      />

      <BidCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        bid={bid}
      />
    </>
  );
}
