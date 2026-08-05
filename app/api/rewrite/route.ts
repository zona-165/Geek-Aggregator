export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { endpoint?: string; apiKey?: string; model?: string; title?: string; content?: string };
  if (!body.apiKey || !body.content) return Response.json({ error: "请填写 API Key 和原文内容" }, { status: 400 });
  const endpoint = (body.endpoint || "https://api.deepseek.com").replace(/\/$/, "");
  const response = await fetch(`${endpoint}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${body.apiKey}` }, body: JSON.stringify({ model: body.model || "deepseek-chat", temperature: 0.7, messages: [{ role: "system", content: "你是微信公众号科技内容编辑。请在保留事实的基础上重写文章，语言自然、有标题感，输出适合公众号发布的正文，不要解释过程。" }, { role: "user", content: `标题：${body.title || ""}\n\n原文：\n${body.content}` }] }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return Response.json({ error: data?.error?.message || `AI 接口返回 ${response.status}` }, { status: 502 });
  const text = data?.choices?.[0]?.message?.content;
  return text ? Response.json({ content: text, model: body.model || "deepseek-chat" }) : Response.json({ error: "AI 接口没有返回正文" }, { status: 502 });
}
