"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Printer,
  AlertTriangle,
  Building2,
  FileCheck2,
  Cpu,
  Truck,
  AlertOctagon,
  CheckCircle2,
  Square,
  CheckSquare,
  BadgeCheck,
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
    tags?: string[];
  };
}

export default function AiSpecXrayModal({
  isOpen,
  onClose,
  bid,
}: AiSpecXrayModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "compliance" | "materials" | "safety" | "certs">("all");

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    doc1: true,
    doc2: true,
    doc3: true,
    doc4: false,
    doc5: true,
    doc6: false,
    doc7: true,
  });

  if (!isOpen) return null;

  // 공고별 맞춤형 엑스레이 스펙 데이터 자동 생성
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
    ? "안내전광판(5512240201)"
    : isBanner
    ? "현수막·배너(5512150201)"
    : isSign
    ? "간판(5512190101) / 안내판(5512171801)"
    : "광고대행(8210150101)";

  const complianceDocs = [
    { id: "doc1", title: "옥외광고사업 등록증", desc: "시·군·구청 발행 유효 등록증", required: true, penalty: "실격" },
    { id: "doc2", title: `직접생산확인증명서 [${directCode}]`, desc: "SMPP 10자리 세부품명 일치 필수", required: true, penalty: "실격" },
    { id: "doc3", title: "중소기업·소상공인 확인서", desc: "중소벤처기업부 발급 유효기간 확인", required: true, penalty: "실격" },
    { id: "doc4", title: "공장등록증 또는 제작설비 증빙", desc: "자사 직접생산 공장/설비 등록증", required: true, penalty: "실격" },
    { id: "doc5", title: "기업신용평가등급 확인서", desc: "조달청 제출용 유효 신용평가서 (B0 이상)", required: true, penalty: "감점" },
    { id: "doc6", title: "사용인감계 및 인감증명서", desc: "제안서 날인용 최근 3개월분", required: false, penalty: "보완요구" },
    { id: "doc7", title: "국세·지방세·4대보험 완납증명서", desc: "투찰 마감일 기준 미납 없음 증명", required: true, penalty: "계약취소" },
  ];

  const riskRules = [
    {
      level: "danger",
      title: "직접생산확인증명서 세부품명 번호 불일치",
      desc: "공고 세부품목코드와 1자리라도 다르면 즉시 실격(0점) 처리됩니다.",
      solution: "SMPP 사이트에서 보유 품목 번호를 재확인하세요.",
    },
    {
      level: "danger",
      title: `지역제한 [${bid.location}] 관내 사업장 요건`,
      desc: "공고일 전일부터 계약일까지 주된 영업소 소재지를 유지해야 합니다.",
      solution: "법인등기부등본 및 사업자등록증 주소지를 확인하세요.",
    },
    {
      level: "warning",
      title: "복합면허 요구 시 단독 투찰 주의",
      desc: isLed ? "정보통신공사업 면허 추가 요구 가능" : "전기 인입 공사 포함 여부 확인 필요",
      solution: "필요 시 협력사 DB를 통해 공동수급 협정을 맺으세요.",
    },
  ];

  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / complianceDocs.length) * 100);

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const specData = {
    materials: isLed
      ? [
          { name: "LED 디스플레이 모듈", spec: "Pixel Pitch 2.0mm~3.0mm 실내외 겸용 고해상도 SMD 패키지", standard: "KS C 7653 / KC 안전인증" },
          { name: "휘도(밝기) 및 시야각", spec: "최대 6,500cd/㎡ 이상 (야간 자동 디밍 센서 내장), 수평 160° / 수직 140°", standard: "공인 시험기관 성적서" },
          { name: "전원 공급장치 (SMPS)", spec: "고효율 PFC 내장 방우형 300W~400W 모듈 분산 배치", standard: "IP67 방수 / KS 인증" },
          { name: "프레임 및 외함 캐비닛", spec: "알루미늄 다이캐스팅 초경량 슬림 캐비닛 (부식 방지 아노다이징 처리)", standard: "내풍압 45m/s 구조계산서" },
          { name: "통합 제어 CMS 시스템", spec: "클라우드 원격 영상 송출 및 실시간 상태 모니터링 컨트롤러", standard: "GS인증 1등급 소프트웨어" },
        ]
      : isBanner
      ? [
          { name: "원단 재질 및 평량", spec: "고강력 폴리에스터 타포린 및 친환경 PET 배너 원단 (550g/㎡ 이상)", standard: "KFI 공인 방염필증" },
          { name: "인쇄 방식 및 해상도", spec: "UV 6색 듀얼 헤드 1,440dpi 실사출력 (내후성 2년 이상 무변색)", standard: "친환경 그린가드 인증 잉크" },
          { name: "마감 및 가공 방식", spec: "사방 열풍 고주파 융착 + 50cm 간격 아일렛(황동 하도메) 펀칭 + 로프 미싱", standard: "인장강도 120kgf 이상" },
          { name: "게첨 및 고정 부자재", spec: "내부식성 스테인리스(SUS304) 와이어로프(Ø4mm) 및 턴버클 체결", standard: "풍속 25m/s 탈락 방지" },
        ]
      : isSign
      ? [
          { name: "메인 프레임 및 바", spec: "아연도금 갈바륨(GI 1.6T~2.0T) 레이저 정밀 절단 및 옥외용 분체도장", standard: "KS D 3506 규격품" },
          { name: "입체 채널 문자", spec: "알루미늄 1.2T 캡채널 + 일체형 에폭시 면발광 (두께 80mm~100mm)", standard: "난연 1등급 V0 소재" },
          { name: "발광 조명 (LED)", spec: "방수 3구 광확산 렌즈 LED 모듈 (0.72W, 6,500K 쿨화이트, 100lm/W)", standard: "IP68 완전방수 / 삼성칩" },
          { name: "조명 전원 (SMPS)", spec: "정전압 방우형 SMPS (정격출력의 70% 이내 부하 설계 적용)", standard: "KC 전자기적합성 등록" },
          { name: "전면 발광 커버", spec: "수입산 광확산 폴리카보네이트(PC 3.0T) 및 옥외용 조명용 시트", standard: "충격강도 유리 250배" },
        ]
      : [
          { name: "미디어 패널 모니터", spec: "21.5인치 ~ 55인치 상업용 IPS 고휘도 논글레어 디지털 패널 (16:9)", standard: "KC 방송통신기자재 인증" },
          { name: "외함 보호 하우징", spec: "냉간압연강판(SPCC 1.2T) 분체도장 + 강화유리(4.0T) 비산방지 필름", standard: "IK08 충격보호등급" },
          { name: "운영 소프트웨어", spec: "LTE/5G 무선망 기반 클라우드 스케줄링 및 아파트 공지 연동 시스템", standard: "보안 적합성 검증" },
        ],

    safeties: [
      { item: "고소작업 장비", detail: "3.5톤~5톤 스카이 크레인 장비검사 합격증 및 안전인증서 필수 제출" },
      { item: "도로점용 및 통제", detail: "관할 경찰서/구청 도로점용 허가 득 및 보행자 안전통로 펜스(2m) 설치" },
      { item: "안전관리 인력", detail: "신호수 2인 상시 배치, 작업자 안전모·안전벨트(2열 안전로프) 100% 착용" },
      { item: "야간/특수 시공", detail: "유동인구 밀집 지역 심야(22:00~06:00) 작업 준수 및 저소음 발전기 사용" },
    ],

    certs: [
      { title: "한국소방산업기술원(KFI) 방염성적서", desc: "실내외 화재 안전 기준 통과 증빙 (원단 및 합성수지)" },
      { title: "IP67 / IP68 방수·방진 공인 시험성적서", desc: "우천 및 태풍 시 침수 방지 및 누전 차단 성능 확인" },
      { title: "직접생산확인증명서 (SMPP)", desc: "중소기업유통센터 발급 유효 기간 내 증명서" },
      { title: "구조안전확인서 및 내풍압 계산서", desc: "건축구조기술사 날인 45m/s 강풍 안전 검증 (대형 간판·전광판)" },
    ],

    warranty: {
      period: "준공(납품) 검수 완료일로부터 2개년 (전광판/미디어 3년)",
      rate: "하자보수보증금율 5% (서울보증보험 하자이행증권 제출)",
      response: "A/S 접수 후 24시간 이내 현장 출동 및 긴급 복구 원칙",
    },
  };

  const handleCopy = () => {
    const text = `
[🔍 AI 시방서 엑스레이 & 실격방지 매트릭스]
공고명: ${bid.title}
발주처: ${bid.client}
배정예산: ${bid.budgetText}

■ 필수 서류 체크 현황 (${checkedCount}/${complianceDocs.length}건):
${complianceDocs.map((d) => `  [${checkedDocs[d.id] ? "완료(O)" : "미비(X)"}] ${d.title}`).join("\n")}

■ 필수 자재 규격:
${specData.materials.map((m, i) => `  ${i + 1}) ${m.name}: ${m.spec} (${m.standard})`).join("\n")}

■ 하자보증: ${specData.warranty.period}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* 모달 헤더 */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  <span>AI 시방서 엑스레이 & 컴플라이언스</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                    3초 추출
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md sm:max-w-xl">
                {bid.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "all" ? "bg-cyan-600 text-white shadow-sm" : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            전체 요약
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === "compliance" ? "bg-rose-600 text-white shadow-sm" : "bg-slate-800/80 text-rose-300 hover:text-rose-200 border border-rose-500/20"
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>📋 필수서류 매트릭스</span>
          </button>
          <button
            onClick={() => setActiveTab("materials")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "materials" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            자재 규격표
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "safety" ? "bg-amber-600 text-white shadow-sm" : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            안전 요건
          </button>
          <button
            onClick={() => setActiveTab("certs")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "certs" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            필수 성적서
          </button>
        </div>

        {/* 모달 본문 (스크롤) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* 🌟 필수서류 & 실격방지 매트릭스 */}
          {(activeTab === "all" || activeTab === "compliance") && (
            <div className="space-y-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>📋 7대 필수서류 점검 & 실격 방지 (GovDash 방식)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-300">
                    준비율: <strong className="text-cyan-400">{progressPercent}%</strong>
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      progressPercent >= 80
                        ? "bg-emerald-500/20 text-emerald-300"
                        : progressPercent >= 50
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {progressPercent >= 80 ? "🟢 투찰가능" : progressPercent >= 50 ? "🟡 보완필요" : "🔴 실격위험"}
                  </span>
                </div>
              </div>

              {/* 체크리스트 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {complianceDocs.map((doc) => {
                  const isChecked = !!checkedDocs[doc.id];
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isChecked ? "bg-emerald-950/20 border-emerald-500/40 text-slate-200" : "bg-slate-900 border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isChecked ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                        <span className={`text-[11px] font-bold truncate ${isChecked ? "text-white" : "text-slate-300"}`}>{doc.title}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 ${isChecked ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>
                        {isChecked ? "완료" : doc.penalty}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 실격위험 안내 */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {riskRules.map((r, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                    <span className="font-bold text-rose-300 block truncate">🚨 {r.title}</span>
                    <p className="text-slate-400 text-[10px] leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1. 자재 규격표 */}
          {(activeTab === "all" || activeTab === "materials") && (
            <div className="space-y-3">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>1. 🏗️ 필수 자재 및 핵심 사양 규격표</span>
              </h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold text-[11px]">
                    <tr>
                      <th className="p-2.5">품목</th>
                      <th className="p-2.5">도면 시방서 사양</th>
                      <th className="p-2.5 text-right">인증 규격</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {specData.materials.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="p-2.5 font-bold text-cyan-300">{m.name}</td>
                        <td className="p-2.5 text-slate-300">{m.spec}</td>
                        <td className="p-2.5 text-right font-mono text-[10px] text-slate-400">{m.standard}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. 안전 요건 */}
          {(activeTab === "all" || activeTab === "safety") && (
            <div className="space-y-3">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>2. ⚠️ 현장 시공 및 고소작업 안전관리 요건</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {specData.safeties.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{s.item}</span>
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. 필수 성적서 */}
          {(activeTab === "all" || activeTab === "certs") && (
            <div className="space-y-3">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>3. 📑 착공·준공계 필수 첨부 시험성적서</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {specData.certs.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{c.title}</span>
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 하자보증 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">무상 보증기간 및 보증금율</span>
              <span className="font-bold text-white">{specData.warranty.period} (보증금율 {specData.warranty.rate})</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">긴급 A/S 출동</span>
              <span className="font-bold text-emerald-400">{specData.warranty.response}</span>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "클립보드 복사 완료!" : "전체 스펙 & 서류목록 복사"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
}
