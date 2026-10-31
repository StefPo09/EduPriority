"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("student");
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
        body: JSON.stringify({ name, email, password, role }),
      });
      const result = (await response.json()) as {
        error?: string;
        id?: string;
        name?: string;
        email?: string;
        role?: "teacher" | "student";
      };
      if (!response.ok) throw new Error(result.error ?? "A apărut o eroare.");
      if (result.id && result.name && result.email && result.role) {
        localStorage.setItem(
          "edupriority:account",
          JSON.stringify({
            id: result.id,
            name: result.name,
            email: result.email,
            role: result.role,
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
      {mode === "signup" && (
        <label className="grid gap-2 text-sm font-semibold">
          Nume
          <input
            className="rounded-lg border border-border px-3 py-2.5 font-normal outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
      )}
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
        <input
          className="rounded-lg border border-border px-3 py-2.5 font-normal outline-none"
          type="password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
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
