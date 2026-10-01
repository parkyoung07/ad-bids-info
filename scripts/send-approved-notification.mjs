import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================================');
console.log('📡 [SignBid AI] 외부 알림 발송 게이트웨이 (notify:approved)');
console.log('================================================================================');

// 1. .env 로드
function loadEnv() {
  const envFiles = [path.join(rootDir, '.env.local'), path.join(rootDir, '.env')];
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}
loadEnv();

const notifApproval = process.env.CHAIRMAN_NOTIFICATION_APPROVAL;
const sendTelegram = process.env.SEND_TELEGRAM === 'true';
const sendKakao = process.env.SEND_KAKAO === 'true';

if (notifApproval !== 'true') {
  console.error('❌ [알림 발송 거부] 회장님의 명시적 알림 발송 승인(CHAIRMAN_NOTIFICATION_APPROVAL=true)이 없습니다.');
  console.error('   -> 회장님의 별도 승인 없이 외부 메시지를 절대 발송할 수 없습니다.');
  process.exit(1);
}

if (!sendTelegram && !sendKakao) {
  console.log('ℹ️ [발송 건너뜀] SEND_TELEGRAM=false 및 SEND_KAKAO=false 상태입니다.');
  process.exit(0);
}

console.log('✅ [회장님 알림 승인 확인] 지정된 채널로 안전하게 알림을 발송합니다.');
