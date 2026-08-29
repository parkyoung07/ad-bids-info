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

    const systemPrompt =
      "You are an AI assistant for a Korean outdoor advertising and digital signage bid information website. Answer in Korean.";

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

    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: aiMessages,
      max_tokens: 300,
    });

    const responseText = result?.response || result || "답변을 생성하지 못했습니다.";

    return new Response(
      JSON.stringify({ response: responseText }),
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
