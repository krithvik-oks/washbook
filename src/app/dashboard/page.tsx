import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/session";

export default async function BookingsPage() {
  const { tenantId } = await requireTenantSession();

  const bookings = await prisma.booking.findMany({
    where: { tenantId },
    include: { service: true },
    orderBy: { startTime: "asc" },
  });

  const now = new Date();
  const upcoming = bookings.filter((b) => b.startTime >= now && b.status === "CONFIRMED");
  const past = bookings.filter((b) => b.startTime < now || b.status !== "CONFIRMED");

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-lg font-semibold">Upcoming bookings</h1>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No upcoming bookings yet.</p>
        ) : (
          <BookingTable bookings={upcoming} />
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Past &amp; other bookings</h2>
        {past.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Nothing here yet.</p>
        ) : (
          <BookingTable bookings={past} />
        )}
      </section>
    </div>
  );
}

function BookingTable({
  bookings,
}: {
  bookings: Array<{
    id: string;
    customerName: string;
    customerPhone: string;
    startTime: Date;
    endTime: Date;
    status: string;
    service: { name: string };
  }>;
}) {
  return (
    <div className="mt-3 overflow-x-auto rounded-md border border-neutral-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-500">
          <tr>
            <th className="px-4 py-2 font-medium">When</th>
            <th className="px-4 py-2 font-medium">Service</th>
            <th className="px-4 py-2 font-medium">Customer</th>
            <th className="px-4 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t border-neutral-100">
              <td className="px-4 py-2">
                {b.startTime.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </td>
              <td className="px-4 py-2">{b.service.name}</td>
              <td className="px-4 py-2">
                {b.customerName}
                <span className="block text-xs text-neutral-500">{b.customerPhone}</span>
              </td>
              <td className="px-4 py-2">{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
