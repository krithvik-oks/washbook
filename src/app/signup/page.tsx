import Link from "next/link";
import { getAppSettings } from "@/lib/settings";
import { SignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const settings = await getAppSettings();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 text-center font-semibold">
        {settings.appName}
      </Link>
      <div className="card p-8">
        <SignupForm />
      </div>
    </main>
  );
}
