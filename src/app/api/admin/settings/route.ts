import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppSettings, updateAppName } from "@/lib/settings";
import { requireAdminSession, UnauthorizedError } from "@/lib/session";

export async function GET() {
  try {
    await requireAdminSession();
    const settings = await getAppSettings();
    return NextResponse.json(settings);
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}

const updateSchema = z.object({ appName: z.string().trim().min(1).max(60) });

export async function PATCH(req: Request) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const settings = await updateAppName(parsed.data.appName);
    return NextResponse.json(settings);
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}
