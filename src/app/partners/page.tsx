"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Layers,
  Users,
  Search,
  MapPin,
  Phone,
  Plus,
  X,
  Sparkles,
  Building2,
  ShieldCheck,
  Copy,
  Check,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import initialPartners from "../../../public/data/partners.json";
import registeredData from "../../../public/data/registered-businesses.json";
import RegionalMapViewer from "@/components/RegionalMapViewer";

export interface PartnerItem {
  id: string;
  companyName: string;
  category: string;
  location: string;
  contactPerson: string;
  phone: string;
  description: string;
  equipment: string[];
  experience: string;
  badges: string[];
}

export interface RegisteredBusinessItem {
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

const CATEGORIES = [
  "전체",
  "크레인·고소작업",
  "LED채널·가공공장",
  "전문시공팀",
  "광폭실사출력·현수막",
  "공동도급·면허제휴",
  "차량랩핑·특수",
];

const LOCATIONS = [
  "전체 지역",
  "서울·수도권",
  "영남·호남·충청",
  "전국",
];

const BUSINESS_ITEMS_FILTER = [
  "전체 품목",
  "LED채널간판",
  "LED전광판",
  "현수막",
  "공공조형물",
  "지주안내탑",
];

const REGION_CODE_MAP: Record<string, string> = {
  "서울": "seoul",
  "경기": "gyeonggi",
  "인천": "incheon",
  "부산": "busan",
  "대구": "daegu",
  "광주": "gwangju",
  "대전": "daejeon",
  "울산": "ulsan",
  "세종": "sejong",
  "강원": "gangwon",
  "충북": "chungbuk",
  "충남": "chungnam",
  "전북": "jeonbuk",
  "전남": "jeonnam",
  "경북": "gyeongbuk",
  "경남": "gyeongnam",
  "제주": "jeju",
};

const STORAGE_PARTNERS_KEY = "ad_bids_custom_partners";

function getPaginationNumbers(current: number, total: number, maxVisible = 7): number[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;

  if (end > total) {
    end = total;
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getInitialPartners(): PartnerItem[] {
  if (typeof window === "undefined") return initialPartners as PartnerItem[];
  try {
    const custom = localStorage.getItem(STORAGE_PARTNERS_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed)) return [...parsed, ...(initialPartners as PartnerItem[])];
    }
  } catch {
    // fallback
  }
  return initialPartners as PartnerItem[];
}

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState<"officialRegistry" | "matching">("officialRegistry");

  // 탭 1: 매칭보드 상태
  const [partners, setPartners] = useState<PartnerItem[]>(getInitialPartners);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedLocation, setSelectedLocation] = useState("전체 지역");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // 탭 2: 전국 지자체 공식 DB 상태
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedItemFilter, setSelectedItemFilter] = useState("전체 품목");
  const [onlyDirectProduction, setOnlyDirectProduction] = useState(false);
  const [registrySearchQuery, setRegistrySearchQuery] = useState("");
  const [registryPage, setRegistryPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 지역별 동적 로드 데이터 캐시
  const [regionalDataCache, setRegionalDataCache] = useState<Record<string, RegisteredBusinessItem[]>>({
    전체: registeredData.businesses as RegisteredBusinessItem[],
  });
  const [isLoadingRegion, setIsLoadingRegion] = useState(false);

  // 신규 등록 폼 상태
  const [newCompany, setNewCompany] = useState("");
  const [newCategory, setNewCategory] = useState("크레인·고소작업");
  const [newLocation, setNewLocation] = useState("서울·경기·인천");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEquipment, setNewEquipment] = useState("");

  const listTopRef = useRef<HTMLDivElement>(null);

  // 지역 선택 시 해당 시·도의 대용량 JSON 청크 비동기 온디맨드 로드 핸들러
  const loadRegionData = async (reg: string) => {
    if (reg === "전체" || regionalDataCache[reg]) return;

    const code = REGION_CODE_MAP[reg];
    if (!code) return;

    setIsLoadingRegion(true);
    try {
      const res = await fetch(`/data/registry/${code}.json`);
      if (res.ok) {
        const data: RegisteredBusinessItem[] = await res.json();
        if (Array.isArray(data)) {
          setRegionalDataCache((prev) => ({
            ...prev,
            [reg]: data,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load regional chunk:", err);
    } finally {
      setIsLoadingRegion(false);
    }
  };

  // 탭 1 필터링
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchCat =
        selectedCategory === "전체" ||
        p.category.includes(selectedCategory) ||
        selectedCategory.includes(p.category);

      const matchLoc =
        selectedLocation === "전체 지역" ||
        p.location.includes(selectedLocation) ||
        p.location === "전국" ||
        selectedLocation === "전국";

      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        q === "" ||
        p.companyName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.equipment.some((eq) => eq.toLowerCase().includes(q));

      return matchCat && matchLoc && matchQuery;
    });
  }, [partners, selectedCategory, selectedLocation, searchQuery]);

  // 탭 2 공식 등록 DB 필터링 (현재 선택된 지역의 전체 데이터 풀 기준)
  const currentPool = useMemo(() => {
    if (selectedRegion === "전체") {
      return (registeredData.businesses as RegisteredBusinessItem[]) || [];
    }
    return regionalDataCache[selectedRegion] || (registeredData.businesses as RegisteredBusinessItem[]) || [];
  }, [selectedRegion, regionalDataCache]);

  const filteredRegistry = useMemo(() => {
    return currentPool.filter((item) => {
      const matchReg = selectedRegion === "전체" || item.region === selectedRegion;
      const matchItem =
        selectedItemFilter === "전체 품목" ||
        item.mainItems.some((it) => it.includes(selectedItemFilter) || selectedItemFilter.includes(it));
      const matchDP = !onlyDirectProduction || item.hasDirectProduction;

      const q = registrySearchQuery.trim().toLowerCase();
      const matchQuery =
        q === "" ||
        item.companyName.toLowerCase().includes(q) ||
        item.regNumber.toLowerCase().includes(q) ||
        item.representative.toLowerCase().includes(q) ||
        item.subRegion.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.mainItems.some((it) => it.toLowerCase().includes(q));

      return matchReg && matchItem && matchDP && matchQuery;
    });
  }, [currentPool, selectedRegion, selectedItemFilter, onlyDirectProduction, registrySearchQuery]);

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(filteredRegistry.length / pageSize));
  const paginatedRegistry = useMemo(() => {
    const start = (registryPage - 1) * pageSize;
    return filteredRegistry.slice(start, start + pageSize);
  }, [filteredRegistry, registryPage, pageSize]);

  const scrollToRegistryTop = () => {
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 필터 변경 시 1페이지로 리셋 및 대용량 청크 로딩 트리거
  const handleRegionSelect = (reg: string) => {
    setSelectedRegion(reg);
    setRegistryPage(1);
    loadRegionData(reg);
    scrollToRegistryTop();
  };

  const handleItemFilterSelect = (item: string) => {
    setSelectedItemFilter(item);
    setRegistryPage(1);
    scrollToRegistryTop();
  };

  const handleSearchChange = (val: string) => {
    setRegistrySearchQuery(val);
    setRegistryPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setRegistryPage(newPage);
    scrollToRegistryTop();
  };

  const handleCopyAddress = (id: string, addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newPhone.trim()) return;

    const newItem: PartnerItem = {
      id: `custom-${Date.now()}`,
      companyName: newCompany.trim(),
      category: newCategory,
      location: newLocation,
      contactPerson: newContact.trim() || "담당자",
      phone: newPhone.trim(),
      description: newDesc.trim() || "옥외광고 전문 시공 및 협력 지원합니다.",
      equipment: newEquipment.split(",").map((s) => s.trim()).filter(Boolean),
      experience: "현장 경험 풍부 및 관공서 시공 협력 가능",
      badges: ["신규등록", "직접소통"],
    };

    const updated = [newItem, ...partners];
    setPartners(updated);

    try {
      const savedCustom = localStorage.getItem(STORAGE_PARTNERS_KEY);
      const parsedCustom = savedCustom ? JSON.parse(savedCustom) : [];
      localStorage.setItem(STORAGE_PARTNERS_KEY, JSON.stringify([newItem, ...parsedCustom]));
    } catch {
      // fallback
    }

    setIsRegisterOpen(false);
    setNewCompany("");
    setNewContact("");
    setNewPhone("");
    setNewDesc("");
    setNewEquipment("");
  };

  // 현재 선택된 지역 통계 정보
  const currentRegionStat = registeredData.regionalStats.find((r) => r.region === selectedRegion);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    옥외광고 입찰 알리미
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                    <Users className="w-2.5 h-2.5 text-cyan-400" />
                    협력사 허브
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  외주 시공 매칭 & 전국 1.8만 지자체 등록업체 공식 DB
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-1">
              <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <Link
                  href="/"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  입찰공고
                </Link>
                <Link
                  href="/calendar"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-300 hover:text-indigo-200 hover:bg-slate-800 transition-all border border-indigo-500/30 bg-indigo-500/10"
                >
                  📅 캘린더
                </Link>
                <Link
                  href="/prespec"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🔔 발주예고
                </Link>
                <Link
                  href="/results"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
                >
                  🏆 낙찰통계
                </Link>
                <Link
                  href="/calculator"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
                >
                  💰 투찰계산기
                </Link>
                <Link
                  href="/partners"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-md shadow-cyan-500/10"
                >
                  🤝 협력사·DB
                </Link>
                <Link
                  href="/proposal"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-300 hover:text-purple-200 hover:bg-slate-800 transition-all border border-purple-500/30 bg-purple-500/10"
                >
                  ✨ AI제안서
                </Link>
                <Link
                  href="/blog"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  트렌드
                </Link>
                <Link
                  href="/news"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-300 hover:text-emerald-200 hover:bg-slate-800 transition-all border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  뉴스
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-xl">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>옥외광고 전문 시공·외주 매칭 & 전국 지자체 공공 DB 허브</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight space-y-1">
            <span>입찰 수주 후 시공 걱정 끝!</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-300">
              전국 옥외광고 전문 협력사 & 지자체 등록업체
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            크레인·스카이 장비, LED채널 가공공장, 현지 시공팀 매칭부터 <br className="hidden sm:inline" />
            행정안전부 전국 18,450개 지자체 공식 등록 면허 업체까지 원스톱으로 검색하세요.
          </p>

          {/* 2대 메인 탭 전환기 */}
          <div className="flex justify-center pt-2">
            <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 inline-flex shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("officialRegistry")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "officialRegistry"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>🏛️ 전국 지자체 공식 등록업체 DB (1.8만 개사)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("matching")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "matching"
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>🤝 실시간 외주·시공 매칭보드</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* ========================================================================= */}
        {/* 탭 1 : 🏛️ 전국 지자체 공식 등록업체 DB (1.8만 개사) */}
        {/* ========================================================================= */}
        {activeTab === "officialRegistry" && (
          <div ref={listTopRef} className="space-y-6">
            {/* 1. 전국 17개 시도 인터랙티브 지도 탐색기 */}
            <RegionalMapViewer
              regionalStats={registeredData.regionalStats}
              selectedRegion={selectedRegion}
              onSelectRegion={handleRegionSelect}
              totalCount={registeredData.totalCount}
            />

            {/* 2. 상세 필터 & 검색 바 */}
            <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* 품목 필터 칩 */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {BUSINESS_ITEMS_FILTER.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleItemFilterSelect(item)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedItemFilter === item
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                          : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {/* 직접생산확인 보유 토글 */}
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={onlyDirectProduction}
                    onChange={(e) => {
                      setOnlyDirectProduction(e.target.checked);
                      setRegistryPage(1);
                    }}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                    직접생산확인(SMPP) 보유사만 보기
                  </span>
                </label>
              </div>

              {/* 검색창 & 페이지 크기 선택기 */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="상호명, 등록번호(면허), 대표자, 전화번호, 주소(시·군·구), 품목 실시간 검색..."
                    value={registrySearchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                  <span>보기</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setRegistryPage(1);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-400 cursor-pointer"
                  >
                    <option value={12}>12개씩 보기</option>
                    <option value={24}>24개씩 보기</option>
                    <option value={48}>48개씩 보기</option>
                    <option value={100}>100개씩 보기</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. 공식 등록 업체 목록 그리드 */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
                <span className="flex items-center gap-2">
                  <span>
                    📍 <strong className="text-white font-bold">[{selectedRegion === "전체" ? "전국" : selectedRegion}]</strong>{" "}
                    {currentRegionStat
                      ? `${currentRegionStat.name} 공식 등록 ${currentRegionStat.count.toLocaleString()}개사 중`
                      : `전국 공식 등록 ${registeredData.totalCount.toLocaleString()}개사 중`}{" "}
                    검색 결과: <strong className="text-indigo-300 font-bold">{filteredRegistry.length.toLocaleString()}개</strong> 업체 (페이지 {registryPage}/{totalPages})
                  </span>
                  {isLoadingRegion && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      대용량 DB 로딩 중...
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  ※ 행정안전부 옥외광고물법 제11조 정식 등록 면허
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedRegistry.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all p-5 shadow-lg flex flex-col justify-between space-y-3.5 group hover:-translate-y-0.5"
                  >
                    <div className="space-y-2.5">
                      {/* 상단 등록번호 & 인증 뱃지 */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          <ShieldCheck className="w-3 h-3 text-indigo-400" />
                          {biz.regNumber}
                        </span>

                        <div className="flex items-center gap-1">
                          {biz.hasDirectProduction && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                              직생보유
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                            {biz.status}
                          </span>
                        </div>
                      </div>

                      {/* 상호명 & 대표자 */}
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {biz.companyName}
                        </h4>
                        <p className="text-xs text-slate-400 pt-0.5">
                          대표자: <span className="text-slate-200">{biz.representative}</span> · 등록일: <span className="text-slate-300">{biz.regDate}</span>
                        </p>
                      </div>

                      {/* 사업장 도로명 주소 */}
                      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{biz.address}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAddress(biz.id, biz.address)}
                          className="text-[11px] text-slate-400 hover:text-white transition-colors shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                        >
                          {copiedId === biz.id ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> 복사됨
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5">
                              <Copy className="w-3 h-3" /> 복사
                            </span>
                          )}
                        </button>
                      </div>

                      {/* 주요 품목 뱃지 */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {biz.mainItems.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                          >
                            🏷️ {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 하단 전화 연결 */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        관할: <strong className="text-slate-200">{biz.region} {biz.subRegion}</strong>
                      </span>

                      <a
                        href={`tel:${biz.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{biz.phone}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRegistry.length === 0 && (
                <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <p className="text-sm text-slate-400 mb-3">
                    선택하신 조건에 해당하는 공식 등록업체가 없습니다.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedRegion("전체");
                      setSelectedItemFilter("전체 품목");
                      setOnlyDirectProduction(false);
                      setRegistrySearchQuery("");
                      setRegistryPage(1);
                    }}
                    className="text-xs text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    필터 초기화
                  </button>
                </div>
              )}

              {/* 페이지네이션 바 */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-6 pb-2">
                  <button
                    type="button"
                    disabled={registryPage === 1}
                    onClick={() => handlePageChange(1)}
                    title="첫 페이지"
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={registryPage === 1}
                    onClick={() => handlePageChange(Math.max(1, registryPage - 1))}
                    title="이전 페이지"
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {getPaginationNumbers(registryPage, totalPages, 7).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          registryPage === pageNum
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={registryPage === totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, registryPage + 1))}
                    title="다음 페이지"
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={registryPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    title="마지막 페이지"
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 탭 2 : 🤝 실시간 외주·시공 매칭보드 */}
        {/* ========================================================================= */}
        {activeTab === "matching" && (
          <div className="space-y-6">
            {/* 상단 액션 바 */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>실시간 시공·외주 파트너 목록</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    총 {filteredPartners.length}개 팀
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  직통 연락처로 장비 및 시공 일정, 외주 단가를 직접 협의하세요.
                </p>
              </div>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>내 업체 등록 / 파트너 구인</span>
              </button>
            </div>

            {/* 필터 및 검색 바 */}
            <div className="space-y-3">
              {/* 카테고리 필터 */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400"
                        : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 검색창 & 지역 필터 */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="업체명, 보유 장비(크레인, CNC, UV출력), 지역 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 협력사 카드 목록 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all p-5 shadow-lg flex flex-col justify-between space-y-4 group hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    {/* 상단 뱃지 & 카테고리 */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                        {partner.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {partner.location}
                      </span>
                    </div>

                    {/* 업체명 */}
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {partner.companyName}
                    </h3>

                    {/* 설명 */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {partner.description}
                    </p>

                    {/* 보유 장비 / 특기 뱃지 */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {partner.equipment.map((eq, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          🔧 {eq}
                        </span>
                      ))}
                    </div>

                    {/* 인증 뱃지 */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {partner.badges.map((b, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        >
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 하단 연락처 & 바로 연결 */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      <span>담당: <strong className="text-slate-200">{partner.contactPerson}</strong></span>
                    </div>

                    <a
                      href={`tel:${partner.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{partner.phone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 협력사 등록 / 구인 모달 (탭 1 전용) */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>협력사 등록 / 시공 파트너 구인</span>
              </h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  업체명 (또는 팀명) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 경기스카이크레인, 한양채널가공"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    전문 분야 *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== "전체").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    활동 지역 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 서울·경기, 전국"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    담당자 직함/이름
                  </label>
                  <input
                    type="text"
                    placeholder="예: 김철수 실장"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    연락처 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 010-1234-5678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  보유 장비 및 특기 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  placeholder="예: 3.5톤 스카이, CNC가공기, 5m UV출력기, 전기면허보유"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  상세 소개 및 작업 가능 범위
                </label>
                <textarea
                  rows={3}
                  placeholder="주요 시공 이력이나 외주 작업 가능한 범위를 적어주세요."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 cursor-pointer"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
