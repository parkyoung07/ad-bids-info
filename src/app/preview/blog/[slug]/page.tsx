import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug, getAllPreviewPostSlugs } from "@/lib/posts";
import {
  Calendar,
  ArrowLeft,
  Tag,
  ExternalLink,
  BookOpen,
  Sparkles,
  AlertCircle
} from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPreviewPostSlugs();
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "초안을 찾을 수 없습니다 | Staging Preview",
      robots: { index: false, follow: false }
    };
  }

  return {
    title: `[초안 미리보기] ${post.title} | SignBid Staging`,
    robots: { index: false, follow: false }
  };
}

export default async function BlogPreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Staging 초안 전용 배너 */}
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3 text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>[회장님 검수용] Staging 초안 미리보기</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                DRAFT
              </span>
            </div>
            <p className="text-xs text-amber-300/80 mt-1">
              본 문서는 회장님 검수를 위한 Staging 전용 초안이며, 회장님의 운영 발행 승인 전까지 운영 블로그 목록, 검색 색인, sitemap에 노출되지 않습니다.
            </p>
          </div>
        </div>

        {/* 상단 네비게이션 */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-sm text-[#8b949e] hover:text-[#58a6ff] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> 메인으로 돌아가기
          </Link>
        </div>

        {/* 글 헤더 */}
        <div className="space-y-4 border-b border-[#30363d] pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#1f6feb]/20 text-[#58a6ff] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#1f6feb]/30">
              {post.category}
            </span>
            <span className="flex items-center text-xs text-[#8b949e]">
              <Calendar className="w-3.5 h-3.5 mr-1" /> {post.date}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
            {post.title}
          </h1>

          {post.summary && (
            <p className="text-base text-[#8b949e] leading-relaxed">
              {post.summary}
            </p>
          )}

          {post.coverImage && (
            <div className="mt-6 rounded-xl overflow-hidden border border-[#30363d] bg-[#161b22]">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto max-h-[400px] object-cover"
              />
              {post.coverImageCredit && (
                <div className="px-4 py-2 text-xs text-[#8b949e] bg-[#0d1117]/80 text-right">
                  {post.coverImageCreditUrl ? (
                    <a
                      href={post.coverImageCreditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-[#58a6ff]"
                    >
                      {post.coverImageCredit}
                    </a>
                  ) : (
                    post.coverImageCredit
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 본문 Markdown 렌더링 */}
        <article className="prose prose-invert max-w-none prose-headings:text-[#f0f6fc] prose-p:text-[#c9d1d9] prose-p:leading-relaxed prose-a:text-[#58a6ff] prose-strong:text-white prose-li:text-[#c9d1d9] prose-blockquote:border-l-[#1f6feb] prose-blockquote:bg-[#161b22]/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>

        {/* 출처 안내 */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mt-12 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <BookOpen className="w-4 h-4 text-[#58a6ff]" /> 공식 출처 및 법적 안내
          </div>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            ※ 본 글은 조달청 나라장터 OpenAPI에서 자동수집된 입찰 후보를 바탕으로 작성한 참고자료입니다. 공고 상태·참가자격·금액·마감일·제출서류는 나라장터 공식 원문에서 최종 확인해야 합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
