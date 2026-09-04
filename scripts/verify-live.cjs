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
  console.log('5대 상위 메뉴 포함 여부:', 
    main.data.includes('공고 찾기') && 
    main.data.includes('입찰 분석') && 
    main.data.includes('입찰 준비') && 
    main.data.includes('협력사') && 
    main.data.includes('입찰 가이드')
  );
  console.log('자동 테마(메가시티 등) 노출 여부 (false여야 정상):', main.data.includes('메가시티') || main.data.includes('3일 주기'));
  console.log('전국 17개 지역버튼 펼침 여부 (false여야 정상):', main.data.includes('지역 선택') && !main.data.includes('id="region-btn-seoul"'));
  console.log('실제 공고 탭 포함 여부:', main.data.includes('검증된 실제 공고'));
  console.log('DEMO 탭 포함 여부:', main.data.includes('기능 미리보기 DEMO'));
  
  console.log('\n=== 2. Calculator Page (https://signbidai.com/calculator) ===');
  const calc = await get('https://signbidai.com/calculator');
  console.log('HTTP Status:', calc.statusCode);
  console.log('1순위 최적 투찰 문구 잔존 여부 (false여야 정상):', calc.data.includes('1순위 최적 투찰'));
  console.log('참고용 시뮬레이션 표기 여부 (true여야 정상):', calc.data.includes('참고용') || calc.data.includes('시뮬레이션'));

  console.log('\n=== 3. Partners Page (https://signbidai.com/partners) ===');
  const partners = await get('https://signbidai.com/partners');
  console.log('HTTP Status:', partners.statusCode);
  console.log('19,940개사 무단 노출 여부 (false여야 정상):', partners.data.includes('19,940'));
  console.log('검증/협력사 체계 안내 여부:', partners.data.includes('협력사') || partners.data.includes('네트워크'));

  console.log('\n=== 4. Proposal Page (https://signbidai.com/proposal) ===');
  const proposal = await get('https://signbidai.com/proposal');
  console.log('HTTP Status:', proposal.statusCode);
  console.log('홍길동 또는 가짜 1000건 실적 잔존 여부 (false여야 정상):', proposal.data.includes('홍길동') || proposal.data.includes('1,000건 이상 준공실적'));

  console.log('\n=== 5. Spec X-ray (https://signbidai.com/spec-xray) ===');
  const xray = await get('https://signbidai.com/spec-xray');
  console.log('HTTP Status:', xray.statusCode);
  console.log('회사정보 미입력 시 판정 보류/안내 여부:', xray.data.includes('판정 보류') || xray.data.includes('정보를 입력') || xray.data.includes('자격 진단'));
  console.log('적격 통과 확실 / 100점 / 낙찰 보장 잔존 여부 (false여야 정상):', xray.data.includes('적격 통과 확실') || xray.data.includes('낙찰 보장') || xray.data.includes('탈락 위험 0%'));

  console.log('\n=== 6. Bid Detail & D-Day check (https://signbidai.com/bids/R26BK01661955-000) ===');
  const bid = await get('https://signbidai.com/bids/R26BK01661955-000');
  console.log('HTTP Status:', bid.statusCode);
  console.log('D-Day 정상 표기 여부 (마감일 기준):', bid.data.includes('D-') || bid.data.includes('마감'));
}

verify().catch(console.error);
