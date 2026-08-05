import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { articles, sources } from "../../../db/schema";

const defaults = [
  { name: "GitHub Trending", feedUrl: "https://github.com/trending.atom", category: "开源项目" },
  { name: "Hacker News", feedUrl: "https://hnrss.org/frontpage", category: "极客工具" },
];

function readTag(xml: string, tag: string) { return (xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"))?.[1] ?? "").replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim(); }
function readEntries(xml: string) { return [...xml.matchAll(/<(entry|item)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map(m => m[2]); }

export async function POST() {
  try {
    const db = getDb();
    for (const source of defaults) await db.insert(sources).values({ ...source, createdAt: new Date() }).onConflictDoNothing();
    const active = await db.select().from(sources).where(eq(sources.enabled, true));
    let added = 0;
    for (const source of active) {
      const response = await fetch(source.feedUrl, { headers: { "User-Agent": "GeekContentLab/1.0" } });
      if (!response.ok) continue;
      for (const entry of readEntries(await response.text()).slice(0, 10)) {
        const title = readTag(entry, "title");
        const link = entry.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ?? readTag(entry, "link");
        if (!title || !link) continue;
        const exists = await db.select({ id: articles.id }).from(articles).where(eq(articles.sourceUrl, link)).limit(1);
        if (exists.length) continue;
        const image = entry.match(/<media:content[^>]+url=["']([^"']+)/i)?.[1] ?? entry.match(/<enclosure[^>]+url=["']([^"']+)/i)?.[1] ?? null;
        const now = new Date();
        await db.insert(articles).values({ sourceId: source.id, title, sourceName: source.name, sourceUrl: link, category: source.category, originalContent: readTag(entry, "summary") || readTag(entry, "description"), coverImage: image, createdAt: now, updatedAt: now });
        added++;
      }
    }
    return Response.json({ added, message: `采集完成，新增 ${added} 篇` });
  } catch { return Response.json({ error: "采集服务需要先绑定 D1 数据库" }, { status: 503 }); }
}
