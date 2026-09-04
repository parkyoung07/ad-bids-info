"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Copy,
  Check,
  Search,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  X,
  FileCheck,
  UserCheck,
  Scale,
  Hammer,
} from "lucide-react";

interface FormDoc {
  id: string;
  category: "적격심사" | "자격/인증" | "입찰/계약" | "시공/안전";
  title: string;
  desc: string;
  format: "HWP" | "PDF" | "DOCX";
  isHot?: boolean;
  content: string;
}

const FORMS_DATA: FormDoc[] = [
  {
    id: "FORM-01",
    category: "적격심사",
    title: "1. 옥외광고물 제작·설치 적격심사 자기평가 및 심사신청서",
    desc: "조달청 및 행정안전부 지자체 물품/용역 적격심사 기준에 따른 경영상태, 수행능력, 입찰가격 100점 만점 자기평가표 양식입니다.",
    format: "HWP",
    isHot: true,
    content: `
[적격심사 자기평가 및 심사신청서]

1. 공고번호 및 사업명: [입찰공고번호 기재] / [공고명 기재]
2. 발주기관: [발주처명 기재]
3. 신청자 정보:
   - 상호 또는 법인명: [회사명]
   - 사업자등록번호: [000-00-00000]
   - 대표자 성명: [대표자명] (인)
   - 주소 및 연락처: [사업장 주소] / [전화번호]

4. 자기평가 점수표 (100점 만점 기준):
   가. 이행능력 평가 (45점)
       - 경영상태 (신용평가등급 BBB+ 이상): 30.0점
       - 동종 사업 수행실적 (최근 3개년 배정예산 100% 이상): 15.0점
   나. 입찰가격 평가 (55점)
       - 투찰률 및 입찰가격 평점: 55.0점
   다. 신인도 및 가점 항목 (+1.5점)
       - 여성기업 / 장애인기업 / 소기업·소상공인 가점: +1.0점
       - 지역업체 참여 가점: +0.5점
   ------------------------------------------------------------
   [합 계 점 수]: 100.0점 / 100점 만점 (적격 통과)

위와 같이 적격심사 신청서 및 관련 증빙서류를 성실히 작성하여 제출합니다.

2026년    월    일
신청인: [회사명] 대표 [대표자명] (직인)
    `.trim(),
  },
  {
    id: "FORM-02",
    category: "자격/인증",
    title: "2. 직접생산확인(SMPP) 시설·장비 보유 현황 및 생산확인서",
    desc: "중소벤처기업부 중소기업유통센터 SMPP 제출용 간판, 전광판, 현수막 직접생산 시설 및 장비 보유 목록 확인서입니다.",
    format: "HWP",
    isHot: true,
    content: `
[직접생산확인 시설·장비 보유 현황표]

1. 신청 품명: 간판(5512160601) / LED전광판(5512160801) / 현수막(5512161201)
2. 사업장 현황:
   - 공장(사업장) 면적: [전용면적 000㎡] (자가/임차)
   - 옥외광고사업 등록번호: [제 2026-00호]
   - 상시 생산인력: [총 0명, 기술자 0명]

3. 필수 보유 생산설비 목록:
   ① CNC 조각기 / 레이저 가공기 (유효 작업영역 1,200mm x 2,400mm 이상): 1대
   ② 채널 벤딩기(자동 절곡기): 1대
   ③ 알루미늄/갈바 용접기 (알곤/CO2 인버터 용접기): 2대
   ④ 대형 UV 평판/롤투롤 실사출력기 (출력폭 3,200mm 이상): 1대
   ⑤ 도장 및 건조 설비 (집진시설 구비): 1식

4. 품질 검사 장비:
   - 절연저항 측정기(메거기), 조도계, 디지털 버니어캘리퍼스 등

상기 생산시설 및 인력을 상시 보유하고 직접생산함을 확약합니다.

2026년    월    일
회사명: [회사명] 대표 [대표자명] (직인)
    `.trim(),
  },
  {
    id: "FORM-03",
    category: "입찰/계약",
    title: "3. 나라장터(G2B) 입찰참가 및 현장대리인 위임장",
    desc: "전자입찰 투찰, 제안서 제출, 현장설명회 참석 시 대표자를 대리하여 직원이 참석할 때 제출하는 표준 위임장입니다.",
    format: "HWP",
    isHot: false,
    content: `
[위 임 장 (대리인 지정)]

1. 위임받는 사람 (수임인):
   - 성 명: [홍길동]
   - 주민등록번호(앞 6자리): [800101-*******]
   - 소속 및 직위: [영업기획부 / 과장]
   - 연 락 처: [010-0000-0000]

2. 위임하는 사항:
   - 사업명: [입찰공고명 기재]
   - 발주처: [발주기관명 기재]
   - 위임 권한: 상기 건의 전자입찰 참가, 제안서 및 입찰서류 제출, 현장설명회 참석, 가격 개찰 등 입찰 절차 일체에 관한 권한

위 사람을 본 입찰의 대리인으로 정식 위임합니다.

2026년    월    일

위임자(대표자):
- 상 호: [회사명]
- 주 소: [사업장 주소]
- 대표자: [대표자 성명] (사용인감 날인)
    `.trim(),
  },
  {
    id: "FORM-04",
    category: "입찰/계약",
    title: "4. 사용인감계 및 법인인감증명원 제출 확인서",
    desc: "입찰 계약 및 대금 청구 시 법인인감 대신 계약용 사용인감을 사용할 때 제출하는 필수 인감 증명 서식입니다.",
    format: "HWP",
    isHot: false,
    content: `
[사 용 인 감 계]

1. 사용인감 (우측 날인란):
   ┌───────────────────────┐
   │                       │
   │      [사용인감]       │ (날인)
   │                       │
   └───────────────────────┘

2. 법인인감 (우측 날인란):
   ┌───────────────────────┐
   │                       │
   │      [법인인감]       │ (날인)
   │                       │
   └───────────────────────┘

상기 사용인감은 귀 기관과의 입찰, 계약 체결, 준공검사 신청, 대금 청구 및 영수 등 제반 업무에 사용하기 위하여 제출하며, 이에 수반되는 모든 법적 책임은 본사가 질 것을 확약합니다.

첨부: 법인인감증명서(개인사업자는 인감증명서) 1부.

2026년    월    일
상호: [회사명]  대표자: [대표자명] (법인인감 날인)
    `.trim(),
  },
  {
    id: "FORM-05",
    category: "시공/안전",
    title: "5. 옥외광고물 안전점검 및 무상 하자보수 이행확약서",
    desc: "준공 시 발주처에 제출하는 풍하중 안전도 점검 합격 및 1~3년 무상 하자보수 A/S 24시간 출동 이행 확약서입니다.",
    format: "HWP",
    isHot: true,
    content: `
[옥외광고물 안전보증 및 하자이행 확약서]

1. 공사(용역)명: [준공 사업명 기재]
2. 발주기관: [발주처명 기재]
3. 준공금액: 금 [000,000,000]원
4. 하자보수 보증기간: 준공일로부터 [2개년] (하자보증금율 5%)

[확 약 사 항]
1. 본 사업으로 시공된 옥외광고물(간판, 전광판, 프레임, LED모듈, SMPS 등)의 구조적 안전성과 전기적 절연 성능을 100% 보증합니다.
2. 보증기간 내에 자재의 불량, 제작 결함, 시공 부실로 인하여 파손, 탈락, 누전, 소등 등의 하자가 발생할 경우, 통보 접수 즉시(24시간 이내) 무상으로 전면 보수 또는 교체 시공하겠습니다.
3. 태풍, 강풍 등 비상 재난 시 옥외광고물 안전 점검 요청에 최우선적으로 응할 것을 엄숙히 확약합니다.

2026년    월    일
시공사: [회사명]  대표이사 [대표자명] (직인)
    `.trim(),
  },
  {
    id: "FORM-06",
    category: "시공/안전",
    title: "6. 고소작업차(스카이) 도로점용 및 현장 안전관리계획서",
    desc: "도로변 크레인/스카이 작업 시 관할 지자체 및 경찰서, 발주처 감독관에게 제출하는 표준 시공 안전관리계획서입니다.",
    format: "HWP",
    isHot: false,
    content: `
[고소작업차 도로점용 및 시공 안전관리계획서]

1. 작업 개요:
   - 작업 장소: [시공 현장 상세 주소]
   - 작업 일시: 2026년 00월 00일 00:00 ~ 00:00
   - 사용 장비: 3.5톤 스카이 고소작업차 1대 (차량번호: 00가 0000)

2. 안전관리 책임자:
   - 현장총괄책임자: [성명] (010-0000-0000)
   - 전담 신호수: [성명 1], [성명 2] (2인 상시 배치)

3. 중점 안전관리 대책:
   가. 보행자 및 차량 통제:
       - 작업 반경 전방 30m, 후방 30m 안전 라바콘 및 점멸 유도등 설치
       - 보행자 전용 임시 안전 통행로(폭 1.5m) 확보 및 신호수 수신호 유도
   나. 추락 및 낙하물 방지:
       - 작업자 2인 안전모, 2열 안전벨트 착용 후 버킷 내 안전고리 체결 필수
       - 작업 구간 하부 낙하물 방지망(2m) 설치 및 공구 이탈방지 끈 체결
   다. 전도 방지:
       - 아우트리거 4개소 최대 확장 및 받침목(두께 50mm 이상) 완벽 설치

위 안전관리계획을 준수하여 무사고 시공을 완수하겠습니다.

2026년    월    일
제출자: [회사명] 안전보건관리책임자 [성명] (인)
    `.trim(),
  },
  {
    id: "FORM-07",
    category: "입찰/계약",
    title: "7. 옥외광고 공동수급 표준협정서 (공동이행 / 분담이행 방식)",
    desc: "대형 간판개선사업이나 전광판 사업 입찰 시 디자인회사 + 옥외광고 시공사 간의 컨소시엄 표준 협정서입니다.",
    format: "HWP",
    isHot: false,
    content: `
[공동수급 표준협정서 (공동이행방식)]

제1조 (목적) 본 협정서는 [입찰공고명 기재] 입찰에 공동으로 참가하여 상호 협력하여 사업을 성공적으로 완수함을 목적으로 한다.
제2조 (공동수급체 구성원)
   1. 대표사(주계약자): [A 디자인전문회사] (출자비율: 60%)
   2. 구성원: [B 옥외광고제작사] (출자비율: 40%)

제3조 (대표자의 권한) 대표사는 발주기관 및 제3자에 대하여 공동수급체를 대표하며, 계약 체결 및 대금 청구권을 행사한다.
제4조 (업무 분담)
   - A사: 디자인 기획, 실시설계, 주민설명회, 감리 총괄
   - B사: 자재 구매, 프레임/채널 제작, 현장 크레인 시공 및 A/S

위와 같이 공동수급체를 결성하고 성실히 이행할 것을 협정합니다.

2026년    월    일
대표사: [A사명] 대표 [대표자명] (직인)
구성원: [B사명] 대표 [대표자명] (직인)
    `.trim(),
  },
  {
    id: "FORM-08",
    category: "자격/인증",
    title: "8. 소기업·소상공인 및 여성·장애인기업 입찰 가점 확인서",
    desc: "적격심사 시 신인도 가점(+1.0점)을 부여받기 위해 사업자등록증 및 공인 확인서와 함께 첨부하는 신청서입니다.",
    format: "HWP",
    isHot: false,
    content: `
[중소기업·사회적 약자기업 가점 신청 확인서]

1. 공고번호 및 사업명: [입찰공고번호] / [사업명]
2. 신청 기업 정보:
   - 상 호: [회사명]  (사업자등록번호: 000-00-00000)
   - 대표자: [대표자명]

3. 가점 신청 구분 (해당 항목에 [V] 체크):
   [V] 소기업 및 소상공인 확인서 (중소벤처기업부 발급)
   [V] 여성기업 확인서 (한국여성경제인협회 발급)
   [ ] 장애인기업 확인서 (장애인기업종합지원센터 발급)
   [ ] 모범납세자 표창 기업

위 기재사항이 사실과 다름없음을 확인하며, 적격심사 가점 부여를 신청합니다.

2026년    월    일
신청인: [회사명] 대표 [대표자명] (직인)
    `.trim(),
  },
];

export default function FormsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [activePreviewDoc, setActivePreviewDoc] = useState<FormDoc | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["전체", "적격심사", "자격/인증", "입찰/계약", "시공/안전"];

  const filteredForms = FORMS_DATA.filter((doc) => {
    const matchCategory = selectedCategory === "전체" || doc.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery = q === "" || doc.title.toLowerCase().includes(q) || doc.desc.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });

  const handleCopy = (doc: FormDoc) => {
    navigator.clipboard.writeText(doc.content);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (doc: FormDoc) => {
    const blob = new Blob([doc.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/[^a-zA-Z0-9가-힣]/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* 히어로 헤더 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026 최신 조달청·지자체 표준 양식 완벽 반영</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            옥외광고 공공입찰 <span className="text-cyan-400">필수 서류 8종</span> 무료 자료실
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            적격심사 자기평가표, 직접생산확인 신청서, 위임장, 사용인감계, 하자보수 확약서 등
            입찰 때마다 작성하기 번거로웠던 표준 서식을 원클릭으로 무료 복사 및 다운로드하세요.
          </p>

          {/* 검색창 */}
          <div className="pt-2 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="서식명 또는 키워드 검색 (예: 적격심사, 위임장, 하자보수, 스카이)"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 shadow-lg transition-all"
            />
          </div>
        </div>
      </section>

      {/* 메인 서식 리스트 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 카테고리 필터 탭 */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            총 <strong className="text-cyan-400">{filteredForms.length}</strong>개 표준 서식
          </span>
        </div>

        {/* 서식 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredForms.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {doc.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {doc.isHot && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                        BEST 필수서식
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {doc.format}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {doc.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActivePreviewDoc(doc)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>미리보기</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(doc)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedId === doc.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">복사완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>텍스트 복사</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownload(doc)}
                    className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-600/20 active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>서식 다운로드</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 미리보기 모달 */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {activePreviewDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/60 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500 selection:text-white border-y border-slate-800/80">
              {activePreviewDoc.content}
            </div>

            <div className="px-6 py-3.5 bg-slate-950 flex items-center justify-between text-xs">
              <button
                onClick={() => handleCopy(activePreviewDoc)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                {copiedId === activePreviewDoc.id ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedId === activePreviewDoc.id ? "복사 완료!" : "전체 텍스트 복사"}</span>
              </button>

              <button
                onClick={() => handleDownload(activePreviewDoc)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
              >
                <Download className="w-4 h-4" />
                <span>서식 파일 다운로드</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
