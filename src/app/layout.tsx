import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import MobileBottomNav from "@/components/MobileBottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SignBid AI | 옥외광고 · 인쇄 · 행사전시 공공입찰 전문 플랫폼",
    template: "%s | SignBid AI",
  },
  description:
    "조달청 나라장터, 온비드, K-apt 옥외광고·간판·디지털사이니지·인쇄출판·행사전시 공공입찰 공고를 실시간 수집하고, AI가 참가자격·직접생산·투찰분석을 지원합니다.",
  keywords: [
    "SignBid AI",
    "싸인비드",
    "옥외광고",
    "옥외광고입찰",
    "나라장터",
    "조달청나라장터",
    "공공입찰",
    "간판제작",
    "LED채널간판",
    "LED전광판",
    "디지털사이니지",
    "현수막제작",
    "실내표찰",
    "인쇄출판",
    "인쇄입찰",
    "간행물인쇄",
    "리플렛인쇄",
    "전시부스",
    "축제대행",
    "행사기획입찰",
    "직접생산확인",
    "낙찰결과",
    "입찰분석",
    "입찰정보",
  ],
  authors: [{ name: "SignBid AI", url: "https://signbidai.com" }],
  creator: "SignBid AI",
  publisher: "SignBid AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://signbidai.com"),
  alternates: {
    canonical: "https://signbidai.com",
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
    title: "SignBid AI | 옥외광고 · 인쇄 · 행사전시 공공입찰 전문 플랫폼",
    description:
      "조달청 나라장터, 온비드, K-apt 옥외광고·인쇄·전시 공공입찰 실시간 수집 및 AI 참가자격·낙찰 분석",
    url: "https://signbidai.com",
    siteName: "SignBid AI",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "SignBid AI - 옥외광고·인쇄·행사전시 공공입찰 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SignBid AI | 옥외광고 · 인쇄 · 행사전시 공공입찰 전문 플랫폼",
    description:
      "조달청 나라장터, 온비드, K-apt 옥외광고·인쇄·전시 공공입찰 실시간 수집 및 AI 참가자격·낙찰 분석",
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&h=630&q=80",
    ],
  },
  other: {
    "naver-site-verification": "4e7798c498081ad3ab5efca7e530eb7a340c2b3b",
    "google-site-verification": "google51f0949a73c1e8e5",
  },
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://signbidai.com/#website",
      "url": "https://signbidai.com",
      "name": "SignBid AI",
      "description": "옥외광고·인쇄·행사전시 공공입찰 전문 AI 분석 플랫폼",
      "publisher": {
        "@id": "https://signbidai.com/#organization",
      },
      "inLanguage": "ko-KR",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://signbidai.com/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://signbidai.com/#organization",
      "name": "SignBid AI",
      "url": "https://signbidai.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://signbidai.com/favicon.ico",
      },
      "description": "전국 옥외광고, 인쇄, 전시·행사 사업자를 위한 조달청 나라장터 실시간 입찰 분석 및 협력사 네트워크",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://signbidai.com/partners",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="naver-site-verification" content="4e7798c498081ad3ab5efca7e530eb7a340c2b3b" />
        <meta name="google-site-verification" content="google51f0949a73c1e8e5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col selection:bg-blue-600 selection:text-white pb-16 lg:pb-0">
        <Header />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
        <Chatbot />
        <MobileBottomNav />
      </body>
    </html>
  );
}
