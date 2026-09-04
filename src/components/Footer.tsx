"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Info, AlertTriangle, FileText, CheckCircle2, X } from "lucide-react";

export default function Footer() {
  const [modalType, setModalType] = useState<string | null>(null);

  const renderModalContent = () => {
    switch (modalType) {
      case "privacy":
        return (
          <div>
            <h3 className="text-base font-bold text-white mb-2">개인정보처리방침 (요약)</h3>
            <p className="text-xs text-slate-300 leading-relaxed space-y-2">
              SignBid AI는 맞춤형 입찰 알림 및 서비스 제공을 위해 최소한의 정보(이메일, 카카오 알림톡 전화번호, 관심 지역 및 업종)만을 수집합니다.
              수집된 정보는 이용 목적 외 타인에게 제공되지 않으며, 회원의 요청 시 즉시 파기됩니다.
            </p>
          </div>
        );
      case "terms":
        return (
          <div>
            <h3 className="text-base font-bold text-white mb-2">서비스 이용약관</h3>
            <p className="text-xs text-slate-300 leading-relaxed space-y-2">
              본 서비스는 옥외광고 공공입찰 정보 탐색을 지원하는 민간 편의 도구입니다.
              시스템에서 제공하는 모든 데이터, AI 요약 및 시뮬레이션 결과는 정보 제공 목적의 참고자료이며 법적 효력이 없습니다.
              실제 입찰 참가 및 계약에 따른 법적 책임은 이용자 본인에게 있습니다.
            </p>
          </div>
        );
      case "datasource":
        return (
          <div>
            <h3 className="text-base font-bold text-white mb-2">데이터 출처 및 수집 주기 안내</h3>
            <p className="text-xs text-slate-300 leading-relaxed space-y-2">
              • <strong>조달청 나라장터 (G2B):</strong> 공공데이터포털 Open API 및 공식 링크 연계 (매일 실시간 수집)<br />
              • <strong>온비드 (Onbid):</strong> 한국자산관리공사 공공자산 매체권 공고<br />
              • <strong>K-apt / 학교장터:</strong> 공동주택관리정보시스템 및 교육기관 발주 정보<br />
              • <strong>마지막 시스템 데이터 검증:</strong> 2026.09.04 10:00 (KST)
            </p>
          </div>
        );
      case "ai_guide":
        return (
          <div>
            <h3 className="text-base font-bold text-white mb-2">AI 분석 및 시뮬레이션 이용안내</h3>
            <p className="text-xs text-slate-300 leading-relaxed space-y-2">
              SignBid AI의 모든 분석(시방서 엑스레이, 참가자격 진단, 투찰 시뮬레이터, AI 제안서)은 대규모 언어모델(LLM)과 공공 데이터 규칙 기반 알고리즘을 활용합니다.
              AI의 제안은 발주기관의 공식 유권해석이 아니므로 반드시 원문 공고문 및 첨부 과업지시서와 대조하십시오.
            </p>
          </div>
        );
      case "report_error":
        return (
          <div>
            <h3 className="text-base font-bold text-white mb-2">오류 신고 및 데이터 정정 요청</h3>
            <p className="text-xs text-slate-300 leading-relaxed space-y-2">
              공고명, 마감일시, 참가자격 등 잘못 표기된 데이터나 변경된 공고사항이 발견되면 고객지원팀(support@signbidai.com)으로 신고해 주시기 바랍니다. 확인 즉시 신속하게 정정 조치하겠습니다.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* 필수 법적 고지 박스 */}
        <div className="bg-slate-950/80 rounded-xl p-4 sm:p-5 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>SignBid AI 서비스 운영 및 법적 면책 안내</span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
            SignBid AI는 옥외광고 사업자의 공공입찰 정보 확인을 돕는 <strong>민간 편의 서비스</strong>입니다.
            조달청, 온비드, K-apt 또는 개별 발주기관을 대행하거나 대표하지 않습니다.
            AI 분석과 계산 결과는 참고자료이며 실제 입찰 전 <strong>공식 공고문, 첨부서류 및 발주기관 안내를 반드시 확인</strong>해야 합니다.
          </p>
        </div>

        {/* 하단 링크 메뉴 */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400">
            <button
              onClick={() => setModalType("privacy")}
              className="hover:text-white transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              개인정보처리방침
            </button>
            <span>•</span>
            <button
              onClick={() => setModalType("terms")}
              className="hover:text-white transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              이용약관
            </button>
            <span>•</span>
            <button
              onClick={() => setModalType("datasource")}
              className="hover:text-white transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              데이터 출처 안내
            </button>
            <span>•</span>
            <button
              onClick={() => setModalType("ai_guide")}
              className="hover:text-white transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              AI 분석 이용안내
            </button>
            <span>•</span>
            <button
              onClick={() => setModalType("report_error")}
              className="hover:text-rose-400 text-rose-400/90 transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              오류 신고
            </button>
          </div>

          <p className="text-[10px] text-slate-500">
            © 2026 SignBid AI (옥외광고 입찰정보 알리미). All rights reserved.
          </p>
        </div>
      </div>

      {/* 안내 팝업 모달 */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {renderModalContent()}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
