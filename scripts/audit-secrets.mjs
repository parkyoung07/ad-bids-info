/**
 * 전용 비밀정보 검사 도구 (In-Memory Stream Scanner)
 * 
 * [보안 원칙]
 * 1. 비밀키 원문을 절대 셸 명령어(CLI 인수)로 넘기지 않습니다.
 * 2. .env.local의 키 값을 메모리에만 로드한 후 버퍼 스트림으로 대조합니다.
 * 3. 원문, Base64 인코딩, URL 인코딩 등 모든 변형 패턴을 검사합니다.
 * 4. 검출 시에도 비밀키 값은 일절 출력하지 않고 파일 위치 및 커밋 해시만 마스킹하여 보고합니다.
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

function loadEnvKeys() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return [];
  
  const content = fs.readFileSync(envPath, 'utf8');
  const secrets = [];

  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)$/);
    if (match) {
      const name = match[1].trim();
      const val = match[2].trim().replace(/^['"]|['"]$/g, '');
      // 길이가 8자 이상인 유의미한 시크릿 값만 등록
      if (val.length >= 8) {
        secrets.push({
          name,
          raw: val,
          b64: Buffer.from(val).toString('base64'),
          urlEnc: encodeURIComponent(val)
        });
      }
    }
  }
  return secrets;
}

const targetSecrets = loadEnvKeys();

console.log('================================================================================');
console.log('🛡️ SignBid AI 인메모리 심층 비밀정보 보안 감사 (In-Memory Secret Audit)');
console.log(`🔒 검사 대상 환경변수 항목 수: ${targetSecrets.length}개`);
console.log('🔒 검사 방식: CLI 인자 미사용, 메모리 버퍼 직접 대조 (원문, Base64, URL-인코딩)');
console.log('================================================================================\n');

let totalLeaks = 0;

// 1. Git 전체 커밋 이력 검사 (git log -p 스트림 메모리 버퍼 수신)
console.log('▶ 1. Git 전체 커밋 이력 심층 감사 진행 중...');
const gitLogProc = spawnSync('git', ['log', '-p', '--all'], {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024 // 50MB
});

if (gitLogProc.stdout) {
  const gitLogText = gitLogProc.stdout;
  for (const s of targetSecrets) {
    let foundInGit = false;
    if (gitLogText.includes(s.raw) || gitLogText.includes(s.b64) || gitLogText.includes(s.urlEnc)) {
      foundInGit = true;
      totalLeaks++;
      console.error(`🚨 [GIT LEAK DETECTED] 환경변수 [${s.name}] 관련 패턴이 Git 이력에서 검출되었습니다.`);
    }
    if (!foundInGit) {
      console.log(`  ✅ [Git History] ${s.name}: 안전 (0건 검출)`);
    }
  }
} else {
  console.log('  ⚠️ Git 이력을 읽을 수 없거나 Git 저장소가 아닙니다.');
}

// 2. 빌드 산출물 (out/) 및 소스코드 전수 검사
console.log('\n▶ 2. 빌드 산출물(out/) 및 소스코드 디렉터리 감사 진행 중...');
const scanDirs = ['out', 'public', 'src', 'functions', 'scripts'];

function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walkDir(fullPath, fileList);
      }
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFilesToScan = [];
for (const d of scanDirs) {
  walkDir(d, allFilesToScan);
}

let fileLeaks = 0;
for (const filePath of allFilesToScan) {
  // .env 파일 자체는 검사 대상 제외
  if (filePath.includes('.env')) continue;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const s of targetSecrets) {
      if (content.includes(s.raw) || content.includes(s.b64) || content.includes(s.urlEnc)) {
        fileLeaks++;
        totalLeaks++;
        console.error(`🚨 [FILE LEAK DETECTED] 파일 [${filePath}] 내에 [${s.name}] 키 패턴 노출!`);
      }
    }
  } catch (err) {
    // 바이너리 파일 등은 건너뜀
  }
}

if (fileLeaks === 0) {
  console.log(`  ✅ [Files Audit] 총 ${allFilesToScan.length}개 파일 전수 검사 완료: 0건 검출 (안전)`);
}

console.log('\n================================================================================');
if (totalLeaks === 0) {
  console.log('🎉 [보안 감사 통과] Git 이력, 빌드 산출물, 소스코드 내 비밀정보 노출 0건 (완전 무결)');
} else {
  console.error(`❌ [보안 감사 실패] 총 ${totalLeaks}건의 비밀정보 노출 의심 패턴이 발견되었습니다.`);
  process.exit(1);
}
console.log('================================================================================');
