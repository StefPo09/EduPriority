"use client";

import PageHeader from "../components/settings/PageHeader";
import { useTheme } from "@/components/shared/ThemeContext";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme === "dark";
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [account] = useState(() => {
    if (typeof window === "undefined") return undefined;
    const stored = localStorage.getItem("edupriority:account");
    if (!stored) return undefined;
    try {
      return JSON.parse(stored) as {
        name: string;
        email: string;
        role: "teacher" | "student";
      };
    } catch {
      return undefined;
    }
  });
  const [lastName = "", ...firstNameParts] =
    account?.name.trim().split(/\s+/).filter(Boolean) ?? [];
  const firstName = firstNameParts.join(" ");

  return (
    <div className="w-full">
      <PageHeader />
      <div className="grid gap-5">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-5 font-semibold">Profil</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Nume
              <input
                className="rounded-lg border border-border px-3 py-2.5 font-normal"
                defaultValue={lastName}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Prenume
              <input
                className="rounded-lg border border-border px-3 py-2.5 font-normal"
                defaultValue={firstName}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <input
                className="rounded-lg border border-border px-3 py-2.5 font-normal"
                defaultValue={account?.email ?? ""}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Scoala
              <input
                className="rounded-lg border border-border px-3 py-2.5 font-normal"
              />
            </label>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-4 font-semibold">Preferinte AI</h2>
          {[
            "Extrage automat deadline-uri",
            "Sugereaza timp estimat",
            "Mod strict (fara inferente AI)",
          ].map((label) => (
            <label
              className="flex items-center gap-3 border-b border-border py-3 last:border-0"
              key={label}
            >
              <input
                type="checkbox"
                defaultChecked={label !== "Mod strict (fara inferente AI)"}
              />
              {label}
            </label>
          ))}
        </section>
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">Aspect</h2>
              <p className="mt-1 text-sm text-muted">
                Alege intre modul luminos si modul intunecat.
              </p>
            </div>
            <label className="flex shrink-0 cursor-pointer items-center gap-3">
              <span className="text-sm font-semibold">
                {isDarkMode ? "Intunecat" : "Luminos"}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                role="switch"
                aria-label="Schimba tema aplicatiei"
                aria-checked={isDarkMode}
                checked={isDarkMode}
                onChange={(event) =>
                  setTheme(event.target.checked ? "dark" : "light")
                }
              />
              <span
                aria-hidden="true"
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isDarkMode ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-surface transition-transform ${
                    isDarkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
            </label>
          </div>
        </section>
        <button
          className="w-fit rounded-lg bg-primary px-4 py-2.5 font-semibold text-surface"
          type="button"
          onClick={() => window.alert("Preferințele au fost salvate.")}
        >
          Salveaza modificarile
        </button>
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-(--color-priority-5)/10 text-sm font-bold text-(--color-priority-5)"
                >
                  !
                </span>
                <h2 className="font-semibold">
                  Zona periculoasă
                </h2>
              </div>
              <p className="mt-2 text-sm text-muted">
                Deconectează contul de pe acest dispozitiv. Vei putea reveni
                oricând autentificându-te din nou.
              </p>
            </div>
            <button
              className="shrink-0 rounded-lg border border-(--color-priority-5)/40 px-4 py-2.5 font-semibold text-(--color-priority-5) transition-colors hover:bg-(--color-priority-5)/10 focus:outline-none focus:ring-4 focus:ring-(--color-priority-5)/15"
              type="button"
              onClick={() => setShowLogoutConfirmation(true)}
            >
              Deconectare
            </button>
          </div>
        </section>
      </div>
      {showLogoutConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogoutConfirmation(false);
            }
          }}
        >
          <section
            aria-describedby="logout-description"
            aria-labelledby="logout-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7"
            role="dialog"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-priority-5)/10 text-lg font-bold text-(--color-priority-5)">
              !
            </div>
            <h2 id="logout-title" className="mt-5 text-xl font-bold">
              Te deconectezi?
            </h2>
            <p id="logout-description" className="mt-2 leading-6 text-muted">
              Vei fi deconectat de pe acest dispozitiv și vei reveni la pagina
              de autentificare.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="rounded-lg border border-border px-4 py-2.5 font-semibold text-ink transition-colors hover:bg-background focus:outline-none focus:ring-4 focus:ring-primary-soft"
                type="button"
                onClick={() => setShowLogoutConfirmation(false)}
              >
                Anulează
              </button>
              <button
                className="rounded-lg bg-(--color-priority-5) px-4 py-2.5 font-semibold text-white transition-colors hover:brightness-90 focus:outline-none focus:ring-4 focus:ring-(--color-priority-5)/20"
                type="button"
                onClick={() => {
                  localStorage.removeItem("edupriority:account");
                  navigate("/login", { replace: true });
                }}
              >
                Da, deconectează-mă
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
