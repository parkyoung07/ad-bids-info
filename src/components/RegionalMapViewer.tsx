import React from "react";
import { MapPin, Building2 } from "lucide-react";

interface RegionalStat {
  region: string;
  name: string;
  count: number;
  code: string;
}

interface RegionalMapViewerProps {
  regionalStats: RegionalStat[];
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  totalCount: number;
}

export default function RegionalMapViewer({
  regionalStats,
  selectedRegion,
  onSelectRegion,
  totalCount,
}: RegionalMapViewerProps) {
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-indigo-500/30 p-5 sm:p-6 shadow-xl space-y-5">
      {/* 헤더 타이틀 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🗺️ 전국 17개 시·도 옥외광고 등록업체 현황</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                행정안전부 공식 데이터
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              지역을 클릭하시면 해당 시·도의 공식 등록 면허 업체를 즉시 조회할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            전국 총 <strong className="text-indigo-300 font-bold">{totalCount.toLocaleString()}</strong>개사 등록
          </span>
          <button
            onClick={() => onSelectRegion("전체")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedRegion === "전체"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            전국 전체
          </button>
        </div>
      </div>

      {/* 전국 17개 시·도 인터랙티브 카드 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {regionalStats.map((item) => {
          const isSelected = selectedRegion === item.region;
          return (
            <button
              key={item.region}
              type="button"
              onClick={() => onSelectRegion(item.region)}
              className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5 ${
                isSelected
                  ? "bg-gradient-to-br from-indigo-950/80 to-purple-950/60 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500"
                  : "bg-slate-950/60 border-slate-800 hover:border-indigo-500/40 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs sm:text-sm font-bold flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
                  <MapPin className={`w-3 h-3 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                  {item.region}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/80" />
                )}
              </div>

              <div className="flex items-baseline justify-between w-full pt-1">
                <span className="text-[11px] font-mono font-bold text-indigo-300">
                  {item.count.toLocaleString()}
                  <span className="text-[10px] font-normal text-slate-400 ml-0.5">개사</span>
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  {((item.count / totalCount) * 100).toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
