let cachedStats = { serverCount: 0, memberCount: 0, status: "online" };

export async function onRequest(context) {
  const method = context.request.method;

  if (method === "POST") {
    try {
      cachedStats = await context.request.json();
    } catch (e) {
      return new Response("Błąd danych", { status: 400 });
    }
  }

  return new Response(JSON.stringify(cachedStats), {
    headers: { 
      'Content-Type': 'application/json', 
      'Access-Control-Allow-Origin': '*' 
    }
  });
}
