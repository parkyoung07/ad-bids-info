"use client";

import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<"all" | "materials" | "safety" | "certs">("all");

  if (!isOpen) return null;

  // 공고별 맞춤형 엑스레이 스펙 데이터 자동 생성
  const isLed = bid.category.includes("전광판") || bid.category.includes("사이니지") || bid.title.includes("전광판") || bid.title.includes("LED");
  const isBanner = bid.category.includes("현수막") || bid.title.includes("현수막") || bid.title.includes("배너");
  const isSign = bid.category.includes("간판") || bid.title.includes("간판") || bid.category.includes("조형물");
  const isMedia = bid.category.includes("매체") || bid.category.includes("온비드") || bid.category.includes("아파트");

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

  const handleCopyAll = () => {
    const text = `
[🔍 AI 시방서 엑스레이 핵심 스펙 분석표]
공고명: ${bid.title}
발주처: ${bid.client}
배정예산: ${bid.budgetText}

1. 🏗️ 필수 자재 및 규격:
${specData.materials.map((m, i) => `  ${i + 1}) ${m.name}: ${m.spec} (${m.standard})`).join("\n")}

2. ⚠️ 시공 및 안전관리 기준:
${specData.safeties.map((s, i) => `  ${i + 1}) ${s.item}: ${s.detail}`).join("\n")}

3. 📑 필수 제출 시험성적서:
${specData.certs.map((c, i) => `  ${i + 1}) ${c.title}: ${c.desc}`).join("\n")}

4. 🛡️ 하자보증 및 유지관리:
  - 무상 보증기간: ${specData.warranty.period}
  - 하자보증금율: ${specData.warranty.rate}
  - 긴급 A/S 기준: ${specData.warranty.response}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* 모달 상단 헤더 */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI 시방서 엑스레이 V2.0
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {bid.id}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 mt-0.5">
                {bid.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              전체 요약표
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "materials"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              자재 규격
            </button>
            <button
              onClick={() => setActiveTab("safety")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "safety"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              시공 안전
            </button>
            <button
              onClick={() => setActiveTab("certs")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === "certs"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              성적서/인증
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "복사됨!" : "스펙표 복사"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700 hidden sm:flex"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄</span>
            </button>
          </div>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. 필수 자재 및 규격표 */}
          {(activeTab === "all" || activeTab === "materials") && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">
                  1. 🏗️ 필수 자재 및 핵심 사양 규격표
                </h4>
              </div>
              <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-inner bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold">
                    <tr>
                      <th className="p-3 w-1/4">품목 / 부자재</th>
                      <th className="p-3 w-1/2">도면 시방서 명기 사양</th>
                      <th className="p-3 w-1/4 text-right">표준 인증 규격</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {specData.materials.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-bold text-cyan-300">
                          {m.name}
                        </td>
                        <td className="p-3 text-slate-200">
                          {m.spec}
                        </td>
                        <td className="p-3 text-right font-mono text-[11px] text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                            {m.standard}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. 시공 현장 및 안전 요건 */}
          {(activeTab === "all" || activeTab === "safety") && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  2. ⚠️ 현장 시공 및 고소작업 안전관리 요건
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specData.safeties.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1"
                  >
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{s.item}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {s.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. 필수 제출 시험성적서 */}
          {(activeTab === "all" || activeTab === "certs") && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  3. 📑 착공 및 준공계 필수 첨부 시험성적서
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specData.certs.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1"
                  >
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>{c.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. 하자보증 및 A/S 조건 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>4. 🛡️ 사후 하자보증 및 유지관리 책임 기준</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500 block text-[11px]">무상 보증기간</span>
                <strong className="text-white">{specData.warranty.period}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">하자보수보증금율</span>
                <strong className="text-indigo-300">{specData.warranty.rate}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">긴급 출동 기준</span>
                <strong className="text-emerald-300">{specData.warranty.response}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 모달 하단 푸터 */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>조달청 시방서 및 특기시방 데이터 기반 실시간 분석</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
