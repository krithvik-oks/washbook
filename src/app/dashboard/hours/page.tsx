"use client";

import { useEffect, useState } from "react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface DayRule {
  dayOfWeek: number;
  closed: boolean;
  openTime: string;
  closeTime: string;
}

export default function HoursPage() {
  const [week, setWeek] = useState<DayRule[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/hours")
      .then((r) => r.json())
      .then(setWeek);
  }, []);

  function update(dayOfWeek: number, patch: Partial<DayRule>) {
    setWeek((w) => w!.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/hours", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules: week }),
    });
    setSaving(false);
    setSaved(true);
  }

  if (!week) return <p className="text-sm text-[var(--muted)]">Loading…</p>;

  return (
    <div className="card max-w-lg p-6">
      <h1 className="text-lg font-semibold">Operating hours</h1>
      <div className="mt-4 flex flex-col gap-3">
        {week.map((day) => (
          <div key={day.dayOfWeek} className="flex items-center gap-3 text-sm">
            <label className="flex w-32 items-center gap-2">
              <input
                type="checkbox"
                checked={!day.closed}
                onChange={(e) => update(day.dayOfWeek, { closed: !e.target.checked })}
                className="accent-[var(--primary)]"
              />
              {DAY_NAMES[day.dayOfWeek]}
            </label>
            <input
              type="time"
              disabled={day.closed}
              value={day.openTime}
              onChange={(e) => update(day.dayOfWeek, { openTime: e.target.value })}
              className="input"
            />
            <span className="text-[var(--muted)]">to</span>
            <input
              type="time"
              disabled={day.closed}
              value={day.closeTime}
              onChange={(e) => update(day.dayOfWeek, { closeTime: e.target.value })}
              className="input"
            />
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="btn btn-primary mt-6">
        {saving ? "Saving…" : "Save hours"}
      </button>
      {saved && <span className="ml-3 text-sm text-emerald-600">Saved.</span>}
    </div>
  );
}
