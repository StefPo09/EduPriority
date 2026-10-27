import type { ReactNode } from "react";
import { Link } from "react-router";

export default function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-6 sm:p-8">
        <Link className="mb-8 block text-xl font-bold text-primary" to="/">
          EduPriority
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted">{description}</p>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
