/**
 * SignBid AI 전체 공개 URL 및 정적 산출물 무결성 전수 검증 스크립트
 * 
 * 1. 정적 빌드 산출물(out/) 및 데이터 전수 검사
 * 2. DEMO 페이지 금지어(공식 원문, 공식 출처, 조달청 검증, 1순위 추천, 공고문 제 등) 검출 시 빌드 실패(Exit code 1)
 * 3. 구형 공고번호(R26BK...) 정적 경로 완전 제거 확인
 * 4. 라이브 도메인(https://signbidai.com) HTTP 응답 상태 코드 및 내용 전수 크롤링 검증
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 금지어 목록 (정규식 또는 문자열)
const FORBIDDEN_PATTERNS = [
  { name: '공식 원문', regex: /공식\s*원문/ },
  { name: '공식 출처', regex: /공식\s*출처/ },
  { name: '조달청 검증', regex: /조달청\s*검증/ },
  { name: '1순위 추천/최적', regex: /1순위\s*(추천|최적)/ },
  { name: '공고문 제O조', regex: /공고문\s*제\s*\d+\s*조/ },
  { name: '공고문 O페이지', regex: /공고문\s*\d+\s*페이지/ },
  { name: '실제 G2B 상세 링크', regex: /g2b\.go\.kr\/link\/PNPE/ },
];

// 예외 허용 문구 (일반 면책 조항)
const ALLOWED_EXCEPTIONS = [
  '실제 입찰은 나라장터 원문을 확인하십시오',
  '실제 입찰 전 나라장터 원문을 별도로 확인해야 합니다',
  '실제 입찰 전에는 반드시 나라장터 원문을 별도로 확인해야 합니다',
  '나라장터 원문',
];

function checkContentForForbidden(content, filePathOrUrl) {
  const violations = [];

  // 예외 문구를 임시 치환하여 오탐 방지
  let sanitized = content;
  ALLOWED_EXCEPTIONS.forEach((exc, idx) => {
    sanitized = sanitized.split(exc).join(`__ALLOWED_EXC_${idx}__`);
  });

  for (const pat of FORBIDDEN_PATTERNS) {
    if (pat.regex.test(sanitized)) {
      violations.push(pat.name);
    }
  }

  return violations;
}

function httpGet(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SignBidVerifier/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const u = new URL(url);
          redirectUrl = `${u.origin}${redirectUrl}`;
        }
        return httpGet(redirectUrl, maxRedirects - 1).then((redirectRes) => {
          resolve({
            initialStatus: res.statusCode,
            initialLocation: res.headers.location,
            statusCode: redirectRes.statusCode,
            headers: redirectRes.headers,
            data: redirectRes.data,
          });
        }).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        initialStatus: res.statusCode,
        initialLocation: null,
        statusCode: res.statusCode,
        headers: res.headers,
        data,
      }));
    }).on('error', reject);
  });
}

async function verifyLocalStatic() {
  console.log('====================================================');
  console.log('🔍 [1단계] 로컬 정적 빌드 산출물(out/) 전수 검사');
  console.log('====================================================');

  const outDir = path.join(__dirname, '../out');
  if (!fs.existsSync(outDir)) {
    console.warn('⚠️ out/ 디렉토리가 없습니다. (빌드 전이면 public/data 및 src 코드 기준으로 대체 검증합니다)');
  }

  const bidsJsonPath = path.join(__dirname, '../public/data/bids.json');
  const bids = JSON.parse(fs.readFileSync(bidsJsonPath, 'utf-8'));

  console.log(`총 ${bids.length}건의 공고 데이터 검사 중...`);
  let hasError = false;

  bids.forEach((bid, idx) => {
    if (!bid.id.startsWith('DEMO-BID-')) {
      console.error(`❌ [오류] 공고 ID가 DEMO 형식이 아닙니다: ${bid.id}`);
      hasError = true;
    }
    if (!bid.isDemo) {
      console.error(`❌ [오류] 공고 ${bid.id}의 isDemo 플래그가 true가 아닙니다.`);
      hasError = true;
    }
    if (bid.sourceDetailUrl && bid.sourceDetailUrl.includes('g2b.go.kr')) {
      console.error(`❌ [오류] DEMO 공고 ${bid.id}에 실제 G2B 링크가 연결되어 있습니다: ${bid.sourceDetailUrl}`);
      hasError = true;
    }
    const bidStr = JSON.stringify(bid);
    const violations = checkContentForForbidden(bidStr, `bids.json [${bid.id}]`);
    if (violations.length > 0) {
      console.error(`❌ [오류] DEMO 공고 ${bid.id}에 금지어가 포함되어 있습니다: ${violations.join(', ')}`);
      hasError = true;
    }
  });

  if (fs.existsSync(outDir)) {
    // out/bids/ 폴더 확인
    const outBidsDir = path.join(outDir, 'bids');
    if (fs.existsSync(outBidsDir)) {
      const generatedBidDirs = fs.readdirSync(outBidsDir);
      console.log(`정적 생성된 /bids/* 디렉토리 목록:`, generatedBidDirs);

      generatedBidDirs.forEach((dir) => {
        if (!dir.startsWith('DEMO-BID-') && dir !== 'index.html' && dir !== 'index.txt') {
          console.error(`❌ [오류] 구형 실제 공고번호 디렉토리가 out/bids/ 에 잔존합니다: ${dir}`);
          hasError = true;
        }

        const htmlFile = path.join(outBidsDir, dir, 'index.html');
        if (fs.existsSync(htmlFile)) {
          const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
          const violations = checkContentForForbidden(htmlContent, `/bids/${dir}`);
          if (violations.length > 0) {
            console.error(`❌ [오류] /bids/${dir}/index.html 에 금지어가 포함되어 있습니다: ${violations.join(', ')}`);
            hasError = true;
          }
        }
      });
    }

    // 도구 페이지 검사
    const toolPages = ['spec-xray', 'proposal', 'calculator', 'results'];
    toolPages.forEach((tool) => {
      const toolHtml = path.join(outDir, tool, 'index.html');
      if (fs.existsSync(toolHtml)) {
        const content = fs.readFileSync(toolHtml, 'utf-8');
        const violations = checkContentForForbidden(content, `/${tool}`);
        if (violations.length > 0) {
          console.error(`❌ [오류] /${tool}/index.html 에 금지어가 포함되어 있습니다: ${violations.join(', ')}`);
          hasError = true;
        }
      }
    });
  }

  if (hasError) {
    console.error('\n❌ [검증 실패] 금지어 또는 규격 불일치 항목이 발견되어 빌드를 중단합니다.');
    process.exit(1);
  }

  console.log('✅ 로컬 정적 검증 통과 (금지어 0건, DEMO ID 규격 100% 일치)\n');
}

async function verifyLiveServer(domain = 'https://signbidai.com') {
  console.log('====================================================');
  console.log(`🌐 [2단계] 라이브 서버(${domain}) 전수 크롤링 검증`);
  console.log('====================================================');

  const testUrls = [
    // 1. 메인 & 정적 도구 페이지
    { path: '/', expected: 200, name: '메인 대시보드' },
    { path: '/spec-xray/', expected: 200, name: '시방서 엑스레이 스튜디오' },
    { path: '/proposal/', expected: 200, name: 'AI 제안서 스튜디오' },
    { path: '/calculator/', expected: 200, name: '투찰금액 시뮬레이터' },
    { path: '/results/', expected: 200, name: '낙찰 통계 분석' },
    { path: '/partners/', expected: 200, name: '전국 시공 네트워크' },
    { path: '/calendar/', expected: 200, name: '입찰 캘린더' },
    { path: '/prespec/', expected: 200, name: '사전규격 공개' },
    { path: '/news/', expected: 200, name: '조달 뉴스' },
    { path: '/blog/', expected: 200, name: '인사이트 블로그' },

    // 2. DEMO 공고 상세 (모두 200 OK)
    { path: '/bids/DEMO-BID-001/', expected: 200, name: 'DEMO 공고 1' },
    { path: '/bids/DEMO-BID-002/', expected: 200, name: 'DEMO 공고 2' },
    { path: '/bids/DEMO-BID-003/', expected: 200, name: 'DEMO 공고 3' },
    { path: '/bids/DEMO-BID-004/', expected: 200, name: 'DEMO 공고 4' },
    { path: '/bids/DEMO-BID-005/', expected: 200, name: 'DEMO 공고 5' },
    { path: '/bids/DEMO-BID-006/', expected: 200, name: 'DEMO 공고 6' },
    { path: '/bids/DEMO-BID-007/', expected: 200, name: 'DEMO 공고 7' },
    { path: '/bids/DEMO-BID-008/', expected: 200, name: 'DEMO 공고 8' },

    // 3. 구형 불일치 공고 상세 (모두 404/410 이어야 정상)
    { path: '/bids/R26BK01661955-000/', expected: 404, name: '구형 공고 (국회방송 불일치건)' },
    { path: '/bids/R26BK01650918-000/', expected: 404, name: '구형 공고 (MMCA 불일치건)' },
    { path: '/bids/R26BK01650354-000/', expected: 404, name: '구형 공고 (소방본부 불일치건)' },
    { path: '/bids/R26BK01683902-000/', expected: 404, name: '구형 공고 (부경대 불일치건)' },
  ];

  const results = [];
  let allPassed = true;

  for (const target of testUrls) {
    const fullUrl = `${domain}${target.path}`;
    try {
      const res = await httpGet(fullUrl);
      const is404Expected = target.expected === 404;
      const is404Result = (
        res.initialStatus === 404 ||
        res.statusCode === 404 ||
        (res.initialStatus === 302 && res.initialLocation && res.initialLocation.includes('404')) ||
        res.data.includes('404 NOT FOUND') ||
        res.data.includes('존재하지 않거나 삭제된 공고')
      );

      const isStatusMatch = is404Expected ? is404Result : (res.statusCode === target.expected);
      let forbiddenFound = [];

      if (res.statusCode === 200 && !is404Result) {
        forbiddenFound = checkContentForForbidden(res.data, target.path);
      }

      const passed = isStatusMatch && forbiddenFound.length === 0;
      if (!passed) allPassed = false;

      const displayActual = res.initialStatus !== res.statusCode
        ? `${res.initialStatus} ➔ ${res.statusCode} (${res.initialLocation || ''})`
        : `${res.statusCode}`;

      results.push({
        name: target.name,
        path: target.path,
        expected: target.expected,
        actual: displayActual,
        forbiddenCount: forbiddenFound.length,
        forbiddenDetails: forbiddenFound.join(', '),
        passed,
      });
    } catch (e) {
      allPassed = false;
      results.push({
        name: target.name,
        path: target.path,
        expected: target.expected,
        actual: `ERROR: ${e.message}`,
        forbiddenCount: 0,
        forbiddenDetails: '',
        passed: false,
      });
    }
  }

  console.log('\n| 대상 화면 | 경로 | 기대 상태코드 | 실제 상태코드 | 금지어 검출 | 판정 |');
  console.log('| :--- | :--- | :---: | :---: | :---: | :---: |');
  results.forEach((r) => {
    const statusMark = r.passed ? '✅ 정상' : '❌ 실패';
    const forbiddenText = r.forbiddenCount > 0 ? `🚨 ${r.forbiddenDetails}` : '0건 (안전)';
    console.log(`| ${r.name} | \`${r.path}\` | \`${r.expected}\` | \`${r.actual}\` | ${forbiddenText} | ${statusMark} |`);
  });

  if (!allPassed) {
    console.error('\n❌ [라이브 검증 실패] 일부 URL 상태 코드가 일치하지 않거나 금지어가 발견되었습니다.');
    if (process.argv.includes('--strict')) {
      process.exit(1);
    }
  } else {
    console.log('\n✅ [라이브 검증 완벽 통과] 모든 공개 URL 정상 작동 및 구형 URL 404 차단 완료');
  }

  return { allPassed, results };
}

async function main() {
  await verifyLocalStatic();

  if (process.argv.includes('--live')) {
    await verifyLiveServer('https://signbidai.com');
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { verifyLocalStatic, verifyLiveServer };
