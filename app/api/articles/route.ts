import { listArticles, upsertArticle } from "../../../db/file-store";

export async function GET() { return Response.json({ items: await listArticles(), persistent: true }); }

export async function PATCH(request: Request) {
  const body = await request.json() as { id?: number; status?: string; title?: string; rewrittenContent?: string; coverImage?: string; source?: string; tag?: string; excerpt?: string; time?: string; originalContent?: string };
  if (!body.id) return Response.json({ error: "缺少文章 ID" }, { status: 400 });
  const item = await upsertArticle(body.id, { ...(body.status ? { status: body.status } : {}), ...(body.title !== undefined ? { title: body.title } : {}), ...(body.rewrittenContent !== undefined ? { rewrittenContent: body.rewrittenContent, excerpt: body.rewrittenContent } : {}), ...(body.coverImage !== undefined ? { coverImage: body.coverImage } : {}), ...(body.source ? { source: body.source } : {}), ...(body.tag ? { tag: body.tag } : {}), ...(body.time ? { time: body.time } : {}), ...(body.originalContent ? { originalContent: body.originalContent } : {}) });
  return Response.json({ item, persistent: true });
}
