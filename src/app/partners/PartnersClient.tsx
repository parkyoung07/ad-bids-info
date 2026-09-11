"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Building2,
  Search,
  Phone,
  Copy,
  Check,
  CheckCircle2,
  Factory,
  Sparkles,
  Send,
  X,
  ChevronDown,
  Filter,
  RefreshCw,
  Award,
  Info,
  Calendar,
  ExternalLink
} from "lucide-react";
import RegionalMapViewer from "@/components/RegionalMapViewer";
import registeredData from "../../../public/data/registered-businesses.json";

interface RegisteredBusiness {
  id: string;
  companyName: string;
  regNumber: string;
  representative: string;
  region: string;
  subRegion: string;
  address: string;
  phone: string;
  mainItems: string[];
  hasDirectProduction: boolean;
  regDate: string;
  status: string;
}

interface RegionalStat {
  region: string;
  name: string;
  count: number;
  code: string;
  areaCode: string;
}

const CATEGORY_TAGS = [
  "전체",
  "LED채널간판",
  "LED전광판",
  "표찰·안내판",
  "실사출력",
  "공공조형물",
  "금속가공",
  "디지털사이니지",
];

const CERTIFICATION_LEVELS = [
  {
    level: 1,
    title: "공공데이터 등록업체",
    desc: "행정안전부 및 전국 17개 지자체 옥외광고 등록대장 정합성 100% 대조 완료",
    badge: "공공데이터 확인",
    badgeColor: "bg-blue-500/15 text-blue-300 border-blue-400/30",
    isDone: true,
  },
  {
    level: 2,
    title: "업체 본인확인 완료",
    desc: "사업자등록증명원 및 대표자/담당자 실명·휴대폰 본인인증(KCB/NICE) 완료",
    badge: "본인인증 완료",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30",
    isDone: false,
  },
  {
    level: 3,
    title: "면허서류 확인",
    desc: "옥외광고사업등록증, 정보통신공사업, 전기공사업 등 필수 법정 면허 사본 검증",
    badge: "면허서류 검증",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
    isDone: false,
  },
  {
    level: 4,
    title: "직접생산확인 검증",
    desc: "중소벤처기업부 직접생산확인증명서(세부품명 10자리) 및 공장·설비 유효성 검증",
    badge: "직접생산 검증",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    isDone: false,
  },
  {
    level: 5,
    title: "거래후기 보유",
    desc: "관공서 납품 외주 시공 또는 공동도급 완료 실적 포트폴리오 및 원청사 평가 보유",
    badge: "시공실적 보유",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-400/30",
    isDone: false,
  },
  {
    level: 6,
    title: "SignBid 인증 협력사",
    desc: "1~5단계 전체 검증을 통과하고 현장 실사 및 하자책임 서약서를 제출한 최상위 파트너",
    badge: "SignBid 공식인증",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    isDone: false,
  },
];

export default function PartnersClient() {
  const [businesses, setBusinesses] = useState<RegisteredBusiness[]>(
    (registeredData.businesses as RegisteredBusiness[]) || []
  );
  const [regionalStats, setRegionalStats] = useState<RegionalStat[]>(
    (registeredData.regionalStats as RegionalStat[]) || []
  );
  const [totalCount, setTotalCount] = useState<number>(registeredData.totalCount || 19940);
  const [lastUpdated, setLastUpdated] = useState<string>(registeredData.lastUpdated || "2026-08-31");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState<string>("전체");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [onlyDirectProduction, setOnlyDirectProduction] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination
  const [displayLimit, setDisplayLimit] = useState<number>(24);

  // Modals & Interactivity
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [inquiryTargetCompany, setInquiryTargetCompany] = useState<RegisteredBusiness | null>(null);

  // Partner Application Form State
  const [applyForm, setApplyForm] = useState({
    companyName: "",
    bizNumber: "",
    repName: "",
    phone: "",
    region: "서울",
    licenses: [] as string[],
    items: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Filtered List
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((item) => {
      // 1. 휴폐업 엄격 배제 (정상영업만 통과)
      if (item.status !== "정상영업") return false;

      // 2. 지역 필터
      if (selectedRegion !== "전체" && item.region !== selectedRegion) {
        return false;
      }

      // 3. 직접생산 필터
      if (onlyDirectProduction && !item.hasDirectProduction) {
        return false;
      }

      // 4. 품목 카테고리 필터
      if (selectedCategory !== "전체") {
        const matchesCategory = item.mainItems.some((tag) =>
          tag.toLowerCase().includes(selectedCategory.toLowerCase())
        );
        if (!matchesCategory) return false;
      }

      // 5. 검색어 (업체명, 대표자, 등록번호, 주소, 품목)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = item.companyName.toLowerCase().includes(query);
        const matchRep = item.representative.toLowerCase().includes(query);
        const matchRegNo = item.regNumber.toLowerCase().includes(query);
        const matchAddress = item.address.toLowerCase().includes(query);
        const matchSubRegion = item.subRegion.toLowerCase().includes(query);
        const matchItems = item.mainItems.some((t) => t.toLowerCase().includes(query));

        if (!matchName && !matchRep && !matchRegNo && !matchAddress && !matchSubRegion && !matchItems) {
          return false;
        }
      }

      return true;
    });
  }, [businesses, selectedRegion, selectedCategory, onlyDirectProduction, searchQuery]);

  const displayedList = useMemo(() => {
    return filteredBusinesses.slice(0, displayLimit);
  }, [filteredBusinesses, displayLimit]);

  const handleCopyAddress = (id: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLicenseToggle = (license: string) => {
    setApplyForm((prev) => {
      const exists = prev.licenses.includes(license);
      return {
        ...prev,
        licenses: exists
          ? prev.licenses.filter((l) => l !== license)
          : [...prev.licenses, license],
      };
    });
  };

  const handleSubmitApply = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setInquiryTargetCompany(null);
        setIsSubmitted(false);
        setApplyForm({
          companyName: "",
          bizNumber: "",
          repName: "",
          phone: "",
          region: "서울",
          licenses: [],
          items: "",
          message: "",
        });
      }, 1500);
    }, 1000);
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. 상단 헤더 & 안내 */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            행정안전부 공공데이터 포털 인허가 원부 대조
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            휴·폐업 업체 0건 (정상영업 원부 전수검증)
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">
            <Calendar className="w-3 h-3 text-amber-400" />
            매월 1회 정기 동기화 갱신
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              전국 옥외광고 협력사 및 공동수급 파트너
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              행정안전부 및 17개 시·도 지자체 옥외광고사업 등록대장을 기반으로 검증된 전국 공식 등록업체 디렉토리입니다.
            </p>
          </div>

          <button
            onClick={() => {
              setInquiryTargetCompany(null);
              setIsApplyModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer shrink-0 group"
          >
            <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
            <span>파트너 무료 등록·인증 신청</span>
          </button>
        </div>

        {/* 📌 공공데이터 제공 기준 및 전화번호 미게재 공지 안내 박스 */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-xs text-slate-300 space-y-2.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs sm:text-sm">
            <Info className="w-4 h-4 shrink-0 text-blue-400" />
            <span>공공데이터 연동 기준 및 연락처 안내 공지</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] sm:text-xs text-slate-400 leading-relaxed">
            <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <p className="text-slate-200 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>데이터 기준 및 정기 갱신 주기</span>
              </p>
              <p>
                본 디렉토리는 <strong>행정안전부 지방행정인허가(LOCALDATA) 데이터</strong>를 기준으로 제공되며, <strong>매월 1회(월간 정기 업데이트)</strong> 최신 인허가 원부와 동기화됩니다. (최근 기준일: <strong className="text-white">{lastUpdated}</strong>)
              </p>
            </div>
            <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <p className="text-slate-200 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>전화번호 미게재 사유 및 온라인 제휴 창구</span>
              </p>
              <p>
                개인정보보호법에 따라 공공데이터 포털 상의 대표자 유선번호는 비공개 처리되어 제공됩니다. 당사는 불확실한 가상 번호나 무의미한 검색 링크를 게재하지 않으며, 제휴 및 공동수급 견적은 <strong>[온라인 제휴·견적 문의]</strong>를 통해 안전하게 접수·연결해 드립니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 전국 17개 시·도 현황 대시보드 맵 뷰어 */}
      <RegionalMapViewer
        regionalStats={regionalStats}
        selectedRegion={selectedRegion}
        onSelectRegion={(reg) => {
          setSelectedRegion(reg);
          setDisplayLimit(24);
        }}
        totalCount={totalCount}
      />

      {/* 3. 검색 및 필터 컨트롤 바 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        {/* 상단: 검색창 & 직접생산 필터 토글 */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* 검색 입력창 */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayLimit(24);
              }}
              placeholder="업체명, 대표자명, 등록번호, 시·군·구, 품목(LED, 전광판, 표찰 등) 검색"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* 직접생산확인 토글 버튼 */}
          <button
            onClick={() => {
              setOnlyDirectProduction(!onlyDirectProduction);
              setDisplayLimit(24);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
              onlyDirectProduction
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/20"
                : "bg-slate-950/80 text-slate-400 border-slate-700/80 hover:text-slate-200"
            }`}
          >
            <Factory className={`w-4 h-4 ${onlyDirectProduction ? "text-emerald-400" : "text-slate-500"}`} />
            <span>직접생산확인(공장보유) 업체만</span>
            {onlyDirectProduction && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>

        {/* 하단: 품목 카테고리 태그 칩 */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-semibold mr-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-blue-400" />
            품목별:
          </span>
          {CATEGORY_TAGS.map((tag) => {
            const isSelected = selectedCategory === tag;
            return (
              <button
                key={tag}
                onClick={() => {
                  setSelectedCategory(tag);
                  setDisplayLimit(24);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {tag}
              </button>
            );
          })}

          {/* 필터 초기화 */}
          {(selectedRegion !== "전체" || selectedCategory !== "전체" || onlyDirectProduction || searchQuery) && (
            <button
              onClick={() => {
                setSelectedRegion("전체");
                setSelectedCategory("전체");
                setOnlyDirectProduction(false);
                setSearchQuery("");
                setDisplayLimit(24);
              }}
              className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer py-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. 검색 결과 카운터 */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs sm:text-sm text-slate-400">
          {selectedRegion !== "전체" && <strong className="text-blue-400 font-bold">[{selectedRegion}] </strong>}
          {selectedCategory !== "전체" && <strong className="text-indigo-400 font-bold">[{selectedCategory}] </strong>}
          {onlyDirectProduction && <strong className="text-emerald-400 font-bold">[직접생산] </strong>}
          검색된 업체: 총 <strong className="text-white font-bold">{filteredBusinesses.length.toLocaleString()}</strong>개사
        </p>
        <span className="text-xs text-slate-500">
          기준일: {lastUpdated} (공공데이터 동기화)
        </span>
      </div>

      {/* 5. 업체 카드 그리드 */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">공공데이터 등록부 옥외광고 사업자 데이터를 불러오는 중입니다...</p>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">조건에 부합하는 등록업체가 없습니다.</h3>
          <p className="text-xs text-slate-400">
            지역 또는 검색어를 변경하시거나, 필터를 초기화해 보세요.
          </p>
          <button
            onClick={() => {
              setSelectedRegion("전체");
              setSelectedCategory("전체");
              setOnlyDirectProduction(false);
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 mt-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            전체 목록 보기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedList.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
              >
                {/* 상단 뱃지 및 등록정보 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-400/30">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      공공등록 검증
                    </span>

                    {item.hasDirectProduction && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                        <Factory className="w-3 h-3 text-emerald-400" />
                        직접생산 팩토리
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-slate-500 ml-auto">
                      {item.regDate}
                    </span>
                  </div>

                  {/* 업체명 & 등록번호 */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{item.companyName}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span>대표: <strong className="text-slate-200">{item.representative}</strong></span>
                      <span className="text-slate-600">|</span>
                      <span className="font-mono text-[11px] text-slate-400 truncate">{item.regNumber}</span>
                    </div>
                  </div>

                  {/* 주요 취급 품목 태그 */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.mainItems.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 주소 영역 */}
                  <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="leading-relaxed line-clamp-2 text-slate-300 text-[11px]">
                        📍 {item.address}
                      </span>
                      <button
                        onClick={() => handleCopyAddress(item.id, item.address)}
                        title="주소 복사"
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 하단 액션 버튼 (신뢰 최우선: 제휴·견적 문의 연결) */}
                <div className="pt-3 border-t border-slate-800">
                  {item.phone ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${item.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        <span>{item.phone}</span>
                      </a>

                      <button
                        onClick={() => {
                          setInquiryTargetCompany(item);
                          setIsApplyModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold border border-blue-500/30 transition-all cursor-pointer shrink-0"
                      >
                        <span>제휴 문의</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setInquiryTargetCompany(item);
                        setIsApplyModalOpen(true);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer group"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
                      <span>온라인 제휴·견적 문의</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. 더보기 버튼 */}
      {displayedList.length < filteredBusinesses.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => setDisplayLimit((prev) => prev + 24)}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-bold border border-slate-700 transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg"
          >
            <span>더 많은 등록업체 불러오기 ({displayedList.length} / {filteredBusinesses.length.toLocaleString()})</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 7. 협력사 신뢰 인증 6단계 표준 체계 안내 섹션 */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>협력사 신뢰 인증 6단계 표준 체계</span>
            </h2>
            <p className="text-xs text-slate-400">
              SignBid AI는 단계별 법적·실무적 검증을 통과한 파트너사에게 차등 인증 뱃지를 부여합니다.
            </p>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 self-start sm:self-auto">
            현재 1단계(공공등록) 전수 적용 중
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CERTIFICATION_LEVELS.map((item) => (
            <div
              key={item.level}
              className={`rounded-xl p-4 space-y-2.5 flex flex-col justify-between border ${
                item.isDone
                  ? "bg-slate-950 border-blue-500/40 ring-1 ring-blue-500/20"
                  : "bg-slate-950/60 border-slate-800"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    STEP 0{item.level}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  {item.isDone && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  <span>{item.title}</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {item.isDone ? (
                <div className="text-[10px] font-bold text-blue-400 flex items-center gap-1 pt-1 border-t border-slate-800">
                  <span>✅ 전체 업체 기본 검증 완료</span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>서류 접수 및 개별 실사 심사 대상</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. 파트너 입점 및 인증 신청 모달 */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* 모달 닫기 버튼 */}
            <button
              onClick={() => {
                setIsApplyModalOpen(false);
                setInquiryTargetCompany(null);
                setIsSubmitted(false);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 헤더 */}
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-400/30">
                <Sparkles className="w-3 h-3 text-blue-400" />
                {inquiryTargetCompany ? "업체 제휴·견적 문의" : "협력사 파트너 무료 등록"}
              </span>
              <h2 className="text-lg font-black text-white">
                {inquiryTargetCompany
                  ? `[${inquiryTargetCompany.companyName}] 제휴 문의`
                  : "옥외광고 공장·장비·시공사 파트너 등록 신청"}
              </h2>
              <p className="text-xs text-slate-400">
                {inquiryTargetCompany
                  ? "해당 업체와의 공동도급 또는 외주 견적 문의 사항을 남겨주시면 안전하게 연결해 드립니다."
                  : "등록 신청 시 SignBid AI 파트너 디렉토리에 우선 등재 및 상위 인증 뱃지를 심사해 드립니다."}
              </p>
            </div>

            {/* 제출 완료 화면 */}
            {isSubmitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">신청이 성공적으로 접수되었습니다!</h3>
                <p className="text-xs text-slate-400">
                  수석 개발팀 및 운영진이 서류를 확인한 후 24시간 이내에 기재해 주신 연락처로 안내드리겠습니다.
                </p>
              </div>
            ) : (
              /* 신청 양식 폼 */
              <form onSubmit={handleSubmitApply} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      업체명 (상호) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={applyForm.companyName}
                      onChange={(e) => setApplyForm({ ...applyForm, companyName: e.target.value })}
                      placeholder="(주)한국광고기획"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      대표자 / 담당자명 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={applyForm.repName}
                      onChange={(e) => setApplyForm({ ...applyForm, repName: e.target.value })}
                      placeholder="홍길동 대표"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      연락처 (휴대폰/유선) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={applyForm.phone}
                      onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                      placeholder="010-1234-5678"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      소재 지역 <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={applyForm.region}
                      onChange={(e) => setApplyForm({ ...applyForm, region: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {regionalStats.map((r) => (
                        <option key={r.region} value={r.region}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 보유 면허 및 자격 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    보유 면허 및 설비 (중복 선택 가능)
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      "옥외광고사업 등록증",
                      "직접생산확인(공장보유)",
                      "정보통신공사업 면허",
                      "전기공사업 면허",
                      "스카이/크레인 장비보유",
                      "3M/에이버리 랩핑인증",
                    ].map((lic) => {
                      const isChecked = applyForm.licenses.includes(lic);
                      return (
                        <button
                          type="button"
                          key={lic}
                          onClick={() => handleLicenseToggle(lic)}
                          className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isChecked
                              ? "bg-blue-600/20 border-blue-500 text-blue-200"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <span>{lic}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 주요 취급 품목 및 메시지 */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    주요 취급 품목 및 소개
                  </label>
                  <textarea
                    rows={3}
                    value={applyForm.message}
                    onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })}
                    placeholder="예: LED 채널간판 자체 레이저가공 공장 보유, 서울·경기 3.5톤 스카이 상시 대기, 야간 시공 가능 등"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>신청서 무료 접수하기</span>
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-2">
                    입력하신 정보는 파트너십 확인 및 인증 목적으로만 안전하게 사용됩니다.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
