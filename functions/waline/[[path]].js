export async function onRequest(context) {
  const WALINE_URL = "https://zhetengpages-waline.vercel.app";
  const url = new URL(context.request.url);

  // 逻辑：前端请求 /waline/api/comment
  // 代理剥离 /waline，变成 /api/comment 转发给 Vercel
  const targetPath = url.pathname.replace(/^\/waline/, '');
  const targetUrl = new URL(targetPath + url.search, WALINE_URL);

  const headers = new Headers(context.request.headers);
  headers.delete("Origin");
  headers.delete("Referer");

  try {
    return await fetch(targetUrl, {
      method: context.request.method,
      headers: headers,
      body: ["GET", "HEAD"].includes(context.request.method) ? null : context.request.body,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Proxy Error" }), { status: 500 });
  }
}
