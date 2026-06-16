let cachedStats = { serverCount: 0, memberCount: 0, status: "offline" };

export async function onRequest(context) {
  const method = context.request.method;
  const SECRET = context.env.API_SECRET;
  const providedKey = context.request.headers.get("x-api-key");

  if (providedKey !== SECRET) return new Response("Błąd", { status: 401 });

  if (method === "POST") {
    cachedStats = await context.request.json();
    return new Response("Zaktualizowano", { status: 200 });
  }

  return new Response(JSON.stringify(cachedStats), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
