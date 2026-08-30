export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    if (!env.CHAT_KV) {
      return new Response(
        JSON.stringify({
          error: "Cloudflare KV binding (CHAT_KV) is not configured.",
          messages: [],
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(request.url);
    const senderFilter = url.searchParams.get("sender"); // e.g. "admin" or "user"

    // 1. KV에서 msg_ 로 시작하는 모든 키 목록 조회 (최대 1000개)
    const listResult = await env.CHAT_KV.list({ prefix: "msg_", limit: 100 });
    const keys = listResult.keys || [];

    // 2. 각 키의 값을 비동기로 읽기
    const messagePromises = keys.map(async (k) => {
      const raw = await env.CHAT_KV.get(k.name);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return {
          id: parsed.id || k.name,
          message: parsed.message || "",
          text: parsed.message || "",
          sender: parsed.sender || "user",
          timestamp: parsed.timestamp || 0,
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(messagePromises);

    // 3. 유효한 메시지만 필터링하고 타임스탬프 기준 오름차순(과거->최신) 정렬
    let messages = results
      .filter((m) => m !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    // 4. sender 파라미터가 있으면 필터링
    if (senderFilter) {
      messages = messages.filter((m) => m.sender === senderFilter);
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: messages.length,
        messages,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while fetching messages from KV.",
        messages: [],
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
