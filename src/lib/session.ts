import { auth } from "@/lib/auth";

export class UnauthorizedError extends Error {}

/**
 * Returns the current business user's session, scoped to their tenant.
 * Centralizing this means every dashboard/API route derives tenantId from
 * the authenticated session, never from client-supplied input.
 */
export async function requireTenantSession() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new UnauthorizedError("Not authenticated or not part of a tenant");
  }
  return {
    userId: session.user.id,
    tenantId: session.user.tenantId,
    role: session.user.role,
  };
}
