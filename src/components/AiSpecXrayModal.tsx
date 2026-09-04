"use client";

import React, { useState } from "react";
import {
  X,
  FileCheck2,
  AlertTriangle,
  Lightbulb,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  Layers,
  Cpu,
} from "lucide-react";

interface AiSpecXrayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: {
    id: string;
    title: string;
    client: string;
    budget: number;
    budgetText: string;
    category: string;
    location: string;
    linkUrl?: string;
    isDemo?: boolean;
    tags?: string[];
  };
}

export default function AiSpecXrayModal({
  isOpen,
  onClose,
  bid,
}: AiSpecXrayModalProps) {
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const isLed =
    bid.category?.includes("전광판") ||
    bid.category?.includes("사이니지") ||
    bid.title?.includes("전광판") ||
    bid.title?.includes("LED");
  const isBanner =
    bid.category?.includes("현수막") ||
    bid.title?.includes("현수막") ||
    bid.title?.includes("배너");
  const isSign =
    bid.category?.includes("간판") ||
    bid.title?.includes("간판") ||
    bid.category?.includes("조형물");

  const directCode = isLed
    ? "전광판(5512240201)"
    : isBanner
    ? "현수막·배너(5512150201)"
    : isSign
    ? "간판(5512190101)"
    : "광고대행(8210150101)";

  const complianceDocs = [
    { id: "doc1", title: "옥외광고사업 등록증", desc: "시·군·구청 발행 유효 등록증명서 (가상 예시)", required: true, penalty: "실격", evidence: "DEMO 분석 예시: 실제 공고문을 업로드하면 해당 문구와 위치를 추출합니다." },
    { id: "doc2", title: `직접생산확인증명서 [${directCode}]`, desc: "SMPP 발급 세부품명 번호 일치 (가상 예시)", required: true, penalty: "실격", evidence: "DEMO 분석 예시: 실제 공고문을 업로드하면 해당 문구와 위치를 추출합니다." },
    { id: "doc3", title: "중소기업·소상공인 확인서", desc: "중소벤처기업부 발급 유효기간 확인 (가상 예시)", required: true, penalty: "실격", evidence: "DEMO 분석 예시: 실제 공고문을 업로드하면 해당 문구와 위치를 추출합니다." },
    { id: "doc4", title: "기업신용평가등급 확인서", desc: "제출용 유효 신용평가서 (가상 예시)", required: true, penalty: "감점", evidence: "DEMO 분석 예시: 실제 공고문을 업로드하면 해당 문구와 위치를 추출합니다." },
    { id: "doc5", title: "국세·지방세·4대보험 완납증명서", desc: "투찰 마감일 기준 미납 없음 증명 (가상 예시)", required: true, penalty: "계약취소", evidence: "DEMO 분석 예시: 실제 공고문을 업로드하면 해당 문구와 위치를 추출합니다." },
  ];

  const riskRules = [
    {
      title: "직접생산확인증명서 세부품명 번호 불일치",
      desc: "공고 세부품목코드와 1자리라도 다르면 즉시 실격(0점) 처리됩니다. (가정 예시)",
      solution: "SMPP 사이트에서 보유 품목 번호를 재확인하세요.",
      evidence: "DEMO 분석 예시: 실제 공고문을 업로드하면 해당 문구와 위치를 추출합니다.",
    },
    {
      title: "지역제한 관내 소재지 확인",
      desc: `[${bid.location}] 관내 사업장 제한 여부를 사업자등록증과 대조하십시오. (가정 예시)`,
      solution: "법인등기부상 본점 소재지 확인",
      evidence: "DEMO 분석 예시: 실제 공고문을 업로드하면 해당 문구와 위치를 추출합니다.",
    },
  ];

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* 상단 모달 헤더 */}
        <div className="bg-slate-950 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  시방서 엑스레이 분석
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30">
                  DEMO 시뮬레이션
                </span>
              </div>
              <p className="text-xs text-slate-400">
                표시된 자격·금액·서류는 가상 예시이며 실제 입찰 전에는 반드시 나라장터 원문을 별도로 확인해야 합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 요약 바 */}
        <div className="bg-slate-950/80 px-5 sm:px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              발주처 (가상): <strong className="text-white">{bid.client}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              추정가격 (가상): <strong className="text-blue-300">{bid.budgetText}</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 truncate max-w-xs">
            {bid.title}
          </span>
        </div>

        {/* 본문 영역 */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. 필수 서류 체크 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" />
                <span>필수 제출 서류 (DEMO 가정 예시)</span>
              </span>
              <span className="text-[10px] text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-400/20">
                자가 점검용
              </span>
            </div>

            <div className="space-y-2">
              {complianceDocs.map((doc) => {
                const isChecked = !!checkedDocs[doc.id];
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDoc(doc.id)}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <div>
                        <strong className="text-slate-200 block text-xs">{doc.title}</strong>
                        <span className="text-[10px] text-slate-400">{doc.desc}</span>
                        <span className="text-[10px] text-cyan-400 block">{doc.evidence}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {doc.penalty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. 실격 위험 방지 룰셋 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>실격 위험 사전 방지 룰셋 (DEMO 가정 예시)</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {riskRules.map((rule, idx) => (
                <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <strong className="text-slate-200 block">{rule.title}</strong>
                  <p className="text-slate-400 text-[11px]">{rule.desc}</p>
                  <p className="text-cyan-300 text-[11px]">💡 대응: {rule.solution}</p>
                  <span className="text-[10px] text-slate-500 block">{rule.evidence}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 닫기 */}
        <div className="bg-slate-950 px-5 sm:px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
