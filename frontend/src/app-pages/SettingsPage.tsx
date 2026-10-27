"use client";

import PageHeader from "../components/settings/PageHeader";
import { useTheme } from "@/components/shared/ThemeContext";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

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
                defaultValue="Matei Popescu"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <input
                className="rounded-lg border border-border px-3 py-2.5 font-normal"
                defaultValue="matei@liceu.ro"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Scoala
              <input
                className="rounded-lg border border-border px-3 py-2.5 font-normal"
                defaultValue="Liceul Teoretic Mihai Eminescu"
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
        <button className="w-fit rounded-lg bg-primary px-4 py-2.5 font-semibold text-surface">
          Salveaza modificarile
        </button>
      </div>
    </div>
  );
}
