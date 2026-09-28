"use client";

import React, { useState } from "react";
import { MessageCircle, Sparkles, CheckCircle2 } from "lucide-react";
import SubscribeModal from "./SubscribeModal";

interface BlogKakaoCTAProps {
  title?: string;
  category?: string;
}

export default function BlogKakaoCTA({
  title = "옥외광고 트렌드 및 최신 공고",
  category = "간판·조형물",
}: BlogKakaoCTAProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="my-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-blue-900/20 border border-amber-400/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <MessageCircle className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 mr-1.5">
                카카오톡 무료 알림
              </span>
              <span className="text-xs sm:text-sm font-black text-white">
                매일 아침 8시, 놓치면 안 되는 알짜 공고 브리핑
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed pl-10">
            내 지역의 옥외광고·간판·사이니지 입찰 공고와 마감 리마인더를 카톡으로 무료로 받아보세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] cursor-pointer shrink-0"
        >
          🚀 카톡 무료 알림 신청
        </button>
      </div>

      <SubscribeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultBidTitle={title}
        defaultCategory={category}
      />
    </>
  );
}
