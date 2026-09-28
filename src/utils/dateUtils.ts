/**
 * SignBid AI - 한국 표준시(KST: Asia/Seoul, UTC+9) 기준 실시간 마감일 & D-Day 계산 유틸리티
 * 
 * [핵심 원칙]
 * 1. D-7 같은 정적 수치를 저장하지 않고, 사용자 화면 표시 시점(Client/Server Runtime)에 실시간 재계산
 * 2. 한국 시간(Asia/Seoul) 기준으로 마감 시각이 1초라도 경과하면 즉시 마감 처리
 * 3. 마감 당일 마감시각 이전인 경우: "오늘 마감 (D-Day)" 및 마감 임박 강조
 * 4. 마감일 파싱 에러나 결측 시: "마감일 원문 확인"으로 안전하게 fallback
 */

export interface BidTimeStatus {
  isExpired: boolean;
  dDay: number | null;
  dDayText: string;
  statusBadgeText: string;
  isUrgent: boolean;
  isTodayClose: boolean;
  formattedCloseDate: string;
  isValidDate: boolean;
}

/**
 * 주어진 날짜 객체를 KST(UTC+9) 기준 YYYY-MM-DD 자정 시각(ms)으로 정규화
 */
function getKSTMidnightMs(date: Date): number {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const kst = new Date(utc + 9 * 3600000);
  return new Date(kst.getFullYear(), kst.getMonth(), kst.getDate()).getTime();
}

/**
 * 실시간 KST 마감 상태 및 D-Day 계산 함수
 */
export function computeBidTimeStatus(
  bidCloseDate?: string | null,
  fallbackEndDate?: string | null,
  isClosedFlag?: boolean,
  statusField?: string
): BidTimeStatus {
  // 1. DEMO 예시 공고 예외 처리
  if (statusField === "DEMO 예시") {
    return {
      isExpired: false,
      dDay: null,
      dDayText: "DEMO 예시",
      statusBadgeText: "DEMO 예시",
      isUrgent: false,
      isTodayClose: false,
      formattedCloseDate: bidCloseDate || fallbackEndDate || "-",
      isValidDate: true,
    };
  }

  const rawDateStr = (bidCloseDate || fallbackEndDate || "").trim();

  // 2. 마감일 정보가 아예 없거나 빈 값인 경우 안전 fallback
  if (!rawDateStr) {
    const isExplicitClosed = isClosedFlag === true || statusField === "마감";
    return {
      isExpired: isExplicitClosed,
      dDay: null,
      dDayText: isExplicitClosed ? "입찰 마감" : "공고문 마감일 확인",
      statusBadgeText: isExplicitClosed ? "🔴 입찰 마감" : "공고문 마감일 확인",
      isUrgent: false,
      isTodayClose: false,
      formattedCloseDate: "마감일 원문 확인",
      isValidDate: false,
    };
  }

  // 3. 날짜 문자열 파싱 (YYYY-MM-DD HH:mm:ss 또는 YYYY-MM-DD 등)
  const cleanDateStr = rawDateStr.replace(/-/g, "/");
  const closeDate = new Date(cleanDateStr);

  // 파싱 오류 발생 시 안전하게 '마감일 원문 확인' 처리
  if (isNaN(closeDate.getTime())) {
    return {
      isExpired: isClosedFlag === true || statusField === "마감",
      dDay: null,
      dDayText: "마감일 원문 확인",
      statusBadgeText: "공고문 마감일 확인",
      isUrgent: false,
      isTodayClose: false,
      formattedCloseDate: rawDateStr,
      isValidDate: false,
    };
  }

  const now = new Date();
  const nowMs = now.getTime();
  const closeMs = closeDate.getTime();

  // 4. 이미 명시적으로 마감되었거나, 마감 시각이 현재 시각(ms)을 초과한 경우 -> 즉시 마감 처리
  if (isClosedFlag === true || statusField === "마감" || closeMs <= nowMs) {
    return {
      isExpired: true,
      dDay: -1,
      dDayText: "입찰 마감",
      statusBadgeText: "🔴 입찰 마감",
      isUrgent: false,
      isTodayClose: false,
      formattedCloseDate: rawDateStr,
      isValidDate: true,
    };
  }

  // 5. 현재 진행 중인 공고의 KST 달력 일자 차이 기반 D-Day 계산
  const todayMidnightMs = getKSTMidnightMs(now);
  const closeMidnightMs = getKSTMidnightMs(closeDate);
  const diffDays = Math.round((closeMidnightMs - todayMidnightMs) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    // 오늘 마감 (D-Day): 시각이 아직 지나지 않음
    return {
      isExpired: false,
      dDay: 0,
      dDayText: "오늘 마감 (D-Day)",
      statusBadgeText: "🔥 오늘 마감 (D-Day)",
      isUrgent: true,
      isTodayClose: true,
      formattedCloseDate: rawDateStr,
      isValidDate: true,
    };
  }

  const isUrgent = diffDays <= 3;
  return {
    isExpired: false,
    dDay: diffDays,
    dDayText: `D-${diffDays}`,
    statusBadgeText: isUrgent ? `🔥 마감 D-${diffDays}` : `진행중 (D-${diffDays})`,
    isUrgent,
    isTodayClose: false,
    formattedCloseDate: rawDateStr,
    isValidDate: true,
  };
}

/**
 * 한국 시간(KST) 현재 날짜 정보 가져오기
 */
export function getKSTToday() {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const kst = new Date(utc + 9 * 3600000);
  const year = kst.getFullYear();
  const monthNum = kst.getMonth() + 1;
  const dayNum = kst.getDate();
  const monthStr = String(monthNum).padStart(2, "0");
  const dayStr = String(dayNum).padStart(2, "0");

  return {
    year,
    monthNum,
    dayNum,
    dateStr: `${year}-${monthStr}-${dayStr}`,
    displayStr: `${year}년 ${monthNum}월 ${dayNum}일`,
  };
}
