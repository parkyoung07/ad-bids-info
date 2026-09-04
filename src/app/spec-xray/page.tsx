import React from "react";
import type { Metadata } from "next";
import SpecXrayStudioClient from "./SpecXrayStudioClient";

export const metadata: Metadata = {
  title: "AI 시방서 3초 엑스레이 스튜디오 | SignBid AI",
  description:
    "30~50페이지짜리 복잡한 한글(HWP) 시방서를 3초 만에 엑스레이 분석! 갈바륨, SUS304 스텐, LED 모듈, SMPS 정격용량, 스카이 크레인 고소작업 안전요건, 방염/방수 시험성적서를 원클릭으로 추출합니다.",
  keywords: [
    "AI 시방서 엑스레이",
    "옥외광고 시방서 분석",
    "간판 자재 규격표",
    "LED전광판 스펙",
    "스카이 안전관리계획",
    "방염성적서",
    "IP68 방수성적서",
  ],
};

import bidsData from "../../../public/data/bids.json";
import { BidItem } from "@/components/BidCard";

export default function SpecXrayPage() {
  const bids = (bidsData as unknown as BidItem[]) || [];
  return <SpecXrayStudioClient initialBids={bids} />;
}
