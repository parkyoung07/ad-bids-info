"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  X,
  RotateCcw,
  Send,
  Loader2,
  Bot,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import bidsData from "../../public/data/bids.json";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

const createMsgId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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

  // 현재 상세 페이지인 경우 해당 공고 탐색
  const currentBid = useMemo(() => {
    if (pathname.startsWith("/bids/")) {
      const bidId = pathname.replace("/bids/", "");
      const bids = (bidsData as unknown as Array<{
        id: string;
        title: string;
        client: string;
        category: string;
        location: string;
        endDate: string;
        verifiedRequirements?: {
          license?: string;
          directProduction?: string;
          workPeriod?: string;
          warrantyPeriod?: string;
        };
      }>) || [];
      return bids.find((b) => b.id === bidId) || null;
    }
    return null;
  }, [pathname]);

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome-msg",
      sender: "bot",
      text: `안녕하세요! 옥외광고 전문 AI 입찰비서입니다.\n참가 자격 요건, 직접생산확인, 면허 기준, 입찰 일정 등에 대해 질문해 주세요.\n\n※ AI 답변은 참고용입니다. 실제 입찰 전 공식 공고문과 발주기관 안내를 확인하세요.`,
      time: "오전 09:00",
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleReset = () => {
    setIsTyping(false);
    setInputValue("");
    setMessages([
      {
        id: createMsgId("welcome"),
        sender: "bot",
        text: `대화가 초기화되었습니다.\n궁금하신 공고 조건이나 입찰 법령에 대해 질문해 주세요.\n\n※ AI 답변은 참고용입니다. 실제 입찰 전 공식 공고문과 발주기관 안내를 확인하세요.`,
        time: getCurrentTime(),
      },
    ]);
  };

  // 5단계 정형화 응답 생성기 (결론 -> 확인된 원문 -> 추가 확인 필요 -> 근거 -> 면책 안내)
  const generateStructuredResponse = (userQuery: string): string => {
    const q = userQuery.toLowerCase();

    // 1. 직접생산 관련 질문
    if (q.includes("직생") || q.includes("직접생산")) {
      return `[ 1. 결론 ]
공공입찰 물품제조 및 인쇄·설치 공고의 경우 중소벤처기업부 발급 유효 '직접생산확인증명서' 보유가 필수 요건입니다.

[ 2. 확인된 원문 내용 ]
• 세부품명 10자리 번호가 공고문에 명시된 품목과 완벽히 일치해야 합니다.
• 투찰 마감일 기준으로 유효기간 내에 있어야 적격심사 통과가 가능합니다.

[ 3. 추가 확인이 필요한 내용 ]
• SMPP(공공구매종합정보망)에서 보유 증명서의 유효기간 및 세부품명 코드를 재확인하십시오.

[ 4. 근거 ]
중소기업제품 구매촉진 및 판로지원에 관한 법률 제9조

※ AI 답변은 참고용입니다. 실제 입찰 전 공식 공고문과 발주기관 안내를 확인하세요.`;
    }

    // 2. 면허/옥외광고업 등록 질문
    if (q.includes("면허") || q.includes("자격") || q.includes("등록")) {
      return `[ 1. 결론 ]
옥외광고물 제작 및 설치 입찰은 관할 시·군·구청에 '옥외광고사업' 정식 등록을 필한 사업자만 참가 가능합니다.

[ 2. 확인된 원문 내용 ]
• 옥외광고사업 등록증 및 사업자등록증명 사본 제출 필수
• 전광판/사이니지 사업의 경우 정보통신공사업 면허가 추가 요구될 수 있습니다.

[ 3. 추가 확인이 필요한 내용 ]
• 공동도급(공동이행방식) 허용 여부를 공고문에서 최종 확인하십시오.

[ 4. 근거 ]
옥외광고물 등의 관리와 옥외광고산업 진흥에 관한 법률 제11조

※ AI 답변은 참고용입니다. 실제 입찰 전 공식 공고문과 발주기관 안내를 확인하세요.`;
    }

    // 3. 현재 공고 기반 질문인 경우
    if (currentBid) {
      return `[ 1. 결론 ]
현재 조회 중인 [${currentBid.title}] 공고에 대한 요약입니다.

[ 2. 확인된 원문 내용 ]
• 발주기관: ${currentBid.client}
• 필수자격: ${currentBid.verifiedRequirements?.license || "옥외광고사업 등록"}
• 직접생산: ${currentBid.verifiedRequirements?.directProduction || "해당 세부품명 직생증명서"}
• 투찰마감: ${currentBid.endDate}

[ 3. 추가 확인이 필요한 내용 ]
• 참가 전 시방서 내 지정 자재 규격 및 현장설명회 참석 의무 여부를 확인하십시오.

[ 4. 근거 ]
조달청 나라장터 공식 공고문 및 과업지시서

※ AI 답변은 참고용입니다. 실제 입찰 전 공식 공고문과 발주기관 안내를 확인하세요.`;
    }

    // 기본 응답
    return `[ 1. 결론 ]
질문하신 내용에 대한 입찰 안내입니다.

[ 2. 확인된 원문 내용 ]
• 옥외광고 공공입찰은 공고별 필수 면허(옥외광고업, 정보통신 등), 직접생산확인, 지역제한 요건을 충족해야 합니다.
• 투찰 전 조달청 적격심사 세부기준의 낙찰하한율을 반드시 확인하십시오.

[ 3. 추가 확인이 필요한 내용 ]
• 발주기관의 세부 과업지시서 내 특수조건 및 제출서류 목록을 확인하세요.

[ 4. 근거 ]
지방자치단체 입찰 및 계약 집행기준

※ AI 답변은 참고용입니다. 실제 입찰 전 공식 공고문과 발주기관 안내를 확인하세요.`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: createMsgId("user"),
      sender: "user",
      text,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateStructuredResponse(text);
      const botMsg: Message = {
        id: createMsgId("bot"),
        sender: "bot",
        text: replyText,
        time: getCurrentTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* 챗봇 대화창 (기본 닫힘) */}
      {isOpen && (
        <div className="mb-3 w-[360px] sm:w-[420px] max-w-[calc(100vw-2.5rem)] h-[540px] max-h-[calc(100vh-6rem)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* 헤더 */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>SignBid AI 입찰비서</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-medium">
                    표준 답변
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  {currentBid ? `[${currentBid.title.substring(0, 16)}...] 공고 기준` : "공공입찰 원문 기반 질의응답"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="대화 초기화"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 메시지 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[90%] whitespace-pre-wrap leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white font-medium"
                      : "bg-slate-900 border border-slate-800 text-slate-200"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800 w-32">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>답변 작성 중...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 빠른 질문 추천 칩 */}
          <div className="bg-slate-950 px-3 py-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <button
              onClick={() => handleSendMessage("직접생산확인 필수조건이 어떻게 되나요?")}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap cursor-pointer"
            >
              직생 필수 조건
            </button>
            <button
              onClick={() => handleSendMessage("옥외광고사업 등록증이 꼭 필요한가요?")}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap cursor-pointer"
            >
              면허 요건
            </button>
            {currentBid && (
              <button
                onClick={() => handleSendMessage("이 공고의 핵심 자격과 일정을 요약해줘")}
                className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 whitespace-nowrap cursor-pointer"
              >
                현재 공고 요약
              </button>
            )}
          </div>

          {/* 인풋 영역 */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[38px]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 우측 하단 기본 플로팅 버튼 (기본 닫힘 유지) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 border border-blue-400/40 transition-all cursor-pointer transform hover:scale-105 active:scale-95 min-h-[44px]"
      >
        <MessageSquare className="w-4 h-4 text-cyan-300" />
        <span>{currentBid ? "이 공고에 대해 AI에게 질문" : "AI 입찰비서 질문"}</span>
      </button>
    </div>
  );
}
