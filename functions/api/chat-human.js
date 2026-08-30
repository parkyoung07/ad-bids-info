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
    const key = `msg_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
    const value = JSON.stringify({
      id: key,
      message: message.trim(),
      sender,
      timestamp,
    });

    // KV에 메시지 저장 (30일 보관)
    await env.CHAT_KV.put(key, value, {
      expirationTtl: 60 * 60 * 24 * 30,
    });

    return new Response(
      JSON.stringify({
        success: true,
        id: key,
        message: message.trim(),
        sender,
        timestamp,
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
