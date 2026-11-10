import { NextRequest, NextResponse } from "next/server";
import { commandSchema } from "@/lib/types";
import { session, update } from "@/lib/store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const id = request.cookies.get("reelsmap-demo")?.value ?? crypto.randomUUID();
  const state = session(id);
  const resource = path[0];
  const data = resource === "state" ? state : resource === "posts" ? state.posts : resource === "places" ? state.places : resource === "lists" ? state.lists : resource === "changes" ? state.changes : resource === "settings" ? state.settings : undefined;
  if (!data) return NextResponse.json({ error: "없는 API입니다." }, { status: 404 });
  const response = NextResponse.json(data);
  response.cookies.set("reelsmap-demo", id, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}

export async function POST(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const input: unknown = await request.json().catch(() => null);
  const parsed = commandSchema.safeParse(input);
  if (!parsed.success || path[0] !== parsed.data.action) return NextResponse.json({ error: "요청 내용을 확인해 주세요." }, { status: 400 });
  const id = request.cookies.get("reelsmap-demo")?.value;
  if (!id) return NextResponse.json({ error: "예시 세션을 먼저 열어 주세요." }, { status: 400 });
  return NextResponse.json(update(session(id), parsed.data));
}
