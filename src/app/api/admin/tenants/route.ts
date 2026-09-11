import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, UnauthorizedError } from "@/lib/session";

const VALID_STATUSES = ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED"];

export async function GET(req: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 10));

    const where: Prisma.TenantWhereInput = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status && VALID_STATUSES.includes(status)
        ? { subscriptionStatus: status as Prisma.EnumSubscriptionStatusFilter["equals"] }
        : {}),
    };

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { services: true, bookings: true, users: true } },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({ tenants, total, page, pageSize });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}
