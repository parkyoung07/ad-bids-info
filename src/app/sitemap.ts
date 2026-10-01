import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import bidsData from "../../public/data/bids.json";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://signbidai.com";
  const now = new Date();

  // 1. 기본 고정 페이지 (표준 Canonical URL 규격)
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/prespec`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/results`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/spec-xray`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/proposal`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // 2. 블로그 트렌드 분석 리포트 동적 추가
  const posts = getAllPosts();
  posts.forEach((post) => {
    routes.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  // 3. 8대 최소 공개조건을 충족한 자동수집 후보 공고 상세 페이지 동적 추가
  const bids = ((bidsData as unknown as { id: string; startDate?: string; title?: string; client?: string; officialUrl?: string; sourceDetailUrl?: string; linkUrl?: string; status?: string; validationStatus?: string; verificationStatus?: string; validation?: { status?: string } }[]) || [])
    .filter(b => {
      const isCandidate =
        b.status === "AUTO_COLLECTED_CANDIDATE" ||
        b.status === "진행중" ||
        b.status === "마감" ||
        b.validationStatus === "AUTO_COLLECTED_CANDIDATE" ||
        (b.validation && b.validation.status === "AUTO_COLLECTED_CANDIDATE") ||
        (b.validation && b.validation.status === "REVIEW_REQUIRED") ||
        (b.validation && b.validation.status === "APPROVED") ||
        b.status === "APPROVED";
      const isIsolated = ["PENDING_MANUAL_CHECK", "NEEDS_REVIEW", "DATA_CONFLICT", "REJECTED", "CANCELLED", "HELD"].includes(
        b.validation?.status || b.verificationStatus || b.validationStatus || ""
      );
      const hasOfficialUrl = Boolean(b.officialUrl || b.sourceDetailUrl || b.linkUrl);
      return isCandidate && !isIsolated && hasOfficialUrl;
    });
  bids.forEach((bid) => {
    routes.push({
      url: `${baseUrl}/bids/${bid.id}`,
      lastModified: bid.startDate ? new Date(bid.startDate) : now,
      changeFrequency: "daily",
      priority: 0.7,
    });
  });

  return routes;
}
