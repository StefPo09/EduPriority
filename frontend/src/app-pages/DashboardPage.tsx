"use client";

import PageHeader from "../components/dashboard/PageHeader";
import RequestTable from "../components/dashboard/RequestTable";

export default function DashboardPage() {
  return (
    <div className="printable-page w-full">
      <PageHeader />
      <section className="printable-requests overflow-hidden rounded-xl border border-border bg-surface">
        <RequestTable />
      </section>
    </div>
  );
}
