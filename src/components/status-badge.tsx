const BOOKING_STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  COMPLETED: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  CANCELLED: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  NO_SHOW: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const SUBSCRIPTION_STATUS_STYLES: Record<string, string> = {
  TRIALING: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  PAST_DUE: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  CANCELED: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

export function BookingStatusBadge({ status }: { status: string }) {
  return <span className={`badge ${BOOKING_STATUS_STYLES[status] ?? ""}`}>{status}</span>;
}

export function SubscriptionStatusBadge({ status }: { status: string }) {
  return <span className={`badge ${SUBSCRIPTION_STATUS_STYLES[status] ?? ""}`}>{status}</span>;
}
