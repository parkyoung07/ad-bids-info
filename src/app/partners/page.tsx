import React from "react";
import type { Metadata } from "next";
import PartnersClient from "./PartnersClient";

export const metadata: Metadata = {
  title: "전국 17개 시·도 옥외광고 공공등록 협력사 및 공동수급 파트너 네트워크 | SignBid AI",
  description:
    "행정안전부 및 17개 시·도 지자체 옥외광고사업 등록대장 기반 검증 네트워크. 휴·폐업 없는 정상영업 등록업체 19,940여 개사 전수 대조, 직접생산확인 공장, LED채널·전광판·스카이 크레인·전문시공팀 실시간 검색 및 제휴 지원.",
  keywords: [
    "옥외광고 등록업체",
    "공동수급 파트너",
    "직접생산확인 공장",
    "LED채널간판 제작공장",
    "LED전광판 파트너",
    "관공서 표찰 제작",
    "스카이 크레인 고소작업",
    "옥외광고 공동도급",
    "SignBid 파트너",
  ],
};

export default function PartnersPage() {
  return <PartnersClient />;
}
