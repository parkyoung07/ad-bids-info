/**
 * SignBid AI - 한국 표준시(KST: Asia/Seoul, UTC+9) 기준 실시간 마감일 & D-Day 계산 유틸리티
 * 
 * [핵심 원칙]
 * 1. 환경(서버/브라우저, OS 타임존)에 독립적으로 항상 KST 기준 절대 시각 및 D-Day 계산
 * 2. 날짜 파싱 오류 시 원문 보존 및 "공식 원문 확인 필요"로 안전하게 fallback
 * 3. 서버 SSR과 브라우저 첫 렌더링 시 Hydration 불일치 원천 방지
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
 * 날짜 문자열(YYYY-MM-DD HH:mm:ss 등)을 KST(UTC+9) 기준 UTC 밀리초(ms)로 파싱
 */
export function parseKSTDateToMs(dateStr?: string | null): { ms: number; y: number; m: number; d: number } | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const match = dateStr.trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (!match) return null;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  const h = match[4] ? parseInt(match[4], 10) : 23;
  const min = match[5] ? parseInt(match[5], 10) : 59;
  const s = match[6] ? parseInt(match[6], 10) : 59;

  // KST는 UTC+9이므로 UTC 시간 = h - 9
  const utcMs = Date.UTC(y, m - 1, d, h - 9, min, s);
  return { ms: utcMs, y, m, d };
}

/**
 * 실시간 KST 마감 상태 및 D-Day 계산 함수
 */
export function computeBidTimeStatus(
  bidCloseDate?: string | null,
  fallbackEndDate?: string | null,
  isClosedFlag?: boolean,
  statusField?: string,
  fixedNowMs?: number
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
      dDayText: isExplicitClosed ? "입찰 마감" : "공식 원문 확인 필요",
      statusBadgeText: isExplicitClosed ? "🔴 공식 마감" : "공식 원문 확인 필요",
      isUrgent: false,
      isTodayClose: false,
      formattedCloseDate: "공식 원문 확인 필요",
      isValidDate: false,
    };
  }

  // 3. 날짜 파싱 (KST 기준)
  const parsed = parseKSTDateToMs(rawDateStr);
  if (!parsed) {
    return {
      isExpired: isClosedFlag === true || statusField === "마감",
      dDay: null,
      dDayText: "공식 원문 확인 필요",
      statusBadgeText: "공식 원문 확인 필요",
      isUrgent: false,
      isTodayClose: false,
      formattedCloseDate: rawDateStr,
      isValidDate: false,
    };
  }

  const nowMs = typeof fixedNowMs === "number" ? fixedNowMs : Date.now();
  const closeMs = parsed.ms;

  // 4. 이미 명시적으로 마감되었거나, 마감 시각이 현재 시각(ms)을 초과한 경우
  if (isClosedFlag === true || statusField === "마감" || closeMs <= nowMs) {
    return {
      isExpired: true,
      dDay: -1,
      dDayText: "입찰 마감",
      statusBadgeText: "🔴 공식 마감",
      isUrgent: false,
      isTodayClose: false,
      formattedCloseDate: rawDateStr,
      isValidDate: true,
    };
  }

  // 5. KST 달력 일자 차이 기준 D-Day 계산
  const nowKST = new Date(nowMs + 9 * 3600000);
  const nowKSTMidMs = Date.UTC(nowKST.getUTCFullYear(), nowKST.getUTCMonth(), nowKST.getUTCDate());
  const closeKSTMidMs = Date.UTC(parsed.y, parsed.m - 1, parsed.d);
  const diffDays = Math.round((closeKSTMidMs - nowKSTMidMs) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
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
    statusBadgeText: isUrgent ? `🔥 마감 D-${diffDays}` : `D-${diffDays}`,
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
  const kst = new Date(Date.now() + 9 * 3600000);
  const year = kst.getUTCFullYear();
  const monthNum = kst.getUTCMonth() + 1;
  const dayNum = kst.getUTCDate();
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

