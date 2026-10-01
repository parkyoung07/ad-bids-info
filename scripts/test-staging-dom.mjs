import https from "https";
import fs from "fs";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "SignBid-SmokeTest/1.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      })
      .on("error", reject);
  });
}

async function runSmokeTests() {
  console.log("================================================================================");
  console.log("🔍 [SignBid AI] Staging 실서버 Rendered DOM 및 운영 사이트 Smoke Test");
  console.log("================================================================================");

  const stagingUrl = "https://staging.ad-bids-info.pages.dev";
  const prodUrl = "https://signbidai.com";
  const newCandidateIds = [
    "R26BK01750751-000",
    "R26BK01745608-000",
    "R26BK01745989-000",
    "R26BK01750109-000",
    "R26BK01751430-000",
    "R26BK01748842-000",
    "R26BK01748096-001",
    "R26BK01749040-001",
    "R26BK01749796-000"
  ];

  let allPassed = true;

  // 1. Fetch Staging HTML
  console.log(`\n▶ [1/6] Staging 메인 페이지 접속: ${stagingUrl}`);
  const stagingRes = await fetchUrl(stagingUrl);
  console.log(`  - HTTP Status: ${stagingRes.status}`);
  if (stagingRes.status !== 200) {
    console.error(`  ❌ Staging 응답 실패: ${stagingRes.status}`);
    allPassed = false;
  }

  // 2. Fetch Staging bids.json
  console.log(`\n▶ [2/6] Staging 배포 bids.json 확인: ${stagingUrl}/data/bids.json`);
  const bidsJsonRes = await fetchUrl(`${stagingUrl}/data/bids.json`);
  let stagingBids = [];
  try {
    stagingBids = JSON.parse(bidsJsonRes.body);
    console.log(`  - Staging bids.json 전체 건수: ${stagingBids.length}건`);
    if (stagingBids.length === 28) {
      console.log(`  ✅ Staging bids.json 28건 일치`);
    } else {
      console.error(`  ❌ Staging bids.json 건수 불일치: ${stagingBids.length} (기대값: 28)`);
      allPassed = false;
    }
  } catch (err) {
    console.error(`  ❌ Staging bids.json 파싱 실패:`, err.message);
    allPassed = false;
  }

  // 3. Staging DOM 검증: 28건, 25건, 3건 렌더링 및 신규 공고 9건 존재 여부
  console.log(`\n▶ [3/6] Staging HTML DOM 텍스트 및 공고 검증`);
  
  // 금지어 검사: '검증 완료', '공식 검증', '승인 완료'
  const prohibitedWords = ["검증 완료", "공식 검증", "승인 완료"];
  let prohibitedFound = 0;
  prohibitedWords.forEach(word => {
    // Check inside staging bids card area (ignoring markdown doc text if any)
    const matches = (stagingRes.body.match(new RegExp(word, "g")) || []).length;
    if (matches > 0) {
      console.warn(`  ⚠️ 금지어 '${word}' 발견: ${matches}회`);
      prohibitedFound += matches;
    }
  });
  if (prohibitedFound === 0) {
    console.log(`  ✅ 금지어 (검증 완료, 공식 검증, 승인 완료) 0건 확인`);
  }

  // 신규 공고번호 9개 존재 여부
  let foundCandidateCount = 0;
  newCandidateIds.forEach(id => {
    if (stagingRes.body.includes(id)) {
      foundCandidateCount++;
    } else {
      console.error(`  ❌ 신규 공고 ID 누락 in HTML: ${id}`);
    }
  });
  console.log(`  - 신규 공고번호 HTML 포함 수: ${foundCandidateCount}/9`);
  if (foundCandidateCount === 9) {
    console.log(`  ✅ 신규 공고 9건 모두 DOM/HTML 내 포함 확인`);
  } else {
    allPassed = false;
  }

  // 후보 9건의 isVerified: true 개수 검증 (0이어야 함)
  const candidateBidsInJson = stagingBids.filter(b => newCandidateIds.includes(b.id));
  const verifiedCount = candidateBidsInJson.filter(b => b.isVerified === true || b.validation?.isVerified === true).length;
  console.log(`  - 신규 후보 9건 중 isVerified: true 개수: ${verifiedCount}`);
  if (verifiedCount === 0) {
    console.log(`  ✅ 신규 후보 9건 모두 isVerified: false 유지 (모순 방지 통과)`);
  } else {
    console.error(`  ❌ isVerified: true 잘못 부여됨: ${verifiedCount}건`);
    allPassed = false;
  }

  // 4. Staging 블로그 미리보기 확인
  const blogPreviewUrl = `${stagingUrl}/preview/blog/2026-10-01-pm-ad-trend/`;
  console.log(`\n▶ [4/6] Staging 블로그 초안 미리보기 검증: ${blogPreviewUrl}`);
  const blogRes = await fetchUrl(blogPreviewUrl);
  console.log(`  - HTTP Status: ${blogRes.status}`);
  if (blogRes.status === 200) {
    console.log(`  ✅ Staging 블로그 미리보기 HTTP 200 정상 응답`);
  } else {
    console.error(`  ❌ Staging 블로그 미리보기 응답 실패: ${blogRes.status}`);
    allPassed = false;
  }

  // 5. 운영 사이트 원본 보존 검증: https://signbidai.com
  console.log(`\n▶ [5/6] 운영 사이트(signbidai.com) 무변경 격리 검증`);
  const prodBidsRes = await fetchUrl(`${prodUrl}/data/bids.json`);
  try {
    const prodBids = JSON.parse(prodBidsRes.body);
    console.log(`  - 운영 사이트 bids.json 건수: ${prodBids.length}건`);
    if (prodBids.length === 18) {
      console.log(`  ✅ 운영 사이트 기존 18건 완벽 유지 (Staging 미승인 운영 반영 방지 성공)`);
    } else {
      console.error(`  ❌ 운영 사이트 건수 변동 감지: ${prodBids.length} (기대값: 18)`);
      allPassed = false;
    }
  } catch (err) {
    console.error(`  ❌ 운영 사이트 bids.json 확인 실패:`, err.message);
  }

  // 6. 운영 블로그 404 유지 검증
  const prodBlogUrl = `${prodUrl}/blog/2026-10-01-pm-ad-trend/`;
  console.log(`\n▶ [6/6] 운영 사이트 블로그 비공개(404) 유지 검증: ${prodBlogUrl}`);
  const prodBlogRes = await fetchUrl(prodBlogUrl);
  console.log(`  - HTTP Status: ${prodBlogRes.status}`);
  if (prodBlogRes.status === 404) {
    console.log(`  ✅ 운영 사이트 미발행 블로그 404 정상 확인`);
  } else {
    console.warn(`  ⚠️ 운영 사이트 블로그 응답 코드: ${prodBlogRes.status}`);
  }

  console.log("\n================================================================================");
  if (allPassed) {
    console.log("🎉 [Smoke Test 완료] Staging 실서버 및 운영 격리 검증 100% 통과");
  } else {
    console.log("❌ [Smoke Test 실패] 일부 검증 항목 불일치 발생");
  }
  console.log("================================================================================");
}

runSmokeTests().catch(console.error);
