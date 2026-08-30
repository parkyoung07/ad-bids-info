// 마크다운 기호 제거 함수
function stripMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/\r?\n+/g, " ")
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

    // 1. RAG: /data/search-index.json 가져오기
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

    // 2. 질문 단어 분리 및 키워드 매칭
    const keywords = userMessage
      .toLowerCase()
      .split(/[\s,?.!]+/)
      .filter((k) => k.length >= 1);

    const scoredItems = searchIndex.map((item) => {
      const searchText = `${item.title || ""} ${item.description || item.summary || ""} ${item.content || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (searchText.includes(kw)) {
          score += 1;
          if ((item.title || "").toLowerCase().includes(kw)) {
            score += 2;
          }
        }
      }
      return { item, score };
    });

    // 3. 매칭 점수가 높은 상위 3개 항목 선택
    const top3 = scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.item);

    // 4. 선택된 항목의 title과 summary를 포맷팅
    const bidDataContent =
      top3.length > 0
        ? top3
            .map(
              (item, idx) =>
                `[${idx + 1}] 제목: ${item.title || ""}\n요약: ${item.description || item.summary || item.content || ""}`
            )
            .join("\n\n")
        : "등록된 입찰 공고 데이터가 없습니다.";

    // 5. 시스템 프롬프트 구성
    const systemPrompt = `You are an AI assistant for a Korean outdoor advertising and digital signage bid information website.
Answer ONLY in Korean. Keep answers to 2-3 sentences maximum.
Do NOT use any markdown symbols (**, *, #, -). Plain text only.
Base your answer ONLY on the following bid data. If not relevant, reply: 해당 내용은 현재 등록된 입찰 공고에서 확인이 어렵습니다. 다른 조건으로 질문해 주세요.

[입찰 공고 데이터]
${bidDataContent}`;

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

    // 6. Workers AI 호출 (max_tokens: 150)
    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: aiMessages,
      max_tokens: 150,
    });

    const rawResponse = result?.response || result || "해당 내용은 현재 등록된 입찰 공고에서 확인이 어렵습니다. 다른 조건으로 질문해 주세요.";
    const cleanResponse = stripMarkdown(rawResponse);

    return new Response(
      JSON.stringify({ response: cleanResponse }),
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
