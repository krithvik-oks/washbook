import Link from "next/link";
import { getAppSettings } from "@/lib/settings";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const settings = await getAppSettings();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 text-center font-semibold">
        {settings.appName}
      </Link>
      <div className="card p-8">
        <LoginForm />
      </div>
    </main>
  );
}
