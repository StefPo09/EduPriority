import {
  getCurrentAccountRequestFilters,
  getRequests,
} from "@/lib/requests";

export default function PageHeader() {
  async function downloadCsv() {
    const requests = await getRequests(getCurrentAccountRequestFilters());
    const escapeCsvValue = (value: string | undefined) =>
      `"${(value ?? "—").replaceAll('"', '""').replace(/\r?\n/g, " ")}"`;
    const rows = [
      ["ID", "Scor", "Cerere", "Materie", "Tip", "Elev", "Profesor", "Status", "Timp estimat", "Deadline", "Creată la", "Rezumat AI", "Acțiune recomandată"],
      ...requests.map((request) => [
        request.id,
        String(request.priority),
        request.text,
        request.subject,
        request.type,
        request.student,
        request.teacher,
        request.status,
        request.estimatedTime,
        request.deadline,
        request.createdAt,
        request.aiSummary,
        request.suggestedAction,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsvValue).join(";")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${csv}\r\n`], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "edupriority-cereri.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

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
        <button
          className="min-h-10 cursor-pointer rounded-lg border border-border bg-surface px-4 py-2.5 font-semibold text-ink hover:border-primary-soft hover:bg-primary-soft hover:text-primary"
          type="button"
          onClick={() => void downloadCsv()}
        >
          Export CSV
        </button>
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
