export async function POST(request) {
  const body = await request.json();
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: body.max_tokens || 4000,
          messages: body.messages,
        }),
      });

      const data = await response.json();

      // Se for rate limit e ainda tem tentativas, aguarda e tenta de novo
      if (data.error?.type === "rate_limit_error" && attempt < maxRetries) {
        const waitMs = attempt * 8000; // 8s, 16s
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      return Response.json(data);

    } catch (error) {
      if (attempt === maxRetries) {
        return Response.json({ error: { message: error.message } }, { status: 500 });
      }
      await new Promise(r => setTimeout(r, attempt * 5000));
    }
  }
}
