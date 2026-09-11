import Link from "next/link";
import { requireAdminSession } from "@/lib/session";
import { getAppSettings } from "@/lib/settings";
import { SignOutButton } from "@/app/dashboard/sign-out-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();
  const settings = await getAppSettings();

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-semibold">{settings.appName}</p>
            <p className="text-xs text-neutral-500">Platform Admin</p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/tenants">Tenants</Link>
            <Link href="/admin/bookings">Bookings</Link>
            <Link href="/admin/reports">Reports</Link>
            <Link href="/admin/settings">Settings</Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
