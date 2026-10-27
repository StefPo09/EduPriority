import { Link } from "react-router";

export default function PageHeader() {
  return (
    <header className="mb-6 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Dashboard prioritizat
        </h1>
        <p className="leading-6 text-muted">
          Cererile sunt sortate după scorul de prioritate
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          className="min-h-10 rounded-lg border border-border bg-surface px-4 py-2.5 font-semibold text-ink hover:border-primary-soft hover:bg-primary-soft hover:text-primary"
          to="/export"
        >
          Export CSV
        </Link>
        <button
          className="min-h-10 rounded-lg border border-border bg-surface px-4 py-2.5 font-semibold text-ink hover:border-primary-soft hover:bg-primary-soft hover:text-primary"
          onClick={() => window.print()}
        >
          Print
        </button>
      </div>
    </header>
  );
}
