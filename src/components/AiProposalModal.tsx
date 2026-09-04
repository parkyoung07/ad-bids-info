"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  FileText,
  Presentation,
  Copy,
  Check,
  AlertCircle,
  Building,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface AiProposalModalProps {
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
    checkList?: {
      workPeriod?: string;
      warrantyPeriod?: string;
      licenseRequired?: string;
      directProduction?: string;
    };
    verifiedRequirements?: {
      license?: string;
      directProduction?: string;
      workPeriod?: string;
      warrantyPeriod?: string;
    };
  };
}

export default function AiProposalModal({
  isOpen,
  onClose,
  bid,
}: AiProposalModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [repName, setRepName] = useState("");
  const [hasFactory, setHasFactory] = useState(false);
  const [hasDirectProd, setHasDirectProd] = useState(false);
  const [confirmedWarranty, setConfirmedWarranty] = useState("");
  const [confirmedExperience, setConfirmedExperience] = useState("");

  const [activeViewTab, setActiveViewTab] = useState<"document" | "slides">("document");
  const [copied, setCopied] = useState(false);

  // 제안서 전문 생성 (3단계 구분 & 확인 필요 처리)
  const proposalDocumentText = useMemo(() => {
    const cName = companyName.trim() || "[회사 확인 필요: 제안사명]";
    const rName = repName.trim() || "[회사 확인 필요: 대표자명]";
    const expText = confirmedExperience.trim() || "[회사 확인 필요: 실적 증빙 확인]";
    const warText = confirmedWarranty.trim() || "[회사 확인 필요: 보증기간 확약]";
    const facText = hasFactory ? "자체 제작 설비 및 공장 보유" : "[회사 확인 필요: 공장등록증 확인]";
    const dpText = hasDirectProd ? "유효 직접생산확인증명서 보유" : "[회사 확인 필요: SMPP 증명서 확인]";

    return `================================================================================
과 업 수 행 계 획 서  및  입 찰  제 안 서  초 안
[ 사업명 : ${bid.title} ]
================================================================================

[ 1. 회사가 입력한 사실정보 (Company Facts) ]
• 제안 업체명: ${cName}
• 대 표 자 명: ${rName}
• 자체 제조설비: ${facText}
• 직접생산확인: ${dpText}
• 주요 수행실적: ${expText}
• 확약 보증기간: ${warText}

[ 2. 공고문에서 확인된 요구사항 (RFP Requirements) ]
• 발 주 기 관: ${bid.client}
• 주 요 품 목: ${bid.category}
• 필수 참가자격: ${bid.verifiedRequirements?.license || bid.checkList?.licenseRequired || "공고문 참조"}
• 직접생산세부: ${bid.verifiedRequirements?.directProduction || bid.checkList?.directProduction || "공고문 세부품명 일치 필수"}
• 과 업 기 한: ${bid.verifiedRequirements?.workPeriod || bid.checkList?.workPeriod || "계약체결일 기준 산정"}
• 보 증 조 건: ${bid.verifiedRequirements?.warrantyPeriod || bid.checkList?.warrantyPeriod || "준공 후 하자보증금 납부"}

[ 3. AI가 작성한 제안문 초안 (AI Draft Proposal) ]
■ 제1장. 사업의 목적 및 추진 방향
 1. 사업 이해도
   - 본 사업은 ${bid.client}의 옥외 공간 품격을 제고하고 이용자 안전을 확보하기 위한 과업입니다.
   - 발주기관의 공공디자인 가이드라인과 설치 환경 특성을 반영하여 표준 공정 프로세스를 수립합니다.

 2. 제안의 차별성
   - 시공 전 정밀 3D 실측 및 구조 안전 진단을 통한 설치 오차 제로화 추진 [회사 확인 필요: 3D 실측 장비 유무]
   - 내후성 및 안전성이 검증된 정품 규격 자재 우선 채택 [회사 확인 필요: 시험성적서 구비]

■ 제2장. 공정 및 품질 관리 계획
 1. 제작 공정 관리
   - 원자재 입고 검수 -> 정밀 가공/용접 -> 표면 도장 -> 전장 배선 -> 공장 출하 검사
 2. 현장 안전 및 시공 관리
   - 도로변 고소작업 시 보행자 안전통로 및 신호수 배치 [회사 확인 필요: 안전관리계획 수립]
   - 작업자 안전보호구 착용 및 장비 안전검사증 구비

■ 제3장. 사후 관리 및 유지보수 계획
 1. 비상 대응 체계
   - 하자 발생 접수 시 전담 AS팀 긴급 현장 출동 및 원인 분석 [회사 확인 필요: 출동 가능 시간대 확약]
 2. 정기 점검 계획
   - 준공 후 태풍 및 집중호우 대비 구조 안전 정기 점검 실시

================================================================================
※ 안내: 본 문서는 AI가 작성한 초안입니다. 실제 제출 전 회사의 자격, 장비, 실적과 대조하여 반드시 최종 검토 및 수정하십시오.`;
  }, [bid, companyName, repName, hasFactory, hasDirectProd, confirmedExperience, confirmedWarranty]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(proposalDocumentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* 상단 모달 헤더 */}
        <div className="bg-slate-950 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                AI 입찰 제안서 초안 작성기
              </h3>
              <p className="text-xs text-slate-400">
                공고문 요구조건과 회사 사실정보를 대조하여 표준 제안서 초안을 구성합니다.
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

        {/* 상단 안전 경고 바 */}
        <div className="bg-amber-950/20 px-5 sm:px-6 py-2.5 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="leading-relaxed">
            AI 제안서에는 확인되지 않은 내용이 포함될 수 있습니다. 제출 전 회사의 실제 보유 자격, 실적, 장비 및 공고 요구사항과 반드시 대조하십시오.
          </p>
        </div>

        {/* 본문 영역 */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* 입력 필드 (회사 사실정보) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Building className="w-4 h-4 text-blue-400" />
              <span>제안사 사실정보 입력 (선택 입력)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">회사명</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="예: (주)한국광고"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">대표자명</label>
                <input
                  type="text"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="예: 대표자 성명"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFactory}
                  onChange={(e) => setHasFactory(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">자체 공장/설비 보유</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDirectProd}
                  onChange={(e) => setHasDirectProd(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">직접생산확인 보유</span>
              </label>
            </div>
          </div>

          {/* 제안서 텍스트 뷰어 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
            {proposalDocumentText}
          </div>
        </div>

        {/* 푸터 */}
        <div className="bg-slate-950 px-5 sm:px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "복사 완료!" : "제안서 초안 복사"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
