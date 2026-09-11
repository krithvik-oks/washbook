import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireTenantSession, UnauthorizedError } from "@/lib/session";

const VALID_STATUSES = ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];

export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantSession();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status");
    const when = searchParams.get("when") ?? "upcoming";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 10));

    const now = new Date();
    const where: Prisma.BookingWhereInput = {
      tenantId,
      ...(when === "upcoming" ? { startTime: { gte: now } } : {}),
      ...(when === "past" ? { startTime: { lt: now } } : {}),
      ...(status && VALID_STATUSES.includes(status)
        ? { status: status as Prisma.EnumBookingStatusFilter["equals"] }
        : {}),
      ...(q
        ? {
            OR: [
              { customerName: { contains: q, mode: "insensitive" } },
              { customerPhone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { startTime: when === "past" ? "desc" : "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { service: { select: { name: true } } },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({ bookings, total, page, pageSize });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}
