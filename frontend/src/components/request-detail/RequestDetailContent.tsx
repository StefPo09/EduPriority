import PriorityBadge, { type Priority } from "@/components/shared/PriorityBadge";
import { useParams } from "react-router";
import { getRequest, updateRequest } from "@/lib/requests";
import { useEffect, useState } from "react";

export default function RequestDetailContent() {
  const { id } = useParams();
  const [request, setRequest] = useState<Awaited<ReturnType<typeof getRequest>>>();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) void getRequest(id).then(setRequest);
  }, [id]);

  if (!request) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6 text-muted">
        Cererea nu a fost găsită.
      </section>
    );
  }

  const isResolved = request.status === "resolved";

  async function toggleResolved() {
    if (!request || isUpdating) return;
    setIsUpdating(true);
    try {
      const nextStatus = isResolved ? "pending" : "resolved";
      const updated = await updateRequest(request.id, { status: nextStatus });
      setRequest(updated);
      window.dispatchEvent(new Event("edupriority:requests-updated"));
    } finally {
      setIsUpdating(false);
    }
  }

  async function cyclePriority() {
    if (!request || isUpdating) return;
    setIsUpdating(true);
    try {
      const nextPriority = ((request.priority % 5) + 1) as Priority;
      const updated = await updateRequest(request.id, { priority: nextPriority });
      setRequest(updated);
      window.dispatchEvent(new Event("edupriority:requests-updated"));
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Cererea elevului</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isResolved
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
              }`}
            >
              {isResolved ? "Rezolvat" : "În așteptare"}
            </span>
          </div>
          <p className="leading-6 text-muted">
            {request.text}
          </p>
          <h2 className="mb-5 mt-7 text-base font-semibold">Clasificare AI</h2>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-primary-soft px-2.5 py-2 text-sm font-semibold text-primary">
              {request.subject}
            </span>
            <span className="rounded-md bg-primary-soft px-2.5 py-2 text-sm font-semibold text-primary">
              {request.type}
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-muted">
            <span>Prioritate: {request.priority} din 5</span>
          </div>
          <p className="leading-6 text-muted">
            <strong className="text-ink">Rezumat:</strong> {request.aiSummary || `cerere trimisă de ${request.student}.`}
          </p>
          {request.teacher && (
            <p className="mt-2 leading-6 text-muted">
              <strong className="text-ink">Profesor:</strong> {request.teacher}
            </p>
          )}
        </section>
        <section className="rounded-xl border border-primary-soft bg-primary-soft p-5 sm:p-6">
          <h2 className="mb-5 text-base font-semibold">Sugestie AI</h2>
          <p className="leading-6 text-muted">
            <strong className="text-ink">Timp estimat:</strong>
            <br />
            {request.estimatedTime || "20 min"}
          </p>
          <p className="leading-6 text-muted">
            <strong className="text-ink">Acțiune recomandată:</strong>
            <br />
            {request.suggestedAction || "Verifică cererea și stabilește următorul pas."}
          </p>
          <p className="border-t border-border pt-4 leading-6 text-muted">
            Deadline: {request.deadline}
          </p>
          <PriorityBadge score={request.priority} showLabel />
        </section>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <button
          className="min-h-10 rounded-lg bg-primary px-4 font-semibold text-surface hover:brightness-90 disabled:opacity-60"
          disabled={isUpdating}
          onClick={() => void toggleResolved()}
          type="button"
        >
          {isResolved ? "Redeschide cererea" : "Marchează rezolvat"}
        </button>
        <button
          className="min-h-10 rounded-lg border border-border bg-surface px-4 font-semibold text-ink hover:border-primary-soft hover:bg-primary-soft hover:text-primary disabled:opacity-60"
          disabled={isUpdating}
          onClick={() => void cyclePriority()}
          type="button"
        >
          Schimbă prioritatea ({request.priority} → {(request.priority % 5) + 1})
        </button>
      </div>
    </>
  );
}
