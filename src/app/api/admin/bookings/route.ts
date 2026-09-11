import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, UnauthorizedError } from "@/lib/session";

export async function GET(req: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") ?? undefined;

    const bookings = await prisma.booking.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { startTime: "desc" },
      take: 200,
      include: {
        service: { select: { name: true } },
        tenant: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}
