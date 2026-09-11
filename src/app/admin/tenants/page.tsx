"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { SubscriptionStatusBadge } from "@/components/status-badge";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: string;
  capacity: number;
  createdAt: string;
  _count: { services: number; bookings: number; users: number };
}

const PAGE_SIZE = 10;

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (q) params.set("q", q);
    if (status) params.set("status", status);

    const res = await fetch(`/api/admin/tenants?${params}`);
    const data = await res.json();
    setTenants(data.tenants);
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

  function updateStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  async function remove(tenant: Tenant) {
    if (!confirm(`Delete "${tenant.name}" and all of its services, bookings, and users? This can't be undone.`)) {
      return;
    }
    const res = await fetch(`/api/admin/tenants/${tenant.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Couldn't delete that tenant.");
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="text-lg font-semibold">Tenants</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{total} businesses on the platform.</p>
      {error && <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => updateQ(e.target.value)}
          placeholder="Search by name or slug…"
          className="input flex-1 min-w-48"
        />
        <select value={status} onChange={(e) => updateStatus(e.target.value)} className="input">
          <option value="">All statuses</option>
          <option value="TRIALING">Trialing</option>
          <option value="ACTIVE">Active</option>
          <option value="PAST_DUE">Past due</option>
          <option value="CANCELED">Canceled</option>
        </select>
      </div>

      {!tenants ? (
        <p className="mt-4 text-sm text-[var(--muted)]">Loading…</p>
      ) : (
        <>
          <div className="table-shell mt-4">
            <table>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Bays</th>
                  <th>Services</th>
                  <th>Bookings</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-[var(--muted)]">
                      No tenants match your filters.
                    </td>
                  </tr>
                )}
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link href={`/admin/tenants/${t.id}`} className="font-medium text-[var(--primary)] underline">
                        {t.name}
                      </Link>
                      <span className="block text-xs text-[var(--muted)]">/{t.slug}</span>
                    </td>
                    <td>
                      <SubscriptionStatusBadge status={t.subscriptionStatus} />
                    </td>
                    <td>{t.capacity}</td>
                    <td>{t._count.services}</td>
                    <td>{t._count.bookings}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="text-right">
                      <button onClick={() => remove(t)} className="link-danger">
                        Delete
                      </button>
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
