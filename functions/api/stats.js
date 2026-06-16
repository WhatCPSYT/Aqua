export async function onRequest(context) {
  const method = context.request.method;
  const cacheKey = new Request(context.request.url);
  const cache = caches.default;

  if (method === "POST") {
    const AUTH_TOKEN = context.env.TOKEN; 
    const authHeader = context.request.headers.get("Authorization");

    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
      return new Response(JSON.stringify({ error: "Brak autoryzacji lub błędny token" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const stats = await context.request.json();
      
      if (typeof stats.serverCount !== 'number' || typeof stats.memberCount !== 'number') {
        return new Response(JSON.stringify({ error: "Nieprawidłowy format danych" }), { status: 400 });
      }

      const response = new Response(JSON.stringify(stats), {
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*' 
        }
      });

      context.waitUntil(cache.put(cacheKey, response.clone()));

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Błąd przetwarzania JSON" }), { status: 400 });
    }
  }

  if (method === "GET") {
    const cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const defaultStats = { serverCount: 0, memberCount: 0, status: "offline" };
    return new Response(JSON.stringify(defaultStats), {
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      }
    });
  }

  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  return new Response("Method not allowed", { status: 405 });
}
