"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Building2,
  BookOpen,
  MessageCircle,
  Bot,
  Sparkles,
} from "lucide-react";
import SubscribeModal from "@/components/SubscribeModal";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  const handleOpenChatbot = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-signbid-chatbot"));
    }
  };

  const navItems = [
    {
      label: "입찰공고",
      href: "/",
      icon: FileText,
      isActive: pathname === "/",
    },
    {
      label: "협력사",
      href: "/partners",
      icon: Building2,
      isActive: pathname.startsWith("/partners"),
    },
    {
      label: "입찰뉴스",
      href: "/blog",
      icon: BookOpen,
      isActive: pathname.startsWith("/blog") || pathname.startsWith("/news"),
    },
  ];

  return (
    <>
      {/* 모바일 전용 하단 고정 퀵 내비게이션 바 (lg 이상에서는 헤더 네비게이션이 있으므로 숨김) */}
      <nav
        aria-label="모바일 하단 빠른 메뉴"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] px-2 py-1.5 transition-all"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* 1~3: 메인 페이지 이동 링크 */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[48px] touch-manipulation ${
                  item.isActive
                    ? "text-blue-400 font-bold bg-blue-500/10"
                    : "text-slate-400 hover:text-slate-200 active:bg-slate-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-1 transition-transform ${
                    item.isActive ? "scale-110 text-blue-400" : ""
                  }`}
                />
                <span className="text-[11px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}

          {/* 4: 카톡 알림 신청 모달 트리거 */}
          <button
            type="button"
            onClick={() => setIsSubscribeOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-amber-400 hover:text-amber-300 active:bg-slate-900 transition-all min-h-[48px] touch-manipulation cursor-pointer relative"
          >
            <span className="relative">
              <MessageCircle className="w-5 h-5 mb-1 fill-amber-400/20" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
            </span>
            <span className="text-[11px] font-bold tracking-tight">카톡알림</span>
          </button>

          {/* 5: AI 비서 상담 대화창 트리거 */}
          <button
            type="button"
            onClick={handleOpenChatbot}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-cyan-400 hover:text-cyan-300 active:bg-slate-900 transition-all min-h-[48px] touch-manipulation cursor-pointer"
          >
            <Bot className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-bold tracking-tight">AI비서</span>
          </button>
        </div>
      </nav>

      {/* 카카오톡 맞춤 알림 모달 */}
      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        defaultBidTitle="SignBid 모바일 맞춤 공고 알림"
      />
    </>
  );
}
