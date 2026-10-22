"use client";

import type { ComponentProps } from "react";
import { Link as RouterLink } from "react-router";

function Link({ href, ...props }: Omit<ComponentProps<typeof RouterLink>, "to"> & { href: string }) {
  return <RouterLink to={href} {...props} />;
}

export default function ExportPage() {
  return (
    <div className="max-w-[620px]">
      <header className="mb-6"><h1 className="mb-2 text-2xl font-bold tracking-[-.03em]">Export CSV / Print</h1><p className="leading-6 text-muted">Descarcă sau tipărește lista de cereri prioritizate.</p></header>
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-[18px] text-base font-semibold">20 cereri prioritizate</h2>
        <p className="mb-6 leading-6 text-muted">Fișierul include scorul, cererea, materia, urgența, timpul estimat și deadline-ul.</p>
        <div className="flex flex-wrap items-center gap-2.5"><button className="min-h-[42px] rounded-lg bg-primary px-4 font-semibold text-surface hover:brightness-90">Descarcă CSV</button><button className="min-h-[42px] rounded-lg border border-border bg-surface px-4 font-semibold text-ink hover:border-primary-soft hover:bg-primary-soft hover:text-primary" onClick={() => window.print()}>Tipărește lista</button><Link className="text-[13px] text-primary" href="/dashboard">← Înapoi la dashboard</Link></div>
      </section>
    </div>
  );
}
