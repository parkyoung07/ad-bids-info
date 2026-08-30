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
    const senderFilter = url.searchParams.get("sender");

    // 1. chat_history 키에서 즉시 읽기 (지연 없음)
    let messages = [];
    try {
      const raw = await env.CHAT_KV.get("chat_history");
      if (raw) {
        messages = JSON.parse(raw);
      }
    } catch {
      messages = [];
    }

    // 2. text 필드 정규화 및 정렬
    messages = (Array.isArray(messages) ? messages : []).map((m) => ({
      id: m.id || `msg_${m.timestamp}`,
      message: m.message || m.text || "",
      text: m.message || m.text || "",
      sender: m.sender || "user",
      timestamp: m.timestamp || 0,
    }));

    // 3. 발신자 필터링 (있을 경우)
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
