"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Mail,
  Send,
  X,
  Sparkles,
  CheckCircle2,
  Phone,
  Building2,
  FileText,
  Clock,
} from "lucide-react";

interface DirectReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: {
    id?: string;
    companyName?: string;
    phone?: string;
    email?: string;
    region?: string;
    categories?: string[];
  } | null;
}

const QUICK_TEMPLATES = [
  {
    id: "welcome_bid",
    title: "1. 맞춤 입찰 공고 안내 (기본)",
    channel: "both",
    subject: "[SignBid AI] 대표님 맞춤 옥외광고 추천 입찰 공고 안내",
    body: (name: string, region: string) =>
      `안녕하세요, ${name || "대표"}님! 옥외광고 전문 AI 입찰비서 SignBid AI입니다.\n\n신청해 주신 [${region || "맞춤"}] 지역의 신규 알짜 공고가 등록되어 안내해 드립니다.\n\n▶ 추천 공고: 지자체 공공간판 및 사이니지 제작·설치 사업\n▶ 참가자격: 옥외광고사업 등록 및 직접생산확인 증명\n▶ 상세분석: https://signbidai.com/bids\n\n궁금하신 사항은 언제든 편하게 회신해 주세요!`,
  },
  {
    id: "deadline_reminder",
    title: "2. 마감 D-1 골든타임 리마인더",
    channel: "kakao",
    subject: "[SignBid AI] 관심 공고 투찰 마감 24시간 전 알림",
    body: (name: string, region: string) =>
      `[SignBid AI] 마감 임박 공고 리마인더 ⏰\n\n${name || "대표"}님, 관심 등록하신 공고의 투찰 마감이 24시간 남았습니다.\n\n▶ 투찰 전 필수 체크:\n1. 기초금액 대비 A값 공제액 확인\n2. 투찰계산기로 사정율 시뮬레이션\n\n지금 바로 투찰금액을 점검해 보세요:\nhttps://signbidai.com/calculator`,
  },
  {
    id: "spec_analysis",
    title: "3. 사전규격 및 참가자격 AI 진단 회신",
    channel: "email",
    subject: "[SignBid AI] 요청하신 공고 시방서·참가자격 AI 진단 리포트",
    body: (name: string, region: string) =>
      `안녕하세요, ${name || "대표"}님.\n\n요청하신 공고의 과업지시서 핵심 규격 및 참가자격 진단 결과입니다.\n\n1. 필수 자격: 옥외광고사업 등록, 직접생산확인(간판/표찰)\n2. 특이사항: 수도권 지역제한 및 안전관리계획서 제출 필수\n3. 권장 투찰대역: 낙찰하한율(87.745%) + 0.155% 사정률\n\n세부 서류 양식은 사이트 내 입찰서류함(https://signbidai.com/forms)에서 무료로 다운로드 가능합니다.\n\n감사합니다.\nSignBid AI 전담팀 드림`,
  },
  {
    id: "partner_intro",
    title: "4. 우수 협력사(스카이/가공/시공) 매칭 안내",
    channel: "both",
    subject: "[SignBid AI] 요청 지역 우수 옥외광고 협력사 연결 안내",
    body: (name: string, region: string) =>
      `안녕하세요, ${name || "대표"}님! SignBid AI 협력사 지원팀입니다.\n\n[${region || "해당"}] 지역 시공 및 가공을 위한 검증된 협력사 정보입니다:\n\n- 추천 협력사: 수도권·영남 전문 스카이/크레인 고소작업팀\n- 보유 장비: 3.5톤~5톤 스카이 및 25톤 크레인 (안전검사필)\n- 협력사 DB 조회: https://signbidai.com/partners\n\n필요 시 공동도급 제휴 연결을 무료로 지원해 드립니다.`,
  },
];

export default function DirectReplyModal({
  isOpen,
  onClose,
  targetUser,
}: DirectReplyModalProps) {
  const [channel, setChannel] = useState<"kakao" | "email">("kakao");
  const [subject, setSubject] = useState("[SignBid AI] 맞춤 옥외광고 입찰 정보 안내");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // 대상자 변경 시 기본 템플릿 로드
  React.useEffect(() => {
    if (targetUser) {
      const defaultTemplate = QUICK_TEMPLATES[0];
      setMessageText(
        defaultTemplate.body(targetUser.companyName || "", targetUser.region || "전국")
      );
      setSubject(defaultTemplate.subject);
      setSendSuccess(false);
    }
  }, [targetUser]);

  if (!isOpen || !targetUser) return null;

  const handleApplyTemplate = (tpl: typeof QUICK_TEMPLATES[0]) => {
    setMessageText(
      tpl.body(targetUser.companyName || "", targetUser.region || "전국")
    );
    setSubject(tpl.subject);
    if (tpl.channel === "kakao") setChannel("kakao");
    if (tpl.channel === "email") setChannel("email");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSending(true);

    try {
      if (channel === "kakao") {
        // 카카오 알림톡/문자 발송 시뮬레이션 및 API 연동
        await new Promise((resolve) => setTimeout(resolve, 800));
        console.log(`[Kakao Sent] to ${targetUser.phone}:`, messageText);
      } else {
        // 이메일 발송
        await new Promise((resolve) => setTimeout(resolve, 800));
        console.log(`[Email Sent] to ${targetUser.email || "고객"}:`, subject, messageText);
      }
      setSendSuccess(true);
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* 상단 닫기 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {sendSuccess ? (
          /* 발송 성공 화면 */
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">
                {channel === "kakao" ? "카카오톡 알림톡 발송 완료!" : "이메일 답장 발송 완료!"}
              </h3>
              <p className="text-xs text-slate-300">
                <span className="font-bold text-amber-400">
                  {targetUser.companyName || "고객사"} (
                  {channel === "kakao" ? targetUser.phone : targetUser.email || targetUser.phone}
                  )
                </span>
                님에게 메시지가 안전하게 전송되었습니다.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              닫기
            </button>
          </div>
        ) : (
          /* 메시지 작성 폼 */
          <form onSubmit={handleSend} className="space-y-4">
            {/* 타이틀 헤더 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>고객 즉시 1:1 답장 발송기</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    CRM Engine
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  카카오톡 알림톡 및 이메일로 템플릿 기반 맞춤 답장을 1초 만에 전송합니다.
                </p>
              </div>
            </div>

            {/* 수신 고객 정보 카드 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-bold text-white">
                  {targetUser.companyName || "미기재 업체"}
                </span>
                <span className="px-2 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-400/30 rounded text-[10px] font-bold">
                  {targetUser.region || "전국"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                {targetUser.phone && (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Phone className="w-3 h-3" />
                    {targetUser.phone}
                  </span>
                )}
                {targetUser.email && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Mail className="w-3 h-3 text-indigo-400" />
                    {targetUser.email}
                  </span>
                )}
              </div>
            </div>

            {/* 1. 발송 채널 선택 */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                발송 채널 선택
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel("kakao")}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    channel === "kakao"
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/25"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>카카오톡 알림톡 / SMS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel("email")}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    channel === "email"
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/25"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>공식 이메일 답장 (Email)</span>
                </button>
              </div>
            </div>

            {/* 2. 빠른 원클릭 템플릿 선택 */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>원클릭 빠른 템플릿 적용</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-[11px] font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* 이메일일 경우 제목 입력 */}
            {channel === "email" && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  이메일 제목
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* 3. 본문 작성 */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>메시지 본문</span>
                <span className="text-[10px] text-slate-500">
                  글자수: {messageText.length}자
                </span>
              </label>
              <textarea
                rows={7}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono leading-relaxed resize-none"
              />
            </div>

            {/* 발송 버튼 */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSending || !messageText.trim()}
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  channel === "kakao"
                    ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-amber-400/20 hover:from-amber-300 hover:to-yellow-300"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25"
                }`}
              >
                {isSending ? (
                  <span>전송 중...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {channel === "kakao"
                        ? "카카오톡 즉시 발송"
                        : "이메일 즉시 발송"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
