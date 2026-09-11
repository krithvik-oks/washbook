"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  capacity: number;
  subscriptionStatus: string;
  users: { id: string; name: string; email: string; role: string }[];
  services: { id: string; name: string; durationMinutes: number; price: string; active: boolean }[];
  bookings: {
    id: string;
    customerName: string;
    customerPhone: string;
    startTime: string;
    status: string;
    service: { name: string };
  }[];
}

const BOOKING_STATUSES = ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];
const SUBSCRIPTION_STATUSES = ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED"];

export default function AdminTenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/tenants/${id}`);
    setTenant(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally re-fetch only when id changes
  }, [id]);

  async function saveTenant(patch: Partial<TenantDetail>) {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/admin/tenants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      load();
    }
  }

  async function toggleService(serviceId: string, active: boolean) {
    await fetch(`/api/admin/services/${serviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  async function deleteService(serviceId: string) {
    const res = await fetch(`/api/admin/services/${serviceId}`, { method: "DELETE" });
    if (res.ok) load();
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (!tenant) return <p className="text-sm text-neutral-500">Loading…</p>;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/admin/tenants" className="text-sm text-neutral-500 underline">
          ← All tenants
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold">{tenant.name}</h1>
          <Link href={`/${tenant.slug}`} target="_blank" className="text-sm underline">
            View public page →
          </Link>
        </div>
      </div>

      <section className="max-w-lg">
        <h2 className="font-semibold">Business details</h2>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Name
            <input
              className="input"
              value={tenant.name}
              onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
              onBlur={() => saveTenant({ name: tenant.name })}
            />
          </label>
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-neutral-700">
              Phone
              <input
                className="input"
                value={tenant.phone ?? ""}
                onChange={(e) => setTenant({ ...tenant, phone: e.target.value })}
                onBlur={() => saveTenant({ phone: tenant.phone })}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-neutral-700">
              Bays / capacity
              <input
                type="number"
                min={1}
                max={50}
                className="input"
                value={tenant.capacity}
                onChange={(e) => setTenant({ ...tenant, capacity: Number(e.target.value) })}
                onBlur={() => saveTenant({ capacity: tenant.capacity })}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Address
            <input
              className="input"
              value={tenant.address ?? ""}
              onChange={(e) => setTenant({ ...tenant, address: e.target.value })}
              onBlur={() => saveTenant({ address: tenant.address })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Subscription status
            <select
              className="input"
              value={tenant.subscriptionStatus}
              onChange={(e) => saveTenant({ subscriptionStatus: e.target.value })}
            >
              {SUBSCRIPTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {saving && <p className="text-xs text-neutral-500">Saving…</p>}
          {saved && !saving && <p className="text-xs text-green-700">Saved.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-semibold">Users</h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {tenant.users.map((u) => (
                <tr key={u.id} className="border-t border-neutral-100">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-semibold">Services</h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Duration</th>
                <th className="px-4 py-2 font-medium">Price</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {tenant.services.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-neutral-500">
                    No services yet.
                  </td>
                </tr>
              )}
              {tenant.services.map((s) => (
                <tr key={s.id} className="border-t border-neutral-100">
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.durationMinutes} min</td>
                  <td className="px-4 py-2">${s.price}</td>
                  <td className="px-4 py-2">{s.active ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => toggleService(s.id, s.active)} className="mr-3 text-neutral-600 underline">
                      {s.active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => deleteService(s.id)} className="text-red-600 underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-semibold">Recent bookings</h2>
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
              {tenant.bookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-neutral-500">
                    No bookings yet.
                  </td>
                </tr>
              )}
              {tenant.bookings.map((b) => (
                <tr key={b.id} className="border-t border-neutral-100">
                  <td className="px-4 py-2">
                    {new Date(b.startTime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-2">{b.service.name}</td>
                  <td className="px-4 py-2">
                    {b.customerName}
                    <span className="block text-xs text-neutral-500">{b.customerPhone}</span>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className="input"
                      value={b.status}
                      onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                    >
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
      </section>
    </div>
  );
}
