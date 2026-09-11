"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function SignupForm() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, ownerName, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Start your free trial</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        14 days free. No card required to get started.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Field label="Business name">
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="input"
            placeholder="Sunny Car Wash"
          />
        </Field>
        <Field label="Your name">
          <input
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="input"
            placeholder="Jamie Rivera"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="At least 8 characters"
          />
        </Field>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-primary mt-2">
          {loading ? "Creating your account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--primary)] underline">
          Log in
        </Link>
      </p>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-[var(--foreground)]">
      {label}
      {children}
    </label>
  );
}
