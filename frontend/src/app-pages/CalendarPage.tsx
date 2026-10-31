"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import PageHeader from "../components/calendar/PageHeader";
import { getRequests, type StudentRequest } from "@/lib/requests";

const weekDays = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
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
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refresh = async () => {
      setLoading(true);
      try {
        setRequests(await getRequests());
        setLoadError("");
      } catch {
        setLoadError("Nu s-au putut încărca deadline-urile. Încearcă din nou.");
      } finally {
        setLoading(false);
      }
    };
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
    else {
      const day = next.getDate();
      next.setDate(1);
      next.setMonth(next.getMonth() + amount);
      const lastDay = new Date(
        next.getFullYear(),
        next.getMonth() + 1,
        0,
      ).getDate();
      next.setDate(Math.min(day, lastDay));
    }
    setSelectedDate(next);
  }

  function goToToday() {
    setSelectedDate(new Date());
  }

  const monthLabel = selectedDate.toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });
  const selectedRequests = requestsByDate[dateKey(selectedDate)] ?? [];
  const todayKey = dateKey(new Date());
  const selectedDateKey = dateKey(selectedDate);
  const monthRequestCount = requests.filter((request) => {
    const deadline = new Date(`${request.deadline}T00:00:00`);
    return (
      deadline.getFullYear() === selectedDate.getFullYear() &&
      deadline.getMonth() === selectedDate.getMonth()
    );
  }).length;
  const todayRequestCount = requestsByDate[todayKey]?.length ?? 0;

  return (
    <div className="w-full">
      <PageHeader view={view} setView={setView} />
      <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <div className="mb-5 grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 sm:gap-4">
          <button
            className="justify-self-start rounded-lg px-2 py-2 text-sm font-semibold text-primary hover:bg-primary-soft sm:px-3"
            onClick={() => move(-1)}
            type="button"
          >
            <span aria-hidden="true">← </span>
            <span className="hidden sm:inline">Înapoi</span>
          </button>
          <strong className="text-center capitalize">
            {view === "week"
              ? `${week[0].toLocaleDateString("ro-RO", { day: "numeric", month: "short" })} – ${week[6].toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" })}`
              : monthLabel}
          </strong>
          <button
            className="justify-self-end rounded-lg px-2 py-2 text-sm font-semibold text-primary hover:bg-primary-soft sm:px-3"
            onClick={goToToday}
            type="button"
          >
            Astăzi
          </button>
          <button
            aria-label={view === "week" ? "Săptămâna următoare" : "Luna următoare"}
            className="justify-self-end rounded-lg px-2 py-2 text-sm font-semibold text-primary hover:bg-primary-soft sm:px-3"
            onClick={() => move(1)}
            type="button"
          >
            <span className="hidden sm:inline">Înainte </span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {view === "week" ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
            {week.map((date) => (
              <div
                className={`min-h-28 rounded-lg border p-3 ${
                  dateKey(date) === selectedDateKey
                    ? "border-primary bg-primary-soft/40"
                    : "border-border"
                }`}
                key={dateKey(date)}
              >
                <button
                  aria-label={date.toLocaleDateString("ro-RO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  aria-pressed={dateKey(date) === selectedDateKey}
                  className="flex w-full items-center gap-2 text-left"
                  onClick={() => setSelectedDate(date)}
                  type="button"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold ${
                      dateKey(date) === todayKey
                        ? "bg-primary text-surface"
                        : "hover:bg-primary-soft"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <span className="text-sm text-muted">
                    {date.toLocaleDateString("ro-RO", {
                      weekday: "long",
                      month: "long",
                    })}
                  </span>
                  {requestsByDate[dateKey(date)]?.length ? (
                    <span className="ml-auto rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                      {requestsByDate[dateKey(date)].length}
                    </span>
                  ) : null}
                </button>
                {requestsByDate[dateKey(date)]?.map((request) => (
                  <Link
                    key={request.id}
                    to={`/requests/${request.id}`}
                    className="mt-3 block truncate rounded-md bg-primary-soft p-2 text-xs font-semibold text-primary hover:brightness-95"
                  >
                    {request.text}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[35rem]">
              <div className="grid grid-cols-7 gap-px overflow-hidden rounded-t-lg border border-border bg-border">
                {weekDays.map((day) => (
                  <div
                    className="bg-background px-1 py-2 text-center text-xs font-semibold text-muted sm:p-3"
                    key={day}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px overflow-hidden rounded-b-lg border-x border-b border-border bg-border">
                {monthDays.map((date) => {
                  const dayRequests = requestsByDate[dateKey(date)] ?? [];
                  const isCurrentMonth =
                    date.getMonth() === selectedDate.getMonth();
                  const isToday = dateKey(date) === todayKey;
                  const isSelected = dateKey(date) === selectedDateKey;

                  return (
                    <div
                      className={`min-h-16 p-1.5 sm:min-h-28 sm:p-2 ${
                        isSelected
                          ? "bg-primary-soft/40"
                          : isCurrentMonth
                            ? "bg-surface"
                            : "bg-background text-muted"
                      }`}
                      key={dateKey(date)}
                    >
                      <button
                        aria-label={date.toLocaleDateString("ro-RO", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        aria-pressed={isSelected}
                        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                          isToday
                            ? "bg-primary font-semibold text-surface"
                            : isSelected
                              ? "font-semibold text-primary ring-2 ring-primary"
                              : "hover:bg-primary-soft"
                        }`}
                        onClick={() => setSelectedDate(date)}
                        type="button"
                      >
                        {date.getDate()}
                      </button>
                      <div className="mt-1 hidden space-y-1 sm:block">
                        {dayRequests.slice(0, 2).map((request) => (
                          <Link
                            key={request.id}
                            title={request.text}
                            to={`/requests/${request.id}`}
                            className="block truncate rounded bg-primary-soft px-1.5 py-1 text-[11px] font-medium text-primary hover:brightness-95"
                          >
                            {request.text}
                          </Link>
                        ))}
                        {dayRequests.length > 2 && (
                          <span className="block px-1 text-[11px] text-muted">
                            +{dayRequests.length - 2} altele
                          </span>
                        )}
                      </div>
                      {dayRequests.length > 0 && (
                        <span
                          aria-label={`${dayRequests.length} deadline-uri`}
                          className="mx-auto mt-1 flex h-1.5 w-1.5 rounded-full bg-primary sm:hidden"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {loadError && (
          <div className="mt-4 flex flex-wrap items-center gap-3" role="alert">
            <p className="text-sm text-(--color-priority-5)">{loadError}</p>
            <button
              className="text-sm font-semibold text-primary underline"
              onClick={() => window.dispatchEvent(new Event("edupriority:requests-updated"))}
              type="button"
            >
              Reîncearcă
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-6 border-t border-border pt-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <section aria-labelledby="selected-day-heading">
            <h2
              className="mb-3 text-base font-semibold capitalize"
              id="selected-day-heading"
            >
              {selectedDate.toLocaleDateString("ro-RO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
            {loading ? (
              <p className="text-sm text-muted">Se încarcă deadline-urile...</p>
            ) : selectedRequests.length > 0 ? (
              <div className="grid gap-2">
                {selectedRequests.map((request) => (
                  <Link
                    key={request.id}
                    to={`/requests/${request.id}`}
                    className="block rounded-lg border border-border p-4 hover:border-primary-soft hover:bg-primary-soft"
                  >
                    <strong className="block">{request.text}</strong>
                    <span className="mt-1 block text-sm text-muted">
                      {request.type} · {request.student}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">
                {loadError
                  ? "Deadline-urile nu sunt disponibile momentan."
                  : "Nu există deadline-uri pentru această zi."}
              </p>
            )}
          </section>
          <aside className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className="rounded-lg bg-background p-4">
              <span className="block text-sm text-muted">Deadline-uri luna aceasta</span>
              <strong className="mt-1 block text-2xl">{monthRequestCount}</strong>
            </div>
            <div className="rounded-lg bg-background p-4">
              <span className="block text-sm text-muted">Deadline-uri astăzi</span>
              <strong className="mt-1 block text-2xl">{todayRequestCount}</strong>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
