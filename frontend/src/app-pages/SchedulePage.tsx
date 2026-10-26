import PageHeader from "../components/schedule/PageHeader";

export default function SchedulePage() {
  const slots = [
    ["8:00", "Matematica"],
    ["9:00", "Matematica"],
    ["10:00", "Romana"],
    ["11:00", "Matematica"],
    ["12:00", "Consultatii"],
  ];
  return (
    <div className="w-full">
      <PageHeader />
      <select className="mb-5 rounded-lg border border-border bg-surface px-3 py-2.5">
        <option>Clasa a 11-a A</option>
        <option>Clasa a 10-a A</option>
      </select>
      <section className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="bg-background text-sm text-muted">
              <th className="border-b border-border p-4">Ora</th>
              {["Luni", "Marti", "Miercuri", "Joi", "Vineri"].map((day) => (
                <th className="border-b border-border p-4" key={day}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map(([time, subject]) => (
              <tr key={time}>
                <td className="border-b border-border p-4 text-sm text-muted">
                  {time}
                </td>
                {[0, 1, 2, 3, 4].map((index) => (
                  <td className="border-b border-border p-4" key={index}>
                    {index === 2 && time === "10:00"
                      ? "Romana"
                      : index === 1 || index === 3
                        ? subject
                        : "Matematica"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="mt-5 rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 font-semibold">Programa clasei</h2>
        {[
          ["Cap. 1: Derivate", "Predat"],
          ["Cap. 2: Integrale", "Curent"],
          ["Cap. 3: Aplicatii", "Urmeaza"],
        ].map(([title, status]) => (
          <div
            className="flex justify-between border-b border-border py-3 last:border-0"
            key={title}
          >
            <span>{title}</span>
            <span className="text-sm text-muted">{status}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
