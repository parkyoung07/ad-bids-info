"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users2,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Clock,
} from "lucide-react";

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState<"notice" | "roadmap">("notice");

  // 향후 6단계 인증 상태 데이터 구조
  const certificationLevels = [
    {
      level: 1,
      title: "공공데이터 등록업체",
      desc: "지자체 옥외광고사업 등록대장 및 공공구매종합정보망(SMPP) 기본 데이터 일치 확인",
      badge: "공공데이터 확인",
      badgeColor: "bg-slate-800 text-slate-300 border-slate-700",
    },
    {
      level: 2,
      title: "업체 본인확인 완료",
      desc: "사업자등록증명원 및 대표자/담당자 휴대폰 본인확인(KCB/NICE) 인증 완료",
      badge: "본인인증 완료",
      badgeColor: "bg-blue-500/15 text-blue-300 border-blue-400/30",
    },
    {
      level: 3,
      title: "면허서류 확인",
      desc: "옥외광고사업등록증, 정보통신공사업, 전기공사업 등 필수 법정 면허 사본 검증 완료",
      badge: "면허서류 검증",
      badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30",
    },
    {
      level: 4,
      title: "직접생산확인 검증",
      desc: "중소벤처기업부 발급 직접생산확인증명서 세부품명 10자리 번호 및 유효기간 실시간 검증",
      badge: "직접생산 검증",
      badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
    },
    {
      level: 5,
      title: "거래후기 보유",
      desc: "실제 공공입찰 공동도급 또는 관공서 납품 외주 시공 완료 포트폴리오 및 원청사 평가 보유",
      badge: "시공실적 보유",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    },
    {
      level: 6,
      title: "SignBid 인증 협력사",
      desc: "1~5단계 전체 검증을 통과하고 현장 실사 및 책임시공 서약서를 제출한 최상위 파트너",
      badge: "SignBid 공식 인증",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    },
  ];

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 헤더 안내 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30">
            <Lock className="w-3 h-3 text-amber-400" />
            협력사 DB 임시 정비 안내
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          협력사 및 공동수급 파트너 네트워크
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          옥외광고 사업자 간 신뢰할 수 있는 외주·시공·면허 제휴를 위해 공식 인증 절차를 준비 중입니다.
        </p>
      </div>

      {/* ⚠️ 메인 비공개 및 준비 안내 카드 (요구사항 1-8 준수) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">
              현재 공식 공공데이터와 업체 본인인증 절차를 준비하고 있습니다.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              SignBid AI는 이용자 보호와 공공입찰 데이터의 신뢰성을 최우선으로 합니다.
              이에 따라 <strong>실제 사업체 여부 및 공식 면허가 검증되지 않은 가상 업체정보는 화면에 일체 공개하지 않습니다.</strong>
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              정부 공공마이데이터 및 지자체 옥외광고사업 등록 API 연동이 완료되는 대로 엄격한 본인인증을 통과한 검증 협력사 매칭 서비스를 오픈할 예정입니다.
            </p>
          </div>
        </div>

        {/* 진행 상태 바 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300">
              현재 단계: <strong className="text-cyan-300">공공데이터 등록부 대조 및 본인인증 모듈 구축 중</strong>
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            검증된 협력사라는 표현은 인증 완료 업체에만 적용됩니다.
          </span>
        </div>
      </div>

      {/* 향후 6단계 인증 상태 데이터 구조 안내 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-400" />
            <span>협력사 신뢰 인증 6단계 표준 체계</span>
          </h2>
          <span className="text-xs text-slate-500">
            향후 오픈 예정 기준
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {certificationLevels.map((item) => (
            <div
              key={item.level}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    STEP 0{item.level}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 협력사 사전 등록 문의 배너 */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">
            옥외광고 제조공장·스카이 장비·전문 시공사 사전 파트너 등록
          </h3>
          <p className="text-xs text-slate-400">
            인증 시스템 오픈 시 우선 등록을 희망하시는 사업자분들은 고객지원팀으로 문의해 주시기 바랍니다.
          </p>
        </div>

        <a
          href="mailto:support@signbidai.com"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors shrink-0"
        >
          <span>사전 등록 문의</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
