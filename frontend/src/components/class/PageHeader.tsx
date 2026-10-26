export default function PageHeader() {
  return (
    <header className="mb-6 flex justify-between gap-4">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Clasa: a 11-a A
        </h1>
        <p className="text-muted">Tipare din cererile primite de la elevi.</p>
      </div>
      <select className="h-10 rounded-lg border border-border bg-surface px-3">
        <option>a 11-a A</option>
        <option>a 10-a A</option>
      </select>
    </header>
  );
}
