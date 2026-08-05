import { createHmac, timingSafeEqual } from "node:crypto";
export const COOKIE_NAME = "geek_admin_session";
const secret = () => process.env.ADMIN_SESSION_SECRET ?? "geek-content-lab-session-secret";
export function validCredentials(username: string, password: string) { return username === (process.env.ADMIN_USERNAME ?? "admin") && password === (process.env.ADMIN_PASSWORD ?? "change-me-now"); }
export function createSession() { const value = `admin:${Date.now()}`; return `${value}.${createHmac("sha256", secret()).update(value).digest("hex")}`; }
export function validSession(token?: string) { if (!token) return false; const i = token.lastIndexOf("."); if (i < 0) return false; const value = token.slice(0, i); const actual = Buffer.from(token.slice(i + 1)); const expected = Buffer.from(createHmac("sha256", secret()).update(value).digest("hex")); return actual.length === expected.length && timingSafeEqual(actual, expected) && value.startsWith("admin:") && Date.now() - Number(value.slice(6)) < 604800000; }
