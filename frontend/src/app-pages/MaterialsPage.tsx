"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/materials/PageHeader";
import { getClasses, getMaterials, type Material } from "@/lib/dashboard";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Toate materiile");
  const [selectedClass, setSelectedClass] = useState("Toate clasele");
  const [selectedType, setSelectedType] = useState("Toate tipurile");
  const [classes, setClasses] = useState<string[]>([]);
  const [teacherSubjects] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const account = JSON.parse(
        localStorage.getItem("edupriority:account") ?? "{}",
      ) as { subjects?: string[] };
      return account.subjects ?? [];
    } catch {
      return [];
    }
  });
  const [teacherId] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    try {
      const account = JSON.parse(
        localStorage.getItem("edupriority:account") ?? "{}",
      ) as { id?: string; role?: "teacher" | "student" };
      return account.role === "teacher" ? account.id : undefined;
    } catch {
      return undefined;
    }
  });

  async function upload(file: File) {
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    if (teacherId) formData.append("teacherId", teacherId);
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
    void Promise.all([
      getMaterials(teacherId),
      getClasses(teacherId),
    ]).then(([loadedMaterials, loadedClasses]) => {
      setMaterials(loadedMaterials);
      setClasses(loadedClasses);
    });
  }, [teacherId]);

  const subjects = Array.from(
    new Set([
      ...teacherSubjects,
      ...materials.map((material) => material.subject),
    ]),
  );
  const types = Array.from(new Set(materials.map((material) => material.type)));
  const filteredMaterials = materials.filter(
    (material) =>
      (selectedSubject === "Toate materiile" ||
        material.subject === selectedSubject) &&
      (selectedClass === "Toate clasele" ||
        material.className === selectedClass) &&
      (selectedType === "Toate tipurile" || material.type === selectedType),
  );

  return (
    <div className="w-full">
      <PageHeader onUpload={upload} />
      {uploadError && <p className="mb-4 text-sm text-(--color-priority-5)">{uploadError}</p>}
      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        <select
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-ink"
          value={selectedSubject}
          onChange={(event) => setSelectedSubject(event.target.value)}
        >
          <option>Toate materiile</option>
          {subjects.map((subject) => <option key={subject}>{subject}</option>)}
        </select>
        <select
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-ink"
          value={selectedClass}
          onChange={(event) => setSelectedClass(event.target.value)}
        >
          <option>Toate clasele</option>
          {classes.map((className) => <option key={className}>{className}</option>)}
        </select>
        <select
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-ink"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
        >
          <option>Toate tipurile</option>
          {types.map((type) => <option key={type}>{type}</option>)}
        </select>
      </div>
      <section className="grid gap-3">
        {filteredMaterials.map((material) => (
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
        {filteredMaterials.length === 0 && (
          <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
            Nu există materiale în baza de date.
          </p>
        )}
      </section>
    </div>
  );
}
