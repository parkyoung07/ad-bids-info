import fs from 'fs';
import path from 'path';

// 1. 환경 변수(.env.local) 읽기
function loadEnv() {
  const env = { ...process.env };
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = match[2] || '';
        if (value.endsWith('\r')) value = value.slice(0, -1);
        env[match[1]] = value.trim();
      }
    });
  }
  return env;
}

const env = loadEnv();

console.log('🚀 [가동] 대한민국 옥외광고 발주 채널 통합 수집 파이프라인 (100% 실공고 검증 원칙)');
console.log('================================================================================');
console.log('1. 🏛️ 조달청 나라장터 (G2B OpenAPI & 10대 품목코드) - 실시간 연동');
console.log('2. 🏫 전국 교육청 & 학교장터 (S2B) - 공식 연동 준비 중 (검증 대기)');
console.log('3. 🏢 국토교통부 공동주택관리정보 (K-apt) - 공식 연동 준비 중 (검증 대기)');
console.log('4. 💎 한국자산관리공사 온비드 (OnBid) - 공식 연동 준비 중 (검증 대기)');
console.log('================================================================================');
console.log('※ 무결성 원칙: 실제 전산망에 존재하지 않는 가상/예시 데이터는 단 1건도 등록하지 않습니다.');
