// scripts/send-summary-telegram.mjs
import fs from 'fs';
import path from 'path';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const SEND_TELEGRAM = process.env.SEND_TELEGRAM === 'true';
const OWNER_APPROVED = process.env.OWNER_APPROVED === 'true';

if (!SEND_TELEGRAM || !OWNER_APPROVED) {
  console.log('🔒 [승인 전송 보류] 회장님의 명시적 승인(SEND_TELEGRAM=true & OWNER_APPROVED=true) 대기 중으로 텔레그램 발송을 보류합니다.');
  process.exit(0);
}

if (!token || !chatId) {
  console.log('⚠️ [텔레그램 발송 건너뜀] 텔레그램 봇 토큰 또는 Chat ID가 설정되지 않았습니다.');
  process.exit(0);
}

const subscribersJsonPath = path.join(process.cwd(), 'public/data/subscribers.json');
let subscribers = [];
if (fs.existsSync(subscribersJsonPath)) {
  try {
    subscribers = JSON.parse(fs.readFileSync(subscribersJsonPath, 'utf-8'));
  } catch (e) {
    subscribers = [];
  }
}

const message = `📊 <b>[SignBid AI] 맞춤 알림 접수 현황 브리핑</b>

회장님, 현재까지 접수된 실제 알림 신청 현황입니다.

━━━━━━━━━━━━━━━━━━
📈 <b>실시간 신청 현황 요약</b>
• 누적 신청 업체: <b>${subscribers.length}개사</b>
• 트래픽 통계: <b>Cloudflare 실측 미연동 · 확인 불가</b>
━━━━━━━━━━━━━━━━━━

💡 <i>확인한 범위에서는 정상 작동 중입니다.</i>`;

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
