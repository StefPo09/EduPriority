import RequestForm from "../components/new-request/RequestForm";
import RequestResult from "../components/new-request/RequestResult";
import PageHeader from "../components/new-request/PageHeader";

export default function NewRequestPage() {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <section>
        <PageHeader />
        <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <RequestForm />
        </div>
      </section>
      <RequestResult />
    </div>
  );
}
