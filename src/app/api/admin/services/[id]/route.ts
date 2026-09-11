import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, UnauthorizedError } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await req.json();

    const service = await prisma.service.update({
      where: { id },
      data: { active: typeof body.active === "boolean" ? body.active : undefined },
    });
    return NextResponse.json(service);
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;

    try {
      await prisma.service.delete({ where: { id } });
    } catch {
      return NextResponse.json(
        { error: "Can't delete a service that has bookings. Deactivate it instead." },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}
