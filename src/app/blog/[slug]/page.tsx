import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import {
  Layers,
  Calendar,
  ArrowLeft,
  Tag,
  ExternalLink,
  BookOpen,
  Share2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "_placeholder") {
    return {
      title: "준비 중 | 옥외광고 트렌드",
    };
  }
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "글을 찾을 수 없습니다 | 옥외광고 트렌드",
    };
  }

  const keywordsList =
    post.tags && post.tags.length > 0
      ? [...post.tags, "옥외광고", "조달청나라장터", "입찰공고", "공공입찰"]
      : ["옥외광고", "조달청나라장터", "입찰공고", "공공입찰", "LED간판", "디지털사이니지"];

  const postUrl = `https://ad-bids-info.pages.dev/blog/${slug}/`;
  const coverImg =
    post.coverImage ||
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80";

  return {
    title: `${post.title} | 옥외광고 입찰정보 알리미`,
    description: post.summary || `${post.title}에 관한 옥외광고·사인물 공공입찰 심층 분석 리포트입니다.`,
    keywords: keywordsList,
    authors: [{ name: "옥외광고 입찰정보 알리미" }],
    openGraph: {
      title: post.title,
      description: post.summary || `${post.title} 분석 리포트`,
      url: postUrl,
      siteName: "옥외광고 입찰정보 알리미",
      locale: "ko_KR",
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: [
        {
          url: coverImg,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary || `${post.title} 분석 리포트`,
      images: [coverImg],
    },
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "_placeholder") {
    notFound();
  }
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href="/"
              className="flex items-center space-x-2.5 sm:space-x-3 text-white hover:text-blue-400 transition-colors shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/25 ring-1 ring-white/20 shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="whitespace-nowrap">
                <span className="font-bold text-base sm:text-lg tracking-tight">
                  옥외광고 입찰 알리미
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-1">
              <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <Link
                  href="/"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                  href="/partners"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 transition-all border border-cyan-500/30 bg-cyan-500/10"
                >
                  🤝 협력사·DB
                </Link>
                <Link
                  href="/blog"
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400"
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

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* 브레드크럼 네비게이션 */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-blue-400">홈</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-400">옥외광고 트렌드</Link>
          <span>/</span>
          <span className="text-slate-300 font-medium truncate max-w-xs">{post.category}</span>
        </div>

        {/* 아티클 헤더 */}
        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{post.date}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* 요약 박스 */}
          {post.summary && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 text-sm sm:text-base leading-relaxed">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>핵심 요약</span>
              </div>
              <p>{post.summary}</p>
            </div>
          )}

          {/* 태그 목록 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 대표 이미지 (coverImage) 및 이미지 활용 지침 준수 크레딧 표기 */}
        {post.coverImage && (
          <div className="mb-8">
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl aspect-video max-h-[440px] w-full">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
            {post.coverImageCredit && (
              <p className="mt-2 text-right text-[11px] text-slate-500">
                사진 출처:{" "}
                {post.coverImageCreditUrl ? (
                  <a
                    href={post.coverImageCreditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 underline underline-offset-2 transition-colors"
                  >
                    {post.coverImageCredit}
                  </a>
                ) : (
                  <span>{post.coverImageCredit}</span>
                )}
              </p>
            )}
          </div>
        )}

        {/* 아티클 본문 (Markdown 렌더링) */}
        <article className="prose prose-invert prose-slate max-w-none prose-headings:font-bold prose-headings:text-white prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-2 prose-h3:text-lg sm:prose-h3:text-xl prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base prose-strong:text-white prose-code:text-blue-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-blue-500 prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-300 prose-blockquote:not-italic prose-li:text-slate-300 prose-img:rounded-xl prose-img:border prose-img:border-slate-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>

        {/* 공공/언론 출처 표기 영역 */}
        {(post.source || post.sourceUrl) && (
          <div className="mt-10 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="space-y-1">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                출처 및 참고 자료
              </span>
              <p className="text-slate-400">
                {post.source ? post.source : "공공데이터포털 및 옥외광고 관련 공식 보도자료"}
              </p>
            </div>
            {post.sourceUrl && (
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 transition-colors shrink-0"
              >
                <span>원문 기사/자료 확인</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* 하단 네비게이션 버튼 영역 */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>트렌드 목록으로 돌아가기</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-colors"
          >
            <span>실시간 입찰공고 검색하기</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* 푸터 영역 */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-xs py-8 px-4 text-center mt-16">
        <p>© 2026 옥외광고 입찰정보 알리미 · 옥외광고 트렌드 & 정책 기사 분석</p>
      </footer>
    </div>
  );
}
