import { prisma } from "@/lib/prisma";

export default async function AdminReportsPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalTenants,
    newTenants30d,
    tenantsByStatus,
    totalBookings,
    bookings30d,
    bookingsByStatus,
    totalServices,
    activeServices,
    topTenantsRaw,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.tenant.groupBy({ by: ["subscriptionStatus"], _count: true }),
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
    prisma.service.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.booking.groupBy({
      by: ["tenantId"],
      _count: true,
      orderBy: { _count: { tenantId: "desc" } },
      take: 5,
    }),
  ]);

  const topTenants = await Promise.all(
    topTenantsRaw.map(async (row) => ({
      count: row._count,
      tenant: await prisma.tenant.findUnique({ where: { id: row.tenantId }, select: { name: true, slug: true } }),
    }))
  );

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-lg font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-neutral-500">A quick snapshot of platform activity.</p>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total tenants" value={totalTenants} sub={`+${newTenants30d} last 30 days`} />
        <StatCard label="Total bookings" value={totalBookings} sub={`+${bookings30d} last 30 days`} />
        <StatCard label="Services" value={totalServices} sub={`${activeServices} active`} />
        <StatCard
          label="Active subscriptions"
          value={tenantsByStatus.find((s) => s.subscriptionStatus === "ACTIVE")?._count ?? 0}
          sub={`of ${totalTenants} tenants`}
        />
      </section>

      <section>
        <h2 className="font-semibold">Tenants by subscription status</h2>
        <BreakdownTable rows={tenantsByStatus.map((s) => ({ label: s.subscriptionStatus, count: s._count }))} />
      </section>

      <section>
        <h2 className="font-semibold">Bookings by status</h2>
        <BreakdownTable rows={bookingsByStatus.map((s) => ({ label: s.status, count: s._count }))} />
      </section>

      <section>
        <h2 className="font-semibold">Busiest tenants</h2>
        {topTenants.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No bookings yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-md border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Business</th>
                  <th className="px-4 py-2 font-medium">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {topTenants.map((row, i) => (
                  <tr key={row.tenant?.slug ?? i} className="border-t border-neutral-100">
                    <td className="px-4 py-2">{row.tenant?.name ?? "(deleted tenant)"}</td>
                    <td className="px-4 py-2">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-md border border-neutral-200 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-neutral-400">{sub}</p>
    </div>
  );
}

function BreakdownTable({ rows }: { rows: { label: string; count: number }[] }) {
  if (rows.length === 0) return <p className="mt-2 text-sm text-neutral-500">No data yet.</p>;
  return (
    <div className="mt-3 overflow-x-auto rounded-md border border-neutral-200">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-neutral-100 first:border-t-0">
              <td className="px-4 py-2">{r.label}</td>
              <td className="px-4 py-2 text-right">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
