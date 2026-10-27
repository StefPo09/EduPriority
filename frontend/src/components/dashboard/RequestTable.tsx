"use client";

import { Link } from "react-router";
import PriorityBadge from "@/components/shared/PriorityBadge";
import { useEffect, useState } from "react";
import { getRequests, type StudentRequest } from "@/lib/requests";

export default function RequestTable() {
  const [requests, setRequests] = useState<StudentRequest[]>([]);

  useEffect(() => {
    const refresh = () => getRequests().then(setRequests);
    void refresh();
    window.addEventListener("edupriority:requests-updated", refresh);
    return () =>
      window.removeEventListener("edupriority:requests-updated", refresh);
  }, []);

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
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                <PriorityBadge score={request.priority} />
              </td>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                <Link
                  className="font-semibold text-ink hover:text-primary"
                  to={`/requests/${request.id}`}
                >
                  {request.text}
                </Link>
              </td>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                {request.subject}
              </td>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                {request.type}
              </td>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                —
              </td>
              <td className="whitespace-nowrap border-b border-border px-4 py-4 text-muted">
                {request.deadline}
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-muted" colSpan={6}>
                Nu există cereri încă. Adaugă prima cerere pentru a începe.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
