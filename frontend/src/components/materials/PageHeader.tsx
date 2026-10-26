export default function PageHeader() {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Materiale</h1>
        <p className="text-muted">
          Documentele tale, sortate pe materie, clasa si tema.
        </p>
      </div>
      <label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 font-semibold text-surface">
        Upload
        <input className="sr-only" type="file" />
      </label>
    </header>
  );
}
