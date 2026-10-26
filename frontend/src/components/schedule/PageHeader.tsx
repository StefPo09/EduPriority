export default function PageHeader() {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Orar & programa
        </h1>
        <p className="text-muted">Planul saptamanii pentru clasele tale.</p>
      </div>
      <button className="min-h-10 rounded-lg bg-primary px-4 font-semibold text-surface">
        + Adauga ora
      </button>
    </header>
  );
}
