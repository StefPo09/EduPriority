import PriorityBadge from "@/components/shared/PriorityBadge";
import { useParams } from "react-router";
import { getRequest } from "@/lib/requests";
import { useEffect, useState } from "react";

export default function RequestDetailContent() {
  const { id } = useParams();
  const [request, setRequest] = useState<Awaited<ReturnType<typeof getRequest>>>();
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

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-5 text-base font-semibold">Cererea elevului</h2>
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
            <strong className="text-ink">Rezumat:</strong> cerere trimisă de{" "}
            {request.student}.
          </p>
          {request.teacher && (
            <p className="mt-2 leading-6 text-muted">
              <strong className="text-ink">Profesor:</strong> {request.teacher}
            </p>
          )}
        </section>
        <section className="rounded-xl border border-primary-soft bg-primary-soft p-5 sm:p-6">
          <h2 className="mb-5 text-base font-semibold">Sugestie</h2>
          <p className="leading-6 text-muted">
            <strong className="text-ink">Timp estimat:</strong>
            <br />
            De stabilit
          </p>
          <p className="leading-6 text-muted">
            <strong className="text-ink">Acțiune:</strong>
            <br />
            Verifică cererea și stabilește următorul pas.
          </p>
          <p className="border-t border-border pt-4 leading-6 text-muted">
            Deadline: {request.deadline}
          </p>
          <PriorityBadge score={request.priority} showLabel />
        </section>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <button className="min-h-10 rounded-lg bg-primary px-4 font-semibold text-surface hover:brightness-90">
          Marchează rezolvat
        </button>
        <button className="min-h-10 rounded-lg border border-border bg-surface px-4 font-semibold text-ink hover:border-primary-soft hover:bg-primary-soft hover:text-primary">
          Schimbă prioritatea
        </button>
      </div>
    </>
  );
}
