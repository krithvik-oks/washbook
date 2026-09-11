"use client";

import { useEffect, useState } from "react";
import { Pagination } from "@/components/pagination";
import { BookingStatusBadge } from "@/components/status-badge";

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  status: string;
  service: { name: string };
}

const BOOKING_STATUSES = ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];
const PAGE_SIZE = 10;

export default function DashboardBookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [total, setTotal] = useState(0);
  const [timezone, setTimezone] = useState<string>();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [when, setWhen] = useState("upcoming");
  const [page, setPage] = useState(1);

  async function load() {
    const params = new URLSearchParams({ when, page: String(page), pageSize: String(PAGE_SIZE) });
    if (q) params.set("q", q);
    if (status) params.set("status", status);

    const res = await fetch(`/api/bookings?${params}`);
    const data = await res.json();
    setBookings(data.bookings);
    setTotal(data.total);
    setTimezone(data.timezone);
  }

  useEffect(() => {
    const timeout = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load() closes over q/status/when/page intentionally
  }, [q, status, when, page]);

  function updateQ(value: string) {
    setQ(value);
    setPage(1);
  }

  function updateStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function updateWhen(value: string) {
    setWhen(value);
    setPage(1);
  }

  return (
    <div>
      <h1 className="text-lg font-semibold">Bookings</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{total} bookings match your filters.</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => updateQ(e.target.value)}
          placeholder="Search by customer name or phone…"
          className="input flex-1 min-w-48"
        />
        <select value={when} onChange={(e) => updateWhen(e.target.value)} className="input">
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="all">All</option>
        </select>
        <select value={status} onChange={(e) => updateStatus(e.target.value)} className="input">
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {!bookings ? (
        <p className="mt-4 text-sm text-[var(--muted)]">Loading…</p>
      ) : (
        <>
          <div className="table-shell mt-4">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-[var(--muted)]">
                      No bookings match your filters.
                    </td>
                  </tr>
                )}
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      {new Date(b.startTime).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: timezone,
                      })}
                    </td>
                    <td>{b.service.name}</td>
                    <td>
                      {b.customerName}
                      <span className="block text-xs text-[var(--muted)]">{b.customerPhone}</span>
                    </td>
                    <td>
                      <BookingStatusBadge status={b.status} />
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
