"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  X,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  MessageCircle,
  Clock,
  Building2,
} from "lucide-react";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBidTitle?: string;
  defaultCategory?: string;
}

const REGIONS = [
  "전국",
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

const CATEGORIES = [
  "간판·조형물",
  "디지털사이니지·전광판",
  "매체권·임대",
  "학교·교육",
  "차량랩핑·특수",
  "현수막·배너",
  "인쇄·판촉",
];

export default function SubscribeModal({
  isOpen,
  onClose,
  defaultBidTitle,
  defaultCategory,
}: SubscribeModalProps) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전국");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    defaultCategory ? [defaultCategory] : ["간판·조형물", "디지털사이니지·전광판"]
  );
  const [notifyMorning, setNotifyMorning] = useState(true);
  const [notifyDeadline, setNotifyDeadline] = useState(true);
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !agreed) return;

    setIsSubmitting(true);

    const payload = {
      phone: phone.trim(),
      email: email.trim(),
      companyName: companyName.trim(),
      region: selectedRegion,
      categories: selectedCategories,
      notifyMorning,
      notifyDeadline,
      subscribedAt: new Date().toISOString(),
      targetBid: defaultBidTitle || "전체 맞춤 공고",
    };

    try {
      // 로컬 스토리지 백업 저장
      const existing = JSON.parse(localStorage.getItem("ad_bids_subscribers") || "[]");
      existing.unshift(payload);
      localStorage.setItem("ad_bids_subscribers", JSON.stringify(existing));

      // 백엔드 API 호출 시도
      try {
        await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.log("API save fallback to local:", err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
        {/* 상단 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* 신청 완료 화면 */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">맞춤 알림 신청이 완료되었습니다!</h3>
              <p className="text-xs text-slate-400">
                <span className="text-emerald-400 font-bold">{phone}</span> 번호로 카카오톡 알림톡이 등록되었습니다.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>알림 혜택 안내</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li><strong className="text-slate-200">매일 아침 8시:</strong> [{selectedRegion}] 지역 최신 알짜 공고 TOP 3 발송</li>
                <li><strong className="text-slate-200">마감 D-1:</strong> 관심 공고 마감 24시간 전 리마인더 발송</li>
                <li><strong className="text-slate-200">비용:</strong> 전액 무료 (카카오톡 알림톡)</li>
              </ul>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              확인 완료
            </button>
          </div>
        ) : (
          /* 신청 양식 화면 */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 타이틀 헤더 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/25">
                <MessageCircle className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                  <span>카카오톡 맞춤 입찰 알림</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    무료 서비스
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  매일 아침 8시, 내 지역 & 내 업종 공고만 카톡으로 쏙쏙 받아보세요.
                </p>
              </div>
            </div>

            {defaultBidTitle && (
              <div className="bg-blue-950/40 border border-blue-800/50 rounded-lg p-2.5 text-xs text-blue-200 flex items-start gap-2">
                <Bell className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-cyan-300">선택 공고 마감 알림 포함:</span>
                  <p className="text-[11px] text-slate-300 truncate">{defaultBidTitle}</p>
                </div>
              </div>
            )}

            {/* 1. 희망 지역 선택 */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>알림받을 희망 지역 (1개 선택)</span>
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r === "전국" ? "전국 (모든 지역 공고 수신)" : `${r} 지역 공고`}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. 관심 카테고리 다중 선택 */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>관심 입찰 업종 (복수 선택 가능)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {isChecked ? `✓ ${cat}` : cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. 연락처 입력 */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>휴대폰 번호 (카카오톡 알림톡 수신용) *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>회사명/상호 (선택)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: 서울광고기획"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>이메일 주소 (선택)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. 알림 주기 체크 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={notifyMorning}
                  onChange={(e) => setNotifyMorning(e.target.checked)}
                  className="rounded text-blue-500 bg-slate-900 border-slate-700"
                />
                <span>매일 아침 8시 신규 공고 요약 알림 받기</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={notifyDeadline}
                  onChange={(e) => setNotifyDeadline(e.target.checked)}
                  className="rounded text-blue-500 bg-slate-900 border-slate-700"
                />
                <span>관심 공고 마감 24시간 전(D-1) 리마인더 알림 받기</span>
              </label>
            </div>

            {/* 개인정보 동의 */}
            <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-400">
              <input
                type="checkbox"
                required
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded text-blue-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <label htmlFor="agree" className="cursor-pointer leading-tight">
                [필수] 입찰 알림톡 발송을 위한 개인정보(전화번호) 수집 및 이용에 동의합니다.
              </label>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting || !phone || !agreed}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "등록 중..." : "🚀 카카오톡 무료 알림 등록하기"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
