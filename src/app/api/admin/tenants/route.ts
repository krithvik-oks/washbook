import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, UnauthorizedError } from "@/lib/session";

export async function GET() {
  try {
    await requireAdminSession();

    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { services: true, bookings: true, users: true } },
      },
    });

    return NextResponse.json(tenants);
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}
