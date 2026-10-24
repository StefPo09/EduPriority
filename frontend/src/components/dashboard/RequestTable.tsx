"use client";

import { Link } from "react-router";
import PriorityBadge from "@/components/shared/PriorityBadge";

const requests = [
  [
    "Test vineri: inecuații cu modul",
    "Matematică",
    "Ridicată",
    "15 min",
    "Azi",
    5,
  ],
  [
    "Eseu argumentativ, cum structurez?",
    "Română",
    "Ridicată",
    "20 min",
    "Mâine",
    4,
  ],
  ["Legea lui Ohm, exercițiul 3", "Fizică", "Medie", "10 min", "Vineri", 3],
  ["Cerere recuperare temă", "Istorie", "Scăzută", "5 min", "Luni", 2],
  ["Întrebare despre bibliografie", "Română", "Scăzută", "5 min", "Fără", 1],
] as const;

export default function RequestTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-background text-xs font-semibold text-muted">
            {[
              "Scor",
              "Cerere",
              "Materie",
              "Urgență",
              "Timp est.",
              "Deadline",
            ].map((heading) => (
              <th
                className="whitespace-nowrap border-b border-border px-4 py-4"
                key={heading}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requests.map(([title, subject, urgency, time, deadline, score]) => (
            <tr key={title}>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                <PriorityBadge score={score} />
              </td>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                <Link
                  className="font-semibold text-ink hover:text-primary"
                  to="/requests/demo"
                >
                  {title}
                </Link>
              </td>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                {subject}
              </td>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                {urgency}
              </td>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                {time}
              </td>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                {deadline}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
