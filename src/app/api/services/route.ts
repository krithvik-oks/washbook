import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenantSession, UnauthorizedError } from "@/lib/session";

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  price: z.coerce.number().min(0),
});

export async function GET() {
  try {
    const { tenantId } = await requireTenantSession();
    const services = await prisma.service.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(services);
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const { tenantId } = await requireTenantSession();
    const body = await req.json();
    const parsed = serviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: { ...parsed.data, tenantId },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}
