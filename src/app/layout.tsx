import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignBid AI | 옥외광고 전문 AI 입찰비서 (나라장터 간판·표찰·전광판·현수막)",
  description:
    "조달청 나라장터, 온비드, K-apt 옥외광고·간판·사이니지·현수막 공공입찰 공고를 수집하고, 참가자격과 마감일을 AI가 쉽게 분석합니다.",
  keywords: [
    "SignBid AI",
    "옥외광고",
    "나라장터",
    "조달청입찰",
    "간판제작",
    "실내표찰",
    "디지털사이니지",
    "현수막",
    "공공입찰",
    "LED전광판",
  ],
  authors: [{ name: "SignBid AI" }],
  metadataBase: new URL("https://signbidai.com"),
  openGraph: {
    title: "SignBid AI | 옥외광고 전문 AI 입찰비서",
    description:
      "조달청 나라장터, 온비드, K-apt 옥외광고 공공입찰 공고 수집 및 AI 참가자격 진단 서비스",
    url: "https://signbidai.com",
    siteName: "SignBid AI",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col selection:bg-blue-600 selection:text-white">
        <Header />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}
