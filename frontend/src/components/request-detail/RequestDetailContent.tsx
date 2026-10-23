import type { ComponentProps } from "react";
import { Link as RouterLink } from "react-router";
import PriorityBadge from "@/components/shared/PriorityBadge";

type LinkProps = Omit<ComponentProps<typeof RouterLink>, "to"> & {
  href: string;
};

function Link({ href, ...props }: LinkProps) {
  return <RouterLink to={href} {...props} />;
}

export default function RequestDetailContent() {
  return (
    <>
      <Link
        className="mb-6 inline-block text-sm text-primary"
        href="/dashboard"
      >
        ← Înapoi la dashboard
      </Link>
      <header className="mb-7">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Test vineri: inecuații cu modul
        </h1>
        <p className="leading-6 text-muted">
          Maria Ionescu, 10B · Întrebare · Deadline: azi
        </p>
      </header>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-5 text-base font-semibold">
            Cererea elevului
          </h2>
          <p className="leading-6 text-muted">
            Nu înțeleg cum se rezolvă inecuațiile cu modul. Avem test vineri și
            nu am reușit exercițiile 4–7 din fișă.
          </p>
          <h2 className="mb-5 mt-7 text-base font-semibold">
            Clasificare AI
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-primary-soft px-2.5 py-2 text-sm font-semibold text-primary">
              Matematică
            </span>
            <span className="rounded-md bg-primary-soft px-2.5 py-2 text-sm font-semibold text-primary">
              Inecuații cu modul
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-muted">
            <span>Dificultate: Medie</span>
            <span>Urgență: Ridicată</span>
          </div>
          <p className="leading-6 text-muted">
            <strong className="text-ink">Rezumat:</strong> elevul cere ajutor
            pentru exerciții înaintea unui test apropiat.
          </p>
        </section>
        <section className="rounded-xl border border-primary-soft bg-primary-soft p-5 sm:p-6">
          <h2 className="mb-5 text-base font-semibold">Sugestie</h2>
          <p className="leading-6 text-muted">
            <strong className="text-ink">Timp estimat:</strong>
            <br />
            15 minute
          </p>
          <p className="leading-6 text-muted">
            <strong className="text-ink">Acțiune:</strong>
            <br />
            mini-explicație la începutul orei, apoi 2 exerciții rezolvate pe
            tablă.
          </p>
          <p className="border-t border-border pt-4 leading-6 text-muted">
            De ce scor 5: deadline azi + test în 2 zile.
          </p>
          <PriorityBadge score={5} showLabel />
        </section>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <button className="min-h-10 rounded-lg bg-primary px-4 font-semibold text-surface hover:brightness-90">
          Marchează rezolvat
        </button>
        <button className="min-h-10 rounded-lg border border-border bg-surface px-4 font-semibold text-ink hover:border-primary-soft hover:bg-primary-soft hover:text-primary">
          Schimbă prioritatea
        </button>
      </div>
    </>
  );
}
