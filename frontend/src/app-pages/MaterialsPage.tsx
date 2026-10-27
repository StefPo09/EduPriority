"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/materials/PageHeader";
import { getMaterials, type Material } from "@/lib/dashboard";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [uploadError, setUploadError] = useState("");

  async function upload(file: File) {
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/materials", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      setUploadError("Materialul nu a putut fi încărcat.");
      return;
    }
    const material = (await response.json()) as Material;
    setMaterials((current) => [material, ...current]);
  }
  useEffect(() => {
    void getMaterials().then(setMaterials);
  }, []);

  return (
    <div className="w-full">
      <PageHeader onUpload={upload} />
      {uploadError && <p className="mb-4 text-sm text-(--color-priority-5)">{uploadError}</p>}
      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        <select className="rounded-lg border border-border bg-surface px-3 py-2.5 text-ink">
          <option>Toate materiile</option>
        </select>
        <select className="rounded-lg border border-border bg-surface px-3 py-2.5 text-ink">
          <option>Toate clasele</option>
        </select>
        <select className="rounded-lg border border-border bg-surface px-3 py-2.5 text-ink">
          <option>Toate tipurile</option>
        </select>
      </div>
      <section className="grid gap-3">
        {materials.map((material) => (
          <article
            className="rounded-xl border border-border bg-surface p-4 sm:p-5"
            key={material.id}
          >
            <div className="flex gap-3">
              <span className="text-2xl">{material.icon}</span>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{material.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {material.subject} · {material.className} · {material.type} ·{" "}
                  {material.size}
                </p>
              </div>
              <button className="self-start text-sm font-semibold text-primary">
                Deschide
              </button>
            </div>
          </article>
        ))}
        {materials.length === 0 && (
          <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
            Nu există materiale în baza de date.
          </p>
        )}
      </section>
    </div>
  );
}
