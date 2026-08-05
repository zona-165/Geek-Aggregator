"use client";

import { useEffect, useMemo, useState } from "react";
import Feed from "./feed/page";

type Item = { id: number; title: string; source: string; tag: string; time: string; status: string; excerpt: string; rewrittenContent?: string; coverImage?: string };

const seed: Item[] = [
  { id: 1, title: "OpenAI 发布新一代智能体工具链，开发者如何快速上手？", source: "OpenAI Blog", tag: "AI 前沿", time: "今天 09:32", status: "待改写", excerpt: "从模型调用、工具编排到任务评估，一次看懂智能体应用的完整开发路径。", coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80" },
  { id: 2, title: "用 Docker Compose 搭建一套私人 AI 工作台", source: "Hacker News", tag: "服务器", time: "今天 08:16", status: "已改写", excerpt: "无需复杂运维，用一份配置文件快速运行本地知识库、模型服务与监控。", coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80" },
  { id: 3, title: "这 8 个开源项目，正在重新定义开发者效率", source: "GitHub Trending", tag: "开源项目", time: "昨天 21:05", status: "已发布", excerpt: "精选近期增长最快、真正值得收藏的开源工具，并附上实用场景分析。", coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80" },
  { id: 4, title: "从零理解 RAG：为什么你的 AI 问答总是答非所问", source: "掘金", tag: "编程学习", time: "昨天 18:40", status: "待审核", excerpt: "切分、召回、重排和评估，拆解检索增强生成中的关键工程细节。", coverImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80" },
  { id: 5, title: "极客玩家的终端工具箱：让命令行变得更好用", source: "少数派", tag: "极客工具", time: "08-04 14:22", status: "待改写", excerpt: "从终端复用到文件搜索，分享一组能立即提升工作流的轻量工具。", coverImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80" },
];

const nav = ["总览", "采集箱", "改写工作台", "发布素材", "来源管理"];
const tags = ["全部", "AI 前沿", "编程学习", "极客工具", "服务器", "开源项目"];
const models = [
  { id: "deepseek-v4-flash", name: "deepseek-v4-flash", note: "快速改写 · 低成本", tone: "flash" },
  { id: "deepseek-v4-pro", name: "deepseek-v4-pro", note: "深度改写 · 高质量", tone: "pro" },
  { id: "openai-compatible", name: "OpenAI 兼容接口", note: "自定义地址 · 待配置", tone: "custom" },
];
type SiteSettings = { brand: string; brandVisible: boolean; subtitle: string; subtitleVisible: boolean; eyebrow: string; eyebrowVisible: boolean; heroTitle: string; heroTitleVisible: boolean; heroDescription: string; heroDescriptionVisible: boolean };

function AdminHome() {
  const [activeNav, setActiveNav] = useState("总览");
  const [activeTag, setActiveTag] = useState("全部");
  const [items, setItems] = useState(seed);
  const [selected, setSelected] = useState<Item>(seed[0]);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [persistent, setPersistent] = useState(false);
  const [model, setModel] = useState("deepseek-v4-flash");
  const [editTitle, setEditTitle] = useState(seed[0].title);
  const [editContent, setEditContent] = useState(seed[0].excerpt);
  const [editImage, setEditImage] = useState(seed[0].coverImage ?? "");
  const [aiWritingEnabled, setAiWritingEnabled] = useState(true);
  const [articlePane, setArticlePane] = useState<"original" | "rewritten">("rewritten");
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [aiEndpoint, setAiEndpoint] = useState("https://api.deepseek.com");
  const [aiModelName, setAiModelName] = useState("deepseek-chat");
  const [aiKey, setAiKey] = useState("");
  const [aiConfigured, setAiConfigured] = useState(false);
  const [siteSettingsOpen, setSiteSettingsOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ brand: "极客采集台", brandVisible: true, subtitle: "AI 精选 · 每日更新", subtitleVisible: true, eyebrow: "AI & DEVELOPER DIGEST", eyebrowVisible: true, heroTitle: "今天值得读的技术内容", heroTitleVisible: true, heroDescription: "采集热点，AI 改写，人工审核后发布。", heroDescriptionVisible: true });
  useEffect(() => { fetch("/api/articles").then(r => r.json()).then((data: { items?: Item[]; persistent?: boolean }) => { if (data.persistent && data.items?.length) { setItems(data.items); setSelected(data.items[0]); } setPersistent(Boolean(data.persistent)); }).catch(() => undefined); fetch("/api/settings").then(r => r.json()).then(setSiteSettings).catch(() => undefined); }, []);
  const filtered = useMemo(() => items.filter(x => {
    const navMatch = activeNav === "采集箱" ? ["待改写", "待审核"].includes(x.status) : activeNav === "发布素材" ? x.status === "已发布" : true;
    return navMatch && (activeTag === "全部" || x.tag === activeTag) && `${x.title}${x.source}`.includes(query);
  }), [items, activeTag, query, activeNav]);
  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2400); };
  const collect = () => { flash("正在采集来源…"); fetch("/api/collect", { method: "POST" }).then(r => r.json()).then((data: { message?: string; error?: string }) => { flash(data.message ?? data.error ?? "采集完成"); if (!data.error) window.location.reload(); }).catch(() => flash("采集服务暂不可用")); };
  const choose = (item: Item) => { setSelected(item); setEditTitle(item.title); setEditContent(item.excerpt); setEditImage(item.coverImage ?? ""); };
  const saveEdit = () => { const next = { ...selected, title: editTitle, excerpt: editContent, coverImage: editImage, status: "待审核" }; setSelected(next); setItems(xs => xs.map(x => x.id === selected.id ? next : x)); fetch("/api/articles", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, title: editTitle, rewrittenContent: editContent, coverImage: editImage, status: "待审核" }) }).catch(() => undefined); flash("素材已保存，等待审核"); };
  const publish = () => { const next = { ...selected, title: editTitle, excerpt: editContent, coverImage: editImage, status: "已发布" }; setSelected(next); setItems(xs => xs.map(x => x.id === selected.id ? next : x)); fetch("/api/articles", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, title: editTitle, rewrittenContent: editContent, coverImage: editImage, status: "已发布", source: selected.source, tag: selected.tag, time: selected.time, originalContent: selected.originalContent || selected.excerpt }) }).then(r => r.ok ? flash("已发布到前台") : flash("发布保存失败")).catch(() => flash("发布保存失败")); };
  const rewrite = async () => { if (!aiWritingEnabled) { flash("AI 写作已暂停，请先打开开关"); return; } if (!aiKey) { flash("请先在 AI 接口配置中填写 API Key"); setAiSettingsOpen(true); return; } flash("正在请求 DeepSeek 重写标题和正文…"); try { const response = await fetch("/api/rewrite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: aiEndpoint, apiKey: aiKey, model: aiModelName || model, title: editTitle, content: selected.originalContent || editContent }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "AI 请求失败"); const rewritten = data.content as string; const rewrittenTitle = data.title as string; const next = { ...selected, title: rewrittenTitle, status: "已改写", rewrittenContent: rewritten, excerpt: rewritten }; setItems(xs => xs.map(x => x.id === selected.id ? next : x)); setSelected(next); setEditTitle(rewrittenTitle); setEditContent(rewritten); await fetch("/api/articles", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, title: rewrittenTitle, status: "已改写", rewrittenContent: rewritten }) }); setArticlePane("rewritten"); flash("DeepSeek 已生成原创标题和正文"); } catch (error) { flash(error instanceof Error ? error.message : "AI 请求失败"); } };
  const copy = async () => { const title = editTitle || selected.title; const content = editContent || selected.rewrittenContent || selected.excerpt; const html = `<article><h1>${title.replace(/[&<>]/g, x => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[x] ?? x))}</h1>${editImage ? `<p><img src="${editImage}" alt="${title}" style="max-width:100%;height:auto" /></p>` : ""}<div style="white-space:pre-wrap;line-height:1.8">${content.replace(/[&<>]/g, x => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[x] ?? x))}</div><p>来源：${selected.source}</p></article>`; const text = `${title}\n\n${content}\n\n来源：${selected.source}`; try { if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) })]); else await navigator.clipboard?.writeText(text); flash("已复制图文公众号素材"); } catch { await navigator.clipboard?.writeText(text); flash("已复制纯文本素材"); } };

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">⌁</span><span>极客采集台<small>CONTENT LAB</small></span></div>
      <div className="side-label">工作台</div>
      <nav>{nav.map((n, i) => <button key={n} onClick={() => setActiveNav(n)} className={activeNav === n ? "nav active" : "nav"}><span className="nav-icon">{["◈", "▣", "✦", "▤", "⊙"][i]}</span>{n}{i === 1 && <b>24</b>}</button>)}</nav>
      <div className="side-label source-label">采集来源 <button onClick={() => flash("来源管理即将开放")}>＋</button></div>
      <div className="sources"><span><i className="dot orange"/>AI / 科技</span><span><i className="dot blue"/>GitHub Trending</span><span><i className="dot purple"/>开发者社区</span></div>
      <div className="sidebar-bottom"><div className="server"><span className="pulse"/>采集服务运行中<small>下次采集：12 分钟后</small></div><div className="user"><span className="avatar">林</span><span>林默<small>管理员</small></span><span className="more">•••</span></div></div>
    </aside>
    <section className="content">
      <header className="topbar"><div className="crumb">内容工作台 <span>/</span> {activeNav}</div><div className="top-actions"><button className="user-mini" onClick={() => setSiteSettingsOpen(x => !x)}>站点设置 ⚙</button><a className="user-mini" href="/feed">查看前台 ↗</a><button className="icon-btn" onClick={() => flash("暂无新的系统通知")}>♧</button><button className="user-mini">林默 <span>⌄</span></button></div></header>
      <div className="page-head"><div><div className="eyebrow">WED · AUG 06, 2026</div><h1>早上好，林默 <span>✦</span></h1><p>采集完成后自动进入 AI 改写队列。{persistent && <span className="db-badge"> · 已连接数据库</span>}</p></div><div style={{display:"flex",gap:10,alignItems:"center"}}><button className="filter" onClick={() => setAiSettingsOpen(x => !x)}>⚙ AI 接口配置</button><button className={aiWritingEnabled ? "collect-btn" : "filter"} onClick={() => { setAiWritingEnabled(x => !x); flash(aiWritingEnabled ? "AI 写作已暂停" : "AI 写作已开启"); }}>● AI 写作：{aiWritingEnabled ? "开启" : "暂停"}</button><button className="collect-btn" onClick={collect}>↻ 立即采集</button></div></div>
      {siteSettingsOpen && <section style={{marginBottom:24,padding:20,borderRadius:18,background:"#fff",border:"1px solid #e7eaf0"}}><div className="section-title"><div><h2>前台内容设置</h2><span>修改文字并控制每个区域是否显示</span></div><button className="save-btn" onClick={() => fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(siteSettings) }).then(() => flash("前台设置已保存"))}>保存前台设置</button></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:14}}>{([ ["brand","品牌名称","brandVisible"],["subtitle","品牌副标题","subtitleVisible"],["eyebrow","顶部英文眉题","eyebrowVisible"],["heroTitle","主标题","heroTitleVisible"],["heroDescription","主标题说明","heroDescriptionVisible"] ] as const).map(([key,label,visible]) => <label key={key}>{label}<input value={siteSettings[key]} onChange={e => setSiteSettings(s => ({...s,[key]:e.target.value}))} /><span style={{display:"block",marginTop:7,fontSize:12}}><input type="checkbox" checked={siteSettings[visible]} onChange={e => setSiteSettings(s => ({...s,[visible]:e.target.checked}))} /> 显示此区域</span></label>)}</div></section>}
      {aiSettingsOpen && <section style={{marginBottom:24,padding:20,borderRadius:18,background:"#fff",border:"1px solid #e7eaf0"}}><div className="section-title"><div><h2>AI 接口配置</h2><span>配置仅保存在当前登录会话，不写入 GitHub</span></div><span className={`status ${aiConfigured || aiKey ? "done" : ""}`}>{aiConfigured || aiKey ? "已配置" : "未配置"}</span></div><div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1.4fr",gap:12,marginTop:14}}><label>接口地址<input value={aiEndpoint} onChange={e => setAiEndpoint(e.target.value)} placeholder="https://api.example.com/v1" /></label><label>模型名称<input value={aiModelName} onChange={e => setAiModelName(e.target.value)} /></label><label>API Key<input type="password" value={aiKey} onChange={e => setAiKey(e.target.value)} placeholder="粘贴接口密钥" /></label></div><div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:14}}><button className="filter" onClick={() => { setAiKey(""); setAiConfigured(false); flash("配置已清空"); }}>清空</button><button className="save-btn" onClick={() => { if (!aiKey) { flash("请先填写 API Key"); return; } setAiConfigured(true); flash("配置已保存，可点击 AI 重写"); }}>保存配置</button></div></section>}
      <div className="stats"><div><span>今日新增</span><strong>28</strong><em>+12.5%</em><small>较昨日</small></div><div><span>待处理</span><strong>16</strong><em className="neutral">—</em><small>篇待改写</small></div><div><span>本周发布</span><strong>42</strong><em>+8.2%</em><small>较上周</small></div><div><span>内容来源</span><strong>06</strong><em className="neutral">活跃</em><small>个来源</small></div></div>
      <div className="workspace"><div className="list-pane"><div className="section-title"><div><h2>内容流</h2><span>采集原文 → AI 改写 → 审核发布</span></div><button className="filter">筛选 <span>⌄</span></button></div><div className="toolbar"><div className="search">⌕<input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索标题或来源" /></div><div className="tags">{tags.map(t => <button key={t} className={activeTag === t ? "tag active" : "tag"} onClick={() => setActiveTag(t)}>{t}</button>)}</div></div><div className="items">{filtered.map(item => <button className={selected.id === item.id ? "item selected" : "item"} key={item.id} onClick={() => choose(item)}>{item.coverImage && <img className="item-image" src={item.coverImage} alt="" />}<div className="item-body"><div className="item-top"><span className="item-tag">{item.tag}</span><span className={`status ${item.status === "已发布" ? "published" : item.status === "已改写" ? "done" : ""}`}>{item.status}</span></div><h3>{item.title}</h3><p>{item.excerpt}</p><div className="item-meta"><span>{item.source}</span><span>·</span><span>{item.time}</span><span className="arrow">→</span></div></div></button>)}</div></div><article className="editor"><div className="editor-head"><div><span className="tiny-label">ORIGINAL / REWRITTEN</span><h2>文章处理台</h2></div><span className="status done">{selected.status}</span></div>{editImage && <img className="editor-image" src={editImage} alt="文章封面" />}<div className="source-card"><span className="item-tag">{selected.tag}</span><small>来源 · {selected.source}</small><h3>{selected.title}</h3></div><div className="model-picker"><div><span>改写模型</span><small>{aiWritingEnabled ? models.find(x => x.id === model)?.note : "已暂停自动写作"}</small></div><select disabled={!aiWritingEnabled} value={model} onChange={e => setModel(e.target.value)}>{models.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div><div className="article-tabs"><button className={articlePane === "original" ? "tag active" : "tag"} onClick={() => setArticlePane("original")}>原文章</button><button className={articlePane === "rewritten" ? "tag active" : "tag"} onClick={() => setArticlePane("rewritten")}>AI 重写内容</button></div><label>标题 <input value={editTitle} onChange={e => setEditTitle(e.target.value)} /></label><label>封面图地址 <input value={editImage} onChange={e => setEditImage(e.target.value)} placeholder="https://..." /></label><label>{articlePane === "original" ? "原文章内容" : "重写后内容"} <textarea value={articlePane === "original" ? (selected.excerpt || "暂无原文") : editContent} onChange={e => articlePane === "rewritten" && setEditContent(e.target.value)} readOnly={articlePane === "original"} /></label><div className="editor-foot"><button className="rewrite-btn" onClick={rewrite}>✦ AI 重新改写</button><button className="copy-btn" onClick={copy}>复制公众号素材　↗</button><button className="save-btn" onClick={saveEdit}>提交审核</button><button className="publish-btn" onClick={publish}>标记已发布</button></div></article></div>
      {notice && <div className="toast">✓　{notice}</div>}
    </section>
  </main>;
}

export default function Home() {
  if (typeof window !== "undefined" && window.location.pathname === "/admin") return <AdminHome />;
  return <Feed />;
}
