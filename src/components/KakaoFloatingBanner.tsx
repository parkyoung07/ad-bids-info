"use client";

import React, { useState } from "react";
import { MessageCircle, Bell, X, Sparkles } from "lucide-react";
import SubscribeModal from "./SubscribeModal";

export default function KakaoFloatingBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <>
      {/* 1. 플로팅 카카오톡 알림 유도 배너 (화면 좌측 하단) */}
      {!isDismissed && (
        <aside 
          aria-label="카카오톡 맞춤 알림 신청"
          className="fixed bottom-20 lg:bottom-5 left-4 z-40 max-w-[340px] sm:max-w-[380px] bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 p-3 sm:p-3.5 rounded-2xl shadow-2xl shadow-amber-500/25 border border-amber-300 ring-2 ring-amber-400/40 animate-fadeIn"
        >
          <div className="flex items-start gap-2.5">
            {/* 카카오 아이콘 */}
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="w-5 h-5 fill-amber-400" />
            </div>

            {/* 안내 텍스트 & 버튼 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-950 text-amber-300">
                  무료 알림톡
                </span>
                <span className="text-xs font-black text-slate-950 truncate">
                  매일 아침 8시 맞춤 공고
                </span>
              </div>
              <p className="text-[11px] text-slate-900 font-medium leading-tight">
                내 지역 옥외광고·간판 입찰만 쏙쏙 카톡으로 무료 수신!
              </p>

              <button
                onClick={() => setIsOpen(true)}
                className="mt-2 w-full py-1.5 px-3 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>지금 카톡 무료 알림 받기</span>
              </button>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-800 hover:text-slate-950 p-0.5 -mt-1 -mr-1 rounded-md hover:bg-amber-300/60 transition-colors cursor-pointer"
              aria-label="배너 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. 전역 신청 모달 팝업 */}
      <SubscribeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultBidTitle="전국 옥외광고 맞춤 알림"
      />
    </>
  );
}
