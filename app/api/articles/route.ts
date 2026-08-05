import { listArticles, updateArticle } from "../../../db/file-store";

export async function GET() { return Response.json({ items: await listArticles(), persistent: true }); }

export async function PATCH(request: Request) {
  const body = await request.json() as { id?: number; status?: string; title?: string; rewrittenContent?: string; coverImage?: string };
  if (!body.id) return Response.json({ error: "缺少文章 ID" }, { status: 400 });
  const item = await updateArticle(body.id, { ...(body.status ? { status: body.status } : {}), ...(body.title !== undefined ? { title: body.title } : {}), ...(body.rewrittenContent !== undefined ? { rewrittenContent: body.rewrittenContent, excerpt: body.rewrittenContent } : {}), ...(body.coverImage !== undefined ? { coverImage: body.coverImage } : {}) });
  return item ? Response.json({ item, persistent: true }) : Response.json({ error: "文章不存在" }, { status: 404 });
}
