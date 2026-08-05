import { addArticle, listArticles } from "../../../db/file-store";

const defaults = [
  // 社区讨论流：只保存标题、摘要、来源链接和可公开引用的封面地址。
  { name: "V2EX 编程讨论", feedUrl: "https://www.v2ex.com/feed/programmer.xml", category: "编程学习" },
  { name: "V2EX 社区动态", feedUrl: "https://www.v2ex.com/go/rss", category: "AI 前沿" },
  // 项目官方 release 流：来源明确，适合做版本更新和工具速览。
  { name: "Neovim 官方更新", feedUrl: "https://github.com/neovim/neovim/releases.atom", category: "极客工具" },
  { name: "Ollama 官方更新", feedUrl: "https://github.com/ollama/ollama/releases.atom", category: "AI 前沿" },
  { name: "uv 官方更新", feedUrl: "https://github.com/astral-sh/uv/releases.atom", category: "编程学习" },
  { name: "Immich 官方更新", feedUrl: "https://github.com/immich-app/immich/releases.atom", category: "服务器" },
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
  } catch { return Response.json({ error: "采集服务暂时不可用，请检查 RSS 地址或服务器网络" }, { status: 503 }); }
}
