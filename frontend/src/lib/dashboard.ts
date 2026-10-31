export type Overview = {
  urgent: { critical: number; medium: number; low: number };
  week: {
    received: number;
    resolved: number;
    savedMinutes: number;
    changePercent: number;
  };
};

export type ClassSummary = {
  className: string;
  totalRequests: number;
  averageTime: string;
  resolutionRate: number;
  topics: Array<{ name: string; count: number }>;
};

export type Material = {
  id: string;
  name: string;
  subject: string;
  className: string;
  type: string;
  size: string;
  icon: string;
  teacherId?: string;
};

export type Schedule = {
  className: string;
  slots: Array<{ time: string; subjects: string[]; taughtSubjects?: boolean[] }>;
  curriculum: Array<{ title: string; status: string; subject: string }>;
};

export async function getOverview() {
  const response = await fetch("/api/overview", { cache: "no-store" });
  if (!response.ok) throw new Error("Nu s-au putut încărca statisticile.");
  return response.json() as Promise<Overview>;
}

export async function getClassSummary(className: string, teacherId?: string) {
  const query = teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : "";
  const response = await fetch(
    `/api/classes/${encodeURIComponent(className)}${query}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error("Nu s-au putut încărca datele clasei.");
  return response.json() as Promise<ClassSummary>;
}

export async function getClasses(teacherId?: string) {
  const query = teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : "";
  const response = await fetch(`/api/classes${query}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Nu s-au putut încărca clasele.");
  return response.json() as Promise<string[]>;
}

export async function getMaterials(teacherId?: string) {
  const query = teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : "";
  const response = await fetch(`/api/materials${query}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Nu s-au putut încărca materialele.");
  return response.json() as Promise<Material[]>;
}

export async function getSchedule(className: string, teacherId?: string) {
  const query = teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : "";
  const response = await fetch(
    `/api/schedules/${encodeURIComponent(className)}${query}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error("Nu s-a putut încărca orarul.");
  return response.json() as Promise<Schedule>;
}
