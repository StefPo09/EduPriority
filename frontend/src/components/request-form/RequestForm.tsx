"use client";

import { useState } from "react";
import { useNavigate } from "react-router";

export default function RequestForm() {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/requests/demo");
  }

  return (
    <form className="grid gap-[19px]" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-[1.15fr_.9fr_1fr]">
        <label className="grid gap-2 text-[13px] font-semibold text-ink">
          Elev
          <input className="w-full rounded-lg border border-border bg-surface px-3 py-[11px] text-ink outline-none placeholder:text-muted/80 focus:border-primary focus:ring-4 focus:ring-primary-soft" placeholder="Nume elev" />
        </label>
        <label className="grid gap-2 text-[13px] font-semibold text-ink">
          Tip
          <select className="w-full rounded-lg border border-border bg-surface px-3 py-[11px] text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft" defaultValue="Întrebare">
            <option>Întrebare</option>
            <option>Temă</option>
            <option>Recuperare</option>
          </select>
        </label>
        <label className="grid gap-2 text-[13px] font-semibold text-ink">
          Deadline
          <input className="w-full rounded-lg border border-border bg-surface px-3 py-[11px] text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft" type="date" />
        </label>
      </div>
      <label className="grid gap-2 text-[13px] font-semibold text-ink">
        Text cerere
        <textarea
          className="min-h-[151px] w-full resize-y rounded-lg border border-border bg-surface px-3 py-[11px] leading-6 text-ink outline-none placeholder:text-muted/80 focus:border-primary focus:ring-4 focus:ring-primary-soft"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Lipește aici cererea elevului..."
          rows={7}
        />
      </label>
      <div className="flex flex-wrap items-center gap-2.5">
        <button className="min-h-[42px] rounded-lg bg-primary px-4 font-semibold text-surface hover:brightness-90" type="submit">
          Clasifică cu AI
        </button>
        <button
          className="min-h-[42px] rounded-lg border border-border bg-surface px-4 font-semibold text-ink hover:border-primary-soft hover:bg-primary-soft hover:text-primary"
          type="button"
          onClick={() => setText("Nu înțeleg cum se rezolvă inecuațiile cu modul. Avem test vineri.")}
        >
          Încarcă 20 cereri demo
        </button>
      </div>
    </form>
  );
}
