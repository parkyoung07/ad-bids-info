import type { Metadata } from "next";
import Chatbot from "@/components/Chatbot";
import "./globals.css";

export const metadata: Metadata = {
  title: "옥외광고 입찰정보 알리미 | 나라장터 간판·표찰·현판·랩핑 공고",
  description:
    "조달청 나라장터 옥외광고, 간판, 실내표찰, 현판, 차량랩핑, 디지털사이니지 입찰 공고를 실시간으로 맞춤 안내합니다.",
  keywords: [
    "옥외광고",
    "나라장터",
    "조달청입찰",
    "간판제작",
    "실내표찰",
    "스텐현판",
    "차량랩핑",
    "디지털사이니지",
    "현수막",
    "공공입찰",
    "LED전광판",
  ],
  authors: [{ name: "옥외광고 입찰정보 알리미" }],
  metadataBase: new URL("https://ad-bids-info.pages.dev"),
  openGraph: {
    title: "옥외광고 입찰정보 알리미 | 나라장터 간판·표찰·현판·랩핑 공고",
    description:
      "조달청 나라장터 옥외광고, 간판, 실내표찰, 현판, 차량랩핑, 디지털사이니지 입찰 공고를 실시간으로 맞춤 안내합니다.",
    url: "https://ad-bids-info.pages.dev",
    siteName: "옥외광고 입찰정보 알리미",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "옥외광고 입찰정보 알리미 | 나라장터 간판·표찰·현판·랩핑 공고",
    description:
      "조달청 나라장터 옥외광고, 간판, 실내표찰, 현판, 차량랩핑, 디지털사이니지 입찰 공고를 실시간으로 맞춤 안내합니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col selection:bg-blue-500 selection:text-white">
        {children}
        <Chatbot />
      </body>
    </html>
  );
}

