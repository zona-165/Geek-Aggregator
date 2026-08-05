import { COOKIE_NAME } from "../../../../lib/auth";
export async function POST() { return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", "Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0` } }); }
