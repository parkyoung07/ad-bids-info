// 마크다운 기호 제거 함수 (순수 텍스트 또는 깔끔한 줄바꿈 유지)
function cleanResponseText(text) {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .trim();
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.AI) {
      return new Response(
        JSON.stringify({
          error: "Cloudflare Workers AI binding (AI) is not configured.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const userMessage =
      body.message ||
      (Array.isArray(body.messages)
        ? body.messages[body.messages.length - 1]?.content
        : "");

    if (!userMessage) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1. 통합 검색 인덱스(/data/search-index.json) 가져오기
    let searchIndex = [];
    try {
      const indexUrl = new URL(request.url).origin + "/data/search-index.json";
      const indexRes = await fetch(indexUrl);
      if (indexRes.ok) {
        searchIndex = await indexRes.json();
      }
    } catch (err) {
      console.error("Failed to fetch search index:", err);
    }

    // 2. 질문 의도 및 키워드 가중치 분석
    const lowerQuery = userMessage.toLowerCase();
    const queryTokens = lowerQuery
      .split(/[\s,?.!~#@*&^()_+=/\\-]+/)
      .filter((k) => k.length >= 1);

    const isPartnerQuery = /업체|협력사|파트너|외주|크레인|스카이|가공|공장|시공팀|실사|현수막|인쇄|도매|연락처|전화번호|전화|대표|실장|팀장/.test(lowerQuery);
    const isBidQuery = /입찰|공고|마감|예산|금액|발주|나라장터|온비드|전광판|간판|사이니지|표찰|현판|랩핑|학교|아파트|지자체|청사/.test(lowerQuery);
    const isAwardQuery = /낙찰|예가|투찰률|개찰|결과|통계|얼마에/.test(lowerQuery);

    const scoredItems = searchIndex.map((item) => {
      let score = 0;
      const type = item.type || "post";
      const fullText = `${item.title || ""} ${item.companyName || ""} ${item.client || ""} ${item.category || ""} ${item.location || ""} ${item.description || ""} ${item.content || ""} ${(item.tags || []).join(" ")}`.toLowerCase();

      // 카테고리 의도 매칭 가중치
      if (isPartnerQuery && type === "partner") score += 5;
      if (isBidQuery && type === "bid") score += 4;
      if (isAwardQuery && type === "award") score += 4;

      // 키워드 매칭
      for (const token of queryTokens) {
        if (token.length === 1 && !/^[0-9가-힣a-zA-Z]$/.test(token)) continue;

        if (fullText.includes(token)) {
          score += 2;
          if ((item.title || "").toLowerCase().includes(token)) score += 4;
          if ((item.companyName || "").toLowerCase().includes(token)) score += 5;
          if ((item.category || "").toLowerCase().includes(token)) score += 3;
          if ((item.location || "").toLowerCase().includes(token)) score += 3;
        }
      }

      return { item, score };
    });

    // 3. 상위 연관 항목 선별 (최대 5개)
    const topMatches = scoredItems
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.item);

    // 4. 컨텍스트 블록 포맷팅
    let contextBlocks = [];

    if (topMatches.length > 0) {
      topMatches.forEach((item, idx) => {
        if (item.type === "partner") {
          contextBlocks.push(
            `[협력업체 ${idx + 1}] 업체명: ${item.companyName} | 분야: ${item.category} | 지역: ${item.location} | 담당/연락처: ${item.contactPerson} (${item.phone}) | 보유장비/특징: ${item.description}`
          );
        } else if (item.type === "bid") {
          contextBlocks.push(
            `[입찰공고 ${idx + 1}] 공고명: ${item.title} | 발주처: ${item.client} | 예산: ${item.budgetText} | 마감: ${item.endDate} (D-${item.dDay}) | 지역/유형: ${item.location} (${item.bidType}) | 요약: ${item.description}`
          );
        } else if (item.type === "award") {
          contextBlocks.push(
            `[낙찰통계 ${idx + 1}] 사업명: ${item.title} | 낙찰기업: ${item.winnerCompany} (낙찰률: ${item.awardedRate}%) | 세부: ${item.description}`
          );
        } else {
          contextBlocks.push(
            `[전문정보 ${idx + 1}] 제목: ${item.title} | 내용: ${item.description || item.content}`
          );
        }
      });
    }

    const contextText =
      contextBlocks.length > 0
        ? contextBlocks.join("\n\n")
        : "현재 질문과 정확히 일치하는 특정 데이터가 없습니다. 옥외광고 입찰 및 협력사 일반 가이드로 친절히 안내하세요.";

    // 5. 정교한 한국어 시스템 프롬프트 구성
    const systemPrompt = `당신은 대한민국 최고의 옥외광고·디지털사이니지·공공입찰 전문 AI 도우미 '옥외광고 입찰 알리미 챗봇'입니다.
질문자(옥외광고 사업자 및 실무자)에게 친절하고 신뢰감 있는 어조(하십시오체/해요체)로 정확한 정보를 제공하세요.

[답변 원칙]
1. 아래 [사이트 내부 실시간 데이터]를 최우선으로 활용하여 사실에 기반해 정확하게 답변하세요.
2. 업체/협력사 문의 시: 업체명, 전문 분야, 지역, 담당자명, 연락처(전화번호), 보유 장비 및 특징을 명확하게 안내하세요.
3. 입찰 공고 문의 시: 공고명, 발주처, 배정 예산, 마감일(D-Day), 필수 자격요건 등을 알기 쉽게 요약해 안내하세요.
4. 불필요하게 긴 설명은 지양하고 핵심 위주로 3~5문장 내외로 읽기 편하게 답변하세요.
5. 마크다운 기호(#, *** 등)는 과도하게 쓰지 말고 깔끔한 줄바꿈과 텍스트 위주로 작성하세요.

[사이트 내부 실시간 데이터]
${contextText}`;

    let aiMessages = [];
    if (Array.isArray(body.messages) && body.messages.length > 0) {
      aiMessages = [
        { role: "system", content: systemPrompt },
        ...body.messages
          .filter((m) => m && m.content && (m.role === "user" || m.role === "assistant"))
          .map((m) => ({ role: m.role, content: m.content })),
      ];
    } else {
      aiMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ];
    }

    // 6. Workers AI 호출 (Llama-3.1-8b-instruct)
    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: aiMessages,
      max_tokens: 350,
      temperature: 0.3,
    });

    const rawResponse = result?.response || result || "요청하신 정보를 조회하는 중입니다. 구체적인 품목이나 지역으로 다시 문의해 주시면 상세히 안내해 드리겠습니다.";
    const cleanResponse = cleanResponseText(rawResponse);

    return new Response(
      JSON.stringify({
        response: cleanResponse,
        matchedCount: topMatches.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while calling Workers AI",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

