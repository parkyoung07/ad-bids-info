import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "옥외광고 입찰정보 알리미 | 나라장터 사인물 공고 실시간 조회",
  description: "옥외간판, 실내표찰, 현수막, 차량랩핑 등 옥외광고 및 사인물 관련 조달청 나라장터 입찰공고를 한눈에 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
