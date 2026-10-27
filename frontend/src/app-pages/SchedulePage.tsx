"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/schedule/PageHeader";
import {
  getClasses,
  getSchedule,
  type Schedule,
} from "@/lib/dashboard";

const days = ["Luni", "Marti", "Miercuri", "Joi", "Vineri"];

export default function SchedulePage() {
  const [className, setClassName] = useState("Clasa a 11-a A");
  const [schedule, setSchedule] = useState<Schedule>();
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    void getClasses().then((items) => {
      setClasses(items);
      if (items.length) setClassName(items[0]);
    });
  }, []);

  useEffect(() => {
    void getSchedule(className).then(setSchedule);
  }, [className]);

  return (
    <div className="w-full">
      <PageHeader />
      <select
        className="mb-5 rounded-lg border border-border bg-surface px-3 py-2.5"
        value={className}
        onChange={(event) => setClassName(event.target.value)}
      >
        {classes.map((availableClass) => (
          <option key={availableClass}>{availableClass}</option>
        ))}
      </select>
      <section className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-160 border-collapse text-left">
          <thead>
            <tr className="bg-background text-sm text-muted">
              <th className="border-b border-border p-4">Ora</th>
              {days.map((day) => (
                <th className="border-b border-border p-4" key={day}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule?.slots.map((slot) => (
              <tr key={slot.time}>
                <td className="border-b border-border p-4 text-sm text-muted">
                  {slot.time}
                </td>
                {days.map((day, index) => (
                  <td
                    className="border-b border-border p-4"
                    key={`${slot.time}-${day}`}
                  >
                    {slot.subjects[index] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!schedule?.slots.length && (
          <p className="p-6 text-sm text-muted">
            Nu există ore în baza de date pentru această clasă.
          </p>
        )}
      </section>
      <section className="mt-5 rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 font-semibold">Programa clasei</h2>
        {schedule?.curriculum.map((item) => (
          <div
            className="flex justify-between border-b border-border py-3 last:border-0"
            key={item.title}
          >
            <span>{item.title}</span>
            <span className="text-sm text-muted">{item.status}</span>
          </div>
        ))}
        {!schedule?.curriculum.length && (
          <p className="text-sm text-muted">
            Nu există programă în baza de date pentru această clasă.
          </p>
        )}
      </section>
    </div>
  );
}
