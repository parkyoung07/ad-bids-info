"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Cpu,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  AlertTriangle,
  Building2,
  FileCheck2,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgeCheck,
  CheckSquare,
  Square,
  RotateCcw,
  Info,
} from "lucide-react";
import bidsData from "../../../public/data/bids.json";

export default function SpecXrayStudioClient() {
  const bids = useMemo(() => bidsData || [], []);
  const [selectedBidId, setSelectedBidId] = useState<string>(bids[0]?.id || "R26BK01650918-000");
  const [activeTab, setActiveTab] = useState<"all" | "compliance" | "materials" | "safety">("all");
  const [copied, setCopied] = useState(false);

  // 인터랙티브 필수서류 체크리스트 상태 (기본값: 확인 전, 0개 체크)
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const currentBid = useMemo(() => {
    return bids.find((b) => b.id === selectedBidId) || bids[0];
  }, [bids, selectedBidId]);

  const isLed =
    currentBid?.category?.includes("전광판") ||
    currentBid?.category?.includes("사이니지") ||
    currentBid?.title?.includes("전광판") ||
    currentBid?.title?.includes("LED");
  const isBanner =
    currentBid?.category?.includes("현수막") ||
    currentBid?.title?.includes("현수막") ||
    currentBid?.title?.includes("배너");
  const isSign =
    currentBid?.category?.includes("간판") ||
    currentBid?.title?.includes("간판") ||
    currentBid?.category?.includes("조형물");

  // 서류 체크리스트 정의
  const complianceDocs = useMemo(() => {
    const directCode = isLed
      ? "안내전광판(5512240201) / 디지털사이니지"
      : isBanner
      ? "현수막·배너(5512150201)"
      : isSign
      ? "간판(5512190101) / 안내판(5512171801)"
      : "광고대행(8210150101)";

    return [
      { id: "doc1", title: "옥외광고사업 등록증", desc: "시·군·구청 발행 유효 등록증명서", required: true, penalty: "실격", evidence: "공고문 2페이지 제3조" },
      { id: "doc2", title: `직접생산확인증명서 [${directCode}]`, desc: "SMPP 발급 세부품명 10자리 번호 일치", required: true, penalty: "실격", evidence: "공고문 2페이지 제3조" },
      { id: "doc3", title: "중소기업·소상공인 확인서", desc: "중소벤처기업부 발급 유효기간 확인", required: true, penalty: "실격", evidence: "공고문 2페이지 제3조" },
      { id: "doc4", title: "기업신용평가등급 확인서", desc: "조달청 제출용 유효 신용평가서", required: true, penalty: "감점", evidence: "적격심사 세부기준" },
      { id: "doc5", title: "국세·지방세·4대보험 완납증명서", desc: "투찰 마감일 기준 미납 없는 완납증명서", required: true, penalty: "계약취소", evidence: "국가계약법 시행령" },
    ];
  }, [isLed, isBanner, isSign]);

  // 실격 위험 방지 룰셋
  const riskRules = useMemo(() => {
    return [
      {
        level: "danger",
        title: "직접생산확인증명서 세부품명 번호 불일치",
        desc: "공고문에 명기된 10자리 세부물품번호와 1자리라도 다를 경우 적격심사 즉시 0점(무효) 처리됩니다.",
        solution: "투찰 전 SMPP 사이트에서 보유 세부품명 번호와 공고 원문 규격을 재대조하세요.",
        evidence: "원문 확인: 공고문 참가자격 제3조",
      },
      {
        level: "danger",
        title: "지역제한(소재지 기준) 관내 사업장 미달",
        desc: `본 공고는 [${currentBid?.location || "지역"}] 소재 기업 제한 공고입니다. 법인등기부상 본점 등록일을 확인하세요.`,
        solution: "공고일 전일부터 계약체결일까지 해당 지역 내 주된 영업소가 유지되어야 합니다.",
        evidence: "원문 확인: 공고문 참가자격 제2조",
      },
      {
        level: "warning",
        title: "복합면허(정보통신/전기공사) 요구 시 단독 투찰 주의",
        desc: isLed ? "LED 전광판/사이니지 사업은 정보통신공사업 면허가 상호 보완 요구될 수 있습니다." : "간판 설치 시 전기 인입 공사 포함 여부를 시방서에서 확인하세요.",
        solution: "단독 면허 부족 시 공동수급(공동이행) 협정서를 사전 체결하세요.",
        evidence: "AI 참고 제안 (시방서 공종 분석)",
      },
    ];
  }, [currentBid, isLed]);

  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / complianceDocs.length) * 100);

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* ⚠️ 상단 고정 AI 분석 배지 및 안내문 (요구사항 1-4) */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            AI 분석 · 반드시 공식 공고문을 최종 확인하세요
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          시방서 엑스레이는 조달청 공고문 및 과업지시서에서 추출된 <strong>공식 원문 조건</strong>과 <strong>AI 분석 참고 제안</strong>을 분리하여 제공합니다.
          공식 공고문에 명시되지 않은 자재 규격이나 보증 조건은 참고용이며 필수 조건이 아닙니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 공고 선택 및 핵심 제원 */}
        <div className="lg:col-span-4 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs sm:text-sm font-bold text-white">
            <Search className="w-4 h-4 text-blue-400" />
            <span>분석 대상 공고 선택</span>
          </div>

          <div>
            <select
              value={selectedBidId}
              onChange={(e) => setSelectedBidId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              {bids.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.category}] {b.title.substring(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          {/* 공고 제원 요약 */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">발주기관:</span>
              <strong className="text-white">{currentBid?.client}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">배정예산:</span>
              <strong className="text-blue-400">{currentBid?.budgetText}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">마감일시:</span>
              <strong className="text-rose-400">{currentBid?.endDate}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">공식 출처:</span>
              <span className="text-slate-300">{currentBid?.source || "조달청 나라장터"}</span>
            </div>
          </div>

          {/* 서류 준비 진행률 게이지 */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">필수서류 구비율</span>
              <span className="text-cyan-400">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block text-right">
              {checkedCount} / {complianceDocs.length}개 준비 완료
            </span>
          </div>
        </div>

        {/* 우측: 2개 영역 분리 분석 (원문 조건 vs AI 참고 제안) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 탭 버튼 */}
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === "all" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              전체 보기
            </button>
            <button
              onClick={() => setActiveTab("compliance")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === "compliance" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              필수 서류 체크 (원문)
            </button>
            <button
              onClick={() => setActiveTab("safety")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === "safety" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              실격 위험 룰셋
            </button>
          </div>

          {/* 1. 공식 원문 확인 필수 제출서류 목록 */}
          {(activeTab === "all" || activeTab === "compliance") && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    공식 원문 확인 필수 제출 서류
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium">
                  공고문 직접 확인
                </span>
              </div>

              <div className="space-y-2">
                {complianceDocs.map((doc) => {
                  const isChecked = !!checkedDocs[doc.id];
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        isChecked
                          ? "bg-slate-950/80 border-slate-800"
                          : "bg-rose-950/10 border-rose-500/30"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDoc(doc.id)}
                          className="mt-0.5 rounded text-blue-600 focus:ring-0"
                        />
                        <div className="space-y-0.5">
                          <strong className="text-xs font-bold text-slate-200 block">
                            {doc.title}
                          </strong>
                          <p className="text-[11px] text-slate-400">{doc.desc}</p>
                          <span className="text-[10px] text-cyan-400 font-mono block pt-0.5">
                            근거: {doc.evidence}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                        미비 시 {doc.penalty}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. 실격 위험 방지 룰셋 (원문 vs AI 제안 구분) */}
          {(activeTab === "all" || activeTab === "safety") && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    적격심사 실격 및 감점 방지 룰셋
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-medium">
                  AI 분석 & 룰베이스
                </span>
              </div>

              <div className="space-y-3">
                {riskRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>{rule.title}</span>
                      </strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rule.evidence}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-3.5">
                      {rule.desc}
                    </p>
                    <div className="pl-3.5 pt-1 text-[11px] text-cyan-300 flex items-center gap-1">
                      <span className="font-semibold text-slate-300">대응책:</span>
                      <span>{rule.solution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
