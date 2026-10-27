"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { saveRequest, type RequestType } from "@/lib/requests";

export default function RequestForm() {
  const navigate = useNavigate();
  const [student, setStudent] = useState("");
  const [type, setType] = useState<RequestType>("Întrebare");
  const [deadline, setDeadline] = useState("");
  const [text, setText] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!student.trim() || !deadline || !text.trim()) return;

    const request = await saveRequest({
      student: student.trim(),
      type,
      deadline,
      text: text.trim(),
      subject: "Nespecificată",
      priority: 3,
    });
    window.dispatchEvent(new Event("edupriority:requests-updated"));
    navigate(`/requests/${request.id}`);
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Elev
          <input
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-ink outline-none placeholder:text-muted/80 focus:border-primary focus:ring-4 focus:ring-primary-soft"
            placeholder="Nume elev"
            value={student}
            onChange={(event) => setStudent(event.target.value)}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Tip
          <select
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
            value={type}
            onChange={(event) => setType(event.target.value as RequestType)}
          >
            <option>Întrebare</option>
            <option>Temă</option>
            <option>Recuperare</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Deadline
          <input
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            required
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Text cerere
        <textarea
          className="min-h-36 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 leading-6 text-ink outline-none placeholder:text-muted/80 focus:border-primary focus:ring-4 focus:ring-primary-soft"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Lipește aici cererea elevului..."
          rows={7}
          required
        />
      </label>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          className="min-h-10 rounded-lg bg-primary px-4 font-semibold text-surface hover:brightness-90"
          type="submit"
        >
          Clasifică cu AI
        </button>
      </div>
    </form>
  );
}
