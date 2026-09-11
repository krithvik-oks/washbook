/**
 * Converts a wall-clock date+time as experienced in a given IANA timezone
 * into the correct UTC Date instant. This is what makes "9:00 AM" mean
 * 9:00 AM at the business's location regardless of what timezone the
 * server process itself happens to be running in.
 */
export function zonedTimeToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute, second = 0] = timeStr.split(":").map(Number);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(utcGuess)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  const asIfLocal = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  const offsetMs = asIfLocal - utcGuess.getTime();
  return new Date(utcGuess.getTime() - offsetMs);
}

/** Day of week (0=Sunday..6=Saturday) for a plain calendar date string — timezone-independent. */
export function dayOfWeekForDateStr(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Adds/subtracts whole days from a "YYYY-MM-DD" string, returning a new "YYYY-MM-DD" string. */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Formats a UTC Date instant as wall-clock time/date in the given IANA timezone. */
export function formatInTimezone(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone }).format(date);
}

/** Checks whether a string is a timezone identifier the runtime actually recognizes. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}
