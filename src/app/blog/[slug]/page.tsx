import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import BlogKakaoCTA from "@/components/BlogKakaoCTA";
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
  Hash,
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

  const coreSearchKeywords = [
    "나라장터",
    "광고입찰",
    "인쇄입찰",
    "전시행사입찰",
    "축제용품입찰",
    "간판제작입찰",
    "공공입찰",
    "직접생산확인",
    "옥외광고입찰",
    "조달청나라장터",
    "SignBid AI"
  ];

  const keywordsList = [
    ...coreSearchKeywords,
    ...coreSearchKeywords.map((k) => `#${k}`),
    ...(post.tags || []),
    ...(post.tags || []).map((t) => `#${t}`),
  ];

  const postUrl = `https://signbidai.com/blog/${slug}`;
  const coverImg =
    post.coverImage ||
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80";

  return {
    title: `${post.title} | SignBid AI 입찰 분석 리포트`,
    description:
      post.summary ||
      `${post.title}에 관한 옥외광고·인쇄·전시 공공입찰 심층 분석 리포트입니다.`,
    keywords: keywordsList,
    authors: [{ name: "SignBid AI 입찰분석팀", url: "https://signbidai.com" }],
    creator: "SignBid AI",
    publisher: "SignBid AI",
    metadataBase: new URL("https://signbidai.com"),
    alternates: {
      canonical: postUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: post.title,
      description:
        post.summary || `${post.title} 공공입찰 전문 분석 리포트`,
      url: postUrl,
      siteName: "SignBid AI",
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
      description:
        post.summary || `${post.title} 공공입찰 전문 분석 리포트`,
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
  let cleanContent = post.content || "";
  if (post.coverImage) {
    cleanContent = cleanContent
      .replace(
        new RegExp(
          `^\\s*!\\[[^\\]]*\\]\\(${post.coverImage.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}\\)[^\\n]*\\n*(\\*[^*]+\\*\\n*)?`,
          "i"
        ),
        ""
      )
      .trim();
  }

  const postUrl = `https://signbidai.com/blog/${slug}`;
  const coverImg =
    post.coverImage ||
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80";

  // JSON-LD 구조화 데이터 (Schema.org BlogPosting & BreadcrumbList)
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${postUrl}#article`,
        "isPartOf": {
          "@type": "WebPage",
          "@id": postUrl,
          "url": postUrl,
          "name": post.title,
        },
        "headline": post.title,
        "description": post.summary,
        "image": coverImg,
        "datePublished": post.date,
        "dateModified": post.date,
        "author": {
          "@type": "Organization",
          "name": "SignBid AI 입찰분석팀",
          "url": "https://signbidai.com",
        },
        "publisher": {
          "@type": "Organization",
          "name": "SignBid AI",
          "url": "https://signbidai.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://signbidai.com/favicon.ico",
          },
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": postUrl,
        },
        "keywords": (post.tags || []).join(", "),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "홈",
            "item": "https://signbidai.com",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "옥외광고 트렌드",
            "item": "https://signbidai.com/blog",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": postUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* 검색엔진용 JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* 브레드크럼 네비게이션 */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-blue-400">
            홈
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-400">
            옥외광고 트렌드
          </Link>
          <span>/</span>
          <span className="text-slate-300 font-medium truncate max-w-xs">
            {post.category}
          </span>
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
                <span className="truncate max-w-xs sm:max-w-md">
                  출처: {post.source}
                </span>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {post.title}
          </h1>

          {post.summary && (
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              {post.summary}
            </p>
          )}
        </header>

        {/* 대표 커버 이미지 및 저작권 정보 */}
        {post.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-auto max-h-[480px] object-cover"
            />
            {post.coverImageCredit && (
              <div className="p-2.5 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80">
                <span>{post.coverImageCredit}</span>
                {post.coverImageCreditUrl && (
                  <a
                    href={post.coverImageCreditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>출처 확인</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* 본문 콘텐츠 (ReactMarkdown 렌더링) */}
        <article className="prose prose-invert prose-slate max-w-none prose-headings:font-bold prose-headings:text-white prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-2 prose-h3:text-lg sm:prose-h3:text-xl prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base prose-strong:text-white prose-code:text-blue-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-blue-500 prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-300 prose-blockquote:not-italic prose-li:text-slate-300 prose-img:rounded-xl prose-img:border prose-img:border-slate-800">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ ...props }) => (
                <div className="my-6 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg not-prose">
                  {/* 모바일 가로 스크롤 안내 힌트 바 */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-slate-300">
                      <span className="text-blue-400">📊</span>
                      <span>데이터 분석 및 요약 비교표</span>
                    </span>
                    <span className="text-[11px] text-amber-400/90 font-medium sm:hidden">
                      👉 표를 좌우로 스크롤하여 전체 내용 확인
                    </span>
                  </div>
                  <div className="overflow-x-auto no-scrollbar p-1">
                    <table
                      className="w-full text-left border-collapse"
                      {...props}
                    />
                  </div>
                </div>
              ),
              th: ({ ...props }) => (
                <th
                  className="px-4 py-3 bg-slate-950/70 text-xs font-bold text-slate-200 border-b border-slate-700/80 whitespace-nowrap"
                  {...props}
                />
              ),
              td: ({ ...props }) => (
                <td
                  className="px-4 py-2.5 text-xs text-slate-300 border-b border-slate-800/60 whitespace-nowrap sm:whitespace-normal"
                  {...props}
                />
              ),
            }}
          >
            {cleanContent}
          </ReactMarkdown>
        </article>

        {/* 🏷️ 네이버 & 구글 검색 최적화 핵심 해시태그 섹션 (회장님 엄선 5대 공공입찰 검색어 반영) */}
        <section className="mt-8 pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                네이버·구글 공공입찰 핵심 추천 검색어 & 해시태그
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              클릭 시 실시간 입찰공고 바로 검색
            </span>
          </div>

          {/* 1. 핵심 공공입찰 키워드 칩 (나라장터, 광고입찰, 인쇄입찰, 전시행사입찰, 축제용품입찰 등) */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-inner">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>공공입찰 5대 핵심 검색어:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/?q=나라장터"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 hover:text-white border border-blue-400/40 text-xs font-bold transition-all shadow-sm"
                  title="'나라장터' 실시간 공고 검색"
                >
                  <span className="text-blue-400">#</span>
                  <span>나라장터</span>
                </Link>

                <Link
                  href="/?q=광고"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 hover:text-white border border-indigo-400/40 text-xs font-bold transition-all shadow-sm"
                  title="'광고입찰' 실시간 공고 검색"
                >
                  <span className="text-indigo-400">#</span>
                  <span>광고입찰</span>
                </Link>

                <Link
                  href="/?q=인쇄"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white border border-emerald-400/40 text-xs font-bold transition-all shadow-sm"
                  title="'인쇄입찰' 실시간 공고 검색"
                >
                  <span className="text-emerald-400">#</span>
                  <span>인쇄입찰</span>
                </Link>

                <Link
                  href="/?q=전시"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 hover:text-white border border-pink-400/40 text-xs font-bold transition-all shadow-sm"
                  title="'전시 행사입찰' 실시간 공고 검색"
                >
                  <span className="text-pink-400">#</span>
                  <span>전시 행사입찰</span>
                </Link>

                <Link
                  href="/?q=축제"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-white border border-amber-400/40 text-xs font-bold transition-all shadow-sm"
                  title="'축제용품입찰' 실시간 공고 검색"
                >
                  <span className="text-amber-400">#</span>
                  <span>축제용품입찰</span>
                </Link>

                <Link
                  href="/?q=간판"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-white border border-cyan-400/40 text-xs font-bold transition-all shadow-sm"
                  title="'간판제작입찰' 실시간 공고 검색"
                >
                  <span className="text-cyan-400">#</span>
                  <span>간판제작입찰</span>
                </Link>

                <Link
                  href="/partners"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 hover:text-white border border-teal-400/40 text-xs font-bold transition-all shadow-sm"
                  title="'직접생산확인' 파트너 디렉토리 조회"
                >
                  <span className="text-teal-400">#</span>
                  <span>직접생산확인</span>
                </Link>
              </div>
            </div>

            {/* 2. 본 기사 주제별 맞춤 해시태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  <span>본 리포트 연관 태그:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag, idx) => (
                    <Link
                      key={idx}
                      href={`/?q=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-xs transition-colors"
                      title={`'${tag}' 관련 공고 검색`}
                    >
                      <span className="text-slate-500">#</span>
                      <span>{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 💬 카카오톡 맞춤 알림 신청 CTA */}
        <BlogKakaoCTA
          title={`${post.title} (관련 공고 알림)`}
          category={post.tags?.[0] || "간판·조형물"}
        />

        {/* 공식 출처 및 데이터 신뢰성 안내 섹션 */}
        <section className="mt-8 space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 border border-blue-500/30 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">
                    기사 자료 출처 및 공인 레퍼런스
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {post.source ||
                    "행정안전부, 조달청 나라장터, 한국옥외광고센터 및 공공기관 보도자료"}
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
            <p className="font-semibold mb-0.5">※ SignBid 안내</p>
            <p>
              본 글은 조달청 나라장터 OpenAPI에서 자동수집된 입찰 후보를 바탕으로 작성한 참고자료입니다. 공고 상태·참가자격·금액·마감일·제출서류는 나라장터 공식 원문에서 최종 확인해야 합니다.
            </p>
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
