import Link from "next/link";
import { requireAdminSession } from "@/lib/session";
import { SignOutButton } from "@/app/dashboard/sign-out-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="font-semibold">Platform Admin</p>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/tenants">Tenants</Link>
            <Link href="/admin/bookings">Bookings</Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
