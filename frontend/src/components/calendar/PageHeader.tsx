"use client";

import { Link } from "react-router";

export default function PageHeader({
  view,
  setView,
}: {
  view: "week" | "month";
  setView: (view: "week" | "month") => void;
}) {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted">
          Deadline-uri extrase automat si adaugate manual.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setView("week")}
          className={`min-h-10 rounded-lg border px-4 font-semibold ${view === "week" ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-ink"}`}
        >
          Saptamana
        </button>
        <button
          onClick={() => setView("month")}
          className={`min-h-10 rounded-lg border px-4 font-semibold ${view === "month" ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-ink"}`}
        >
          Luna
        </button>
        <Link to="/requests/new" className="min-h-10 rounded-lg bg-primary px-4 py-2.5 font-semibold text-surface">
          + Adauga
        </Link>
      </div>
    </header>
  );
}
