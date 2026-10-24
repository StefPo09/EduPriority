import RequestForm from "@/components/request-form/RequestForm";
import RequestResult from "@/components/request-result/RequestResult";

export default function NewRequestPage() {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <section>
        <header className="mb-6">
          <h1 className="mb-2 text-2xl font-bold tracking-tight">
            Adaugă cerere
          </h1>
          <p className="leading-6 text-muted">
            Lipește cererea elevului; AI-ul o clasifică în câteva secunde.
          </p>
        </header>
        <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <RequestForm />
        </div>
      </section>
      <RequestResult />
    </div>
  );
}
