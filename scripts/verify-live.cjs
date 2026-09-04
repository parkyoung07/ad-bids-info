const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const u = new URL(url);
          redirectUrl = `${u.origin}${redirectUrl}`;
        }
        return get(redirectUrl).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('=== 1. Main Page (https://signbidai.com) ===');
  const main = await get('https://signbidai.com');
  console.log('HTTP Status:', main.statusCode);
  console.log('검증된 실제 공고 0건 표기 여부:', main.data.includes('검증된 실제 공고 (0)') || main.data.includes('검증된 진행 공고: <strong class="text-white font-bold">0건</strong>'));
  console.log('실제 공고 0건 검증 준비 중 안내 배너 노출 여부:', main.data.includes('조달청 실시간 공식 검증 공고 준비 중 (0건)'));
  console.log('DEMO 예시 8건 표기 여부:', main.data.includes('기능 미리보기 DEMO (8)'));

  console.log('\n=== 2. Calculator Page (https://signbidai.com/calculator) ===');
  const calc = await get('https://signbidai.com/calculator');
  console.log('HTTP Status:', calc.statusCode);
  console.log('1순위 추천/최적 투찰 문구 잔존 여부 (false여야 정상):', calc.data.includes('1순위 최적') || calc.data.includes('1순위 추천'));
  console.log('참고용 시뮬레이션 표기 여부 (true여야 정상):', calc.data.includes('참고용') || calc.data.includes('시뮬레이션'));

  console.log('\n=== 3. Proposal Page (https://signbidai.com/proposal) ===');
  const proposal = await get('https://signbidai.com/proposal');
  console.log('HTTP Status:', proposal.statusCode);
  console.log('구형 중복 메뉴 잔존 여부 (false여야 정상):', proposal.data.includes('옥외광고 입찰 알리미'));
  console.log('과장 문구 (300만원 절감, 심사위원의 마음을 사로잡는 등) 잔존 여부 (false여야 정상):', 
    proposal.data.includes('300만 원') || 
    proposal.data.includes('300만원') || 
    proposal.data.includes('심사위원의 마음') ||
    proposal.data.includes('완벽 지원')
  );

  console.log('\n=== 4. Spec X-ray (https://signbidai.com/spec-xray) ===');
  const xray = await get('https://signbidai.com/spec-xray');
  console.log('HTTP Status:', xray.statusCode);
  console.log('필수서류 구비율 기본값 0% (확인 전, 0개) 여부:', xray.data.includes('0%') && xray.data.includes('0 /'));
  console.log('허위 100% 구비율 잔존 여부 (false여야 정상):', xray.data.includes('100%') && xray.data.includes('5 / 5개'));

  console.log('\n=== 5. Results Page (https://signbidai.com/results) ===');
  const results = await get('https://signbidai.com/results');
  console.log('HTTP Status:', results.statusCode);
  console.log('조달청 G2B 개찰 결과 검증 허위 문구 잔존 여부 (false여야 정상):', results.data.includes('조달청 G2B 개찰 결과 검증'));
  console.log('DEMO 시뮬레이션 표본 명시 여부 (true여야 정상):', results.data.includes('DEMO') && results.data.includes('시뮬레이션 표본'));
}

verify().catch(console.error);
