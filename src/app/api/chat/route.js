export async function POST(request) {
  try {
    const body = await request.json();

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

    // Log completo para debug
    console.log("STATUS:", response.status);
    console.log("RESPOSTA COMPLETA:", JSON.stringify(data));

    return Response.json(data);
  } catch (error) {
    console.log("ERRO:", error.message);
    return Response.json({ error: { message: error.message } }, { status: 500 });
  }
}
