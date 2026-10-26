import PageHeader from "../components/settings/PageHeader";

export default function SettingsPage() {
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
        <button className="w-fit rounded-lg bg-primary px-4 py-2.5 font-semibold text-surface">
          Salveaza modificarile
        </button>
      </div>
    </div>
  );
}
