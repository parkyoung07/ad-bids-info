"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Send,
  Loader2,
} from "lucide-react";
import chatData from "../../public/data/chat-data.json";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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

  // 초기 웰컴 메시지 설정
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-msg",
          sender: "bot",
          text: chatData.welcomeMessage,
          time: getCurrentTime(),
        },
      ]);
    }
  }, [messages.length]);

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

  // 대화 초기화
  const handleReset = () => {
    setIsTyping(false);
    setInputValue("");
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text: chatData.welcomeMessage,
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
        id: `user-${Date.now()}`,
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
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: answer,
          time: getCurrentTime(),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  // 2. 직접 텍스트 입력 후 /api/chat AI 호출 핸들러
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    const userTime = getCurrentTime();
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      time: userTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
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
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur text-white text-xs font-medium px-3.5 py-2 rounded-full shadow-lg border border-slate-700 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>AI 입찰 상담 챗봇</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "채팅창 닫기" : "AI 입찰 도우미 챗봇 열기"}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform active:scale-95 ${
            isOpen
              ? "bg-slate-800 hover:bg-slate-700 rotate-90"
              : "bg-slate-950 hover:bg-slate-900 ring-4 ring-blue-600/30 hover:ring-blue-600/50 hover:scale-105"
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-slate-300" />
          ) : (
            <div className="relative">
              <FileText className="w-6 h-6 text-blue-400" />
              <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-blue-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
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
            <div className="relative w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-inner">
              <FileText className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                {chatData.botName}
              </h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI 온라인 · 실시간 응답
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
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
              {/* 봇 말풍선 (좌측 회색/소프트 말풍선) */}
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

              {/* 내 질문 말풍선 (우측 파란 말풍선) */}
              {msg.sender === "user" && (
                <div className="max-w-[82%] flex flex-col items-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-md whitespace-pre-line break-words">
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

        {/* 하단 질문 선택 영역 + 직접 입력창 */}
        <div className="bg-slate-950 p-2.5 sm:p-3 border-t border-slate-800 shrink-0 space-y-2">
          {/* FAQ 빠른 질문 버튼 리스트 */}
          <div className="max-h-24 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
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

          {/* 직접 텍스트 입력창 */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 pt-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="궁금한 내용을 직접 질문해보세요..."
              disabled={isTyping}
              className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              aria-label="질문 전송"
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-blue-600 shrink-0 flex items-center justify-center"
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
