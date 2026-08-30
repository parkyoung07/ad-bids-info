"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Lock,
  ShieldCheck,
  Send,
  Loader2,
  RotateCcw,
  User,
  UserCheck,
  Headphones,
  ArrowLeft,
  MessageSquare,
  Clock,
  Bell,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Building2,
  Download,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import initialSubscribers from "../../../public/data/subscribers.json";

interface ChatMessage {
  id: string;
  message: string;
  sender: "user" | "admin";
  timestamp: number;
}

interface Subscriber {
  id: string;
  phone: string;
  email?: string;
  companyName?: string;
  region: string;
  categories: string[];
  notifyMorning: boolean;
  notifyDeadline: boolean;
  subscribedAt: string;
  targetBid?: string;
  status: string;
}

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "subscribers">("chat");

  // 채팅 상태
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyInput, setReplyInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  // 알림 신청자 상태
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [sendSuccessMsg, setSendSuccessMsg] = useState("");

  const formatTime = (ts: number) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "admin1234") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
    }
  };

  // 1. 메시지 폴링
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/chat-poll", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const incoming = Array.isArray(data)
          ? data
          : Array.isArray(data?.messages)
          ? data.messages
          : [];
        if (incoming) {
          setMessages(incoming);
          setLastUpdated(new Date().toLocaleTimeString("ko-KR"));
        }
      } catch (err) {
        console.error("Admin polling error:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // 2. 알림 신청자 로드
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadSubscribers = async () => {
      try {
        const local = JSON.parse(localStorage.getItem("ad_bids_subscribers") || "[]");
        const combined = [...local, ...(initialSubscribers as Subscriber[])];
        // 중복 제거 (phone 기준)
        const unique = Array.from(new Map(combined.map((item) => [item.phone, item])).values());
        setSubscribers(unique);
      } catch (err) {
        setSubscribers(initialSubscribers as Subscriber[]);
      }
    };

    loadSubscribers();
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAuthenticated, activeTab]);

  // 답장 전송 핸들러
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || isSending) return;

    const textToSend = replyInput.trim();
    setIsSending(true);

    try {
      const res = await fetch("/api/chat-human", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const newAdminMsg: ChatMessage = {
          id: "admin-" + Date.now(),
          message: textToSend,
          sender: "admin",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, newAdminMsg]);
        setReplyInput("");
        setTimeout(() => replyInputRef.current?.focus(), 100);
      }
    } catch (err) {
      console.error("Admin reply send error:", err);
    } finally {
      setIsSending(false);
    }
  };

  // 카카오 알림톡 모의 발송 테스트
  const handleTestSendKakao = (phone: string) => {
    setSendSuccessMsg(`${phone} 번호로 카카오톡 테스트 알림톡이 성공적으로 발송되었습니다!`);
    setTimeout(() => setSendSuccessMsg(""), 4000);
  };

  // --- 로그인 화면 ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 mb-3 shadow-lg shadow-indigo-600/20">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              통합 입찰 관리자 로그인
            </h1>
            <p className="text-xs text-slate-400">
              실시간 방문자 상담 및 카카오톡 알림 신청자 관리를 위해 비밀번호를 입력해 주세요.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                관리자 비밀번호
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError("");
                }}
                placeholder="비밀번호를 입력하세요 (기본: admin1234)"
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
              {authError && (
                <p className="text-xs text-rose-400 mt-2 font-medium">
                  ⚠️ {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>로그인하여 관리 시작</span>
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800/80">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>메인 홈페이지로 돌아가기</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- 관리자 메인 콘솔 ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white">
                  옥외광고 알리미 관리자 콘솔
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  실시간 가동 중
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                상담 문의 {messages.length}건 · 알림 구독자 {subscribers.length}명
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">사이트 바로가기</span>
            </Link>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-3">
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "chat"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>💬 1:1 실시간 고객 상담 ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("subscribers")}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "subscribers"
                ? "border-amber-500 text-amber-400 bg-amber-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>📱 카톡·이메일 알림 신청자 DB ({subscribers.length})</span>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 flex flex-col">
        {sendSuccessMsg && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{sendSuccessMsg}</span>
          </div>
        )}

        {/* 탭 1: 실시간 채팅 관리 */}
        {activeTab === "chat" && (
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden h-[calc(100vh-190px)]">
            <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>방문자 문의 실시간 대화창</span>
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                  <span>방문자 (오른쪽)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600 inline-block" />
                  <span>관리자 답변 (왼쪽)</span>
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/40">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
                  <MessageSquare className="w-10 h-10 stroke-[1.5] text-slate-600" />
                  <p className="text-sm font-medium">아직 접수된 문의 메시지가 없습니다.</p>
                  <p className="text-xs text-slate-600">
                    방문자가 사이트 챗봇에서 담당자 문의를 보내면 이곳에 즉시 나타납니다.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "admin" && (
                      <div className="max-w-[78%] flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 shadow-sm">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-400 font-semibold mb-1 ml-0.5">
                            관리자 (답변)
                          </div>
                          <div className="bg-slate-800 text-slate-100 border border-slate-700/80 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-line break-words">
                            {msg.message}
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 ml-1 inline-block">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    )}

                    {msg.sender === "user" && (
                      <div className="max-w-[78%] flex flex-col items-end">
                        <div className="text-[11px] text-indigo-300 font-semibold mb-1 mr-0.5 flex items-center gap-1">
                          <span>방문자 문의</span>
                          <User className="w-3 h-3 text-indigo-400" />
                        </div>
                        <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-md whitespace-pre-line break-words">
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 mr-1 inline-block">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-slate-950 p-3 sm:p-4 border-t border-slate-800 shrink-0">
              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                <input
                  ref={replyInputRef}
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="방문자에게 보낼 답장 메시지를 입력하세요..."
                  disabled={isSending}
                  className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 transition-all"
                />
                <button
                  type="submit"
                  disabled={!replyInput.trim() || isSending}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white px-4 sm:px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/25 shrink-0 cursor-pointer"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>답장 전송</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 탭 2: 카카오톡 알림 신청자 DB 관리 */}
        {activeTab === "subscribers" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>카카오톡 & 이메일 맞춤 알림 신청자 명단</span>
                </h3>
                <p className="text-xs text-slate-400">
                  매일 아침 8시 자동 발송 대상자 목록입니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-400/30 rounded-lg">
                  총 {subscribers.length}명 등록됨
                </span>
              </div>
            </div>

            {/* 신청자 카드 목록 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">휴대폰 (알림톡)</th>
                    <th className="p-3">상호 / 회사명</th>
                    <th className="p-3">희망 지역</th>
                    <th className="p-3">관심 업종</th>
                    <th className="p-3">신청 일시</th>
                    <th className="p-3 text-right">테스트 발송</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{sub.phone}</span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {sub.companyName || <span className="text-slate-600">-</span>}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-400/20 rounded font-semibold">
                          {sub.region}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {(sub.categories || []).map((cat) => (
                            <span key={cat} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString("ko-KR") : "-"}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleTestSendKakao(sub.phone)}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 rounded text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>알림톡 테스트</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
