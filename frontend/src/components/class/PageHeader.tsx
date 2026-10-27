export default function PageHeader({
  className,
  classes,
  onClassChange,
}: {
  className: string;
  classes: string[];
  onClassChange: (value: string) => void;
}) {
  return (
    <header className="mb-6 flex justify-between gap-4">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Clasa: {className}
        </h1>
        <p className="text-muted">Tipare din cererile primite de la elevi.</p>
      </div>
      <select
        className="h-10 rounded-lg border border-border bg-surface px-3"
        value={className}
        onChange={(event) => onClassChange(event.target.value)}
      >
        {classes.map((availableClass) => (
          <option key={availableClass}>{availableClass}</option>
        ))}
      </select>
    </header>
  );
}
