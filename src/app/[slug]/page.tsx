import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingWidget } from "./booking-widget";

export default async function TenantBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { services: { where: { active: true }, orderBy: { createdAt: "asc" } } },
  });

  if (!tenant) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">{tenant.name}</h1>
      {tenant.address && <p className="mt-1 text-sm text-neutral-500">{tenant.address}</p>}
      {tenant.phone && <p className="text-sm text-neutral-500">{tenant.phone}</p>}

      {tenant.services.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">
          This business hasn&apos;t added any services yet.
        </p>
      ) : (
        <div className="mt-8">
          <BookingWidget
            slug={tenant.slug}
            services={tenant.services.map((s) => ({
              id: s.id,
              name: s.name,
              durationMinutes: s.durationMinutes,
              price: s.price.toString(),
            }))}
          />
        </div>
      )}
    </main>
  );
}
