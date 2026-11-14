"use client";

import { useState } from "react";

type StoredAccount = {
  id?: string;
  name?: string;
  role?: "teacher" | "student";
};

export default function PageHeader() {
  const [accountName] = useState(() => {
    const storedAccount = localStorage.getItem("edupriority:account");
    if (!storedAccount) return "utilizator";

    try {
      const account = JSON.parse(storedAccount) as StoredAccount;
      return account.name?.trim() || "utilizator";
    } catch {
      return "utilizator";
    }
  });
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buna dimineata" : hour < 18 ? "Buna ziua" : "Buna seara";

  return (
    <header className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          {greeting}, {accountName}!
        </h1>
        <p className="text-muted">Privire de ansamblu pentru ziua de azi.</p>
      </div>
      <span className="text-sm text-muted">Astazi, {new Date().toLocaleString('ro-RO', { month: 'long', day: 'numeric' })}</span>
    </header>
  );
}
