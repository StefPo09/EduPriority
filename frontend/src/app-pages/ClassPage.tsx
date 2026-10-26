import PageHeader from "../components/class/PageHeader";

export default function ClassPage() {
  const topics = [
    ["Derivate compuse", "18"],
    ["Geometrie plana", "12"],
    ["Ecuatii logaritmice", "9"],
    ["Vectori", "7"],
    ["Limite", "6"],
  ];
  return (
    <div className="w-full">
      <PageHeader />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["127", "Cereri totale"],
          ["12 min", "Timp mediu"],
          ["84%", "Rata rezolvare"],
        ].map(([value, label]) => (
          <section
            className="rounded-xl border border-border bg-surface p-5"
            key={label}
          >
            <strong className="block text-xl">{value}</strong>
            <span className="text-sm text-muted">{label}</span>
          </section>
        ))}
      </div>
      <section className="mt-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-4 font-semibold">Top teme</h2>
        {topics.map(([topic, count]) => (
          <div
            className="flex items-center gap-4 border-b border-border py-3 last:border-0"
            key={topic}
          >
            <span className="w-40 text-sm">{topic}</span>
            <span className="h-2 flex-1 rounded-full bg-primary-soft">
              <span
                className="block h-2 rounded-full bg-primary"
                style={{ width: `${Number(count) * 4}%` }}
              />
            </span>
            <span className="w-8 text-right text-sm text-muted">{count}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
