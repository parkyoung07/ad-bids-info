import https from "https";

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject);
  });
}

async function verify() {
  const url = "https://signbidai.com/blog/2026-10-01-pm-ad-trend/";
  console.log("Fetching:", url);
  const res = await fetchHtml(url);
  console.log("HTTP Status:", res.status);

  const checks = [
    { id: 'R26BK01745608-000', title: '2027년도 논산시 행정수첩 제작', org: '충청남도 논산시', amt: '50,000,000원', dl: '2026-10-02 14:00', link: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01745608&bidPbancOrd=000' },
    { id: 'R26BK01745989-000', title: '2027년도 업무용 수첩 및 달력 제작', org: '중앙선거관리위원회', amt: '70,000,000원', dl: '2026-10-07 10:00', link: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01745989&bidPbancOrd=000' },
    { id: 'R26BK01750109-000', title: '2027년도 직원 업무수첩 제작', org: '충청북도 청주시', amt: '72,320,000원', dl: '2026-10-07 10:00', link: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01750109&bidPbancOrd=000' },
    { id: 'R26BK01751430-000', title: '인공지능윤리 교육자료 제작 인쇄(배송포함)', org: '경상북도교육청', amt: '89,800,000원', dl: '2026-10-07 10:00', link: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01751430&bidPbancOrd=000' },
    { id: 'R26BK01748842-000', title: '2027년도 행정수첩 제작(총액계약)', org: '충청남도 홍성군', amt: '39,200,000원', dl: '2026-10-07 15:00', link: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01748842&bidPbancOrd=000' },
    { id: 'R26BK01750751-000', title: '저시정 안내단말(전광판) 개선사업', org: '조달청 인천지방조달청', amt: '552,531,180원', dl: '2026-10-02 11:00', link: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01750751&bidPbancOrd=000' },
    { id: 'R26BK01748096-001', title: '로봇활용 제조혁신 지원사업 참여(도입)기업 현판 및 현황판 제작, 배송', org: '한국로봇산업진흥원', amt: '40,579,000원', dl: '2026-10-08 10:00', link: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01748096&bidPbancOrd=001' },
    { id: 'R26BK01749040-001', title: '울산시내버스 LED행선지전광판 물품구매 요청', org: '울산광역시버스운송사업조합', amt: '370,000,000원', dl: '2026-10-12 10:00', link: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01749040&bidPbancOrd=001' },
    { id: 'R26BK01749796-000', title: '장욱진 문화마을 내송길 안내사인물 디자인 및 제작설치 용역', org: '세종특별자치시', amt: '50,000,000원', dl: '2026-10-14 17:00', link: 'https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=R26BK01749796&bidPbancOrd=000' }
  ];

  let pass = 0;
  checks.forEach((c, idx) => {
    const idOk = res.body.includes(c.id);
    const titleOk = res.body.includes(c.title);
    const orgOk = res.body.includes(c.org);
    const amtOk = res.body.includes(c.amt);
    const dlOk = res.body.includes(c.dl);
    const linkOk = res.body.includes(c.link) || res.body.includes(c.link.replace("&", "&amp;"));
    const allOk = idOk && titleOk && orgOk && amtOk && dlOk && linkOk;
    if (allOk) pass++;
    console.log(`[공고 ${idx + 1}] ${c.id}: ${allOk ? "ALL PASS ✅" : "FAIL ❌"} (id:${idOk}, title:${titleOk}, org:${orgOk}, amt:${amtOk}, dl:${dlOk}, link:${linkOk})`);
  });
  console.log(`\n9건 대조 결과: ${pass}/9건 완전 일치`);

  const oldPhrase = "본 기사는 각 정부 부처, 공공기관 및 전문 언론사의 공식 보도자료와 공개 데이터를 바탕으로 작성된 분석 리포트입니다.";
  console.log("구형 안내문구 잔존 여부:", res.body.includes(oldPhrase) ? "FAIL (발견) ❌" : "PASS (0건) ✅");

  const newPhrase = "본 글은 조달청 나라장터 OpenAPI에서 자동수집된 입찰 후보를 바탕으로 작성한 참고자료입니다. 공고 상태·참가자격·금액·마감일·제출서류는 나라장터 공식 원문에서 최종 확인해야 합니다.";
  console.log("신규 표준 안내문구 포함 여부:", res.body.includes(newPhrase) ? "PASS (정상 포함) ✅" : "FAIL (누락) ❌");
}

verify();
