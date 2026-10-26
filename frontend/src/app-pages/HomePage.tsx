import { Link } from "react-router";
import PriorityBadge from "@/components/shared/PriorityBadge";
import PageHeader from "../components/home/PageHeader";

const recentRequests = [
  ["Andrei P.", "Derivata compusa", 5],
  ["Maria I.", "Test geometrie", 4],
  ["Vlad R.", "Exercitiu repetat", 2],
] as const;

export default function HomePage() {
  return (
    <div className="w-full">
      <PageHeader />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-5 text-base font-semibold">Ce e urgent azi</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link
              to="/frontend/src/components/dashboard"
              className="rounded-lg border border-border p-3 hover:border-primary-soft hover:bg-primary-soft"
            >
              <strong className="block text-2xl text-ink">3</strong>
              <span className="text-sm text-muted">Critice</span>
            </Link>
            <Link
              to="/frontend/src/components/dashboard"
              className="rounded-lg border border-border p-3 hover:border-primary-soft hover:bg-primary-soft"
            >
              <strong className="block text-2xl text-ink">5</strong>
              <span className="text-sm text-muted">Medii</span>
            </Link>
            <Link
              to="/frontend/src/components/dashboard"
              className="rounded-lg border border-border p-3 hover:border-primary-soft hover:bg-primary-soft"
            >
              <strong className="block text-2xl text-ink">12</strong>
              <span className="text-sm text-muted">Scazute</span>
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold">Urmatoarele 7 zile</h2>
            <Link
              className="text-sm font-semibold text-primary"
              to="/frontend/src/components/calendar"
            >
              Vezi calendarul
            </Link>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
              <div
                className="rounded-lg bg-background p-2"
                key={`${day}-${index}`}
              >
                <span className="block text-muted">{day}</span>
                <strong className="mt-2 block">{21 + index}</strong>
                {index === 4 && (
                  <span className="mx-auto mt-2 block h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-5 text-base font-semibold">
          Statistici saptamana asta
        </h2>
        <div className="grid gap-5 sm:grid-cols-4">
          {[
            ["47", "Cereri primite"],
            ["32", "Rezolvate"],
            ["2h 15m", "Timp economisit"],
            ["+12%", "Fata de saptamana trecuta"],
          ].map(([value, label]) => (
            <div key={label}>
              <strong className="block text-xl">{value}</strong>
              <span className="text-sm text-muted">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Ultimele cereri</h2>
          <Link
            className="text-sm font-semibold text-primary"
            to="/frontend/src/components/dashboard"
          >
            Vezi toate
          </Link>
        </div>
        <div className="grid gap-3">
          {recentRequests.map(([student, title, score]) => (
            <Link
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 hover:border-primary-soft hover:bg-primary-soft"
              key={title}
              to="/requests/demo"
            >
              <span>
                <strong>{student}</strong>
                <span className="text-muted"> — {title}</span>
              </span>
              <PriorityBadge score={score} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
