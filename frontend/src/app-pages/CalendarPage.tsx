"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import PageHeader from "../components/calendar/PageHeader";
import { getRequests, type StudentRequest } from "@/lib/requests";

const weekDays = ["L", "M", "M", "J", "V", "S", "D"];
const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const startOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export default function CalendarPage() {
  const [view, setView] = useState<"week" | "month">("month");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [requests, setRequests] = useState<StudentRequest[]>([]);

  useEffect(() => {
    const refresh = () => getRequests().then(setRequests);
    void refresh();
    window.addEventListener("edupriority:requests-updated", refresh);
    return () =>
      window.removeEventListener("edupriority:requests-updated", refresh);
  }, []);

  const requestsByDate = useMemo(() => {
    return requests.reduce<Record<string, typeof requests>>((grouped, request) => {
      (grouped[request.deadline] ??= []).push(request);
      return grouped;
    }, {});
  }, [requests]);

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = startOfWeek(selectedDate);
    date.setDate(date.getDate() + index);
    return date;
  });
  const monthStart = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1,
  );
  const calendarStart = startOfWeek(monthStart);
  const monthDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });

  function move(amount: number) {
    const next = new Date(selectedDate);
    if (view === "week") next.setDate(next.getDate() + amount * 7);
    else next.setMonth(next.getMonth() + amount);
    setSelectedDate(next);
  }

  const monthLabel = selectedDate.toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });
  const selectedRequests = requestsByDate[dateKey(selectedDate)] ?? [];

  return (
    <div className="w-full">
      <PageHeader view={view} setView={setView} />
      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button className="text-sm font-semibold text-primary" onClick={() => move(-1)}>
            ← Înapoi
          </button>
          <strong>
            {view === "week"
              ? `${week[0].toLocaleDateString("ro-RO", { day: "numeric", month: "short" })} – ${week[6].toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" })}`
              : monthLabel}
          </strong>
          <button className="text-sm font-semibold text-primary" onClick={() => move(1)}>
            Înainte →
          </button>
        </div>

        {view === "week" ? (
          <div className="grid grid-cols-7 gap-2">
            {week.map((date, index) => (
              <div className="min-h-32 rounded-lg border border-border p-2 sm:p-3" key={dateKey(date)}>
                <span className="text-xs text-muted">{weekDays[index]}</span>
                <strong className="mt-2 block">{date.getDate()}</strong>
                {requestsByDate[dateKey(date)]?.map((request) => (
                  <Link key={request.id} to={`/requests/${request.id}`} className="mt-4 block rounded-md bg-primary-soft p-2 text-xs font-semibold text-primary">
                    {request.text}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
            {weekDays.map((day, index) => (
              <div className="bg-background p-2 text-center text-xs font-semibold text-muted sm:p-3" key={`${day}-${index}`}>
                {day}
              </div>
            ))}
            {monthDays.map((date) => (
              <div className={`min-h-24 p-2 sm:min-h-32 sm:p-3 ${date.getMonth() === selectedDate.getMonth() ? "bg-surface" : "bg-background text-muted"}`} key={dateKey(date)}>
                <strong className={dateKey(date) === dateKey(new Date()) ? "flex h-7 w-7 items-center justify-center rounded-full bg-primary text-surface" : "flex h-7 w-7 items-center justify-center"}>
                  {date.getDate()}
                </strong>
                {requestsByDate[dateKey(date)]?.map((request) => (
                  <Link key={request.id} to={`/requests/${request.id}`} className="mt-2 block rounded-md bg-primary-soft p-1.5 text-xs font-semibold text-primary">
                    {request.text}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-border pt-5">
          <h2 className="mb-3 text-base font-semibold">
            {selectedDate.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })}
          </h2>
          {selectedRequests.length > 0 ? selectedRequests.map((request) => (
            <Link key={request.id} to={`/requests/${request.id}`} className="block rounded-lg border border-border p-4 hover:border-primary-soft hover:bg-primary-soft">
              <strong className="block">{request.text}</strong>
              <span className="mt-1 block text-sm text-muted">{request.student}</span>
            </Link>
          )) : <p className="text-sm text-muted">Nu există deadline-uri pentru această zi.</p>}
        </div>
      </section>
    </div>
  );
}
