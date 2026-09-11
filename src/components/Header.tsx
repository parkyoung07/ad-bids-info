"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  ChevronDown,
  Menu,
  X,
  Search,
  BarChart3,
  FileCheck,
  Users2,
  BookOpen,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  desc?: string;
  isNew?: boolean;
}

interface NavSection {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "공고 찾기",
    icon: <Search className="w-4 h-4 text-blue-400" />,
    items: [
      { title: "입찰공고", href: "/", desc: "나라장터·공공기관 검증 실시간 공고" },
      { title: "발주예고", href: "/prespec", desc: "사전규격 공개 및 발주 예정 사업" },
      { title: "입찰 캘린더", href: "/calendar", desc: "마감일정 및 주요 현장설명회 일정" },
    ],
  },
  {
    title: "입찰 분석",
    icon: <BarChart3 className="w-4 h-4 text-cyan-400" />,
    items: [
      { title: "참가자격 진단", href: "/spec-xray", desc: "면허·직접생산·지역제한 4단계 분석" },
      { title: "시방서 엑스레이", href: "/spec-xray", desc: "과업지시서 핵심 규격 및 필수서류 추출" },
      { title: "낙찰통계", href: "/results", desc: "과거 개찰 결과 및 사정률 통계" },
      { title: "투찰 계산기", href: "/calculator", desc: "A값 공제식 및 복수예비가격 시뮬레이션" },
    ],
  },
  {
    title: "입찰 준비",
    icon: <FileCheck className="w-4 h-4 text-indigo-400" />,
    items: [
      { title: "관심공고", href: "/#bookmarks", desc: "보관한 공고 및 마감 알림" },
      { title: "입찰서류함", href: "/forms", desc: "지자체 적격심사 및 필수 제출서식" },
      { title: "AI 제안서", href: "/proposal", desc: "과업수행계획서 및 발표자료 초안" },
      { title: "입찰서식", href: "/forms", desc: "옥외광고 표준 입찰 서식 다운로드" },
    ],
  },
  {
    title: "협력사",
    icon: <Users2 className="w-4 h-4 text-emerald-400" />,
    items: [
      { title: "협력사 검색", href: "/partners", desc: "전국 17개 시·도 공공등록 옥외광고 협력사 실시간 검색" },
      { title: "외주·시공 요청", href: "/partners", desc: "스카이·가공·현지시공 협업" },
      { title: "공동수급 파트너", href: "/partners", desc: "지역의무 및 복합면허 파트너" },
    ],
  },
  {
    title: "뉴스 & 트렌드",
    icon: <BookOpen className="w-4 h-4 text-amber-400" />,
    items: [
      { title: "📰 실시간 뉴스", href: "/news", desc: "네이버 뉴스 및 3대 전문지 실시간 속보", isNew: true },
      { title: "💡 옥외광고 트렌드", href: "/blog", desc: "매일 오전/오후 정기 심층 분석 기사" },
      { title: "자격·면허 가이드", href: "/blog", desc: "직접생산확인 및 옥외광고업 등록 안내" },
      { title: "초보자 입찰 안내", href: "/blog", desc: "옥외광고 공공입찰 기초 가이드" },
    ],
  },
];

export default function Header() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (idx: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(idx);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900/98 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 좌측 로고 및 서브타이틀 */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 ring-1 ring-white/15 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  SignBid AI
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-400/30">
                  <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
                  검증 데이터
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                옥외광고 전문 AI 입찰비서
              </span>
            </div>
          </Link>

          {/* PC 드롭다운 네비게이션 (5대 상위 메뉴) */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_SECTIONS.map((section, idx) => {
              const isSectionActive = section.items.some(
                (item) => item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href))
              );

              return (
                <div
                  key={section.title}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      openDropdown === idx || isSectionActive
                        ? "bg-slate-800 text-blue-400"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                    onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
                    aria-expanded={openDropdown === idx}
                  >
                    <span>{section.title}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        openDropdown === idx ? "rotate-180 text-blue-400" : "text-slate-500"
                      }`}
                    />
                  </button>

                  {/* 드롭다운 서브메뉴 */}
                  {openDropdown === idx && (
                    <div className="absolute top-full left-0 w-64 pt-2 z-50">
                      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-1.5 border-b border-slate-800 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          {section.icon}
                          <span>{section.title}</span>
                        </div>
                        <div className="py-1 space-y-0.5">
                          {section.items.map((item) => {
                            const isCurrent = pathname === item.href;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                className={`block px-3 py-2 rounded-lg transition-colors ${
                                  isCurrent
                                    ? "bg-blue-600/20 text-blue-300 font-bold border border-blue-500/30"
                                    : "hover:bg-slate-800/80 text-slate-200"
                                }`}
                              >
                                <div className="text-xs font-semibold flex items-center justify-between">
                                  <span>{item.title}</span>
                                  {item.isNew && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                {item.desc && (
                                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                    {item.desc}
                                  </p>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* 우측 퀵 액션 (뉴스 & 트렌드 / 관심공고 / 맞춤공고) */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/news"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-amber-500/30 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>뉴스 & 트렌드</span>
            </Link>
            <Link
              href="/#bookmarks"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              관심공고
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>맞춤 공고</span>
            </Link>
          </div>

          {/* 모바일 햄버거 메뉴 버튼 (44px 터치 영역) */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href="/news"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-slate-800/90 border border-amber-500/30 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>뉴스 & 트렌드</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none flex items-center justify-center cursor-pointer"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 슬라이드다운 햄버거 메뉴 */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-4 space-y-4">
          {/* 모바일 최상단 퀵 링크 바 */}
          <div className="pb-2">
            <Link
              href="/news"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-center font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>뉴스 & 트렌드 바로가기</span>
            </Link>
          </div>
          <div className="space-y-4">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
                  {section.icon}
                  <span>{section.title}</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {section.items.map((item) => {
                    const isCurrent = pathname === item.href;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs min-h-[40px] ${
                          isCurrent
                            ? "bg-blue-600/20 text-blue-300 font-bold border border-blue-500/30"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div>
                          <span className="font-semibold block">{item.title}</span>
                          {item.desc && (
                            <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2.5 text-center rounded-xl bg-blue-600 text-white font-bold text-xs min-h-[44px] flex items-center justify-center shadow-md"
            >
              맞춤 공고 찾기
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
