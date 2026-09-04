"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  FileText,
  Presentation,
  Check,
  Copy,
  Download,
  Printer,
  ChevronRight,
  Sliders,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Building,
  Info,
} from "lucide-react";

interface BidItem {
  id: string;
  title: string;
  client: string;
  budget: number;
  budgetText: string;
  category: string;
  location: string;
  checkList?: {
    workPeriod?: string;
    warrantyPeriod?: string;
    licenseRequired?: string;
    directProduction?: string;
  };
  verifiedRequirements?: {
    license?: string;
    directProduction?: string;
    location?: string;
    jointVenture?: string;
    workPeriod?: string;
    warrantyPeriod?: string;
    siteBriefing?: string;
  };
  linkUrl?: string;
}

interface ProposalStudioClientProps {
  initialBids: BidItem[];
}

export default function ProposalStudioClient({
  initialBids,
}: ProposalStudioClientProps) {
  const [selectedBidId, setSelectedBidId] = useState<string>(
    initialBids[0]?.id || "custom"
  );
  const [customTitle, setCustomTitle] = useState("2026년도 시가지 옥외 간판개선 및 LED 조형물 제작설치 사업");
  const [customClient, setCustomClient] = useState("경상북도 김천시청");
  const [customBudget, setCustomBudget] = useState(85000000);
  const [customCategory, setCustomCategory] = useState("간판·조형물");
  const [customLocation, setCustomLocation] = useState("경북 김천시");

  // 사용자가 직접 입력하는 회사 사실정보
  const [companyName, setCompanyName] = useState("");
  const [repName, setRepName] = useState("");
  const [hasFactory, setHasFactory] = useState(false);
  const [hasDirectProd, setHasDirectProd] = useState(false);
  const [confirmedWarranty, setConfirmedWarranty] = useState("");
  const [confirmedExperience, setConfirmedExperience] = useState("");

  const [activeViewTab, setActiveViewTab] = useState<"document" | "slides">("document");
  const [copied, setCopied] = useState(false);
  const [copiedSlideIdx, setCopiedSlideIdx] = useState<number | null>(null);

  const currentBid = useMemo(() => {
    if (selectedBidId === "custom") {
      return {
        id: "custom",
        title: customTitle,
        client: customClient,
        budget: Number(customBudget) || 50000000,
        budgetText: `${((Number(customBudget) || 50000000) / 100000000).toFixed(1)}억원`,
        category: customCategory,
        location: customLocation,
        verifiedRequirements: {
          license: "옥외광고사업 등록증 (필수)",
          directProduction: `직접생산확인 [${customCategory}]`,
          workPeriod: "착수일로부터 60일 이내",
          warrantyPeriod: "준공 후 2년 (5%)",
        },
      };
    }
    const found = initialBids.find((b) => b.id === selectedBidId);
    return found || initialBids[0];
  }, [selectedBidId, customTitle, customClient, customBudget, customCategory, customLocation, initialBids]);

  // 마크다운 제안서 본문 생성 (3단계 엄격 분리 및 [회사 확인 필요] 적용)
  const proposalDocumentText = useMemo(() => {
    const cName = companyName.trim() || "[회사 확인 필요: 회사명 입력]";
    const rName = repName.trim() || "[회사 확인 필요: 대표자명 입력]";
    const expText = confirmedExperience.trim() || "[회사 확인 필요: 실적 증명원 대조]";
    const warText = confirmedWarranty.trim() || "[회사 확인 필요: 공고문 기준 보증기간 확약]";
    const facText = hasFactory ? "자체 제작 설비 및 공장 보유" : "[회사 확인 필요: 공장등록증 유무 확인]";
    const dpText = hasDirectProd ? "유효 직접생산확인증명서 보유" : "[회사 확인 필요: SMPP 직생증명서 유효기간 확인]";

    return `================================================================================
과 업 수 행 계 획 서  및  입 찰  제 안 서  초 안
[ 사업명 : ${currentBid.title} ]
================================================================================

[ 1. 회사가 입력한 사실정보 (Company Facts) ]
• 제안 업체명: ${cName}
• 대 표 자 명: ${rName}
• 자체 제조설비: ${facText}
• 직접생산확인: ${dpText}
• 주요 수행실적: ${expText}
• 확약 보증기간: ${warText}

[ 2. 공고문에서 확인된 요구사항 (RFP Requirements) ]
• 발 주 기 관: ${currentBid.client}
• 주 요 품 목: ${currentBid.category}
• 필수 참가자격: ${currentBid.verifiedRequirements?.license || currentBid.checkList?.licenseRequired || "공고문 참조"}
• 직접생산세부: ${currentBid.verifiedRequirements?.directProduction || currentBid.checkList?.directProduction || "공고문 세부품명 일치 필수"}
• 과 업 기 한: ${currentBid.verifiedRequirements?.workPeriod || currentBid.checkList?.workPeriod || "계약체결일 기준 산정"}
• 보 증 조 건: ${currentBid.verifiedRequirements?.warrantyPeriod || currentBid.checkList?.warrantyPeriod || "준공 후 하자보증금 납부"}

[ 3. AI가 작성한 제안문 초안 (AI Draft Proposal) ]
■ 제1장. 사업의 목적 및 추진 방향
 1. 사업 이해도
   - 본 사업은 ${currentBid.client}의 옥외 공간 품격을 제고하고 이용자 안전을 확보하기 위한 과업입니다.
   - 발주기관의 공공디자인 가이드라인과 설치 환경 특성을 반영하여 표준 공정 프로세스를 수립합니다.

 2. 제안의 차별성
   - 시공 전 정밀 3D 실측 및 구조 안전 진단을 통한 설치 오차 제로화 추진 [회사 확인 필요: 3D 실측 가능 여부]
   - 내후성 및 안전성이 검증된 정품 규격 자재 우선 채택 [회사 확인 필요: 시험성적서 구비]

■ 제2장. 공정 및 품질 관리 계획
 1. 제작 공정 관리
   - 원자재 입고 검수 -> 정밀 가공/용접 -> 표면 도장 -> 전장 배선 -> 공장 출하 검사
 2. 현장 안전 및 시공 관리
   - 도로변 고소작업 시 보행자 안전통로 및 신호수 배치 [회사 확인 필요: 안전관리계획서 제출]
   - 작업자 안전보호구 착용 및 장비 안전검사증 구비

■ 제3장. 사후 관리 및 유지보수 계획
 1. 비상 대응 체계
   - 하자 발생 접수 시 전담 AS팀 긴급 현장 출동 및 원인 분석 [회사 확인 필요: 출동 가능 시간대 확약]
 2. 정기 점검 계획
   - 준공 후 태풍 및 집중호우 대비 구조 안전 정기 점검 실시

================================================================================
※ 안내: 본 문서는 AI가 작성한 초안입니다. 실제 제출 전 회사의 자격, 장비, 실적과 대조하여 반드시 최종 검토 및 수정하십시오.`;
  }, [currentBid, companyName, repName, hasFactory, hasDirectProd, confirmedExperience, confirmedWarranty]);

  // 슬라이드 데이터 (3단계 구분 반영)
  const presentationSlides = useMemo(() => {
    const cName = companyName.trim() || "[회사명 미입력]";
    return [
      {
        title: "1. 사업 이해 및 추진 전략",
        bullets: [
          `발주기관: ${currentBid.client} | 대상: ${currentBid.title}`,
          "원문 요구사항 준수 및 공공안전 최우선 설계",
          "철저한 사전 실측을 통한 공기 지연 리스크 원천 차단",
        ],
        type: "공고문 요구사항 기반",
      },
      {
        title: "2. 제안사 보유 역량 현황",
        bullets: [
          `제안사: ${cName}`,
          `공장/설비: ${hasFactory ? "자체 제작설비 보유" : "[회사 확인 필요]"}`,
          `직접생산: ${hasDirectProd ? "유효 증명서 보유" : "[회사 확인 필요]"}`,
          `수행실적: ${confirmedExperience || "[회사 확인 필요: 실적 증빙]"}`,
        ],
        type: "회사 입력 사실정보",
      },
      {
        title: "3. 품질 및 공정 관리 계획",
        bullets: [
          "원자재 공인 시험성적서 검증 후 공정 투입 [회사 확인 필요]",
          "고소작업 크레인 안전검사증 및 신호수 의무 배치",
          "준공 전 전수 조명 및 결선 절연저항 테스트 완료",
        ],
        type: "AI 제안 초안",
      },
      {
        title: "4. 사후 유지보수 및 비상대응",
        bullets: [
          `하자보증: ${confirmedWarranty || currentBid.verifiedRequirements?.warrantyPeriod || "[회사 확인 필요]"}`,
          "비상 연락망 24시간 가동 체계 [회사 확인 필요]",
          "정기 안전점검 및 유지보수 이력 관리",
        ],
        type: "AI 제안 초안",
      },
    ];
  }, [currentBid, companyName, hasFactory, hasDirectProd, confirmedExperience, confirmedWarranty]);

  const copyDoc = () => {
    navigator.clipboard.writeText(proposalDocumentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySlide = (idx: number, slideText: string) => {
    navigator.clipboard.writeText(slideText);
    setCopiedSlideIdx(idx);
    setTimeout(() => setCopiedSlideIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ⚠️ 상단 고정 안전 경고 안내문 (요구사항 1-9) */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>AI 제안서 안전 대조 안내</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          AI 제안서에는 <strong>확인되지 않은 내용이 포함될 수 있습니다.</strong> 제출 전 회사의 실제 보유 자격, 실적, 인력, 장비 및 공고 요구사항과 반드시 대조하십시오.
          검증되지 않은 항목은 <strong className="text-amber-300 font-mono">[회사 확인 필요]</strong>로 표시됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 회사 사실정보 및 공고 설정 패널 */}
        <div className="lg:col-span-4 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs sm:text-sm font-bold text-white">
            <Building className="w-4 h-4 text-blue-400" />
            <span>1. 회사 사실정보 직접 입력</span>
          </div>

          {/* 공고 선택 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              대상 공고
            </label>
            <select
              value={selectedBidId}
              onChange={(e) => setSelectedBidId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="custom">직접 과업명 입력</option>
              {initialBids.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title.substring(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          {/* 회사명 / 대표자명 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                회사명
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="예: (주)한국광고"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                대표자명
              </label>
              <input
                type="text"
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                placeholder="예: 대표자 성명"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          {/* 실제 증빙 가능 여부 체크 */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 block">
              보유 자격 체크 (직접 확인된 항목만 선택)
            </span>

            <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-950 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                checked={hasFactory}
                onChange={(e) => setHasFactory(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">자체 공장/제작설비 보유 증빙 가능</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-950 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                checked={hasDirectProd}
                onChange={(e) => setHasDirectProd(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">직접생산확인증명서 보유 확인</span>
            </label>
          </div>

          {/* 실적 요약 입력 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              대표 실적 (직접 증빙 가능한 실적만 입력)
            </label>
            <input
              type="text"
              value={confirmedExperience}
              onChange={(e) => setConfirmedExperience(e.target.value)}
              placeholder="예: 지자체 간판사업 3건 완료"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          {/* 보증기간 확약 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              확약 하자보증 조건
            </label>
            <input
              type="text"
              value={confirmedWarranty}
              onChange={(e) => setConfirmedWarranty(e.target.value)}
              placeholder="예: 준공 후 2년 무상 A/S"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
        </div>

        {/* 우측: 3단계 구분 제안서 뷰어 */}
        <div className="lg:col-span-8 space-y-4">
          {/* 뷰 탭 전환 */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveViewTab("document")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeViewTab === "document"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>표준 제안서 초안</span>
              </button>

              <button
                onClick={() => setActiveViewTab("slides")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeViewTab === "slides"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>PT 슬라이드 요약</span>
              </button>
            </div>

            {activeViewTab === "document" && (
              <button
                onClick={copyDoc}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "전체 복사됨" : "제안서 전문 복사"}</span>
              </button>
            )}
          </div>

          {activeViewTab === "document" ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
              {/* 3가지 구분 안내 배너 */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                <div className="bg-blue-950/40 p-2 rounded-lg border border-blue-500/30 text-blue-300 font-semibold">
                  1. 회사 사실정보
                </div>
                <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 text-emerald-300 font-semibold">
                  2. 공고문 요구사항
                </div>
                <div className="bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/30 text-cyan-300 font-semibold">
                  3. AI 제안문 초안
                </div>
              </div>

              {/* 제안서 텍스트 영역 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                {proposalDocumentText}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {presentationSlides.map((slide, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                        {slide.type}
                      </span>
                      <button
                        onClick={() =>
                          copySlide(
                            idx,
                            `${slide.title}\n${slide.bullets.map((b) => `• ${b}`).join("\n")}`
                          )
                        }
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                      >
                        {copiedSlideIdx === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {slide.title}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {slide.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-blue-400 shrink-0">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
