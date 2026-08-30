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
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  message: string;
  sender: "user" | "admin";
  timestamp: number;
}

export default function AdminChatPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyInput, setReplyInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  // 타임스탬프를 한국어 시간 문자열로 변환
  const formatTime = (ts: number) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // 1. 비밀번호 인증 핸들러
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "admin1234") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
    }
  };

  // 2. 2초 주기 메시지 폴링 (/api/chat-poll)
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/chat-poll", {
          cache: "no-store",
        });
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

  // 스크롤 최하단 이동
  useEffect(() => {
    if (isAuthenticated) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAuthenticated]);

  // 3. 관리자 답장 전송 핸들러 (/api/chat-human)
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyInput.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    const tempId = `temp_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      message: trimmed,
      sender: "admin",
      timestamp: Date.now(),
    };

    // 낙관적 UI 업데이트
    setMessages((prev) => [...prev, newMsg]);
    setReplyInput("");

    try {
      const res = await fetch("/api/chat-human", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          sender: "admin",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send admin message");
      }
    } catch (err) {
      console.error("Failed to send admin reply:", err);
    } finally {
      setIsSending(false);
      replyInputRef.current?.focus();
    }
  };

  // --- 화면 1: 로그인 인증 전 화면 ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto ring-1 ring-indigo-500/40 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              입찰 상담 관리자 로그인
            </h1>
            <p className="text-xs text-slate-400">
              실시간 방문자 상담 및 문의 관리를 위해 비밀번호를 입력해 주세요.
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
                placeholder="비밀번호를 입력하세요"
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
              <span>로그인하여 상담 시작</span>
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

  // --- 화면 2: 관리자 실시간 상담 화면 ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white">
                  입찰 상담 관리 콘솔
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  실시간 연동 중 (2초 폴링)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>최근 동기화: {lastUpdated || "연결 중..."}</span>
                <span className="mx-1">·</span>
                <span>총 메시지: {messages.length}건</span>
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
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 중앙 대화 목록 컨테이너 */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col">
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden h-[calc(100vh-140px)]">
          {/* 채팅 영역 헤더 안내 */}
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

          {/* 말풍선 목록 영역 */}
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
                  {/* 관리자 말풍선 (왼쪽) */}
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

                  {/* 방문자 말풍선 (오른쪽) */}
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

          {/* 하단 관리자 답장 입력 영역 */}
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
      </main>
    </div>
  );
}
