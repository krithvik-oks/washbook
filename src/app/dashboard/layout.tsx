import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const [tenant, settings] = await Promise.all([
    session?.user?.tenantId
      ? prisma.tenant.findUnique({ where: { id: session.user.tenantId } })
      : null,
    getAppSettings(),
  ]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium text-[var(--primary)]">{settings.appName}</p>
            <p className="font-semibold">{tenant?.name ?? "Dashboard"}</p>
            {tenant && (
              <a
                href={`/${tenant.slug}`}
                target="_blank"
                className="text-xs text-[var(--muted)] underline"
              >
                View public booking page →
              </a>
            )}
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/dashboard" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Bookings
            </Link>
            <Link href="/dashboard/services" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Services
            </Link>
            <Link href="/dashboard/hours" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Hours
            </Link>
            <SignOutButton />
          </nav>
        </div>
        {tenant && tenant.subscriptionStatus !== "ACTIVE" && tenant.subscriptionStatus !== "TRIALING" && (
          <div className="bg-amber-100 px-6 py-2 text-center text-sm text-amber-900">
            Your subscription is {tenant.subscriptionStatus.toLowerCase()}. Some features may be limited.
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
