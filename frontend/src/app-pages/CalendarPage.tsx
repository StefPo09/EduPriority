"use client";

import { useState } from "react";
import { Link } from "react-router";
import PageHeader from "../components/calendar/PageHeader";

const weekDays = ["L", "M", "M", "J", "V", "S", "D"];
const monthDays = Array.from({ length: 31 }, (_, index) => index + 1);
const events: Record<number, string> = {
  3: "Predare proiect",
  10: "Test derivate",
  17: "Fisa geometrie",
  25: "Test geometrie",
};

export default function CalendarPage() {
  const [view, setView] = useState<"week" | "month">("month");
  return (
    <div className="w-full">
      <PageHeader view={view} setView={setView} />
      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <button className="text-sm font-semibold text-primary">
            ← Inapoi
          </button>
          <strong>
            {view === "week" ? "21–27 octombrie 2025" : "Octombrie 2025"}
          </strong>
          <button className="text-sm font-semibold text-primary">
            Inainte →
          </button>
        </div>
        {view === "week" ? (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div
                className="min-h-32 rounded-lg border border-border p-2 sm:p-3"
                key={`${day}-${index}`}
              >
                <span className="text-xs text-muted">{day}</span>
                <strong className="mt-2 block">{21 + index}</strong>
                {index === 4 && (
                  <Link
                    to="/requests/demo"
                    className="mt-4 block rounded-md bg-primary-soft p-2 text-xs font-semibold text-primary"
                  >
                    Test geometrie
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
            {weekDays.map((day, index) => (
              <div
                className="bg-background p-2 text-center text-xs font-semibold text-muted sm:p-3"
                key={`${day}-header-${index}`}
              >
                {day}
              </div>
            ))}
            {[0, 1].map((blank) => (
              <div
                className="min-h-24 bg-surface p-2 sm:min-h-32 sm:p-3"
                key={`blank-${blank}`}
              />
            ))}
            {monthDays.map((date) => (
              <div
                className="min-h-24 bg-surface p-2 sm:min-h-32 sm:p-3"
                key={date}
              >
                <strong
                  className={
                    date === 25
                      ? "flex h-7 w-7 items-center justify-center rounded-full bg-primary text-surface"
                      : "flex h-7 w-7 items-center justify-center"
                  }
                >
                  {date}
                </strong>
                {events[date] && (
                  <Link
                    to="/requests/demo"
                    className="mt-2 block rounded-md bg-primary-soft p-1.5 text-xs font-semibold text-primary"
                  >
                    {events[date]}
                  </Link>
                )}
              </div>
            ))}
            {[0, 1].map((blank) => (
              <div
                className="min-h-24 bg-surface p-2 sm:min-h-32 sm:p-3"
                key={`end-blank-${blank}`}
              />
            ))}
          </div>
        )}
        <div className="mt-6 border-t border-border pt-5">
          <h2 className="mb-3 text-base font-semibold">Vineri, 25 octombrie</h2>
          <Link
            to="/requests/demo"
            className="block rounded-lg border border-border p-4 hover:border-primary-soft hover:bg-primary-soft"
          >
            <strong className="block">Test geometrie</strong>
            <span className="mt-1 block text-sm text-muted">
              Sursa: Maria I. · cerere #47
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
