"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { TimezoneSelect } from "@/components/timezone-select";

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  capacity: number;
  timezone: string;
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

  if (!tenant) return <p className="text-sm text-[var(--muted)]">Loading…</p>;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/admin/tenants" className="text-sm text-[var(--muted)] underline">
          ← All tenants
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold">{tenant.name}</h1>
          <Link href={`/${tenant.slug}`} target="_blank" className="text-sm text-[var(--primary)] underline">
            View public page →
          </Link>
        </div>
      </div>

      <section className="card max-w-lg p-6">
        <h2 className="font-semibold">Business details</h2>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
            Name
            <input
              className="input"
              value={tenant.name}
              onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
              onBlur={() => saveTenant({ name: tenant.name })}
            />
          </label>
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
              Phone
              <input
                className="input"
                value={tenant.phone ?? ""}
                onChange={(e) => setTenant({ ...tenant, phone: e.target.value })}
                onBlur={() => saveTenant({ phone: tenant.phone })}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
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
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
            Address
            <input
              className="input"
              value={tenant.address ?? ""}
              onChange={(e) => setTenant({ ...tenant, address: e.target.value })}
              onBlur={() => saveTenant({ address: tenant.address })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
            Timezone
            <TimezoneSelect
              value={tenant.timezone}
              onChange={(timezone) => {
                setTenant({ ...tenant, timezone });
                saveTenant({ timezone });
              }}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
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
          {saving && <p className="text-xs text-[var(--muted)]">Saving…</p>}
          {saved && !saving && <p className="text-xs text-emerald-600">Saved.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-semibold">Users</h2>
        <div className="table-shell mt-3">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {tenant.users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-semibold">Services</h2>
        <div className="table-shell mt-3">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tenant.services.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-[var(--muted)]">
                    No services yet.
                  </td>
                </tr>
              )}
              {tenant.services.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.durationMinutes} min</td>
                  <td>${s.price}</td>
                  <td>
                    <span
                      className={`badge ${
                        s.active
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-right">
                    <button onClick={() => toggleService(s.id, s.active)} className="link-muted mr-3">
                      {s.active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => deleteService(s.id)} className="link-danger">
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
        <div className="table-shell mt-3">
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
              {tenant.bookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-[var(--muted)]">
                    No bookings yet.
                  </td>
                </tr>
              )}
              {tenant.bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    {new Date(b.startTime).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: tenant.timezone,
                    })}
                  </td>
                  <td>{b.service.name}</td>
                  <td>
                    {b.customerName}
                    <span className="block text-xs text-[var(--muted)]">{b.customerPhone}</span>
                  </td>
                  <td>
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
