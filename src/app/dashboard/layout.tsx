import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const tenant = session?.user?.tenantId
    ? await prisma.tenant.findUnique({ where: { id: session.user.tenantId } })
    : null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-semibold">{tenant?.name ?? "Dashboard"}</p>
            {tenant && (
              <a
                href={`/${tenant.slug}`}
                target="_blank"
                className="text-xs text-neutral-500 underline"
              >
                View public booking page →
              </a>
            )}
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard">Bookings</Link>
            <Link href="/dashboard/services">Services</Link>
            <Link href="/dashboard/hours">Hours</Link>
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
