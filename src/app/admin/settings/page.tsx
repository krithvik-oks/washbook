"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [appName, setAppName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setAppName(data.appName);
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appName }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.formErrors?.[0] ?? "Couldn't save that.");
      return;
    }

    setSaved(true);
  }

  if (loading) return <p className="text-sm text-[var(--muted)]">Loading…</p>;

  return (
    <div className="card max-w-sm p-6">
      <h1 className="text-lg font-semibold">Settings</h1>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
          App name
          <input
            required
            maxLength={60}
            value={appName}
            onChange={(e) => {
              setAppName(e.target.value);
              setSaved(false);
            }}
            className="input"
          />
        </label>
        <p className="text-xs text-[var(--muted)]">Shown in the admin header and the browser tab title.</p>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <button type="submit" disabled={saving} className="btn btn-primary mt-1">
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <p className="text-sm text-emerald-600">Saved.</p>}
      </form>
    </div>
  );
}
