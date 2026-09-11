import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasCapacity } from "@/lib/availability";

const bookSchema = z.object({
  serviceId: z.string(),
  startTime: z.string(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json();
  const parsed = bookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { serviceId, customerName, customerPhone, customerEmail } = parsed.data;

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const service = await prisma.service.findFirst({
    where: { id: serviceId, tenantId: tenant.id, active: true },
  });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const startTime = new Date(parsed.data.startTime);
  if (Number.isNaN(startTime.getTime()) || startTime < new Date()) {
    return NextResponse.json({ error: "Invalid or past time slot" }, { status: 400 });
  }
  const endTime = new Date(startTime.getTime() + service.durationMinutes * 60_000);

  const available = await hasCapacity(tenant.id, startTime, endTime);
  if (!available) {
    return NextResponse.json(
      { error: "That time slot was just taken. Please pick another." },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      tenantId: tenant.id,
      serviceId: service.id,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      startTime,
      endTime,
    },
  });

  return NextResponse.json({ id: booking.id, startTime: booking.startTime });
}
