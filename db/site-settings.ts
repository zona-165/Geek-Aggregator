import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
export type SiteSettings = { brand: string; brandVisible: boolean; subtitle: string; subtitleVisible: boolean; eyebrow: string; eyebrowVisible: boolean; heroTitle: string; heroTitleVisible: boolean; heroDescription: string; heroDescriptionVisible: boolean };
export const defaultSettings: SiteSettings = { brand: "极客采集台", brandVisible: true, subtitle: "AI 精选 · 每日更新", subtitleVisible: true, eyebrow: "AI & DEVELOPER DIGEST", eyebrowVisible: true, heroTitle: "今天值得读的技术内容", heroTitleVisible: true, heroDescription: "采集热点，AI 改写，人工审核后发布。", heroDescriptionVisible: true };
const file = path.join(process.cwd(), "data", "site-settings.json");
export async function getSettings() { try { return { ...defaultSettings, ...JSON.parse(await readFile(file, "utf8")) }; } catch { return defaultSettings; } }
export async function saveSettings(patch: Partial<SiteSettings>) { const next = { ...(await getSettings()), ...patch }; await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(next, null, 2)); return next; }
