"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  status: string;
  service: { name: string };
  tenant: { id: string; name: string; slug: string };
}

const BOOKING_STATUSES = ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  async function load() {
    const res = await fetch("/api/admin/bookings");
    setBookings(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (!bookings) return <p className="text-sm text-neutral-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold">All bookings</h1>
      <p className="mt-1 text-sm text-neutral-500">Most recent {bookings.length} bookings across every tenant.</p>

      <div className="mt-4 overflow-x-auto rounded-md border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">When</th>
              <th className="px-4 py-2 font-medium">Business</th>
              <th className="px-4 py-2 font-medium">Service</th>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-neutral-500">
                  No bookings on the platform yet.
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-neutral-100">
                <td className="px-4 py-2">
                  {new Date(b.startTime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td className="px-4 py-2">
                  <Link href={`/admin/tenants/${b.tenant.id}`} className="underline">
                    {b.tenant.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{b.service.name}</td>
                <td className="px-4 py-2">
                  {b.customerName}
                  <span className="block text-xs text-neutral-500">{b.customerPhone}</span>
                </td>
                <td className="px-4 py-2">
                  <select className="input" value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}>
                    {BOOKING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
