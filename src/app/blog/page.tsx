import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import {
  Layers,
  Calendar,
  Tag,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Sparkles,
  ExternalLink,
  Search,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "옥외광고 트렌드 & 정책 기사 분석 | 옥외광고 입찰정보 알리미",
  description:
    "디지털사이니지, 옥외광고 정책 변화, 공공 사인물 디자인 트렌드 및 산업 동향 심층 분석 리포트.",
};

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* 로고 */}
            <Link href="/" className="flex items-center space-x-3.5 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    옥외광고 입찰 알리미
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  조달청 나라장터 공공입찰 맞춤 실시간 수집 · AI 분석
                </p>
              </div>
            </Link>

            {/* 네비게이션 메뉴 탭 */}
            <nav className="flex items-center gap-1 sm:gap-1.5">
              <Link
                href="/"
                className="px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                입찰공고 목록
              </Link>
              <Link
                href="/calendar"
                className="px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-indigo-300 hover:text-indigo-200 hover:bg-slate-800 transition-all border border-indigo-500/30 bg-indigo-500/10"
              >
                📅 캘린더
              </Link>
              <Link
                href="/prespec"
                className="px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
              >
                🔔 발주 예고
              </Link>
              <Link
                href="/results"
                className="px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all border border-amber-500/30 bg-amber-500/10"
              >
                🏆 낙찰 통계
              </Link>
              <Link
                href="/blog"
                className="px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400"
              >
                옥외광고 트렌드
              </Link>
              <Link
                href="/news"
                className="px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-300 hover:text-emerald-200 hover:bg-slate-800 transition-all border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                실시간 뉴스
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 블로그 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-gradient-to-r from-blue-600/20 via-indigo-500/15 to-cyan-500/20 blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>옥외광고 & 디지털사이니지 산업 트렌드 및 기사 분석</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            옥외광고 시장을 읽는 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">인사이트 & 정책 동향</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            디지털 사이니지 규제 완화, 스마트 도시 사인물, 공공기관 입찰 자격 트렌드 및 주요 언론·학술 기사를 심층 분석하여 전달합니다.
          </p>
        </div>
      </section>

      {/* 블로그 포스트 목록 메인 영역 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {posts.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center my-8 shadow-xl max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400 border border-slate-700/60">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">
              트렌드 분석 및 정책 리포트 준비 중
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              옥외광고 및 디지털사이니지 관련 최신 산업 동향과 공공입찰 분석 기사가 곧 등록될 예정입니다.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/25 transition-colors"
            >
              <span>실시간 입찰공고 보러가기</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-blue-500/5 transition-all duration-200 flex flex-col group"
              >
                {/* 썸네일 이미지 영역 */}
                {post.coverImage ? (
                  <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden bg-slate-950">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-blue-300 border border-blue-500/30">
                        {post.category}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block relative aspect-video bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center p-6 border-b border-slate-800 group-hover:from-blue-950/40 group-hover:to-slate-900 transition-colors"
                  >
                    <BookOpen className="w-10 h-10 text-slate-700 group-hover:text-blue-400/60 transition-colors" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        {post.category}
                      </span>
                    </div>
                  </Link>
                )}

                {/* 포스트 메타 및 내용 */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* 날짜 */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{post.date}</span>
                    </div>

                    {/* 제목 */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug mb-2.5"
                    >
                      {post.title}
                    </Link>

                    {/* 요약문 */}
                    {post.summary && (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 mb-4">
                        {post.summary}
                      </p>
                    )}
                  </div>

                  {/* 태그 및 읽기 링크 */}
                  <div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                      <span>전문 읽기</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 푸터 영역 */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 text-center mt-16 space-y-2">
        <p className="font-semibold text-slate-300">
          옥외광고 입찰정보 알리미 · 옥외광고 트렌드 & 정책 기사 분석
        </p>
        <p className="text-[11px] text-slate-500">
          본 사이트의 분석 콘텐츠는 옥외광고 및 공공 사인물 산업 종사자를 위한 참고 자료로 제공됩니다.
        </p>
      </footer>
    </div>
  );
}
