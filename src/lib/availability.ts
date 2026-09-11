import { prisma } from "@/lib/prisma";
import { zonedTimeToUtc, dayOfWeekForDateStr, addDaysToDateStr } from "@/lib/timezone";

const SLOT_GRANULARITY_MINUTES = 30;

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeStr(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface SlotCandidate {
  startTime: Date;
  endTime: Date;
}

/**
 * Returns bookable start times for a tenant/service on a given calendar day
 * (as experienced in the tenant's own timezone — not the server's), respecting
 * operating hours and bay capacity.
 */
export async function getAvailableSlots(
  tenantId: string,
  serviceId: string,
  dateStr: string
): Promise<SlotCandidate[]> {
  const [tenant, service, rule] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.service.findFirst({ where: { id: serviceId, tenantId, active: true } }),
    prisma.availabilityRule.findFirst({
      where: { tenantId, dayOfWeek: dayOfWeekForDateStr(dateStr) },
    }),
  ]);

  if (!tenant || !service || !rule) return [];

  const timeZone = tenant.timezone;
  const dayStart = zonedTimeToUtc(dateStr, "00:00:00", timeZone);
  const dayEnd = zonedTimeToUtc(addDaysToDateStr(dateStr, 1), "00:00:00", timeZone);

  const existingBookings = await prisma.booking.findMany({
    where: {
      tenantId,
      status: "CONFIRMED",
      startTime: { lt: dayEnd },
      endTime: { gt: dayStart },
    },
    select: { startTime: true, endTime: true },
  });

  const openMinutes = parseTimeToMinutes(rule.openTime);
  const closeMinutes = parseTimeToMinutes(rule.closeTime);
  const duration = service.durationMinutes;

  const slots: SlotCandidate[] = [];
  const now = new Date();

  for (
    let start = openMinutes;
    start + duration <= closeMinutes;
    start += SLOT_GRANULARITY_MINUTES
  ) {
    const startTime = zonedTimeToUtc(dateStr, minutesToTimeStr(start), timeZone);
    const endTime = zonedTimeToUtc(dateStr, minutesToTimeStr(start + duration), timeZone);

    if (startTime < now) continue;

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
