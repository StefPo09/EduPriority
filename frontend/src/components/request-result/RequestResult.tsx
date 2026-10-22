import PriorityBadge from "@/components/shared/PriorityBadge";

export default function RequestResult() {
  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-[18px] text-base font-semibold">Rezultat AI</h2>
      <div className="grid grid-cols-1 gap-x-5 gap-y-[17px] sm:grid-cols-2">
        <div className="grid gap-1"><span className="text-[13px] text-muted">Materie</span><strong className="font-semibold">Matematică</strong></div>
        <div className="grid gap-1"><span className="text-[13px] text-muted">Temă</span><strong className="font-semibold">Inecuații cu modul</strong></div>
        <div className="grid gap-1"><span className="text-[13px] text-muted">Dificultate</span><strong className="font-semibold">Medie</strong></div>
        <div className="grid gap-1"><span className="text-[13px] text-muted">Urgență</span><strong className="font-semibold">Ridicată</strong></div>
      </div>
      <p className="my-6 leading-6 text-muted"><strong className="text-ink">Rezumat:</strong> elevul are nevoie de explicații pentru exerciții înaintea testului de vineri.</p>
      <div className="flex items-center gap-3.5 border-t border-border pt-[19px]">
        <PriorityBadge score={4} showLabel />
        <div className="grid gap-1"><strong>Prioritate 4 din 5</strong><span className="text-[13px] text-muted">Timp estimat: 15 min · Acțiune: mini-explicație în clasă</span></div>
      </div>
    </section>
  );
}
