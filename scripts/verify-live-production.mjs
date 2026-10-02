import https from "https";
import { execSync } from "child_process";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, length: data.length, body: data }));
    }).on("error", reject);
  });
}

async function verifyProduction() {
  console.log("================================================================================");
  console.log("🚀 [SignBid AI] 운영 사이트(signbidai.com) 실서버 배포 최종 검증");
  console.log("================================================================================");

  // 1. GitHub Actions Run status
  try {
    const ghRun = execSync("gh run list --branch main -L 1", { encoding: "utf8" });
    console.log("\n1. GitHub Actions 배포 실행 결과:\n" + ghRun.trim());
  } catch (err) {
    console.log("\n1. GitHub Actions 조회: " + err.message);
  }

  // 2. Production bids.json
  const prodUrl = "https://signbidai.com";
  console.log("\n2. 운영 배포 bids.json 확인: " + prodUrl + "/data/bids.json");
  const bidsRes = await fetchUrl(prodUrl + "/data/bids.json");
  let prodBids = [];
  try {
    prodBids = JSON.parse(bidsRes.body);
    console.log("  - 운영 bids.json 전체 건수: " + prodBids.length + "건 (HTTP " + bidsRes.status + ")");
  } catch (e) {
    console.log("  - JSON 파싱 오류: " + e.message);
  }

  // 3. Production HTML DOM
  console.log("\n3. 운영 메인 페이지 DOM 렌더링 확인: " + prodUrl);
  const mainRes = await fetchUrl(prodUrl);
  console.log("  - HTTP Status: " + mainRes.status + " (HTML: " + mainRes.length.toLocaleString() + " bytes)");

  const catMatches = [
    { name: "전체보기", regex: /전체보기<\/span><span[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/span>/i },
    { name: "제작·시공", regex: /제작·시공<\/span><span[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/span>/i },
    { name: "인쇄·출판", regex: /인쇄·출판<\/span><span[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/span>/i },
    { name: "출력·인쇄 장비", regex: /출력·인쇄 장비<\/span><span[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/span>/i },
    { name: "출력소재·잉크", regex: /출력소재·잉크<\/span><span[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/span>/i },
    { name: "진행 중 자동수집 후보", regex: /진행 중 자동수집 후보\s*\((?:<!-- -->)?(\d+)(?:<!-- -->)?\)/i },
    { name: "공식 마감", regex: /공식 마감\s*\((?:<!-- -->)?(\d+)(?:<!-- -->)?\)/i },
    { name: "조회된 공고", regex: /조회된 공고\s*<strong[^>]*>(?:<!-- -->)?(\d+)(?:<!-- -->)?<\/strong>건/i },
  ];

  catMatches.forEach(({ name, regex }) => {
    const m = mainRes.body.match(regex);
    console.log("  - " + name + ": " + (m ? m[1] : "N/A") + "건");
  });

  // 4. Candidate IDs in production HTML
  console.log("\n4. 신규 후보 9건 운영 DOM 노출 검증:");
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

  let foundCand = 0;
  candidateIds.forEach((id) => {
    const inHtml = mainRes.body.includes(id);
    if (inHtml) foundCand++;
    console.log("  - " + id + ": " + (inHtml ? "✅ 렌더링 확인" : "❌ 미노출"));
  });

  // 5. Prohibited phrases check
  console.log("\n5. 금지어 검증 (검증 완료, 공식 검증, 승인 완료):");
  const prohibited = ["검증 완료", "공식 검증", "승인 완료"];
  prohibited.forEach((p) => {
    const count = (mainRes.body.match(new RegExp(p, "g")) || []).length;
    console.log("  - '" + p + "': " + count + "건 발견 " + (count === 0 ? "✅ 통과" : "❌ 위반"));
  });

  // 6. G2B Link Buttons
  const g2bButtons = (mainRes.body.match(/나라장터 공식 원문 보기/g) || []).length;
  console.log("\n6. 나라장터 공식 원문 직통 버튼: " + g2bButtons + "개 렌더링");

  // 7. Blog draft 404 check
  const blogUrl = prodUrl + "/blog/2026-10-01-pm-ad-trend/";
  const blogRes = await fetchUrl(blogUrl);
  console.log("\n7. 운영 블로그 초안 비공개 격리: " + blogUrl + " (HTTP " + blogRes.status + " -> " + (blogRes.status === 404 ? "✅ 404 비공개 유지" : "⚠️ 비정상") + ")");

  console.log("\n================================================================================");
}

verifyProduction().catch(console.error);
