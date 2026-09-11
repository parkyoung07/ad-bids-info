"use client";

import React, { useState } from "react";
import { ExternalLink, Copy, Check, Info, ShieldCheck, Building2 } from "lucide-react";

interface SourceGuideCardProps {
  sourceName: string;
  announcementNo: string;
  sourceLinkUrl: string;
  clientName: string;
  bidType?: string;
}

export default function SourceGuideCard({
  sourceName,
  announcementNo,
  sourceLinkUrl,
  clientName,
  bidType,
}: SourceGuideCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(announcementNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isG2B = sourceName.includes("조달청") || sourceName.includes("나라장터");
  const isS2B = sourceName.includes("학교장터") || sourceName.includes("S2B");
  const isKapt = sourceName.includes("K-apt") || sourceName.includes("아파트");

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-5 border border-slate-700/70 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm sm:text-base font-extrabold text-white">
            {sourceName} 공식 원문 조회 및 전자입찰 안내
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-400/30">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          공식 데이터 연동
        </span>
      </div>

      {/* 공고번호 복사 및 바로가기 바 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">발주기관 공식 공고번호</span>
          <div className="flex items-center gap-2">
            <code className="text-sm sm:text-base font-bold font-mono text-cyan-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              {announcementNo}
            </code>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white"
              }`}
              title="공고번호 클립보드 복사"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>번호 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1 flex flex-col justify-end">
          <span className="text-[11px] text-slate-400 font-medium">발주기관 / 계약구분</span>
          <p className="text-xs font-bold text-slate-200 truncate">
            {clientName} {bidType ? `(${bidType})` : ""}
          </p>
        </div>
      </div>

      {/* 시스템별 맞춤 원문 열람 안내 가이드 */}
      <div className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-blue-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{sourceName} 원문 시방서 및 공고문 열람 3초 가이드</span>
        </div>

        {isS2B ? (
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 pl-1 leading-relaxed">
            <li>위 <strong>공고번호({announcementNo})</strong>를 [번호 복사] 버튼으로 복사합니다.</li>
            <li>아래 <strong>[학교장터(S2B) 공식 포털 열기]</strong> 버튼을 클릭하여 S2B 시스템에 접속합니다.</li>
            <li>S2B 상단 <strong>[1인수의(견적요청)]</strong> 또는 <strong>[안내공고]</strong> 메뉴 검색창에 공고번호를 붙여넣기(Ctrl+V) 하시면 세부 시방서·내역서를 즉시 열람 및 다운로드하실 수 있습니다.</li>
          </ol>
        ) : isKapt ? (
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 pl-1 leading-relaxed">
            <li>위 <strong>공고번호({announcementNo})</strong>를 [번호 복사] 버튼으로 복사합니다.</li>
            <li>아래 <strong>[K-apt 공동주택 입찰공고 열기]</strong> 버튼을 클릭하여 전자입찰 목록으로 이동합니다.</li>
            <li>검색창에 아파트 단지명(<strong>{clientName}</strong>) 또는 공고번호를 입력하시면 공식 공고문과 현장설명회 서류를 확인하실 수 있습니다.</li>
          </ol>
        ) : (
          <p className="text-[11px] text-slate-300 leading-relaxed">
            조달청 나라장터 공식 1:1 직통 연동을 통해 아래 버튼 클릭 시 해당 공고 원문 및 첨부파일(과업지시서, 시방서) 페이지로 즉시 이동합니다.
          </p>
        )}
      </div>

      {/* 발주처 시스템 공식 바로가기 버튼 */}
      {sourceLinkUrl && (
        <div className="pt-1">
          <a
            href={sourceLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCopy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>{sourceName} 공식 포털 열기 및 원문 확인</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
