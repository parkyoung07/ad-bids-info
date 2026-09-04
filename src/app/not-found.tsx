import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
            404 NOT FOUND
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            존재하지 않거나 삭제된 공고입니다
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            요청하신 공고는 존재하지 않거나, 실시간 공공데이터 원문 검증 과정에서 삭제 처리된 공고입니다.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>메인 홈으로</span>
          </Link>
          <Link
            href="/calendar"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>캘린더 탐색</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
