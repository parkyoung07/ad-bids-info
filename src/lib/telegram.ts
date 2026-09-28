// src/lib/telegram.ts
/**
 * 텔레그램 실시간 알림 발송 유틸리티 (회장님 전용 폰 알림 비서)
 */

interface SubscriberNotificationPayload {
  phone: string;
  email?: string;
  companyName?: string;
  region: string;
  categories: string[];
  notifyMorning?: boolean;
  notifyDeadline?: boolean;
  targetBid?: string;
  subscribedAt: string;
}

export async function sendTelegramNotification(payload: SubscriberNotificationPayload): Promise<{ success: boolean; message?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID 환경변수가 설정되지 않았습니다.");
    return { success: false, message: "환경변수 미설정" };
  }

  const kstTime = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const categoryText = payload.categories && payload.categories.length > 0 ? payload.categories.join(", ") : "전체 업종";
  const company = payload.companyName || "상호 미입력";
  const emailText = payload.email || "이메일 미입력";
  const target = payload.targetBid || "전체 맞춤 공고";

  const message = `🔔 <b>[SignBid AI] 신규 맞춤 알림 신청 접수!</b>\n\n` +
    `👤 <b>업체명:</b> ${company}\n` +
    `📞 <b>연락처:</b> <code>${payload.phone}</code>\n` +
    `📧 <b>이메일:</b> ${emailText}\n` +
    `📍 <b>희망지역:</b> ${payload.region}\n` +
    `🎯 <b>관심분야:</b> ${categoryText}\n` +
    `📌 <b>유입공고:</b> ${target}\n` +
    `⏰ <b>신청시각:</b> ${kstTime} (KST)\n\n` +
    `💡 <i>회장님 관리자 모드: <a href="https://www.signbidai.com/admin">관리자 페이지 바로가기</a></i>`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error("[Telegram] 발송 실패 응답:", data);
      return { success: false, message: data.description || "텔레그램 발송 오류" };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Telegram] API 통신 에러:", err);
    return { success: false, message: err?.message || "네트워크 에러" };
  }
}
