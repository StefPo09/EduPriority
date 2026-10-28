"use client";

import type { ComponentProps } from "react";
import { Link as RouterLink } from "react-router";
import PageHeader from "../components/export/PageHeader";
import { getRequests } from "@/lib/requests";

function Link({
  href,
  ...props
}: Omit<ComponentProps<typeof RouterLink>, "to"> & { href: string }) {
  return <RouterLink to={href} {...props} />;
}

export default function ExportPage() {
  async function downloadCsv() {
    const requests = await getRequests();
    const rows = [
      ["Scor", "Cerere", "Materie", "Urgență", "Deadline"],
      ...requests.map((request) => [
        String(request.priority),
        request.text,
        request.subject,
        request.type,
        request.deadline,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "edupriority-cereri.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full">
      <PageHeader />
      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-5 text-base font-semibold">20 cereri prioritizate</h2>
        <p className="mb-6 leading-6 text-muted">
          Fișierul include scorul, cererea, materia, urgența, timpul estimat și
          deadline-ul.
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            className="min-h-10 rounded-lg bg-primary px-4 font-semibold text-surface hover:brightness-90"
            type="button"
            onClick={() => void downloadCsv()}
          >
            Descarcă CSV
          </button>
          <button
            className="min-h-10 rounded-lg border border-border bg-surface px-4 font-semibold text-ink hover:border-primary-soft hover:bg-primary-soft hover:text-primary"
            onClick={() => window.print()}
          >
            Tipărește lista
          </button>
          <Link
            className="text-sm text-primary"
            href="/dashboard"
          >
            ← Înapoi la dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
