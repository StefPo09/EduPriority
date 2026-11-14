"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router";
import PriorityBadge from "@/components/shared/PriorityBadge";
import PageHeader from "../components/home/PageHeader";
import { getOverview, type Overview } from "@/lib/dashboard";
import {
  getCurrentAccountRequestFilters,
  getRequests,
  type StudentRequest,
} from "@/lib/requests";

export default function HomePage() {
  const [overview, setOverview] = useState<Overview>();
  const [requests, setRequests] = useState<StudentRequest[]>();
  const [isStudent] = useState(() => {
    try {
      const account = JSON.parse(
        localStorage.getItem("edupriority:account") ?? "{}",
      ) as { role?: string };
      return account.role === "student";
    } catch {
      return false;
    }
  });
  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  const nextDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date;
  });

  useEffect(() => {
    const filters = getCurrentAccountRequestFilters();
    const refresh = async () => {
      const requestsResult = await getRequests(filters);
      setRequests(requestsResult);
      if (!isStudent) setOverview(await getOverview());
    };
    void refresh();
    window.addEventListener("edupriority:requests-updated", refresh);
    return () =>
      window.removeEventListener("edupriority:requests-updated", refresh);
  }, [isStudent]);

  const urgentRequests = requests?.filter(
    (request) => request.deadline === todayKey,
  );
  const statistics = overview
    ? [
        [requests ? String(requests.length) : "—", "Cereri primite"],
        [String(overview.week.resolved), "Rezolvate"],
        [`${overview.week.savedMinutes} min`, "Timp economisit"],
        [`${overview.week.changePercent >= 0 ? "+" : ""}${overview.week.changePercent}%`, "Fata de saptamana trecuta"],
      ]
    : [["—", "Cereri primite"], ["—", "Rezolvate"], ["—", "Timp economisit"], ["—", "Fata de saptamana trecuta"]];

  if (isStudent) {
    return (
      <div className="w-full">
        <PageHeader />
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">Cereri trimise</h2>
              <Link className="text-sm font-semibold text-primary" to="/dashboard">
                Vezi toate
              </Link>
            </div>
            <p className="text-3xl font-bold">{requests?.length ?? "—"}</p>
            <p className="mt-1 text-sm text-muted">
              Cererile tale către profesori
            </p>
            <Link
              className="mt-5 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-surface"
              to="/requests/new"
            >
              + Trimite o cerere
            </Link>
          </section>
          <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">Următoarele 2 săptămâni</h2>
              <Link className="text-sm font-semibold text-primary" to="/schedule">
                Vezi orarul
              </Link>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {nextDays.map((date) => (
                <div
                  className={`rounded-lg p-2 ${date.toDateString() === today.toDateString() ? "bg-primary-soft" : "bg-background"}`}
                  key={date.toISOString()}
                >
                  <span className="block text-muted">
                    {date.toLocaleDateString("ro-RO", { weekday: "short" }).slice(0, 2)}
                  </span>
                  <strong className="mt-2 block">{date.getDate()}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageHeader />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-5 text-base font-semibold">Ce e urgent azi</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              [urgentRequests ? urgentRequests.filter((request) => request.priority === 5).length : "—", "Critice", 5],
              [urgentRequests ? urgentRequests.filter((request) => request.priority >= 2 && request.priority <= 4).length : "—", "Medii", 3],
              [urgentRequests ? urgentRequests.filter((request) => request.priority <= 1).length : "—", "Scazute", 1],
            ].map(([value, label, score]) => (
              <Link to="/dashboard" className="rounded-lg border border-border p-3 hover:border-primary-soft hover:bg-primary-soft" key={label}>
                <strong className="block text-2xl text-ink">{value}</strong>
                <span className="text-sm text-muted">{label}</span>
                {score == 3
                  ? <div className="block mt-2">
                      <span className="mr-2"><PriorityBadge score={4} /></span>
                      <span className="mr-2"><PriorityBadge score={3} /></span>
                      <span className="mr-2"><PriorityBadge score={2} /></span>
                    </div>
                  : <span className="mt-2 block"><PriorityBadge score={score as 1 | 5} /></span>
                }
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold">Urmatoarele 2 saptamani</h2>
            <Link className="text-sm font-semibold text-primary" to="/calendar">Vezi calendarul</Link>
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
