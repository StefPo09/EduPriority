export default function PageHeader() {
  return (
    <header className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Buna dimineata, Matei!
        </h1>
        <p className="text-muted">Privire de ansamblu pentru ziua de azi.</p>
      </div>
      <span className="text-sm text-muted">Astazi, 25 octombrie</span>
    </header>
  );
}
