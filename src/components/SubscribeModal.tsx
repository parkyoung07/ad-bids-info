"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  X,
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Mail,
  ShieldCheck,
} from "lucide-react";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBidTitle?: string;
  defaultCategory?: string;
}

const POPULAR_REGIONS = ["전국", "서울", "경기", "인천", "부산", "대구", "대전", "광주"];

export default function SubscribeModal({
  isOpen,
  onClose,
  defaultBidTitle,
  defaultCategory,
}: SubscribeModalProps) {
  const [phone, setPhone] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전국");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // 휴대폰 번호 자동 하이픈 포맷팅
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length > 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    }
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10 || !agreed) return;

    setIsSubmitting(true);

    const payload = {
      phone: phone.trim(),
      email: email.trim(),
      companyName: companyName.trim(),
      region: selectedRegion,
      categories: defaultCategory ? [defaultCategory] : ["간판·조형물", "디지털사이니지·전광판", "인쇄·행사"],
      notifyMorning: true,
      notifyDeadline: true,
      subscribedAt: new Date().toISOString(),
      targetBid: defaultBidTitle || "전체 맞춤 공고",
    };

    try {
      // 1. 브라우저 로컬 저장
      const existing = JSON.parse(localStorage.getItem("ad_bids_subscribers") || "[]");
      existing.unshift(payload);
      localStorage.setItem("ad_bids_subscribers", JSON.stringify(existing));

      // 2. 백엔드 API 호출 -> 서버 저장 및 회장님 텔레그램 실시간 폰 알림 발송!
      try {
        await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn("API save fallback:", err);
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Subscription error:", err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 relative max-h-[92vh] overflow-y-auto">
        {/* 상단 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* 신청 완료 화면 */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white">카톡 무료 알림 등록 완료!</h3>
              <p className="text-sm text-slate-300">
                <span className="text-amber-400 font-bold">{phone}</span> 번호로<br />
                <span className="text-emerald-400 font-semibold">[{selectedRegion}]</span> 지역 신규 공고가 실시간 배달됩니다.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>회원 전용 무료 혜택</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-xs">
                <li>• <b>매일 아침 8시:</b> 엄선된 알짜 신규 입찰 TOP 3 발송</li>
                <li>• <b>마감 D-1 리마인더:</b> 관심 공고 투찰 마감 24시간 전 알림</li>
                <li>• <b>이용료:</b> 전액 무료 (언제든 1초 해지 가능)</li>
              </ul>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              확인 완료 (닫기)
            </button>
          </div>
        ) : (
          /* 신청 양식 (초간편 1초 모드) */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 타이틀 헤더 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 shrink-0">
                <MessageCircle className="w-6 h-6 fill-slate-950" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  <span>카카오톡 1초 맞춤 알림</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    전액 무료
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  매일 아침 8시, 놓치면 아까운 공공입찰만 카톡으로 배달해 드립니다.
                </p>
              </div>
            </div>

            {/* 선택 공고가 있을 때 안내 박스 */}
            {defaultBidTitle && (
              <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-2.5 text-xs text-blue-200 flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-cyan-300">선택 공고 마감 알림 포함: </span>
                  <span className="text-slate-300">{defaultBidTitle}</span>
                </div>
              </div>
            )}

            {/* 1. 핵심 입력: 휴대폰 번호 (시원하고 큼직하게) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-amber-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>휴대폰 번호 입력 (카톡 수신용 필수) *</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={13}
                  placeholder="010-0000-0000 (숫자만 입력)"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full bg-slate-950 border-2 border-amber-500/50 focus:border-amber-400 rounded-2xl px-4 py-3.5 text-base sm:text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all tracking-wider"
                />
              </div>
            </div>

            {/* 2. 빠른 지역 선택 (원터치 칩 버튼) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>희망 지역 선택</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_REGIONS.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setSelectedRegion(r)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      selectedRegion === r
                        ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 추가 선택 사항 (원하시는 분만 펼쳐보기) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-1 text-slate-400 hover:text-slate-300 text-xs font-medium flex items-center justify-between transition-colors"
              >
                <span>🏢 회사명 / 이메일도 함께 남기기 (선택사항)</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-2.5 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2.5 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>회사명 / 상호</span>
                    </label>
                    <input
                      type="text"
                      placeholder="예: 서울사인디자인"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>이메일 주소</span>
                    </label>
                    <input
                      type="email"
                      placeholder="ceo@company.co.kr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. 안심 안내 및 개인정보 동의 (간결화) */}
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
              <input
                type="checkbox"
                required
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 cursor-pointer accent-amber-500"
              />
              <label htmlFor="agree" className="cursor-pointer text-[11px] text-slate-300">
                [필수] 입찰 알림톡 발송을 위한 개인정보(전화번호) 수집에 동의합니다.
              </label>
            </div>

            {/* 5. 큼직한 원클릭 신청 버튼 (한 손 엄지 터치 최적화) */}
            <button
              type="submit"
              disabled={isSubmitting || phone.replace(/[^0-9]/g, "").length < 10 || !agreed}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>🚀 등록 처리 중...</span>
              ) : (
                <>
                  <span>🚀 1초 만에 무료 알림 받기</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>광고 스팸 없는 공공기관 입찰 전용 알림톡 (무료)</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
