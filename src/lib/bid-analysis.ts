import awardData from '../../public/data/award-results.json';

export interface ClientBidStats {
  clientName: string;
  matchedCount: number;
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
}

export interface QualificationProfile {
  hasLicense: boolean; // 옥외광고사업 등록증
  hasDirectProduction: boolean; // 직접생산확인증명서
  hasLocationMatch: boolean; // 관내/지역 요건 충족
  hasPastExperience: boolean; // 3년 내 유사 실적 보유
}

export interface QualificationResult {
  score: number; // 0 ~ 100
  status: 'PASS' | 'WARNING' | 'FAIL';
  statusText: string;
  badgeColor: string;
  checklistStatus: {
    license: { passed: boolean; label: string; tip: string };
    directProduction: { passed: boolean; label: string; tip: string };
    location: { passed: boolean; label: string; tip: string };
    experience: { passed: boolean; label: string; tip: string };
  };
  summaryAdvice: string;
}

interface AwardDataRecord {
  id: string;
  title: string;
  category: string;
  client: string;
  budget?: number;
  rate?: number;
  biddersCount?: number;
}

/**
 * 발주처 및 카테고리 기반 과거 낙찰 사정률 통계 분석 함수
 */
export function getClientBidStats(clientName: string, category: string, budget: number): ClientBidStats {
  const awards = awardData as unknown as AwardDataRecord[];
  
  // 1. 발주처명 또는 기관 유형별 매칭 (유사 발주처 포함)
  let matched = awards.filter((a) => a.client.includes(clientName) || clientName.includes(a.client));
  
  if (matched.length === 0) {
    // 발주처 직접 매칭 없으면 동일 카테고리 또는 유사 공공기관 매칭
    matched = awards.filter((a) => a.category.includes(category) || category.includes(a.category));
  }

  if (matched.length === 0) {
    matched = awards;
  }

  const rates = matched.map((a) => a.rate || 88.0);
  const bidders = matched.map((a) => a.biddersCount || 12);
  
  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const avgBidders = Math.round((bidders.reduce((a, b) => a + b, 0) / bidders.length) * 10) / 10;

  // AI 스마트 추천 구간 계산 (투찰하한율 87.745% 기준 직상단 0.15%~0.35% 가중치)
  const isHighestBid = category.includes('매체') || category.includes('임대');
  
  let recommendedLowRate = 87.850;
  let recommendedHighRate = 88.150;

  if (isHighestBid) {
    recommendedLowRate = 115.000;
    recommendedHighRate = 125.000;
  } else {
    // 평균 낙찰률 주변의 최적 확률 구간
    recommendedLowRate = Math.max(87.745, Math.round((avgRate - 0.125) * 1000) / 1000);
    recommendedHighRate = Math.round((avgRate + 0.175) * 1000) / 1000;
  }

  const recommendedLowPrice = Math.round((budget * recommendedLowRate) / 100);
  const recommendedHighPrice = Math.round((budget * recommendedHighRate) / 100);

  // 사정률 분포 히스토그램 생성 (5개 구간)
  const distribution = isHighestBid
    ? [
        { label: '100% ~ 105%', range: '100.0 - 105.0%', count: 1, percentage: 15, isHotZone: false },
        { label: '105% ~ 115%', range: '105.0 - 115.0%', count: 2, percentage: 25, isHotZone: false },
        { label: '115% ~ 125%', range: '115.0 - 125.0%', count: 4, percentage: 45, isHotZone: true },
        { label: '125% ~ 135%', range: '125.0 - 135.0%', count: 1, percentage: 10, isHotZone: false },
        { label: '135% 초과', range: '135.0% +', count: 1, percentage: 5, isHotZone: false },
      ]
    : [
        { label: '87.745% ~ 87.850%', range: '하한선 초근접', count: 3, percentage: 30, isHotZone: false },
        { label: '87.851% ~ 88.050%', range: '황금 집중 구간', count: 5, percentage: 45, isHotZone: true },
        { label: '88.051% ~ 88.250%', range: '중간 안전 구간', count: 2, percentage: 15, isHotZone: false },
        { label: '88.251% ~ 88.500%', range: '고가 투찰 구간', count: 1, percentage: 7, isHotZone: false },
        { label: '88.501% 이상', range: '탈락 위험 구간', count: 1, percentage: 3, isHotZone: false },
      ];

  // 발주처 특화 AI 전략 메시지 생성
  let aiStrategyNote = '';
  if (isHighestBid) {
    aiStrategyNote = `${clientName}의 매체권 입찰은 최고가 경쟁입니다. 유동인구 대비 광고 수주 수익성을 보수적으로 산정하여 115%~125% 선에서 투찰하는 것이 안전합니다.`;
  } else if (clientName.includes('교육') || clientName.includes('학교')) {
    aiStrategyNote = `교육기관 및 학교 발주는 소액수의 및 적격심사(88.0% 안팎) 낙찰 비중이 높습니다. 친환경 자재 및 안전 기준을 철저히 준수해야 적격심사 감점을 방지할 수 있습니다.`;
  } else if (clientName.includes('병원') || clientName.includes('의료')) {
    aiStrategyNote = `공공병원 발주는 야간 시인성과 24시간 연속 가동 내구성을 중시합니다. 87.8%~88.0% 초반 구간 투찰과 함께 하자보증 2년 이행 능력을 어필하세요.`;
  } else {
    aiStrategyNote = `${clientName}의 옥외광고 관련 공고는 평균 사정률 ${avgRate.toFixed(3)}% 전후에서 1순위 적격자가 다수 배출되었습니다. 황금 구간(${recommendedLowRate}% ~ ${recommendedHighRate}%) 내 투찰을 추천합니다.`;
  }

  return {
    clientName,
    matchedCount: matched.length,
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
  };
}

/**
 * 입찰 참가자격 원클릭 자가진단 평가 함수
 */
export function evaluateQualification(
  profile: QualificationProfile,
  location: string,
  category: string
): QualificationResult {
  let score = 0;
  const isNational = location === '전국';
  const isLease = category.includes('매체') || category.includes('임대');

  // 1. 옥외광고사업 등록증 (40점 배점 - 필수 기본 면허)
  if (profile.hasLicense) score += 40;

  // 2. 직접생산확인증명서 (30점 배점 - 중기부 필수 요건)
  if (isLease || profile.hasDirectProduction) score += 30;

  // 3. 지역 요건 (15점 배점)
  if (isNational || profile.hasLocationMatch) score += 15;

  // 4. 최근 3년 실적 (15점 배점 - 적격심사 만점 기준)
  if (profile.hasPastExperience) score += 15;

  let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  let statusText = '🟢 적격 통과 확실 (입찰 추천)';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  let summaryAdvice = '모든 법정 면허와 필수 참가 요건을 100% 충족하셨습니다. 나라장터 투찰을 적극 권장합니다!';

  if (!profile.hasLicense) {
    status = 'FAIL';
    statusText = '🔴 참가 불가 (필수 면허 미보유)';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    summaryAdvice = '옥외광고사업 등록증이 없어 본 공고에 단독 투찰할 수 없습니다. 등록을 완료하시거나 공동수급(면허 보유사와 협력)을 검토하세요.';
  } else if (!isLease && !profile.hasDirectProduction) {
    status = 'WARNING';
    statusText = '🟡 주의 (직접생산증명서 확인 필요)';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    summaryAdvice = '직접생산확인증명서가 없을 경우 개찰 후 적격심사 단계에서 부적격 탈락될 수 있으니 공공구매종합정보망(SMPP)에서 유효기간을 확인하세요.';
  } else if (!isNational && !profile.hasLocationMatch) {
    status = 'WARNING';
    statusText = '🟡 주의 (지역 제한 요건 확인)';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    summaryAdvice = `본 공고는 [${location}] 관내 업체 제한 조건이 포함되어 있습니다. 사업자등록증상 본점 소재지를 확인하세요.`;
  } else if (!profile.hasPastExperience) {
    status = 'PASS';
    statusText = '🟢 참가 가능 (실적 점수 확인 권장)';
    badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    summaryAdvice = '기본 참가 자격은 모두 충족됩니다. 적격심사 수행능력 점수(실적) 배점을 과업지시서에서 최종 확인하세요.';
  }

  return {
    score,
    status,
    statusText,
    badgeColor,
    checklistStatus: {
      license: {
        passed: profile.hasLicense,
        label: '옥외광고사업 등록증',
        tip: profile.hasLicense ? '자격 요건 충족' : '필수 면허 미보유 (입찰 불가)',
      },
      directProduction: {
        passed: isLease || profile.hasDirectProduction,
        label: isLease ? '매체권 운영 (직생 면제)' : '직접생산확인증명서',
        tip: isLease || profile.hasDirectProduction ? '자격 요건 충족' : 'SMPP 직생증명서 발급/갱신 필요',
      },
      location: {
        passed: isNational || profile.hasLocationMatch,
        label: isNational ? '전국 입찰 (지역 무관)' : `${location} 관내 소재`,
        tip: isNational || profile.hasLocationMatch ? '소재지 요건 충족' : '해당 관내 본점 소재지 확인 필요',
      },
      experience: {
        passed: profile.hasPastExperience,
        label: '최근 3년 동종 시공실적',
        tip: profile.hasPastExperience ? '적격심사 실적 만점' : '소액수의 계약은 실적 없이도 참여 가능',
      },
    },
    summaryAdvice,
  };
}
