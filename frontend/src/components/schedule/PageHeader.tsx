export default function PageHeader() {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Orar & programa
        </h1>
        <p className="text-muted">Planul saptamanii pentru clasele tale.</p>
      </div>
    </header>
  );
}
