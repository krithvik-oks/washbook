"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: string;
  capacity: number;
  createdAt: string;
  _count: { services: number; bookings: number; users: number };
}

const STATUS_STYLES: Record<string, string> = {
  TRIALING: "bg-blue-100 text-blue-800",
  ACTIVE: "bg-green-100 text-green-800",
  PAST_DUE: "bg-amber-100 text-amber-800",
  CANCELED: "bg-neutral-200 text-neutral-700",
};

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/tenants");
    setTenants(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, []);

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

  if (!tenants) return <p className="text-sm text-neutral-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold">Tenants</h1>
      <p className="mt-1 text-sm text-neutral-500">{tenants.length} businesses on the platform.</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-md border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Business</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Bays</th>
              <th className="px-4 py-2 font-medium">Services</th>
              <th className="px-4 py-2 font-medium">Bookings</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-t border-neutral-100">
                <td className="px-4 py-2">
                  <Link href={`/admin/tenants/${t.id}`} className="font-medium underline">
                    {t.name}
                  </Link>
                  <span className="block text-xs text-neutral-500">/{t.slug}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[t.subscriptionStatus]}`}>
                    {t.subscriptionStatus}
                  </span>
                </td>
                <td className="px-4 py-2">{t.capacity}</td>
                <td className="px-4 py-2">{t._count.services}</td>
                <td className="px-4 py-2">{t._count.bookings}</td>
                <td className="px-4 py-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => remove(t)} className="text-red-600 underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
