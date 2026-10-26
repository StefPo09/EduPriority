import PageHeader from "../components/materials/PageHeader";

export default function MaterialsPage() {
  const materials = [
    [
      "📄",
      "Test_derivate_2024.pdf",
      "Matematica · clasa a 11-a · Test",
      "245 KB",
    ],
    [
      "📄",
      "Fisa_geometrie_plan.pdf",
      "Matematica · clasa a 10-a · Fisa",
      "180 KB",
    ],
    [
      "📝",
      "Proiect_semestrial.docx",
      "Informatica · clasa a 11-a · Proiect",
      "45 KB",
    ],
  ];
  return (
    <div className="w-full">
      <PageHeader />
      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        <select className="rounded-lg border border-border bg-surface px-3 py-2.5 text-ink">
          <option>Toate materiile</option>
        </select>
        <select className="rounded-lg border border-border bg-surface px-3 py-2.5 text-ink">
          <option>Toate clasele</option>
        </select>
        <select className="rounded-lg border border-border bg-surface px-3 py-2.5 text-ink">
          <option>Toate tipurile</option>
        </select>
      </div>
      <section className="grid gap-3">
        {materials.map(([icon, name, meta, size]) => (
          <article
            className="rounded-xl border border-border bg-surface p-4 sm:p-5"
            key={name}
          >
            <div className="flex gap-3">
              <span className="text-2xl">{icon}</span>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {meta} · {size}
                </p>
                <p className="mt-3 text-sm text-muted">
                  AI: material clasificat automat pe baza continutului.
                </p>
              </div>
              <button className="self-start text-sm font-semibold text-primary">
                Deschide
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
