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
          <p className="mt-2 text-sm text-neutral-500">Loading…</p>
        ) : services.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No services yet — add your first one below.</p>
        ) : (
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="input mt-3 max-w-xs"
            />
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
                  {filteredServices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-neutral-500">
                        No services match &quot;{search}&quot;.
                      </td>
                    </tr>
                  )}
                  {filteredServices.map((s) => (
                  <tr key={s.id} className="border-t border-neutral-100">
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{s.durationMinutes} min</td>
                    <td className="px-4 py-2">${s.price}</td>
                    <td className="px-4 py-2">{s.active ? "Active" : "Inactive"}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => toggleActive(s)} className="mr-3 text-neutral-600 underline">
                        {s.active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => remove(s)} className="text-red-600 underline">
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
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Name
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Basic wash" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
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
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Add service"}
          </button>
        </form>
      </section>
    </div>
  );
}
