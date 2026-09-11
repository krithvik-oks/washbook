import { prisma } from "@/lib/prisma";

const SLOT_GRANULARITY_MINUTES = 30;

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function dateAtMinutes(day: Date, minutes: number): Date {
  const d = new Date(day);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutes);
  return d;
}

export interface SlotCandidate {
  startTime: Date;
  endTime: Date;
}

/**
 * Returns bookable start times for a tenant/service on a given calendar day,
 * respecting operating hours and bay capacity.
 */
export async function getAvailableSlots(
  tenantId: string,
  serviceId: string,
  day: Date
): Promise<SlotCandidate[]> {
  const [tenant, service, rule] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.service.findFirst({ where: { id: serviceId, tenantId, active: true } }),
    prisma.availabilityRule.findFirst({
      where: { tenantId, dayOfWeek: day.getDay() },
    }),
  ]);

  if (!tenant || !service || !rule) return [];

  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  const existingBookings = await prisma.booking.findMany({
    where: {
      tenantId,
      status: "CONFIRMED",
      startTime: { lte: dayEnd },
      endTime: { gte: dayStart },
    },
    select: { startTime: true, endTime: true },
  });

  const openMinutes = parseTimeToMinutes(rule.openTime);
  const closeMinutes = parseTimeToMinutes(rule.closeTime);
  const duration = service.durationMinutes;

  const slots: SlotCandidate[] = [];

  for (
    let start = openMinutes;
    start + duration <= closeMinutes;
    start += SLOT_GRANULARITY_MINUTES
  ) {
    const startTime = dateAtMinutes(day, start);
    const endTime = dateAtMinutes(day, start + duration);

    if (startTime < new Date()) continue;

    const overlapping = existingBookings.filter(
      (b) => b.startTime < endTime && b.endTime > startTime
    ).length;

    if (overlapping < tenant.capacity) {
      slots.push({ startTime, endTime });
    }
  }

  return slots;
}

/**
 * Re-checks that a specific start/end window still has capacity, to prevent
 * double-booking race conditions between slot listing and booking creation.
 */
export async function hasCapacity(
  tenantId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return false;

  const overlapping = await prisma.booking.count({
    where: {
      tenantId,
      status: "CONFIRMED",
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  return overlapping < tenant.capacity;
}
