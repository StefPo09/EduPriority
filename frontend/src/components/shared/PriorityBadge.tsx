type Priority = 1 | 2 | 3 | 4 | 5;

const labels: Record<Priority, string> = {
  1: "Minim",
  2: "Scăzută",
  3: "Medie",
  4: "Ridicată",
  5: "Critic",
};

export default function PriorityBadge({
  score,
  showLabel = false,
}: {
  score: Priority;
  showLabel?: boolean;
}) {
  const colors = {
    1: "bg-[var(--color-priority-1)]",
    2: "bg-[var(--color-priority-2)]",
    3: "bg-[var(--color-priority-3)]",
    4: "bg-[var(--color-priority-4)]",
    5: "bg-[var(--color-priority-5)]",
  };
  return (
    <span
      className={`inline-flex min-h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm text-surface ${colors[score]}`}
    >
      <strong>{score}</strong>
      {showLabel && <span className="ml-2">{labels[score]}</span>}
    </span>
  );
}
