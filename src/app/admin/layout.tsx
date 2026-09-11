import Link from "next/link";
import { requireAdminSession } from "@/lib/session";
import { getAppSettings } from "@/lib/settings";
import { SignOutButton } from "@/app/dashboard/sign-out-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();
  const settings = await getAppSettings();

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-semibold">{settings.appName}</p>
            <p className="text-xs font-medium text-[var(--primary)]">Platform Admin</p>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/admin/tenants" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Tenants
            </Link>
            <Link href="/admin/bookings" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Bookings
            </Link>
            <Link href="/admin/reports" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Reports
            </Link>
            <Link href="/admin/settings" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Settings
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
