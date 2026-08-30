export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    return new Response(JSON.stringify({ success: true, received: data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: true, message: "fallback" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestGet(context) {
  return new Response(
    JSON.stringify([
      {
        id: "SUB-1725028400000",
        phone: "010-3849-2918",
        email: "master@signmedia.co.kr",
        companyName: "(주)한강사인디자인",
        region: "서울",
        categories: ["간판·조형물", "디지털사이니지·전광판", "매체권·임대"],
        notifyMorning: true,
        notifyDeadline: true,
        subscribedAt: "2026-08-30T10:15:00.000Z",
        targetBid: "전체 맞춤 공고",
        status: "active",
      },
      {
        id: "SUB-1725028100000",
        phone: "010-9182-4738",
        email: "young@busansign.com",
        companyName: "부산종합광고기획",
        region: "부산",
        categories: ["학교·교육", "현수막·배너", "간판·조형물"],
        notifyMorning: true,
        notifyDeadline: true,
        subscribedAt: "2026-08-29T16:20:00.000Z",
        targetBid: "전체 맞춤 공고",
        status: "active",
      },
    ]),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
