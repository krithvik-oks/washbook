import Link from "next/link";
import { getAppSettings } from "@/lib/settings";

const FEATURES = [
  {
    title: "A booking page in minutes",
    body: "Give customers a clean page to pick a service, see open times, and book — no app to download.",
  },
  {
    title: "Hours and bays, handled",
    body: "Set your weekly hours once. Availability updates automatically as bookings come in.",
  },
  {
    title: "One dashboard, every booking",
    body: "See what's coming up, manage your services, and never double-book a bay.",
  },
];

export default async function Home() {
  const settings = await getAppSettings();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            {settings.appName}
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Start free trial
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
          <span className="badge bg-[var(--accent-soft)] text-[var(--primary)]">
            Booking software for car washes
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Online booking, built for car washes.
          </h1>
          <p className="mt-4 max-w-xl text-[var(--muted)]">
            Give customers a simple page to book a wash in seconds. Manage your
            services, hours, and upcoming bookings from one dashboard.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/signup" className="btn btn-primary">
              Start free trial
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Log in
            </Link>
          </div>
          <p className="mt-6 text-xs text-[var(--muted)]">14-day free trial. No card required.</p>
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--accent-soft)]">
          <div className="mx-auto grid max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <h2 className="font-semibold">{f.title}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-6 text-center text-xs text-[var(--muted)]">
        {settings.appName} — {new Date().getFullYear()}
      </footer>
    </div>
  );
}
