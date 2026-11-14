"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [taughtSubjects, setTaughtSubjects] = useState<string[]>([]);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "login" : "signup";
      const response = await fetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          school: role === "teacher" ? school : undefined,
          class_name: role === "student" ? className.trim() || undefined : undefined,
          subjects: role === "teacher" ? taughtSubjects : [],
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        id?: string;
        name?: string;
        email?: string;
        role?: "teacher" | "student";
        school?: string;
        class_name?: string;
        subjects?: string[];
      };
      if (!response.ok) throw new Error(result.error ?? "A apărut o eroare.");
      if (mode === "signup") {
        navigate("/login");
        return;
      }
      if (result.id && result.name && result.email && result.role) {
        localStorage.setItem(
          "edupriority:account",
          JSON.stringify({
            id: result.id,
            name: result.name,
            email: result.email,
            role: result.role,
            school: result.school,
            className: result.class_name,
            subjects: result.subjects ?? [],
          }),
        );
      }
      navigate("/home");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "A apărut o eroare.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <fieldset className="grid gap-2 text-sm font-semibold">
        <legend>Tip cont</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["student", "teacher"] as const).map((option) => (
            <label
              className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center ${
                role === option
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border"
              }`}
              key={option}
            >
              <input
                className="sr-only"
                type="radio"
                name="role"
                value={option}
                checked={role === option}
                onChange={() => setRole(option)}
              />
              {option === "student" ? "Elev" : "Profesor"}
            </label>
          ))}
        </div>
      </fieldset>
      {mode === "signup" && (
        <>
          <label className="grid gap-2 text-sm font-semibold">
            Nume
            <input
              className="rounded-lg border border-border px-3 py-2.5 font-normal outline-none"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          {role === "teacher" && (
            <>
              <label className="grid gap-2 text-sm font-semibold">
                Școala
                <input
                  className="rounded-lg border border-border px-3 py-2.5 font-normal outline-none"
                  value={school}
                  onChange={(event) => setSchool(event.target.value)}
                  required
                />
              </label>
              <fieldset className="grid gap-2 text-sm font-semibold">
                <legend>Materii predate</legend>
                <input
                  className="rounded-lg border border-border px-3 py-2.5 font-normal outline-none"
                  placeholder="Scrie materia și apasă Enter..."
                  value={subjectSearch}
                  onChange={(event) => setSubjectSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    const subject = subjectSearch.trim();
                    if (
                      subject &&
                      !taughtSubjects.some(
                        (item) => item.toLocaleLowerCase("ro") === subject.toLocaleLowerCase("ro"),
                      )
                    ) {
                      setTaughtSubjects([...taughtSubjects, subject]);
                      setSubjectSearch("");
                    }
                  }}
                />
                <div className="flex min-h-11 flex-wrap gap-2 rounded-lg border border-border p-2">
                  {taughtSubjects.map((subject) => (
                    <span
                      className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-normal text-primary"
                      key={subject}
                    >
                      {subject}
                      <button
                        type="button"
                        aria-label={`Elimină ${subject}`}
                        className="cursor-pointer px-1 text-base font-bold leading-none text-(--color-priority-5)"
                        onClick={() =>
                          setTaughtSubjects(
                            taughtSubjects.filter((item) => item !== subject),
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <span className="text-xs font-normal text-muted">
                  Introdu fiecare materie și apasă Enter pentru a o adăuga.
                </span>
              </fieldset>
            </>
          )}
          {role === "student" && (
            <label className="grid gap-2 text-sm font-semibold">
              Clasa
              <input
                className="rounded-lg border border-border px-3 py-2.5 font-normal outline-none"
                list="signup-classes"
                placeholder="Ex.: Clasa a 11-a A (opțional)"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
              />
              <datalist id="signup-classes">
                <option value="Clasa a 11-a A" />
                <option value="Clasa a 11-a B" />
                <option value="Clasa a 12-a A" />
                <option value="Clasa a 12-a B" />
                <option value="Clasa a 10-a C" />
              </datalist>
              <span className="text-xs font-normal text-muted">
                Poți scrie clasa; dacă lași câmpul gol, vei primi una aleatoriu.
              </span>
            </label>
          )}
        </>
      )}
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input
          className="rounded-lg border border-border px-3 py-2.5 font-normal outline-none"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Parolă
        <div className="flex rounded-lg border border-border focus-within:ring-4 focus-within:ring-primary-soft">
          <input
            className="min-w-0 flex-1 px-3 py-2.5 font-normal outline-none"
            type={showPassword ? "text" : "password"}
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            className="cursor-pointer px-3 text-muted hover:text-primary"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
            title={showPassword ? "Ascunde parola" : "Arată parola"}
          >
            {showPassword ? (
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3l18 18M10.58 10.58a2 2 0 002.84 2.84M9.88 4.24A10.7 10.7 0 0112 4c5 0 8.5 4 9.5 6a16.7 16.7 0 01-3.13 3.86M6.61 6.61C4.8 7.72 3.54 9.25 2.5 10c1 2 4.5 6 9.5 6a10.7 10.7 0 003.15-.47"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            )}
          </button>
        </div>
      </label>
      {error && (
        <p className="text-sm text-(--color-priority-5)">{error}</p>
      )}
      <button
        className="mt-2 min-h-10 rounded-lg bg-primary px-4 font-semibold text-surface disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading
          ? "Se încarcă..."
          : mode === "login"
            ? "Autentificare"
            : "Creează cont"}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? "Nu ai cont? " : "Ai deja un cont? "}
        <Link
          className="font-semibold text-primary"
          to={mode === "login" ? "/signup" : "/login"}
        >
          {mode === "login" ? "Înregistrare" : "Autentificare"}
        </Link>
      </p>
    </form>
  );
}
