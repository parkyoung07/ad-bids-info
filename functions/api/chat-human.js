export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.CHAT_KV) {
      return new Response(
        JSON.stringify({
          error: "Cloudflare KV binding (CHAT_KV) is not configured.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const message = body.message;
    const sender = body.sender || "user"; // "user" or "admin"

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "Message content is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const timestamp = Date.now();
    const newMsg = {
      id: `msg_${timestamp}_${Math.random().toString(36).substring(2, 6)}`,
      message: message.trim(),
      sender,
      timestamp,
    };

    // 1. chat_history 단일 키에서 기존 목록 로드 (즉시 일관성 보장)
    let history = [];
    try {
      const rawHistory = await env.CHAT_KV.get("chat_history");
      if (rawHistory) {
        history = JSON.parse(rawHistory);
      }
    } catch {
      history = [];
    }

    // 2. 새 메시지 추가 (최근 100개 유지)
    history.push(newMsg);
    if (history.length > 100) {
      history = history.slice(history.length - 100);
    }

    // 3. chat_history에 즉시 저장
    await env.CHAT_KV.put("chat_history", JSON.stringify(history));

    // 4. 개별 백업 키로도 저장
    await env.CHAT_KV.put(newMsg.id, JSON.stringify(newMsg), {
      expirationTtl: 60 * 60 * 24 * 30,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: newMsg,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while saving message to KV.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
