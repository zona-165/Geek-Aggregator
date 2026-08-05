import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { articles } from "../../../db/schema";

export async function GET() {
  try { return Response.json({ items: await getDb().select().from(articles).orderBy(desc(articles.createdAt)).limit(100), persistent: true }); }
  catch { return Response.json({ items: [], persistent: false }); }
}

export async function PATCH(request: Request) {
  const body = await request.json() as { id?: number; status?: string; title?: string; rewrittenContent?: string; coverImage?: string };
  if (!body.id) return Response.json({ error: "缺少文章 ID" }, { status: 400 });
  try {
    const updated = await getDb().update(articles).set({ ...(body.status ? { status: body.status as "待改写" | "已改写" | "待审核" | "已发布" } : {}), ...(body.title !== undefined ? { rewrittenTitle: body.title } : {}), ...(body.rewrittenContent !== undefined ? { rewrittenContent: body.rewrittenContent } : {}), ...(body.coverImage !== undefined ? { coverImage: body.coverImage } : {}), updatedAt: new Date(), ...(body.status === "已发布" ? { publishedAt: new Date() } : {}) }).where(eq(articles.id, body.id)).returning();
    return Response.json({ item: updated[0], persistent: true });
  } catch { return Response.json({ error: "数据库尚未绑定" }, { status: 503 }); }
}
