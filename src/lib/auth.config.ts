import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the Auth.js config: no Credentials provider, no
 * bcrypt, no Prisma. This is what middleware.ts uses (it runs on Vercel's
 * Edge runtime, which has a strict bundle-size limit) — it only needs to
 * decode the JWT session, not authenticate anyone. The full config with
 * the actual Credentials provider lives in auth.ts, used everywhere else.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string | null;
      }
      return session;
    },
  },
};
