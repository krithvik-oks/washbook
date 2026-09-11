import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        Online booking, built for car washes.
      </h1>
      <p className="mt-4 max-w-xl text-neutral-500">
        Give customers a simple page to book a wash in seconds. Manage your
        services, hours, and upcoming bookings from one dashboard.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Start free trial
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium"
        >
          Log in
        </Link>
      </div>
      <p className="mt-6 text-xs text-neutral-400">14-day free trial. No card required.</p>
    </main>
  );
}
