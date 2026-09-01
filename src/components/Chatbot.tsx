"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  RotateCcw,
  ChevronDown,
  Send,
  Loader2,
  Headphones,
  Bot,
  UserCheck,
} from "lucide-react";
import chatData from "../../public/data/chat-data.json";

interface Message {
  id: string;
  sender: "user" | "bot" | "admin";
  text: string;
  time: string;
}

interface AdminRawMessage {
  id?: string;
  sender?: string;
  text?: string;
  message?: string;
  timestamp?: string;
}

const createMsgId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome-msg",
      sender: "bot",
      text: chatData.welcomeMessage,
      time: "오전 09:00",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHumanMode, setIsHumanMode] = useState(false); // 상담원 대기 모드 여부
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // 메시지 추가 시 스크롤 자동 이동
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // 창 열릴 때 인풋 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // 2초마다 /api/chat-poll로 GET 요청해서 sender: "admin" 새 메시지 확인
  useEffect(() => {
    if (!isHumanMode || !isOpen) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/chat-poll", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();
        const incomingMessages = Array.isArray(data)
          ? data
          : Array.isArray(data?.messages)
            ? data.messages
            : [];

        if (incomingMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newAdminMsgs = (incomingMessages as AdminRawMessage[])
              .filter(
                (m) =>
                  m &&
                  m.sender === "admin" &&
                  !existingIds.has(m.id || `admin-${m.text}-${m.timestamp}`)
              )
              .map((m, idx) => ({
                id: m.id || `admin-${m.timestamp || idx}-${idx}`,
                sender: "admin" as const,
                text: m.text || m.message || "",
                time: m.timestamp
                  ? new Date(m.timestamp).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : getCurrentTime(),
              }));

            if (newAdminMsgs.length === 0) return prev;
            return [...prev, ...newAdminMsgs];
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isHumanMode, isOpen]);

  // 대화 초기화
  const handleReset = () => {
    setIsTyping(false);
    setInputValue("");
    setIsHumanMode(false);
    setMessages([
      {
        id: createMsgId("welcome"),
        sender: "bot",
        text: chatData.welcomeMessage,
        time: getCurrentTime(),
      },
    ]);
  };

  // 상담원 대기 모드 전환
  const handleSwitchToHuman = () => {
    setIsHumanMode(true);
    setMessages((prev) => [
      ...prev,
      {
        id: createMsgId("human-mode"),
        sender: "bot",
        text: "👨‍💼 **입찰 담당자(상담원) 문의 모드**로 전환되었습니다.\n궁금하신 입찰 건이나 요구사항을 입력해 주시면 담당자가 실시간으로 확인 후 답변해 드립니다.",
        time: getCurrentTime(),
      },
    ]);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  };

  // AI 모드로 복귀
  const handleSwitchToAi = () => {
    setIsHumanMode(false);
    setMessages((prev) => [
      ...prev,
      {
        id: createMsgId("ai-mode"),
        sender: "bot",
        text: "🤖 **AI 입찰 도우미 모드**로 전환되었습니다. 무엇이든 질문해 주세요!",
        time: getCurrentTime(),
      },
    ]);
  };

  // 1. 고정 FAQ 질문 클릭 핸들러 (chat-data.json 즉시 답변)
  const handleQuestionClick = (question: string, answer: string) => {
    if (isTyping) return;

    const userTime = getCurrentTime();
    const newMessages: Message[] = [
      ...messages,
      {
        id: createMsgId("user"),
        sender: "user",
        text: question,
        time: userTime,
      },
    ];

    setMessages(newMessages);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: createMsgId("bot"),
          sender: "bot",
          text: answer,
          time: getCurrentTime(),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  // 2. 메시지 전송 핸들러 (AI 모드 또는 상담원 대기 모드)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    const userTime = getCurrentTime();
    const userMsg: Message = {
      id: createMsgId("user"),
      sender: "user",
      text: trimmed,
      time: userTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // A. 상담원 대기 모드인 경우 -> /api/chat-human POST 호출
    if (isHumanMode) {
      try {
        await fetch("/api/chat-human", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmed,
            sender: "user",
            time: userTime,
          }),
        });
      } catch (err) {
        console.error("Chat human error:", err);
      }
      return;
    }

    // B. AI 챗봇 모드인 경우 -> /api/chat POST 호출
    setIsTyping(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.response || "답변을 불러오지 못했습니다.";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botReply,
          time: getCurrentTime(),
        },
      ]);
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "죄송합니다. AI 응답 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* 1. 플로팅 챗봇 버튼 */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-medium px-3.5 py-2 rounded-full shadow-xl border border-indigo-500/30 animate-bounce">
            <span className="text-sm">🤖</span>
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent font-semibold">
              AI 입찰 도우미
            </span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "채팅창 닫기" : "AI 입찰 도우미 챗봇 열기"}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
            isOpen
              ? "bg-slate-800 hover:bg-slate-700 rotate-90"
              : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-110 ring-4 ring-indigo-500/20"
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-slate-300" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot className="w-7 h-7 text-white drop-shadow-md" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-slate-950" />
              </span>
            </div>
          )}
        </button>
      </div>

      {/* 2. 카카오톡 스타일 채팅창 */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto translate-y-0 scale-100"
            : "opacity-0 pointer-events-none translate-y-4 scale-95"
        } 
        /* 모바일: 전체화면 / 데스크탑: 360px x 500px 우측 하단 */
        inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[360px] sm:h-[500px]
        bg-slate-900 border border-slate-800 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
      >
        {/* 헤더 영역 */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`relative w-9 h-9 rounded-full flex items-center justify-center text-white shadow-inner ${
                isHumanMode
                  ? "bg-indigo-600"
                  : "bg-gradient-to-tr from-blue-600 to-indigo-600 ring-1 ring-blue-400/30"
              }`}
            >
              {isHumanMode ? (
                <UserCheck className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
                  isHumanMode ? "bg-amber-400 animate-pulse" : "bg-emerald-500"
                }`}
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                {isHumanMode ? "입찰 전담 상담원" : chatData.botName}
              </h3>
              <p
                className={`text-[11px] flex items-center gap-1 font-medium ${
                  isHumanMode ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${
                    isHumanMode ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                {isHumanMode ? "상담원 대기 중 · 실시간 연결" : "AI 온라인 · 실시간 응답"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isHumanMode && (
              <button
                onClick={handleSwitchToAi}
                title="AI 모드로 전환"
                className="px-2 py-1 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 rounded-md transition-colors border border-blue-800/60 flex items-center gap-1"
              >
                <Bot className="w-3 h-3" />
                <span>AI</span>
              </button>
            )}
            <button
              onClick={handleReset}
              title="대화 초기화"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="닫기"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <ChevronDown className="w-5 h-5 hidden sm:block" />
              <X className="w-5 h-5 sm:hidden" />
            </button>
          </div>
        </div>

        {/* 중앙 말풍선 대화 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/60 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-1.5 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* 1. 상담원(Admin) 답변 말풍선 */}
              {msg.sender === "admin" && (
                <div className="max-w-[82%]">
                  <div className="text-[10px] text-indigo-300 font-semibold mb-0.5 ml-1 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-indigo-400" />
                    <span>입찰 담당자</span>
                  </div>
                  <div className="bg-indigo-950/80 text-indigo-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm border border-indigo-700/60 whitespace-pre-line break-words">
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 ml-1 inline-block">
                    {msg.time}
                  </span>
                </div>
              )}

              {/* 2. 봇(Bot) 답변 말풍선 */}
              {msg.sender === "bot" && (
                <div className="max-w-[82%]">
                  <div className="bg-slate-800 text-slate-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm border border-slate-700/60 whitespace-pre-line break-words">
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 ml-1 inline-block">
                    {msg.time}
                  </span>
                </div>
              )}

              {/* 3. 내 질문(User) 말풍선 */}
              {msg.sender === "user" && (
                <div className="max-w-[82%] flex flex-col items-end">
                  <div
                    className={`text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-md whitespace-pre-line break-words ${
                      isHumanMode ? "bg-indigo-600" : "bg-blue-600"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 mr-1 inline-block">
                    {msg.time}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* AI 타이핑/로딩 인디케이터 */}
          {isTyping && (
            <div className="flex items-center gap-1.5">
              <div className="bg-slate-800 border border-slate-700/60 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-2 shadow-sm">
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>AI가 답변을 작성하고 있습니다...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 하단 영역 (FAQ 리스트 + 입찰 담당자 문의 버튼 + 직접 입력창) */}
        <div className="bg-slate-950 p-2.5 sm:p-3 border-t border-slate-800 shrink-0 space-y-2">
          {/* FAQ 빠른 질문 버튼 리스트 (AI 모드일 때 표시) */}
          {!isHumanMode && (
            <div className="max-h-20 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
              {chatData.faqs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => handleQuestionClick(faq.question, faq.answer)}
                  disabled={isTyping}
                  className="w-full text-left text-[11px] bg-slate-900/90 hover:bg-blue-950/60 text-slate-300 hover:text-blue-300 border border-slate-800/80 hover:border-blue-700/60 rounded-lg px-2.5 py-1.5 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-between group"
                >
                  <span className="truncate pr-1">{faq.question}</span>
                  <span className="text-slate-500 group-hover:text-blue-400 text-[10px] shrink-0">
                    →
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* "입찰 담당자 문의" 전환 버튼 */}
          {!isHumanMode ? (
            <button
              onClick={handleSwitchToHuman}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 hover:from-indigo-900 hover:to-slate-800 text-indigo-300 hover:text-indigo-100 border border-indigo-800/60 hover:border-indigo-600/80 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Headphones className="w-3.5 h-3.5 text-indigo-400" />
              <span>입찰 담당자 문의 (실시간 상담)</span>
            </button>
          ) : (
            <div className="flex items-center justify-between px-2 py-1 bg-indigo-950/50 border border-indigo-800/40 rounded-lg text-[11px] text-indigo-300">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                담당자 연결 대기 중
              </span>
              <button
                onClick={handleSwitchToAi}
                className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-0.5"
              >
                <span>AI 모드로 전환</span>
                <Bot className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* 직접 텍스트 입력창 */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 pt-0.5">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isHumanMode
                  ? "담당자에게 문의할 내용을 입력하세요..."
                  : "궁금한 내용을 직접 질문해보세요..."
              }
              disabled={isTyping}
              className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              aria-label="질문 전송"
              className={`p-2 rounded-xl transition-colors disabled:opacity-40 shrink-0 flex items-center justify-center text-white ${
                isHumanMode
                  ? "bg-indigo-600 hover:bg-indigo-500 disabled:hover:bg-indigo-600"
                  : "bg-blue-600 hover:bg-blue-500 disabled:hover:bg-blue-600"
              }`}
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
