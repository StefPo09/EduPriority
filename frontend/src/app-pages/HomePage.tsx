"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router";
import PriorityBadge from "@/components/shared/PriorityBadge";
import PageHeader from "../components/home/PageHeader";
import { getOverview, type Overview } from "@/lib/dashboard";

export default function HomePage() {
  const [overview, setOverview] = useState<Overview>();
  const today = new Date();
  const nextDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date;
  });

  useEffect(() => {
    void getOverview().then(setOverview);
  }, []);

  const statistics = overview
    ? [
        [String(overview.week.received), "Cereri primite"],
        [String(overview.week.resolved), "Rezolvate"],
        [`${overview.week.savedMinutes} min`, "Timp economisit"],
        [`${overview.week.changePercent >= 0 ? "+" : ""}${overview.week.changePercent}%`, "Fata de saptamana trecuta"],
      ]
    : [["—", "Cereri primite"], ["—", "Rezolvate"], ["—", "Timp economisit"], ["—", "Fata de saptamana trecuta"]];

  return (
    <div className="w-full">
      <PageHeader />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-5 text-base font-semibold">Ce e urgent azi</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              [overview?.urgent.critical ?? "—", "Critice", 5],
              [overview?.urgent.medium ?? "—", "Medii", 3],
              [overview?.urgent.low ?? "—", "Scazute", 1],
            ].map(([value, label, score]) => (
              <Link to="./dashboard" className="rounded-lg border border-border p-3 hover:border-primary-soft hover:bg-primary-soft" key={label}>
                <strong className="block text-2xl text-ink">{value}</strong>
                <span className="text-sm text-muted">{label}</span>
                <span className="mt-2 block"><PriorityBadge score={score as 1 | 3 | 5} /></span>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold">Urmatoarele 7 zile</h2>
            <Link className="text-sm font-semibold text-primary" to="./calendar">Vezi calendarul</Link>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {nextDays.map((date) => (
              <div className={`rounded-lg p-2 ${date.toDateString() === today.toDateString() ? "bg-primary-soft" : "bg-background"}`} key={date.toISOString()}>
                <span className="block text-muted">{date.toLocaleDateString("ro-RO", { weekday: "short" }).slice(0, 2)}</span>
                <strong className="mt-2 block">{date.getDate()}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="mt-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-5 text-base font-semibold">Statistici saptamana asta</h2>
        <div className="grid gap-5 sm:grid-cols-4">
          {statistics.map(([value, label]) => (
            <div key={label}><strong className="block text-xl">{value}</strong><span className="text-sm text-muted">{label}</span></div>
          ))}
        </div>
      </section>
    </div>
  );
}
