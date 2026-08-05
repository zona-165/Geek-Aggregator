import { getSettings, saveSettings } from "../../../db/site-settings";
export async function GET() { return Response.json(await getSettings()); }
export async function PATCH(request: Request) { const body = await request.json(); return Response.json(await saveSettings(body)); }
