"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { saveRequest, type RequestType } from "@/lib/requests";

export default function RequestForm() {
  const navigate = useNavigate();
  const [account] = useState<{
    name: string;
    role: "teacher" | "student";
  } | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const storedAccount = localStorage.getItem("edupriority:account");
    if (!storedAccount) return undefined;
    try {
      const parsed = JSON.parse(storedAccount) as {
        name?: string;
        role?: "teacher" | "student";
      };
      return parsed.name && parsed.role
        ? { name: parsed.name, role: parsed.role }
        : undefined;
    } catch {
      return undefined;
    }
  });
  const [student, setStudent] = useState(() =>
    account?.role === "student" ? account.name : "",
  );
  const [type, setType] = useState<RequestType>("Întrebare");
  const [deadline, setDeadline] = useState("");
  const [text, setText] = useState("");
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const [teacherId, setTeacherId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/teachers")
      .then((response) => response.json())
      .then((items: Array<{ id: string; name: string }>) => {
        setTeachers(items);
        setTeacherId(items[0]?.id ?? "");
      });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!student.trim() || !deadline || !text.trim()) return;
    if (!teacherId) {
      setError("Nu există niciun profesor disponibil.");
      return;
    }

    const teacher = teachers.find((item) => item.id === teacherId);
    try {
      const request = await saveRequest({
        student: student.trim(),
        type,
        deadline,
        text: text.trim(),
        subject: "Nespecificată",
        priority: 3,
        teacherId,
        teacher: teacher?.name,
      });
      window.dispatchEvent(new Event("edupriority:requests-updated"));
      navigate(`/requests/${request.id}`);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Cererea nu a putut fi salvată.",
      );
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        {account?.role !== "student" && (
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
        )}
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Profesor
          <select
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
            value={teacherId}
            onChange={(event) => setTeacherId(event.target.value)}
            required
          >
            {teachers.length === 0 ? (
              <option value="">Niciun profesor disponibil</option>
            ) : (
              teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))
            )}
          </select>
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
        {account?.role === "student" ? "Întrebarea ta" : "Text cerere"}
        <textarea
          className="min-h-36 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 leading-6 text-ink outline-none placeholder:text-muted/80 focus:border-primary focus:ring-4 focus:ring-primary-soft"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={
            account?.role === "student"
              ? "Scrie întrebarea pentru profesor..."
              : "Lipește aici cererea elevului..."
          }
          rows={7}
          required
        />
      </label>
      <div className="flex flex-wrap items-center gap-2.5">
        {error && <p className="w-full text-sm text-(--color-priority-5)">{error}</p>}
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
