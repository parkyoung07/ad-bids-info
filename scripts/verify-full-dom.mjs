import https from "https";

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    }).on("error", reject);
  });
}

async function verifyFullDom() {
  console.log("================================================================================");
  console.log("🔬 [SignBid AI] Staging 실서버 Rendered DOM 정밀 분석 보고");
  console.log("================================================================================");

  const stagingUrl = "https://staging.ad-bids-info.pages.dev";
  const { status, body } = await fetchText(stagingUrl);

  console.log(`\n1. Staging 메인 페이지 응답: HTTP ${status} (HTML 크기: ${body.length.toLocaleString()} bytes)`);

  // 2. Extract Category Chips
  console.log("\n2. 업종별 칩 카운트 렌더링 검증:");
  const catMatches = [
    { name: "전체보기", regex: /전체보기<\/span><span[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/span>/i },
    { name: "제작·시공", regex: /제작·시공<\/span><span[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/span>/i },
    { name: "인쇄·출판", regex: /인쇄·출판<\/span><span[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/span>/i },
    { name: "출력·인쇄 장비", regex: /출력·인쇄 장비<\/span><span[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/span>/i },
    { name: "출력소재·잉크", regex: /출력소재·잉크<\/span><span[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/span>/i },
  ];

  catMatches.forEach(({ name, regex }) => {
    const m = body.match(regex);
    const count = m ? m[1] : "N/A";
    console.log(`   - ${name}: ${count}건 (DOM 렌더링 확인)`);
  });

  // 3. Extract Tab Counts
  console.log("\n3. 상태 탭 카운트 렌더링 검증:");
  const tabMatches = [
    { name: "진행 중 자동수집 후보", regex: /진행 중 자동수집 후보\s*\((?:<!-- -->)?(\d+)(?:<!-- -->)?\)/i },
    { name: "공식 마감", regex: /공식 마감\s*\((?:<!-- -->)?(\d+)(?:<!-- -->)?\)/i },
    { name: "조회된 공고", regex: /조회된 공고\s*<strong[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/strong>건/i },
  ];

  tabMatches.forEach(({ name, regex }) => {
    const m = body.match(regex);
    const count = m ? m[1] : "N/A";
    console.log(`   - ${name}: ${count}건`);
  });

  // 4. Candidate IDs check in DOM
  console.log("\n4. 신규 후보 9건 카드 렌더링 검증:");
  const candidateIds = [
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

  let foundCount = 0;
  candidateIds.forEach((id, idx) => {
    const hasId = body.includes(id);
    if (hasId) foundCount++;
    console.log(`   [${idx + 1}] ${id}: ${hasId ? "✅ DOM 렌더링 정상" : "❌ 누락"}`);
  });

  // 5. Check Prohibited phrases in DOM
  console.log("\n5. 금지어 노출 여부 검증 (검증 완료, 공식 검증, 승인 완료):");
  const prohibited = ["검증 완료", "공식 검증", "승인 완료"];
  prohibited.forEach((p) => {
    const count = (body.match(new RegExp(p, "g")) || []).length;
    console.log(`   - '${p}': ${count}건 발견 ${count === 0 ? "✅ 통과" : "❌ 위반"}`);
  });

  // 6. G2B Link Button check
  console.log("\n6. 나라장터 공식 원문 직통 버튼:");
  const g2bButtons = (body.match(/나라장터 공식 원문 보기/g) || []).length;
  console.log(`   - '나라장터 공식 원문 보기' 버튼 렌더링: ${g2bButtons}개`);

  console.log("\n================================================================================");
}

verifyFullDom().catch(console.error);
