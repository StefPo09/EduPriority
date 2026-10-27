import { Link } from "react-router";
import BrandLogo from "../components/shared/BrandLogo";

export default function StartPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-lg rounded-xl border border-border bg-surface p-8 text-center sm:p-10">
        <div className="flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="mt-8 text-3xl font-bold tracking-tight">
          Organizează cererile elevilor mai simplu.
        </h1>
        <p className="mt-3 leading-6 text-muted">
          Prioritizează, planifică și urmărește activitatea clasei dintr-un
          singur loc.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            className="rounded-lg bg-primary px-4 py-3 font-semibold text-surface"
            to="/signup"
          >
            Înregistrare
          </Link>
          <Link
            className="rounded-lg border border-border px-4 py-3 font-semibold text-ink hover:border-primary-soft hover:bg-primary-soft hover:text-primary"
            to="/login"
          >
            Autentificare
          </Link>
        </div>
      </section>
    </main>
  );
}
