/**
 * G2B 나라장터 공공데이터 OpenAPI 공식 오퍼레이션 통합 실측 테스트 스크립트
 * 
 * [조회 기준]
 * - 정확한 최근 3일 (72시간): 202609010000 ~ 202609040000 (KST)
 * - 비밀키 원문 및 전체 URL 콘솔 출력 차단 ([MASKED] 처리)
 */

import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const l of lines) {
      const m = l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (m) process.env[m[1]] = (m[2] || '').trim();
    }
  }
}
loadEnv();

const apiKey = process.env.PUBLIC_DATA_API_KEY;
if (!apiKey) {
  console.error('❌ [오류] PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const encKey = encodeURIComponent(apiKey);

// 정확한 최근 3일 (2026.09.01 00:00 ~ 2026.09.04 00:00 KST, 72시간)
const bgnDt = '202609010000';
const endDt = '202609040000';

const OPERATIONS_REGISTRY = [
  {
    category: '목록 및 상세정보 통합 API',
    operationName: 'getBidPblancListInfoServc',
    displayName: '용역 입찰공고 상세정보 (113개 내부 필드 포함)',
    endpoint: 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServc',
    inqryDiv: '1'
  },
  {
    category: '목록 및 상세정보 통합 API',
    operationName: 'getBidPblancListInfoThng',
    displayName: '물품 입찰공고 상세정보 (101개 내부 필드 포함)',
    endpoint: 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoThng',
    inqryDiv: '1'
  },
  {
    category: '목록 및 상세정보 통합 API',
    operationName: 'getBidPblancListInfoCnstwk',
    displayName: '공사 입찰공고 상세정보 (143개 내부 필드 포함)',
    endpoint: 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoCnstwk',
    inqryDiv: '1'
  },
  {
    category: '조달청 상세검색 (동일 스키마/데이터)',
    operationName: 'getBidPblancListInfoServcPPSSrch',
    displayName: '조달청 용역 상세조회 (ListInfo와 동일 113개 필드)',
    endpoint: 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServcPPSSrch',
    inqryDiv: '1'
  },
  {
    category: '조달청 상세검색 (동일 스키마/데이터)',
    operationName: 'getBidPblancListInfoThngPPSSrch',
    displayName: '조달청 물품 상세조회 (ListInfo와 동일 101개 필드)',
    endpoint: 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoThngPPSSrch',
    inqryDiv: '1'
  },
  {
    category: '조달청 상세검색 (동일 스키마/데이터)',
    operationName: 'getBidPblancListInfoCnstwkPPSSrch',
    displayName: '조달청 공사 상세조회 (ListInfo와 동일 143개 필드)',
    endpoint: 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoCnstwkPPSSrch',
    inqryDiv: '1'
  },
  {
    category: '별도 지역제한 API',
    operationName: 'getBidPblancListInfoPrtcptPsblRgn',
    displayName: '입찰공고 참가가능지역정보 (6개 필드)',
    endpoint: 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoPrtcptPsblRgn',
    inqryDiv: '1'
  },
  {
    category: '별도 변경이력 API',
    operationName: 'getBidPblancListInfoChgHstryServc',
    displayName: '용역 입찰공고 변경이력 (11개 필드)',
    endpoint: 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoChgHstryServc',
    inqryDiv: '1'
  },
  {
    category: '별도 변경이력 API',
    operationName: 'getBidPblancListInfoChgHstryThng',
    displayName: '물품 입찰공고 변경이력 (11개 필드)',
    endpoint: 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoChgHstryThng',
    inqryDiv: '1'
  },
  {
    category: '별도 변경이력 API',
    operationName: 'getBidPblancListInfoChgHstryCnstwk',
    displayName: '공사 입찰공고 변경이력 (11개 필드)',
    endpoint: 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoChgHstryCnstwk',
    inqryDiv: '1'
  }
];

async function runIntegrationTest() {
  console.log('================================================================================');
  console.log('🔒 나라장터(G2B) OpenAPI 공식 오퍼레이션 실측 통합 테스트 (3일 기준)');
  console.log(`📅 정확한 조회 기준일시: ${bgnDt} ~ ${endDt} (KST, 72시간)`);
  console.log('🛡️ 보안 준수: API Key 및 쿼리 파라미터 내 비밀정보 콘솔 마스킹 완비');
  console.log('================================================================================\n');

  const testLogs = [];

  for (const op of OPERATIONS_REGISTRY) {
    const maskedUrl = `${op.endpoint}?serviceKey=[MASKED]&numOfRows=1&pageNo=1&type=json&inqryDiv=${op.inqryDiv}&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`;
    const realUrl = `${op.endpoint}?serviceKey=${encKey}&numOfRows=1&pageNo=1&type=json&inqryDiv=${op.inqryDiv}&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`;

    try {
      const res = await fetch(realUrl, { signal: AbortSignal.timeout(8000) });
      const status = res.status;
      const data = await res.json();
      
      const resultCode = data?.response?.header?.resultCode || 'N/A';
      const resultMsg = data?.response?.header?.resultMsg || 'N/A';
      const totalCount = data?.response?.body?.totalCount ?? 0;
      const items = data?.response?.body?.items || [];
      const returnedCount = Array.isArray(items) ? items.length : (items ? 1 : 0);
      const rawItem = Array.isArray(items) ? items[0] : items;
      const fieldNames = rawItem ? Object.keys(rawItem) : [];
      const errorMsg = (status === 200 && resultCode === '00') ? 'None' : `${status} ${resultCode}: ${resultMsg}`;

      testLogs.push({
        operationName: op.operationName,
        displayName: op.displayName,
        category: op.category,
        maskedUrl,
        httpStatus: status,
        resultCode,
        resultMsg,
        totalCount,
        returnedCount,
        fieldCount: fieldNames.length,
        fieldNames,
        errorMsg
      });

      console.log(`[HTTP ${status}] [${op.operationName}] (${op.displayName})`);
      console.log(`   - 분류: ${op.category}`);
      console.log(`   - resultCode: ${resultCode} (${resultMsg})`);
      console.log(`   - totalCount: ${totalCount.toLocaleString()}건 | 반환 건수: ${returnedCount}건 | 필드 수: ${fieldNames.length}개`);
      console.log(`   - 오류 메시지: ${errorMsg}`);
      console.log(`   - 첫 번째 응답 필드 목록: [${fieldNames.join(', ')}]`);
      console.log('');
    } catch (err) {
      testLogs.push({
        operationName: op.operationName,
        displayName: op.displayName,
        httpStatus: 'ERROR',
        errorMsg: err.message
      });
      console.log(`⚠️ [ERROR] [${op.operationName}]: ${err.message}\n`);
    }
  }

  console.log('================================================================================');
  console.log(`📊 테스트 완료: 총 ${OPERATIONS_REGISTRY.length}개 오퍼레이션 검증 수행`);
  console.log('================================================================================');
  
  const outPath = path.resolve(process.cwd(), 'docs/verification/api_operations_test_log.json');
  fs.writeFileSync(outPath, JSON.stringify(testLogs, null, 2), 'utf8');
  console.log(`📁 테스트 로그가 [${outPath}]에 저장되었습니다.`);
}

runIntegrationTest();
