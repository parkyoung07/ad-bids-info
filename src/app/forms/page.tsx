import React from "react";
import type { Metadata } from "next";
import FormsClient from "./FormsClient";

export const metadata: Metadata = {
  title: "옥외광고 공공입찰 필수 서류 양식 무료 자료실 | SignBid AI",
  description:
    "적격심사 자기평가표, 직접생산확인 신청서, 위임장, 사용인감계, 하자보수 확약서, 고소작업 안전관리계획서 등 옥외광고 입찰에 꼭 필요한 표준 서식 8종 무료 다운로드 및 복사 제공.",
  keywords: [
    "옥외광고 입찰 서식",
    "적격심사 자기평가표",
    "직접생산확인 신청서",
    "나라장터 위임장",
    "사용인감계 양식",
    "간판 하자보수확약서",
    "스카이 안전관리계획서",
    "공동수급협정서",
  ],
};

export default function FormsPage() {
  return <FormsClient />;
}
