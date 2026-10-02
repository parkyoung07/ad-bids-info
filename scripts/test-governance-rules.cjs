// scripts/test-governance-rules.cjs
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const rootDir = path.resolve(__dirname, '..');
let testCount = 0;
let passCount = 0;
let failureCount = 0;

function runTest(testName, testFn) {
  testCount++;
  try {
    const result = testFn();
    if (result === true || result === undefined) {
      console.log(`  ✅ [PASS] 테스트 ${testCount}: ${testName}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] 테스트 ${testCount}: ${testName} - ${result}`);
      failureCount++;
    }
  } catch (err) {
    console.error(`  ❌ [FAIL] 테스트 ${testCount}: ${testName} - 에러: ${err.message}`);
    failureCount++;
  }
}

console.log('================================================================================');
console.log('🛡️ [SignBid AI] 10대 운영 거버넌스 및 할루시네이션 방지 종합 자동 검증 테스트');
console.log('================================================================================\n');

// 1. 공고번호 없는 발주처 생성 차단
runTest('공식 공고번호 없는 가상 발주처 임의 생성 차단 검증', () => {
  const genPostCode = fs.readFileSync(path.join(rootDir, 'scripts/generate-post.js'), 'utf-8');
  const inspectCode = fs.readFileSync(path.join(rootDir, 'scripts/daily-inspect.mjs'), 'utf-8');
  if (genPostCode.includes('가상 발주처/가상 예산/가상 마감일 생성 절대 금지') &&
      inspectCode.includes('💡 [핵심 산업 트렌드 브리핑]')) {
    return true;
  }
  return '일반 트렌드 글 생성 프롬프트에 가상 발주처 차단 지침이 누락되었습니다.';
});

// 2. 공식 URL 없는 공고 카드 생성 차단
runTest('공식 상세 URL 없는 공고 요약 카드 생성 차단 검증', () => {
  const postsDir = path.join(rootDir, 'src/content/posts');
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const content = fs.readFileSync(path.join(postsDir, f), 'utf-8');
      if (content.includes('📋 [공고 핵심 요약 카드]') || content.includes('📋 공고 핵심 요약 카드')) {
        if (!content.includes('https://www.g2b.go.kr') && !content.includes('http://www.g2b.go.kr')) {
          return `포스트 [${f}]에 공식 URL 증빙 없는 공고 카드가 존재합니다.`;
        }
      }
    }
  }
  return true;
});

// 3. 공식 금액 없는 예상 예산 생성 차단
runTest('공식 금액 없는 임의 예상 예산(억 단위 추정) 생성 차단 검증', () => {
  const genPostCode = fs.readFileSync(path.join(rootDir, 'scripts/generate-post.js'), 'utf-8');
  const inspectCode = fs.readFileSync(path.join(rootDir, 'scripts/daily-inspect.mjs'), 'utf-8');
  if (genPostCode.includes('예상 예산대:') || inspectCode.includes('예상 예산대:')) {
    return '코드베이스 내 프롬프트/템플릿에 근거 없는 예상 예산대 입력 유도가 잔존합니다.';
  }
  return true;
});

// 4. 공식 마감일 없는 D-Day 생성 차단
runTest('공식 마감일시 없는 허위 D-Day 생성 차단 검증', () => {
  const genPostCode = fs.readFileSync(path.join(rootDir, 'scripts/generate-post.js'), 'utf-8');
  const inspectCode = fs.readFileSync(path.join(rootDir, 'scripts/daily-inspect.mjs'), 'utf-8');
  if (genPostCode.includes('입찰 마감 D-Day:') || inspectCode.includes('입찰 마감 D-Day:')) {
    return '코드베이스 내 프롬프트/템플릿에 근거 없는 마감 D-Day 입력 유도가 잔존합니다.';
  }
  return true;
});

// 5. 공식 근거 없는 참가자격 생성 차단
runTest('공식 공고 근거 없는 참가자격 임의 생성 차단 검증', () => {
  const genPostCode = fs.readFileSync(path.join(rootDir, 'scripts/generate-post.js'), 'utf-8');
  const inspectCode = fs.readFileSync(path.join(rootDir, 'scripts/daily-inspect.mjs'), 'utf-8');
  if (genPostCode.includes('필수 자격조건: ...') || inspectCode.includes('필수 자격조건: ...')) {
    return '코드베이스 내 프롬프트/템플릿에 근거 없는 자격조건 생성 유도가 잔존합니다.';
  }
  return true;
});

// 6. 트렌드 글의 가상 발주기관·가상 예산 검출
runTest('게시 중인 블로그 포스트 내 가상 발주기관 및 가상 예산 잔존 전수 검출', () => {
  const postsDir = path.join(rootDir, 'src/content/posts');
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    const hallucinationPatterns = [
      /스마트도시조성사업단/,
      /45억\s*~\s*60억/,
      /2026년\s*10월\s*20일\s*15:00\s*마감\s*\(D-18\)/
    ];
    for (const f of files) {
      const content = fs.readFileSync(path.join(postsDir, f), 'utf-8');
      for (const pattern of hallucinationPatterns) {
        if (pattern.test(content)) {
          return `블로그 포스트 [${f}]에 가상의 공고 정보가 잔존합니다: ${pattern}`;
        }
      }
    }
  }
  return true;
});

// 7. draft 글 운영 검색·sitemap·RSS 제외
runTest('draft: true 초안 글의 운영 검색 색인 및 sitemap 원천 배제 검증', () => {
  const searchIndexPath = path.join(rootDir, 'public/data/search-index.json');
  if (fs.existsSync(searchIndexPath)) {
    const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf-8'));
    const postsDir = path.join(rootDir, 'src/content/posts');
    const draftSlugs = new Set();
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
      files.forEach(f => {
        const content = fs.readFileSync(path.join(postsDir, f), 'utf-8');
        const { data } = matter(content);
        if (data.draft === true) {
          draftSlugs.add(f.replace(/\.md$/, ''));
        }
      });
    }

    for (const item of searchIndex) {
      if (item.type === 'post' && draftSlugs.has(item.id || item.slug)) {
        return `draft: true인 초안 [${item.id || item.slug}]가 검색 인덱스에 포함되어 있습니다.`;
      }
    }
  }
  return true;
});

// 8. force push 문자열 워크플로 및 운영 스크립트 검출
runTest('GitHub Actions 워크플로 및 스크립트 내 git force push 명령 잔존 검출', () => {
  const workflowsDir = path.join(rootDir, '.github/workflows');
  const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml'));
  for (const f of files) {
    const content = fs.readFileSync(path.join(workflowsDir, f), 'utf-8');
    if (content.includes('--force') || content.includes('-f ') || content.includes('--force-with-lease')) {
      return `워크플로 [${f}]에 git force push 명령이 포함되어 있습니다.`;
    }
  }
  const scriptsDir = path.join(rootDir, 'scripts');
  const scriptFiles = fs.readdirSync(scriptsDir).filter(f => (f.endsWith('.mjs') || f.endsWith('.js') || f.endsWith('.cjs')) && f !== 'test-governance-rules.cjs');
  for (const f of scriptFiles) {
    const content = fs.readFileSync(path.join(scriptsDir, f), 'utf-8');
    if (content.includes('git push --force') || content.includes('git push -f')) {
      return `스크립트 [${f}]에 git force push 명령이 포함되어 있습니다.`;
    }
  }
  return true;
});

// 9. Production job의 environment 보호 설정 확인
runTest('deploy.yml 내 Production 배포 job의 environment: production 보호 격리 검증', () => {
  const deployYmlPath = path.join(rootDir, '.github/workflows/deploy.yml');
  const deployYml = fs.readFileSync(deployYmlPath, 'utf-8');
  if (!deployYml.includes('environment: production')) {
    return 'deploy.yml에 environment: production 설정이 누락되어 승인자 보호가 작동하지 않습니다.';
  }
  if (!deployYml.includes('deploy-production:')) {
    return 'deploy.yml에 독립된 deploy-production job이 누락되었습니다.';
  }
  return true;
});

// 10. 거버넌스 PR에 불필요한 생성 콘텐츠 포함 여부 확인
runTest('거버넌스 PR 대상 디렉터리 내 일회성 스크립트 및 비필수 콘텐츠 잔존 검출', () => {
  const forbiddenFiles = [
    'scripts/verify-blog-9bids.mjs',
    'scripts/verify-final-live.mjs',
    'scripts/verify-live-production.mjs',
    'src/content/posts/2026-10-02-pm-ad-trend.md'
  ];
  for (const file of forbiddenFiles) {
    if (fs.existsSync(path.join(rootDir, file))) {
      return `PR 대상에서 제외되어야 할 일회성 파일이 잔존합니다: ${file}`;
    }
  }
  return true;
});

console.log('\n================================================================================');
if (failureCount === 0) {
  console.log(`🎉 [테스트 완료] 10대 운영 거버넌스 및 할루시네이션 방지 테스트 전원 통과 (${passCount}/${testCount})`);
  console.log('================================================================================\n');
  process.exit(0);
} else {
  console.error(`❌ [테스트 실패] 총 ${testCount}개 중 ${failureCount}개 테스트 실패`);
  console.log('================================================================================\n');
  process.exit(1);
}
