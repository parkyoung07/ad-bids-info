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

  // 본문 맨 앞에 대표 이미지(coverImage)와 중복되는 마크다운 이미지가 있을 경우 자동 제거
  let cleanContent = post.content || '';
  if (post.coverImage) {
    cleanContent = cleanContent.replace(
      new RegExp(`^\\s*!\\[[^\\]]*\\]\\(${post.coverImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)[^\\n]*\\n*(\\*[^*]+\\*\\n*)?`, 'i'),
      ''
    ).trim();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
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
            {post.source && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-xs sm:max-w-md">출처: {post.source}</span>
              </div>
            )}
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
            {cleanContent}
          </ReactMarkdown>
        </article>

        {/* 공식 출처 및 데이터 신뢰성 안내 섹션 */}
        <section className="mt-12 space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 border border-blue-500/30 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">기사 자료 출처 및 공인 레퍼런스</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {post.source || "행정안전부, 조달청 나라장터, 한국옥외광고센터 및 공공기관 보도자료"}
                </p>
              </div>
              {post.sourceUrl && (
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all shrink-0"
                >
                  <span>공식 원문 출처 바로가기</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* 기사 및 정책 리포트 안내 배너 */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] sm:text-xs text-blue-300/90 leading-relaxed">
            <p className="font-semibold mb-0.5">※ 기사 및 리포트 안내</p>
            <p>본 기사는 각 정부 부처, 공공기관 및 전문 언론사의 공식 보도자료와 공개 데이터를 바탕으로 작성된 분석 리포트입니다. 법령 개정 및 세부 정책 일정은 행정기관의 사정에 따라 변동될 수 있으므로, 관련 업무 추진 시 소관 부처의 공식 고시 및 원문 자료를 최종 확인하시기 바랍니다.</p>
          </div>
        </section>

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
    </div>
  );
}
