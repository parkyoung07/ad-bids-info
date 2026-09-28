import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://signbidai.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Yeti", // 네이버 검색로봇
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot", // 구글 검색로봇
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Daumoa", // 다음/카카오 검색로봇
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
