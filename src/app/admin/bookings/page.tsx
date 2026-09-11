"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pagination } from "@/components/pagination";

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
const PAGE_SIZE = 20;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (q) params.set("q", q);
    if (status) params.set("status", status);

    const res = await fetch(`/api/admin/bookings?${params}`);
    const data = await res.json();
    setBookings(data.bookings);
    setTotal(data.total);
  }

  useEffect(() => {
    const timeout = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load() closes over q/status/page intentionally
  }, [q, status, page]);

  function updateQ(value: string) {
    setQ(value);
    setPage(1);
  }

  function updateStatusFilter(value: string) {
    setStatus(value);
    setPage(1);
  }

  async function updateBookingStatus(id: string, newStatus: string) {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-lg font-semibold">All bookings</h1>
      <p className="mt-1 text-sm text-neutral-500">{total} bookings across every tenant.</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => updateQ(e.target.value)}
          placeholder="Search by customer name or phone…"
          className="input flex-1 min-w-48"
        />
        <select value={status} onChange={(e) => updateStatusFilter(e.target.value)} className="input">
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {!bookings ? (
        <p className="mt-4 text-sm text-neutral-500">Loading…</p>
      ) : (
        <>
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
                      No bookings match your filters.
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
                      <select className="input" value={b.status} onChange={(e) => updateBookingStatus(b.id, e.target.value)}>
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
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
