import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, UnauthorizedError } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        services: { orderBy: { createdAt: "asc" } },
        bookings: {
          orderBy: { startTime: "desc" },
          take: 50,
          include: { service: { select: { name: true } } },
        },
      },
    });

    if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(tenant);
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  capacity: z.coerce.number().int().min(1).max(50).optional(),
  subscriptionStatus: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const tenant = await prisma.tenant.update({ where: { id }, data: parsed.data });
    return NextResponse.json(tenant);
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;

    await prisma.tenant.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}
