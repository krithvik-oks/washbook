"use client";

import { useEffect, useState } from "react";

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: string;
}

interface Slot {
  startTime: string;
}

function todayISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function BookingWidget({ slug, services }: { slug: string; services: Service[] }) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId || !date) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting selection state to sync with the new service/date before fetching
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(`/api/public/${slug}/slots?serviceId=${serviceId}&date=${date}`)
      .then((r) => r.json())
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [slug, serviceId, date]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setError(null);
    setSubmitting(true);

    const res = await fetch(`/api/public/${slug}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        startTime: selectedSlot,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Couldn't book that slot.");
      return;
    }

    const data = await res.json();
    setConfirmed(data.startTime);
  }

  if (confirmed) {
    return (
      <div className="card border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-900/20">
        <h2 className="font-semibold text-emerald-900 dark:text-emerald-300">Booking confirmed!</h2>
        <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-400">
          {new Date(confirmed).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
        </p>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-400">See you then, {name}.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
          Service
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="input">
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.durationMinutes} min — ${s.price}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
          Date
          <input
            type="date"
            min={todayISO()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">Available times</p>
        {loadingSlots ? (
          <p className="mt-2 text-sm text-[var(--muted)]">Loading…</p>
        ) : !slots || slots.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No open times that day. Try another date.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot.startTime}
                onClick={() => setSelectedSlot(slot.startTime)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  selectedSlot === slot.startTime
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] hover:border-[var(--primary)]"
                }`}
              >
                {new Date(slot.startTime).toLocaleTimeString(undefined, { timeStyle: "short" })}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSlot && (
        <form onSubmit={handleBook} className="card flex flex-col gap-3 p-4">
          <p className="text-sm font-medium">Your details</p>
          <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
          <input required placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Booking…" : "Confirm booking"}
          </button>
        </form>
      )}
    </div>
  );
}
