import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import bidsData from "../../public/data/bids.json";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ad-bids-info.pages.dev";
  const now = new Date();

  // 1. 기본 고정 페이지
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/news/`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calendar/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/prespec/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/results/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // 2. 블로그 글 동적 추가
  const posts = getAllPosts();
  posts.forEach((post) => {
    routes.push({
      url: `${baseUrl}/blog/${post.slug}/`,
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  // 3. 입찰 공고 상세 페이지 동적 추가
  const bids = (bidsData as unknown as { id: string; startDate?: string }[]) || [];
  bids.forEach((bid) => {
    routes.push({
      url: `${baseUrl}/bids/${bid.id}/`,
      lastModified: bid.startDate ? new Date(bid.startDate) : now,
      changeFrequency: "daily",
      priority: 0.7,
    });
  });

  return routes;
}
