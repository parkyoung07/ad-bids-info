"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Sparkles,
  Bell,
  CheckCircle2,
  CalendarDays,
  BellRing,
} from "lucide-react";
import bidsData from "../../../public/data/bids.json";
import prespecData from "../../../public/data/prespec-bids.json";
import awardData from "../../../public/data/award-results.json";

interface RawBidItem {
  id: string;
  title: string;
  category: string;
  client: string;
  budget?: number;
  budgetText?: string;
  location?: string;
  endDate?: string;
  dDay?: number;
  linkUrl?: string;
}

interface RawPrespecItem {
  id: string;
  title: string;
  category: string;
  client: string;
  budget?: number;
  budgetText?: string;
  location?: string;
  opinionEndDate?: string;
  linkUrl?: string;
}

interface RawAwardItem {
  id: string;
  title: string;
  category: string;
  client: string;
  budget?: number;
  budgetText?: string;
  winningBid?: number;
  winningBidText?: string;
  location?: string;
  openedDate?: string;
  linkUrl?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  category: string;
  client: string;
  budget: number;
  budgetText: string;
  location: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: "deadline" | "prespec" | "award";
  typeLabel: string;
  linkUrl: string;
  dDay?: number;
}

export default function CalendarPage() {
  // 2026년 8월/9월 기준 캘린더 초기값
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8월 (1-indexed: 8, 9)
  const [selectedDate, setSelectedDate] = useState<string>("2026-08-30");

  // 알림 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subPhone, setSubPhone] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subLocation, setSubLocation] = useState("전국");
  const [subSuccess, setSubSuccess] = useState(false);

  // 입찰공고, 사전규격, 개찰결과를 날짜별 이벤트로 통합
  const allEvents: CalendarEvent[] = useMemo(() => {
    const list: CalendarEvent[] = [];

    // 1. 입찰공고 마감일 (deadline)
    ((bidsData as unknown as RawBidItem[]) || []).forEach((b) => {
      const datePart = (b.endDate || "").split(" ")[0];
      const timePart = (b.endDate || "").split(" ")[1] || "";
      if (datePart) {
        list.push({
          id: b.id,
          title: b.title,
          category: b.category,
          client: b.client,
          budget: b.budget || 0,
          budgetText: b.budgetText || "",
          location: b.location || "전국",
          date: datePart,
          time: timePart,
          type: "deadline",
          typeLabel: "마감",
          linkUrl: b.linkUrl || "https://www.g2b.go.kr",
          dDay: b.dDay,
        });
      }
    });

    // 2. 사전규격 의견마감일 (prespec)
    ((prespecData as unknown as RawPrespecItem[]) || []).forEach((p) => {
      const datePart = (p.opinionEndDate || "").split(" ")[0];
      const timePart = (p.opinionEndDate || "").split(" ")[1] || "";
      if (datePart) {
        list.push({
          id: p.id,
          title: p.title,
          category: p.category,
          client: p.client,
          budget: p.budget || 0,
          budgetText: p.budgetText || "",
          location: p.location || "전국",
          date: datePart,
          time: timePart,
          type: "prespec",
          typeLabel: "사전규격 마감",
          linkUrl: p.linkUrl || "https://www.g2b.go.kr",
        });
      }
    });

    // 3. 개찰 결과일 (award)
    ((awardData as unknown as RawAwardItem[]) || []).forEach((a) => {
      const datePart = (a.openedDate || "").split(" ")[0];
      const timePart = (a.openedDate || "").split(" ")[1] || "";
      if (datePart) {
        list.push({
          id: a.id,
          title: a.title,
          category: a.category,
          client: a.client,
          budget: a.winningBid || a.budget || 0,
          budgetText: a.winningBidText || a.budgetText || "",
          location: a.location || "전국",
          date: datePart,
          time: timePart,
          type: "award",
          typeLabel: "개찰·낙찰",
          linkUrl: a.linkUrl || "https://www.g2b.go.kr",
        });
      }
    });

    return list;
  }, []);

  // 월 변경 핸들러
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 현재 월의 달력 그리드 데이터 생성
  const monthDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0(일) ~ 6(토)
    const totalDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{ dayNumber: number; dateStr: string; isCurrentMonth: boolean }> = [];

    // 이전 달 빈칸
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: 0, dateStr: "", isCurrentMonth: false });
    }

    // 이번 달 날짜들
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // 날짜별 이벤트 매핑
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    allEvents.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [allEvents]);

  // 선택된 날짜의 이벤트 목록
  const selectedDateEvents = useMemo(() => {
    return eventsByDate[selectedDate] || [];
  }, [eventsByDate, selectedDate]);

  // 이번 달 통계
  const monthStats = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    const thisMonthEvents = allEvents.filter((e) => e.date.startsWith(prefix));
    const deadlines = thisMonthEvents.filter((e) => e.type === "deadline").length;
    const prespecs = thisMonthEvents.filter((e) => e.type === "prespec").length;
    const awards = thisMonthEvents.filter((e) => e.type === "award").length;
    const totalB = thisMonthEvents.reduce((acc, cur) => acc + cur.budget, 0);

    const eok = Math.floor(totalB / 100000000);
    const man = Math.floor((totalB % 100000000) / 10000);
    let budgetStr = "";
    if (eok > 0) budgetStr += `${eok}억 `;
    if (man > 0) budgetStr += `${man}만 `;
    budgetStr += "원";

    return {
      totalCount: thisMonthEvents.length,
      deadlines,
      prespecs,
      awards,
      budgetStr: budgetStr.trim() || "0원",
    };
  }, [allEvents, currentYear, currentMonth]);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSubSuccess(false);
      setSubPhone("");
      setSubEmail("");
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-2.5 group shrink-0">
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform shrink-0">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div className="whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    옥외광고 입찰 알리미
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">
                    <CalendarIcon className="w-2.5 h-2.5 text-indigo-400" />
                    입찰 캘린더
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden xl:block">
                  마감일·발주예고·개찰일 한눈에 보는 월간 입찰 달력
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              <nav className="flex items-center gap-1 shrink-0">
                <Link
                  href="/"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  입찰공고
                </Link>
                <Link
                  href="/calendar"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shadow-md shadow-indigo-500/10"
                >
                  📅 캘린더
                </Link>
                <Link
                  href="/prespec"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🔔 발주예고
                </Link>
                <Link
                  href="/results"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
                >
                  🏆 낙찰통계
                </Link>
                <Link
                  href="/calculator"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
                >
                  💰 투찰계산기
                </Link>
                <Link
                  href="/spec-xray"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🔍 시방서 엑스레이
                </Link>
                <Link
                  href="/partners"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🤝 협력사·DB
                </Link>
                <Link
                  href="/proposal"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-purple-300 hover:text-purple-200 hover:bg-slate-800 transition-all border border-purple-500/30 bg-purple-500/10"
                >
                  ✨ AI제안서
                </Link>
                <Link
                  href="/forms"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  📄 입찰서식
                </Link>
                <Link
                  href="/blog"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  트렌드
                </Link>
                <Link
                  href="/news"
                  className="whitespace-nowrap px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold text-emerald-300 hover:text-emerald-200 hover:bg-slate-800 transition-all border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  뉴스
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 & 알림 구독 CTA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-xl">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
            <span>2026년 옥외광고·간판·사이니지·매체권 일정 스마트 캘린더</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            마감일 놓치지 않는 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-300 to-cyan-300">스마트 입찰 캘린더</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            달력 날짜를 클릭하면 해당 일자의 입찰 마감 공고, 사전규격 발주예고, 낙찰 결과가 실시간으로 펼쳐집니다.
          </p>

          {/* 알림 구독 버튼 */}
          <div className="flex justify-center pt-1">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all cursor-pointer transform hover:scale-105"
            >
              <Bell className="w-4 h-4 text-cyan-300 animate-wiggle" />
              <span>내 지역 입찰 마감 카톡/이메일 알림 무료 신청</span>
            </button>
          </div>

          {/* 4대 KPI 요약 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentMonth}월 총 일정</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-indigo-400">{monthStats.totalCount}건</p>
              <p className="text-[10px] text-slate-500">입찰 + 예고 + 개찰</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>마감 예정 공고</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-rose-400">{monthStats.deadlines}건</p>
              <p className="text-[10px] text-slate-500">투찰 마감 임박</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <BellRing className="w-3.5 h-3.5 text-cyan-400" />
                <span>사전규격 예고</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-cyan-300">{monthStats.prespecs}건</p>
              <p className="text-[10px] text-slate-500">본공고 발주 대기</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentMonth}월 사업 규모</span>
              </div>
              <p className="text-base sm:text-xl font-black text-amber-300 truncate">{monthStats.budgetStr}</p>
              <p className="text-[10px] text-slate-500">월간 배정 총액</p>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 캘린더 및 상세 일정 영역 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 월간 달력 그리드 (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          {/* 월 전환 헤더 */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{currentYear}년 {currentMonth}월</span>
              <span className="text-xs font-normal text-slate-400">일정 캘린더</span>
            </h2>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="이전 달"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentYear(2026);
                  setCurrentMonth(8);
                  setSelectedDate("2026-08-30");
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                오늘
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="다음 달"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 범례 안내 */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>마감 공고</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>사전규격 예고</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>개찰·낙찰</span>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-1">
            <div className="text-rose-400">일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div className="text-blue-400">토</div>
          </div>

          {/* 날짜 셀 그리드 */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthDays.map((d, idx) => {
              if (!d.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[64px] sm:min-h-[76px] rounded-xl bg-slate-950/30 border border-transparent opacity-30"
                  />
                );
              }

              const dateEvs = eventsByDate[d.dateStr] || [];
              const isSelected = selectedDate === d.dateStr;
              const isToday = d.dateStr === "2026-08-30";
              const dayOfWeek = (idx % 7);

              const hasDeadline = dateEvs.some((e) => e.type === "deadline");
              const hasPrespec = dateEvs.some((e) => e.type === "prespec");
              const hasAward = dateEvs.some((e) => e.type === "award");

              return (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`min-h-[64px] sm:min-h-[76px] p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                    isSelected
                      ? "bg-indigo-600/25 border-indigo-400 ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/20"
                      : isToday
                      ? "bg-slate-800/90 border-blue-500/70"
                      : "bg-slate-950/70 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        dayOfWeek === 0
                          ? "text-rose-400"
                          : dayOfWeek === 6
                          ? "text-blue-400"
                          : "text-slate-200"
                      }`}
                    >
                      {d.dayNumber}
                    </span>

                    {isToday && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500 text-white font-bold">
                        오늘
                      </span>
                    )}
                  </div>

                  {/* 일정 뱃지 / 점 */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hasDeadline && (
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 shrink-0" title="마감 공고" />
                    )}
                    {hasPrespec && (
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 shrink-0" title="발주 예고" />
                    )}
                    {hasAward && (
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 shrink-0" title="낙찰 결과" />
                    )}

                    {dateEvs.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-semibold ml-auto hidden sm:inline">
                        {dateEvs.length}건
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 우측: 선택한 날짜의 상세 일정 카드 목록 (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-xs text-indigo-400 font-semibold">선택한 일자 일정</span>
                <h3 className="text-base sm:text-lg font-black text-white">{selectedDate}</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                총 {selectedDateEvents.length}건
              </span>
            </div>

            {/* 일정 목록 */}
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-10 text-slate-500 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">선택하신 날짜에 등록된 일정이 없습니다.</p>
                <p className="text-[11px] text-slate-600">달력에서 점 표시가 있는 날짜를 클릭해 보세요.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {selectedDateEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-3.5 transition-all shadow-md flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              ev.type === "deadline"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : ev.type === "prespec"
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {ev.typeLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {ev.category}
                          </span>
                        </div>

                        {ev.time && (
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {ev.time}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                        {ev.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span className="truncate max-w-[140px]">{ev.client}</span>
                        <span className="font-extrabold text-white text-xs">{ev.budgetText}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-end">
                      <a
                        href={ev.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        <span>원문 공고 확인</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 실시간 알림 구독 신청 팝업 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">맞춤 입찰 알림 무료 신청</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {subSuccess ? (
              <div className="py-8 text-center space-y-2 text-emerald-400">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 animate-bounce" />
                <h4 className="text-base font-bold text-white">알림 신청이 완료되었습니다!</h4>
                <p className="text-xs text-slate-400">매일 아침 8시, 놓치지 않게 최신 공고를 보내드립니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribeSubmit} className="space-y-3.5">
                <p className="text-xs text-slate-400">
                  내가 원하는 지역의 옥외광고·간판·사이니지 신규 공고 및 마감 일정을 매일 아침 전송해 드립니다.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">관심 희망 지역</label>
                  <select
                    value={subLocation}
                    onChange={(e) => setSubLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="전국">전국 (전체)</option>
                    <option value="서울">서울특별시</option>
                    <option value="경기">경기도</option>
                    <option value="인천">인천광역시</option>
                    <option value="부산">부산광역시</option>
                    <option value="대구">대구광역시</option>
                    <option value="대전">대전광역시</option>
                    <option value="광주">광주광역시</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">휴대폰 번호 (카카오톡 알림)</label>
                  <input
                    type="tel"
                    required
                    placeholder="010-1234-5678"
                    value={subPhone}
                    onChange={(e) => setSubPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">이메일 주소 (선택)</label>
                  <input
                    type="email"
                    placeholder="example@company.com"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer mt-2"
                >
                  무료 알림 등록하기
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
