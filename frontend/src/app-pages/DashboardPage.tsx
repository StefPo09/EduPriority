"use client";

import PageHeader from "../components/dashboard/PageHeader";
import RequestTable from "../components/dashboard/RequestTable";

export default function DashboardPage() {
  return (
    <div className="w-full">
      <PageHeader />
      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <RequestTable />
      </section>
    </div>
  );
}
