import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredArticle = { id: number; title: string; source: string; tag: string; time: string; status: string; excerpt: string; originalContent?: string; rewrittenContent?: string; coverImage?: string; sourceUrl?: string };
const file = path.join(process.cwd(), "data", "articles.json");
async function load(): Promise<StoredArticle[]> { try { return JSON.parse(await readFile(file, "utf8")); } catch { return []; } }
async function save(items: StoredArticle[]) { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(items, null, 2)); }
export async function listArticles() { return load(); }
export async function addArticle(item: Omit<StoredArticle, "id">) { const items = await load(); const next = { ...item, id: items.reduce((max, x) => Math.max(max, x.id), 0) + 1 }; items.unshift(next); await save(items); return next; }
export async function updateArticle(id: number, patch: Partial<StoredArticle>) { const items = await load(); const index = items.findIndex(x => x.id === id); if (index < 0) return undefined; items[index] = { ...items[index], ...patch }; await save(items); return items[index]; }
