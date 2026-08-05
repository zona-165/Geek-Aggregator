import { addArticle, listArticles } from "../../../db/file-store";

type FeedSource = { name: string; feedUrl: string; category: string; keywords?: RegExp; excludeKeywords?: RegExp };

const defaults: FeedSource[] = [
  // 社区讨论流：只保存标题、摘要、来源链接和可公开引用的封面地址。
  { name: "V2EX 编程讨论", feedUrl: "https://www.v2ex.com/feed/programmer.xml", category: "编程学习" },
  { name: "V2EX 社区动态", feedUrl: "https://www.v2ex.com/go/rss", category: "AI 前沿" },
  { name: "V2EX 服务器", feedUrl: "https://www.v2ex.com/feed/server.xml", category: "服务器", keywords: /运维|工具|脚本|Linux|Debian|Ubuntu|Docker|部署|搭建|BBR|内核|网络|服务器|云|GPU|故障|排查|安全|监控/i, excludeKeywords: /购买|出售|优惠|优惠券|招聘|推广|返利|邀请码|跑路/i },
  { name: "V2EX VPS", feedUrl: "https://www.v2ex.com/feed/vps.xml", category: "服务器", keywords: /测评|测速|线路|流媒体|YouTube|Netflix|性能|带宽|延迟|IP|部署|搭建|脚本|BBR|Docker|Linux|网络|故障|排查/i, excludeKeywords: /购买|出售|优惠|折扣|推荐.*vps|出租|转让|邀请码|返利|机场/i },
  { name: "V2EX Linux", feedUrl: "https://www.v2ex.com/feed/linux.xml", category: "服务器", keywords: /Linux|Ubuntu|Debian|内核|命令|脚本|服务器|Docker|网络|SSH|Nginx|systemd|故障|排查|部署|安装|漏洞|Wayland/i, excludeKeywords: /手柄|输入法|桌面壁纸|游戏|招聘|出售|优惠/i },
  { name: "V2EX Docker", feedUrl: "https://www.v2ex.com/feed/docker.xml", category: "服务器", keywords: /Docker|容器|镜像|Compose|OrbStack|部署|Homelab|Registry|containerd|K8s|Kubernetes|服务|运维/i, excludeKeywords: /微信|聊天|游戏|招聘|优惠|出售/i },
  { name: "V2EX DevOps", feedUrl: "https://www.v2ex.com/feed/devops.xml", category: "服务器", keywords: /Jenkins|containerd|生产|环境|部署|流水线|DevOps|Linux|镜像|运维|监控|健康|自愈|Terraform|K8s|Docker|CI|CD|架构/i, excludeKeywords: /代理|招聘|出售|优惠|推广|群聊/i },
  // 项目官方 release 流：来源明确，适合做版本更新和工具速览。
  { name: "流媒体检测脚本更新", feedUrl: "https://github.com/lmc999/RegionRestrictionCheck/commits/main.atom", category: "服务器", keywords: /region|media|netflix|youtube|tiktok|bilibili|check|unlock|流媒体|检测|解锁/i, excludeKeywords: /update ad|promotional/i },
  { name: "IT之家 AI", feedUrl: "https://www.ithome.com/rss/", category: "AI 前沿" },
  { name: "36氪科技", feedUrl: "https://36kr.com/feed", category: "AI 前沿" },
  { name: "InfoQ 中文", feedUrl: "https://www.infoq.cn/feed", category: "编程学习" },
  { name: "开源中国", feedUrl: "https://www.oschina.net/news/rss", category: "开源项目" },
  { name: "少数派", feedUrl: "https://sspai.com/feed", category: "极客工具" },
  { name: "Neovim 官方更新", feedUrl: "https://github.com/neovim/neovim/releases.atom", category: "极客工具" },
  { name: "Ollama 官方更新", feedUrl: "https://github.com/ollama/ollama/releases.atom", category: "AI 前沿" },
  { name: "uv 官方更新", feedUrl: "https://github.com/astral-sh/uv/releases.atom", category: "编程学习" },
];

const junkTitle = /招聘|招聘信息|推广|广告位|优惠券|邀请码|返利|返现|出售|出一台|求购|代购|转让|跑路|机场|带货|商务合作|代理加盟|(?:限时|全网)折扣/i;
const fallbackCovers: Record<string, string> = {
  "AI 前沿": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=82",
  "编程学习": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=82",
  "开源项目": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=82",
  "极客工具": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=82",
  "服务器": "https://images.unsplash.com/photo-1451187580459-43490279cfa4?auto=format&fit=crop&w=1200&q=82",
};

function readTag(xml: string, tag: string) { return (xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"))?.[1] ?? "").replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim(); }
function readEntries(xml: string) { return [...xml.matchAll(/<(entry|item)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map(m => m[2]); }
function readImage(entry: string) {
  return entry.match(/<(?:media:content|media:thumbnail|enclosure)[^>]+(?:url|href)=["']([^"']+)["']/i)?.[1]
    ?? entry.match(/<image[\s\S]*?<url>([^<]+)<\/url>/i)?.[1]
    ?? entry.match(/<itunes:image[^>]+href=["']([^"']+)["']/i)?.[1]
    ?? null;
}

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
        if (junkTitle.test(title)) continue;
        if (source.keywords && !source.keywords.test(title)) continue;
        if (source.excludeKeywords?.test(title)) continue;
        if (existing.some(x => x.sourceUrl === link)) continue;
        const image = readImage(entry) ?? fallbackCovers[source.category];
        const now = new Date();
        await addArticle({ title, source: source.name, sourceUrl: link, tag: source.category, time: now.toISOString(), status: "待改写", excerpt: readTag(entry, "summary") || readTag(entry, "description"), originalContent: readTag(entry, "summary") || readTag(entry, "description"), coverImage: image });
        added++;
      }
    }
    return Response.json({ added, message: `采集完成，新增 ${added} 篇` });
  } catch { return Response.json({ error: "采集服务暂时不可用，请检查 RSS 地址或服务器网络" }, { status: 503 }); }
}
