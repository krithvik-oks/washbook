import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenantSession, UnauthorizedError } from "@/lib/session";

const dayRuleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  closed: z.boolean(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const hoursSchema = z.object({ rules: z.array(dayRuleSchema).length(7) });

export async function GET() {
  try {
    const { tenantId } = await requireTenantSession();
    const rules = await prisma.availabilityRule.findMany({ where: { tenantId } });

    const byDay = new Map(rules.map((r) => [r.dayOfWeek, r]));
    const week = Array.from({ length: 7 }, (_, dayOfWeek) => {
      const rule = byDay.get(dayOfWeek);
      return {
        dayOfWeek,
        closed: !rule,
        openTime: rule?.openTime ?? "09:00",
        closeTime: rule?.closeTime ?? "17:00",
      };
    });

    return NextResponse.json(week);
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}

export async function PUT(req: Request) {
  try {
    const { tenantId } = await requireTenantSession();
    const body = await req.json();
    const parsed = hoursSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await prisma.$transaction(
      parsed.data.rules.map((rule) =>
        rule.closed
          ? prisma.availabilityRule.deleteMany({ where: { tenantId, dayOfWeek: rule.dayOfWeek } })
          : prisma.availabilityRule.upsert({
              where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: rule.dayOfWeek } },
              create: { tenantId, dayOfWeek: rule.dayOfWeek, openTime: rule.openTime, closeTime: rule.closeTime },
              update: { openTime: rule.openTime, closeTime: rule.closeTime },
            })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw err;
  }
}
