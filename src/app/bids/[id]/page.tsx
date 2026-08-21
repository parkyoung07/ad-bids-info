import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  ArrowLeft,
  Flame,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Layers,
  Banknote,
  Briefcase,
  HelpCircle,
  FileText,
  BadgeInfo,
} from "lucide-react";
import sampleData from "../../../../public/data/bids-sample.json";

export interface BidItem {
  id: string;
  title: string;
  category: string;
  client: string;
  budget: number;
  budgetText: string;
  location: string;
  startDate: string;
  endDate: string;
  dDay: number;
  bidType: string;
  linkUrl: string;
}

// 정적 내보내기(output: 'export')를 위한 params 생성
export async function generateStaticParams() {
  return sampleData.map((bid) => ({
    id: bid.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BidDetailPage({ params }: PageProps) {
  const { id } = await params;
  const bid = (sampleData as BidItem[]).find((item) => item.id === id);

  if (!bid) {
    notFound();
  }

  const isUrgent = bid.dDay <= 3 && bid.dDay >= 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 상단 네비게이션 헤더 */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center space-x-2.5 text-white hover:text-blue-400 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">
                옥외광고 입찰정보 알리미
              </span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>목록으로 돌아가기</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 상세 영역 */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* 브레드크럼 */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:text-blue-600">홈</Link>
          <span>/</span>
          <span className="text-slate-700">{bid.category}</span>
          <span>/</span>
          <span className="text-slate-400 font-mono">공고번호 {bid.id}</span>
        </div>

        {/* 상단 헤더 카드 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {bid.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {bid.location}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                공고번호: {bid.id}
              </span>
            </div>

            {/* D-Day 배지 */}
            {isUrgent ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-500 text-white shadow-sm shadow-rose-500/20 animate-pulse">
                <Flame className="w-4 h-4 fill-white" />
                마감임박 D-{bid.dDay}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 text-white">
                <Clock className="w-4 h-4 text-blue-400" />
                마감 D-{bid.dDay}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight mb-4">
            {bid.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>발주처: <strong className="text-slate-800">{bid.client}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>공고일: <span className="text-slate-700">{bid.startDate}</span></span>
            </div>
          </div>
        </div>

        {/* 주요 공고 세부 정보 테이블 그리드 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>나라장터 공고 세부 정보</span>
            </div>
            <span className="text-xs text-slate-400">조달청 G2B 공공데이터 연계</span>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* 발주기관 / 수요기관 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  발주기관 / 수요기관
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-900">{bid.client}</p>
              </div>

              {/* 계약방법 및 입찰방식 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  계약방법 및 입찰방식
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-900">{bid.bidType}</p>
              </div>

              {/* 배정예산 (추정가격) */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-blue-600" />
                  배정예산 (추정가격)
                </p>
                <p className="text-lg sm:text-xl font-extrabold text-blue-700">
                  {bid.budgetText} <span className="text-xs font-normal text-slate-500">(₩{bid.budget.toLocaleString()}원)</span>
                </p>
              </div>

              {/* 입찰서 접수 마감일시 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  입찰서 접수 마감일시
                </p>
                <p className="text-sm sm:text-base font-bold text-rose-600">{bid.endDate}</p>
              </div>

              {/* 지역 제한 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  지역 제한
                </p>
                <p className="text-sm font-semibold text-slate-900">{bid.location} 관내 소재 업체 우선</p>
              </div>

              {/* 주 공종 / 품목분류 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  주 공종 및 품목 분류
                </p>
                <p className="text-sm font-semibold text-slate-900">{bid.category} (제작 및 시공·설치)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 입찰 참가 자격 및 주의사항 안내 박스 */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">옥외광고 사업자 필수 참가 자격 안내</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
              <FileCheck2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">옥외광고사업 등록:</strong> 「옥외광고물 등의 관리와 옥외광고산업 진흥에 관한 법률」 제11조에 따른 옥외광고사업 등록 업체.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
              <FileCheck2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">직접생산확인증명서 보유:</strong> 해당 세부 품명(간판, 안내판, 현수막, 랩핑 등)에 대한 유효한 직접생산확인증명서를 소지한 중소기업자.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">투찰 전 확인사항:</strong> 본 페이지의 정보는 요약본이므로, 반드시 아래 나라장터 원문 공고의 과업지시서, 시방서, 제안요청서를 확인하신 후 투찰하시기 바랍니다.
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← 목록으로 돌아가기</span>
          </Link>

          <a
            href={bid.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <span>나라장터 공고 원문 바로가기</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-900 text-slate-500 text-xs py-8 px-4 text-center border-t border-slate-800 mt-12">
        <p>© 2026 Ad Bids Alerter · 조달청 나라장터 공공데이터 연계</p>
      </footer>
    </div>
  );
}
