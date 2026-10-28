"use client";

import { useState } from "react";

export default function PageHeader() {
  const [firstName] = useState(() => {
    if (typeof window === "undefined") return "";
    const storedAccount = localStorage.getItem("edupriority:account");
    if (!storedAccount) return "";
    try {
      const { name } = JSON.parse(storedAccount) as { name?: string };
      const nameParts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
      return nameParts.slice(1).join(" ") || nameParts[0] || "";
    } catch {
      return "";
    }
  });

  return (
    <header className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Buna dimineata{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-muted">Privire de ansamblu pentru ziua de azi.</p>
      </div>
      <span className="text-sm text-muted">Astazi, {new Date().toLocaleString('ro-RO', { month: 'long', day: 'numeric' })}</span>
    </header>
  );
}
