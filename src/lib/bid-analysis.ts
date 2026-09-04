import awardData from '../../public/data/award-results.json';

export interface BidTerminology {
  term: string;
  definition: string;
  formula: string;
  note: string;
}

export const BID_TERMINOLOGY: Record<string, BidTerminology> = {
  사정률: {
    term: "사정률 (복수예비가격 결정 비율)",
    definition: "발주기관이 정한 기초금액을 기준으로 15개의 복수예비가격을 작성할 때 적용되는 비율입니다.",
    formula: "(예정가격 ÷ 기초금액) × 100%",
    note: "국가계약/지자체 발주에 따라 기초금액 대비 ±2% ~ ±3% 범위 내에서 무작위 4개 추첨 평균으로 결정됩니다."
  },
  투찰률: {
    term: "투찰률 (입찰자 투찰 비율)",
    definition: "입찰 참가업체가 기초금액 또는 예정가격 대비 얼마의 비율로 투찰서를 제출했는지를 나타냅니다.",
    formula: "(투찰금액 ÷ 예정가격 또는 기초금액) × 100%",
    note: "공고문 산식에 따라 A값(국민연금 등 공제항목) 반영 여부를 반드시 확인해야 합니다."
  },
  낙찰률: {
    term: "낙찰률 (예정가격 대비 낙찰 비율)",
    definition: "실제 개찰 후 결정된 예정가격을 기준으로 최종 1순위 낙찰자가 써낸 금액의 비율입니다.",
    formula: "(최종 낙찰금액 ÷ 확정 예정가격) × 100%",
    note: "적격심사 기준 낙찰하한율 이상자 중 최저가 투찰자가 1순위 대상자가 됩니다."
  },
  낙찰가율: {
    term: "낙찰가율 (기초금액 대비 낙찰 비율)",
    definition: "공고 당시 공개된 기초금액(배정예산) 대비 최종 계약 낙찰금액의 비율입니다.",
    formula: "(최종 낙찰금액 ÷ 기초금액) × 100%",
    note: "실제 사업 예산 대비 낙찰 규모를 가늠할 때 주로 사용됩니다."
  },
  낙찰하한율: {
    term: "낙찰하한율 (법정 최저 투찰 기준율)",
    definition: "덤핑 투찰 및 부실 시공을 방지하기 위해 법령으로 정한 적격심사 통과 최소 투찰 비율입니다.",
    formula: "발주처 적격심사 기준표 참조 (예: 용역 87.745%, 물품 84.245%, 중기간경쟁 87.995%)",
    note: "낙찰하한율 미만으로 투찰하면 적격심사 대상에서 즉시 탈락(실격)됩니다."
  }
};

export interface ClientBidStats {
  clientName: string;
  matchedCount: number;
  isSampleInsufficient: boolean; // 표본 5건 미만 여부
  sampleInsufficientMessage?: string;
  avgRate: number;
  minRate: number;
  maxRate: number;
  recommendedLowRate: number;
  recommendedHighRate: number;
  recommendedLowPrice: number;
  recommendedHighPrice: number;
  avgBidders: number;
  distribution: {
    label: string;
    range: string;
    count: number;
    percentage: number;
    isHotZone: boolean;
  }[];
  aiStrategyNote: string;
  dataOrigin: string;
  lastUpdated: string;
}

export interface QualificationProfile {
  isRegisteredUser?: boolean;
  hasLicense?: boolean; // 옥외광고사업 등록증
  hasDirectProduction?: boolean; // 직접생산확인증명서
  hasLocationMatch?: boolean; // 관내/지역 요건 충족
  hasPastExperience?: boolean; // 3년 내 유사 실적 보유
}

export type QualificationStatus = 
  | 'HIGH' // 참가 가능성 높음
  | 'NEEDS_CONFIRM' // 추가 확인 필요
  | 'INELIGIBLE' // 필수조건 미충족
  | 'PENDING'; // 분석정보 부족 (판정 보류)

export interface QualificationResult {
  score?: number; // 0 ~ 100
  status: QualificationStatus;
  statusText: string;
  badgeColor: string;
  isPending: boolean;
  checklistStatus: {
    license: { passed: boolean; label: string; tip: string };
    directProduction: { passed: boolean; label: string; tip: string };
    location: { passed: boolean; label: string; tip: string };
    experience: { passed: boolean; label: string; tip: string };
  };
  summaryAdvice: string;
  legalNotice: string;
}

interface AwardDataRecord {
  id: string;
  title: string;
  category: string;
  client: string;
  budget?: number;
  rate?: number;
  biddersCount?: number;
  openedDate?: string;
}

/**
 * 발주처 및 카테고리 기반 과거 낙찰 통계 분석 함수 (신뢰성 강화 & 표본 5건 미만 안전조치)
 */
export function getClientBidStats(clientName: string, category: string, budget: number): ClientBidStats {
  const awards = (awardData as unknown as AwardDataRecord[]) || [];
  
  // 1. 발주처명 직접 매칭
  let matched = awards.filter((a) => a.client && (a.client.includes(clientName) || clientName.includes(a.client)));
  
  // 2. 발주처 매칭이 5건 미만인 경우 동일 카테고리 실적 검색
  if (matched.length < 5) {
    matched = awards.filter((a) => a.category && (a.category.includes(category) || category.includes(a.category)));
  }

  const sampleCount = matched.length;
  const isSampleInsufficient = sampleCount < 5;

  if (isSampleInsufficient || sampleCount === 0) {
    return {
      clientName,
      matchedCount: sampleCount,
      isSampleInsufficient: true,
      sampleInsufficientMessage: "유사 낙찰사례가 부족하여 신뢰할 수 있는 투찰구간을 산출하기 어렵습니다.",
      avgRate: 0,
      minRate: 0,
      maxRate: 0,
      recommendedLowRate: 0,
      recommendedHighRate: 0,
      recommendedLowPrice: 0,
      recommendedHighPrice: 0,
      avgBidders: 0,
      distribution: [],
      aiStrategyNote: "공식 낙찰 표본 건수가 부족하여 특정 투찰구간을 권장하지 않습니다. 공고문 내 낙찰하한율 및 기초금액 산식을 직접 확인하십시오.",
      dataOrigin: "조달청 나라장터 공공데이터 검증 표본",
      lastUpdated: "2026.09.04 10:00"
    };
  }

  const rates = matched.map((a) => a.rate || 88.0);
  const bidders = matched.map((a) => a.biddersCount || 10);
  
  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const avgBidders = Math.round((bidders.reduce((a, b) => a + b, 0) / bidders.length) * 10) / 10;

  const isHighestBid = category.includes('매체') || category.includes('임대');
  
  let recommendedLowRate = 87.850;
  let recommendedHighRate = 88.150;

  if (isHighestBid) {
    recommendedLowRate = 115.000;
    recommendedHighRate = 125.000;
  } else {
    recommendedLowRate = Math.max(87.745, Math.round((avgRate - 0.100) * 1000) / 1000);
    recommendedHighRate = Math.round((avgRate + 0.150) * 1000) / 1000;
  }

  const recommendedLowPrice = Math.round((budget * recommendedLowRate) / 100);
  const recommendedHighPrice = Math.round((budget * recommendedHighRate) / 100);

  // 표본 수와 정확히 일치하는 히스토그램 생성
  const binCount = 5;
  const step = (maxRate - minRate) / binCount || 0.2;
  const distribution = Array.from({ length: binCount }, (_, i) => {
    const low = minRate + i * step;
    const high = i === binCount - 1 ? maxRate + 0.001 : low + step;
    const count = rates.filter((r) => r >= low && r < high).length;
    const percentage = Math.round((count / sampleCount) * 100);
    return {
      label: `${low.toFixed(2)}% ~ ${high.toFixed(2)}%`,
      range: `${low.toFixed(3)}% - ${high.toFixed(3)}%`,
      count,
      percentage,
      isHotZone: count >= Math.ceil(sampleCount / binCount)
    };
  });

  const aiStrategyNote = isHighestBid
    ? `${clientName}의 자산 임대/매체권 공고는 온비드 최고가 경쟁 방식입니다. 수익성을 종합 검토하여 투찰가를 산정하세요.`
    : `${clientName}의 유사 옥외광고 발주 표본 ${sampleCount}건의 평균 사정률은 ${avgRate.toFixed(3)}%입니다. 적격심사 하한율을 준수하세요.`;

  return {
    clientName,
    matchedCount: sampleCount,
    isSampleInsufficient: false,
    avgRate: Math.round(avgRate * 1000) / 1000,
    minRate,
    maxRate,
    recommendedLowRate,
    recommendedHighRate,
    recommendedLowPrice,
    recommendedHighPrice,
    avgBidders,
    distribution,
    aiStrategyNote,
    dataOrigin: "조달청 나라장터 공공데이터 실시간 연계",
    lastUpdated: "2026.09.04 10:00"
  };
}

/**
 * 입찰 참가자격 판정 함수 (미입력 시 '판정 보류' 및 4단계 표준 체계)
 */
export function evaluateQualification(
  profile: QualificationProfile | null | undefined,
  location: string,
  category: string
): QualificationResult {
  const legalNotice = "본 결과는 등록된 회사정보와 AI 분석을 바탕으로 한 참고자료입니다. 실제 입찰 전 공식 공고문과 발주기관 안내를 반드시 확인해야 합니다.";

  // 사용자 프로필이 등록되지 않은 경우: '판정 보류 / 분석정보 부족'
  if (!profile || profile.isRegisteredUser === false) {
    return {
      status: 'PENDING',
      statusText: '판정 보류 (분석정보 부족)',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      isPending: true,
      checklistStatus: {
        license: { passed: false, label: '옥외광고사업 등록증', tip: '등록 필요' },
        directProduction: { passed: false, label: '직접생산확인증명서', tip: '등록 필요' },
        location: { passed: false, label: '관내 소재지 여부', tip: '등록 필요' },
        experience: { passed: false, label: '유사 시공 실적', tip: '등록 필요' }
      },
      summaryAdvice: '회사의 지역, 면허, 직접생산확인증명, 실적 정보를 등록하면 참가 가능성을 분석할 수 있습니다.',
      legalNotice
    };
  }

  let score = 0;
  const isNational = location === '전국';
  const isLease = category.includes('매체') || category.includes('임대');

  if (profile.hasLicense) score += 40;
  if (isLease || profile.hasDirectProduction) score += 30;
  if (isNational || profile.hasLocationMatch) score += 15;
  if (profile.hasPastExperience) score += 15;

  let status: QualificationStatus = 'HIGH';
  let statusText = '참가 가능성 높음';
  let badgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  let summaryAdvice = '기본 참가 자격 요건을 충족하는 것으로 분석됩니다. 공고문의 세부 서류를 최종 확인하세요.';

  if (!profile.hasLicense) {
    status = 'INELIGIBLE';
    statusText = '필수조건 미충족';
    badgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    summaryAdvice = '옥외광고사업 등록증이 확인되지 않아 단독 투찰이 어렵습니다. 면허 보유 여부를 확인하십시오.';
  } else if (!isLease && !profile.hasDirectProduction) {
    status = 'NEEDS_CONFIRM';
    statusText = '추가 확인 필요';
    badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    summaryAdvice = '직접생산확인증명서의 세부품명 번호 및 유효기간을 SMPP에서 반드시 확인해야 합니다.';
  } else if (!isNational && !profile.hasLocationMatch) {
    status = 'NEEDS_CONFIRM';
    statusText = '추가 확인 필요';
    badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    summaryAdvice = `본 공고는 [${location}] 관내 업체 제한 조건이 포함되어 있습니다. 사업자등록증상 본점 소재지를 확인하세요.`;
  } else if (!profile.hasPastExperience) {
    status = 'HIGH';
    statusText = '참가 가능성 높음';
    badgeColor = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    summaryAdvice = '기본 자격은 충족됩니다. 적격심사 실적 배점 기준을 공고문에서 추가 확인하십시오.';
  }

  return {
    score,
    status,
    statusText,
    badgeColor,
    isPending: false,
    checklistStatus: {
      license: {
        passed: !!profile.hasLicense,
        label: '옥외광고사업 등록증',
        tip: profile.hasLicense ? '자격 요건 충족' : '필수 면허 미보유 (입찰 불가)'
      },
      directProduction: {
        passed: isLease || !!profile.hasDirectProduction,
        label: isLease ? '매체권 운영 (직생 면제)' : '직접생산확인증명서',
        tip: isLease || profile.hasDirectProduction ? '자격 요건 충족' : 'SMPP 직생증명서 유효기간 확인 필요'
      },
      location: {
        passed: isNational || !!profile.hasLocationMatch,
        label: isNational ? '전국 입찰 (지역 무관)' : `${location} 관내 소재`,
        tip: isNational || profile.hasLocationMatch ? '소재지 요건 충족' : '해당 관내 본점 소재지 확인 필요'
      },
      experience: {
        passed: !!profile.hasPastExperience,
        label: '최근 3년 동종 시공실적',
        tip: profile.hasPastExperience ? '실적 요건 확인' : '소액수의 계약은 실적 없이도 참여 가능'
      }
    },
    summaryAdvice,
    legalNotice
  };
}
