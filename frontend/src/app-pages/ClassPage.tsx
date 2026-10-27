"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/class/PageHeader";
import {
  getClassSummary,
  getClasses,
  type ClassSummary,
} from "@/lib/dashboard";

export default function ClassPage() {
  const [className, setClassName] = useState("a 11-a A");
  const [summary, setSummary] = useState<ClassSummary>();
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    void getClasses().then((items) => {
      setClasses(items);
      if (items.length) setClassName(items[0]);
    });
  }, []);

  useEffect(() => {
    void getClassSummary(className).then(setSummary);
  }, [className]);

  return (
    <div className="w-full">
      <PageHeader
        className={className}
        classes={classes}
        onClassChange={setClassName}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [summary?.totalRequests ?? "—", "Cereri totale"],
          [summary?.averageTime ?? "—", "Timp mediu"],
          [summary ? `${summary.resolutionRate}%` : "—", "Rata rezolvare"],
        ].map(([value, label]) => (
          <section
            className="rounded-xl border border-border bg-surface p-5"
            key={label}
          >
            <strong className="block text-xl">{value}</strong>
            <span className="text-sm text-muted">{label}</span>
          </section>
        ))}
      </div>
      <section className="mt-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-4 font-semibold">Top teme</h2>
        {summary?.topics.map((topic) => (
          <div
            className="flex items-center gap-4 border-b border-border py-3 last:border-0"
            key={topic.name}
          >
            <span className="w-40 text-sm">{topic.name}</span>
            <span className="h-2 flex-1 rounded-full bg-primary-soft">
              <span
                className="block h-2 rounded-full bg-primary"
                style={{ width: `${Math.min(topic.count * 4, 100)}%` }}
              />
            </span>
            <span className="w-8 text-right text-sm text-muted">{topic.count}</span>
          </div>
        ))}
        {!summary?.topics.length && <p className="text-sm text-muted">Nu există date pentru această clasă.</p>}
      </section>
    </div>
  );
}
