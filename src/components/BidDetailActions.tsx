"use client";

import React, { useState } from "react";
import { MessageCircle, ExternalLink, Bell } from "lucide-react";
import SubscribeModal from "@/components/SubscribeModal";

interface BidDetailActionsProps {
  bidTitle: string;
  bidCategory: string;
  linkUrl: string;
}

export default function BidDetailActions({
  bidTitle,
  bidCategory,
  linkUrl,
}: BidDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 border border-amber-300/40 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-slate-950" />
          <span>카톡 마감 1일 전 알림 받기</span>
        </button>

        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105 active:scale-95"
        >
          <span>원문 공고문 바로가기</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <SubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultBidTitle={bidTitle}
        defaultCategory={bidCategory}
      />
    </>
  );
}
