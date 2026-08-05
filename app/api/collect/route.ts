import { addArticle, listArticles } from "../../../db/file-store";

const defaults = [
  { name: "GitHub Trending", feedUrl: "https://github.com/trending.atom", category: "开源项目" },
  { name: "Hacker News", feedUrl: "https://hnrss.org/frontpage", category: "极客工具" },
  { name: "开源中国", feedUrl: "https://www.oschina.net/news/rss", category: "开源项目" },
  { name: "少数派", feedUrl: "https://sspai.com/feed", category: "极客工具" },
  { name: "IT之家 AI", feedUrl: "https://www.ithome.com/rss/", category: "AI 前沿" },
  { name: "InfoQ 中文", feedUrl: "https://www.infoq.cn/feed", category: "编程学习" },
  { name: "36氪科技", feedUrl: "https://36kr.com/feed", category: "AI 前沿" },
];

function readTag(xml: string, tag: string) { return (xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"))?.[1] ?? "").replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim(); }
function readEntries(xml: string) { return [...xml.matchAll(/<(entry|item)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map(m => m[2]); }

export async function POST() {
  try {
    let added = 0;
    const existing = await listArticles();
    for (const source of defaults) {
      const response = await fetch(source.feedUrl, { headers: { "User-Agent": "GeekContentLab/1.0" } });
      if (!response.ok) continue;
      for (const entry of readEntries(await response.text()).slice(0, 10)) {
        const title = readTag(entry, "title");
        const link = entry.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ?? readTag(entry, "link");
        if (!title || !link) continue;
        if (existing.some(x => x.sourceUrl === link)) continue;
        const image = entry.match(/<media:content[^>]+url=["']([^"']+)/i)?.[1] ?? entry.match(/<enclosure[^>]+url=["']([^"']+)/i)?.[1] ?? null;
        const now = new Date();
        await addArticle({ title, source: source.name, sourceUrl: link, tag: source.category, time: now.toISOString(), status: "待改写", excerpt: readTag(entry, "summary") || readTag(entry, "description"), originalContent: readTag(entry, "summary") || readTag(entry, "description"), coverImage: image ?? undefined });
        added++;
      }
    }
    return Response.json({ added, message: `采集完成，新增 ${added} 篇` });
  } catch { return Response.json({ error: "采集服务需要先绑定 D1 数据库" }, { status: 503 }); }
}
