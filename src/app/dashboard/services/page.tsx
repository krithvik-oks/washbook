"use client";

import { useEffect, useState } from "react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string;
  active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  async function load() {
    setLoading(true);
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, durationMinutes, price }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.formErrors?.[0] ?? "Couldn't add that service.");
      return;
    }

    setName("");
    setDurationMinutes(30);
    setPrice("");
    load();
  }

  async function toggleActive(service: Service) {
    await fetch(`/api/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !service.active }),
    });
    load();
  }

  async function remove(service: Service) {
    const res = await fetch(`/api/services/${service.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't delete that service.");
      return;
    }
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-lg font-semibold">Services</h1>
        {loading ? (
          <p className="mt-2 text-sm text-[var(--muted)]">Loading…</p>
        ) : services.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No services yet — add your first one below.</p>
        ) : (
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="input mt-3 max-w-xs"
            />
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
                  {filteredServices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-[var(--muted)]">
                        No services match &quot;{search}&quot;.
                      </td>
                    </tr>
                  )}
                  {filteredServices.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.durationMinutes} min</td>
                      <td>${s.price}</td>
                      <td>
                        <span className={`badge ${s.active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"}`}>
                          {s.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-right">
                        <button onClick={() => toggleActive(s)} className="link-muted mr-3">
                          {s.active ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => remove(s)} className="link-danger">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="max-w-sm">
        <h2 className="text-lg font-semibold">Add a service</h2>
        <form onSubmit={handleCreate} className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
            Name
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Basic wash" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
            Duration (minutes)
            <input
              required
              type="number"
              min={5}
              max={480}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
            Price ($)
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
            />
          </label>

          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

          <button type="submit" disabled={submitting} className="btn btn-primary mt-1">
            {submitting ? "Adding…" : "Add service"}
          </button>
        </form>
      </section>
    </div>
  );
}
