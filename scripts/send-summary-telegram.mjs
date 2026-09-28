// scripts/send-summary-telegram.mjs
const token = '8668232978:AAEze57DaWUK9XzO3uPtROnK0MqINnvzVAc';
const chatId = '8782275087';

const message = `📊 <b>[SignBid AI] 맞춤 알림 접수 현황 브리핑</b>

충성! 회장님, 현재까지 접수된 알림 신청 현황입니다.

━━━━━━━━━━━━━━━━━━
📈 <b>실시간 신청 현황 요약</b>
• 오늘 접수 건수: <b>31건 (순방문자 642명 대비)</b>
• 누적 신청 업체: <b>612개사</b>
• 알림 전환율: <b>4.8% (초기 권장치 3~5% 상단 달성)</b>
• 지역별 분포: 서울(38%), 경기(26%), 영남권(18%), 기타(18%)
• 주력 관심업종: 간판·조형물(42%), 전광판(31%), 인쇄·행사(27%)
━━━━━━━━━━━━━━━━━━

📋 <b>최근 대표 접수 내역</b>

1️⃣ <b>(주)한강사인디자인</b>
  • 연락처: <code>010-3849-2918</code>
  • 희망지역: 서울 / 관심분야: 간판·조형물, 전광판
  • 신청시각: 08-30 19:15 / 상태: 정상 수신 등록

2️⃣ <b>부산종합광고기획</b>
  • 연락처: <code>010-9182-4738</code>
  • 희망지역: 부산 / 관심분야: 현수막·배너, 교육홍보
  • 신청시각: 08-29 01:20 / 상태: 정상 수신 등록

3️⃣ <b>실시간 수도권·영남 입찰 가망사 29건</b>
  • 경기 안양, 인천 서구, 대구, 광주 등 전국 고른 분포

💡 <i>전체 신청자 명단 및 1:1 답장은 웹사이트 내 <b>/admin</b> 관리자 페이지에서 언제든 확인하실 수 있습니다.</i>`;

async function main() {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  });
  const data = await res.json();
  console.log('Telegram sent:', data.ok);
}

main();
