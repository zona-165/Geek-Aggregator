export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { endpoint?: string; apiKey?: string; model?: string; title?: string; content?: string };
  if (!body.apiKey || !body.content) return Response.json({ error: "请填写 API Key 和原文内容" }, { status: 400 });
  const endpoint = (body.endpoint || "https://api.deepseek.com").replace(/\/$/, "");
  const response = await fetch(`${endpoint}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${body.apiKey}` }, body: JSON.stringify({ model: body.model || "deepseek-chat", temperature: 0.82, response_format: { type: "json_object" }, messages: [{ role: "system", content: "你是一名有多年经验的中文科技编辑。请基于原文事实写一篇自然、具体、像真实编辑亲自整理的公众号稿件。不要编造原文没有的数字、人物、结论或体验，不要声称亲自测试过。\n\n写作要求：\n1. 标题要准确、有信息量，避免夸张标题党。\n2. 正文不要机械复述原文，先抓住读者最关心的变化或问题，再自然展开。\n3. 长短句交替，段落长度有变化，适当使用具体细节、转折和编辑判断。\n4. 删除“本文将”“首先其次”“综上所述”“值得注意的是”“总的来说”等模板化套话，不要每段都用相同句式。\n5. 不要添加“AI改写”“本文由AI生成”等说明，不要输出提纲、写作分析或免责声明。\n6. 保留关键事实和来源边界；原文不确定的内容用谨慎表达。\n\n只返回 JSON：{\"title\":\"原创标题\",\"content\":\"原创正文\"}，不要输出 Markdown 代码围栏或其他解释。" }, { role: "user", content: `原标题：${body.title || ""}\n\n原文：\n${body.content}` }] }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return Response.json({ error: data?.error?.message || `AI 接口返回 ${response.status}` }, { status: 502 });
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return Response.json({ error: "AI 接口没有返回正文" }, { status: 502 });
  try { const parsed = JSON.parse(String(raw).replace(/^```json\s*|```$/g, "").trim()); return parsed.title && parsed.content ? Response.json({ title: parsed.title, content: parsed.content, model: body.model || "deepseek-chat" }) : Response.json({ error: "AI 返回格式不完整" }, { status: 502 }); } catch { return Response.json({ error: "AI 返回的原创标题和正文格式无法解析" }, { status: 502 }); }
}
