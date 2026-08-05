export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { endpoint?: string; apiKey?: string; model?: string; title?: string; content?: string };
  if (!body.apiKey || !body.content) return Response.json({ error: "请填写 API Key 和原文内容" }, { status: 400 });
  const endpoint = (body.endpoint || "https://api.deepseek.com").replace(/\/$/, "");
  const response = await fetch(`${endpoint}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${body.apiKey}` }, body: JSON.stringify({ model: body.model || "deepseek-chat", temperature: 0.7, response_format: { type: "json_object" }, messages: [{ role: "system", content: "你是微信公众号科技内容编辑。请基于原文事实进行原创改写，重新拟定有吸引力但不夸张的中文标题，并重写完整正文。只返回 JSON：{\"title\":\"原创标题\",\"content\":\"原创正文\"}，不要输出 Markdown 代码围栏或解释。" }, { role: "user", content: `原标题：${body.title || ""}\n\n原文：\n${body.content}` }] }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return Response.json({ error: data?.error?.message || `AI 接口返回 ${response.status}` }, { status: 502 });
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return Response.json({ error: "AI 接口没有返回正文" }, { status: 502 });
  try { const parsed = JSON.parse(String(raw).replace(/^```json\s*|```$/g, "").trim()); return parsed.title && parsed.content ? Response.json({ title: parsed.title, content: parsed.content, model: body.model || "deepseek-chat" }) : Response.json({ error: "AI 返回格式不完整" }, { status: 502 }); } catch { return Response.json({ error: "AI 返回的原创标题和正文格式无法解析" }, { status: 502 }); }
}
