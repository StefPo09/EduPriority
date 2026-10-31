import type { StudentRequest } from "./requests";

export type Material = {
  id: string;
  name: string;
  subject: string;
  className: string;
  type: string;
  size: string;
  icon: string;
};

export type ClassSummary = {
  className: string;
  totalRequests: number;
  averageTime: string;
  resolutionRate: number;
  topics: { name: string; count: number }[];
};

export type Schedule = {
  className: string;
  slots: Array<{ time: string; subjects: string[] }>;
  curriculum: Array<{ title: string; status: string }>;
};

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const requests: StudentRequest[] = [];
const materials: Material[] = [];
const classSummaries: ClassSummary[] = [];
const schedules: Schedule[] = [];

/*
 * Connected to Python FastAPI backend at BACKEND_URL.
 * Includes graceful fallback if backend is offline.
 */
export async function listRequests(): Promise<StudentRequest[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/requests`, { cache: "no-store" });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Backend offline, fallback
  }

  return [...requests].sort(
    (first, second) => second.priority - first.priority,
  );
}

export async function findRequest(id: string): Promise<StudentRequest | undefined> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/requests/${id}`, { cache: "no-store" });
    if (response.ok) {
      return await response.json();
    }
    if (response.status === 404) return undefined;
  } catch {
    // Backend offline, fallback
  }

  return requests.find((request) => request.id === id);
}

export async function insertRequest(
  input: Omit<StudentRequest, "id" | "createdAt">,
): Promise<StudentRequest> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Backend offline, fallback
  }

  const request: StudentRequest = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  requests.unshift(request);
  return request;
}

export async function updateRequest(
  id: string,
  updates: Partial<StudentRequest> & { status?: string },
): Promise<StudentRequest | undefined> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Backend offline, fallback
  }

  const req = requests.find((r) => r.id === id);
  if (req) {
    Object.assign(req, updates);
  }
  return req;
}

export async function listMaterials(): Promise<Material[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/materials`, { cache: "no-store" });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Backend offline, fallback
  }

  return materials;
}

export async function insertMaterial(file: {
  name: string;
  size: number;
  type: string;
}): Promise<Material> {
  const material: Material = {
    id: crypto.randomUUID(),
    name: file.name,
    subject: "Nespecificată",
    className: "Nespecificată",
    type: file.type || "Fișier",
    size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    icon: "📄",
  };
  materials.unshift(material);
  return material;
}

export async function findClassSummary(className: string): Promise<ClassSummary> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/classes/${encodeURIComponent(className)}`, { cache: "no-store" });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Backend offline, fallback
  }

  return (
    classSummaries.find((summary) => summary.className === className) ?? {
      className,
      totalRequests: 0,
      averageTime: "—",
      resolutionRate: 0,
      topics: [],
    }
  );
}

export async function listClasses(): Promise<string[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/classes`, { cache: "no-store" });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Backend offline, fallback
  }

  return classSummaries.map((summary) => summary.className);
}

export async function findSchedule(className: string): Promise<Schedule> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/schedules/${encodeURIComponent(className)}`, { cache: "no-store" });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Backend offline, fallback
  }

  return (
    schedules.find((schedule) => schedule.className === className) ?? {
      className,
      slots: [],
      curriculum: [],
    }
  );
}

export async function getOverview() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/overview`, { cache: "no-store" });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Backend offline, fallback
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayRequests = requests.filter(
    (request) => request.deadline === today,
  );
  const currentWeek = requests.filter((request) => {
    const created = new Date(request.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo;
  });

  return {
    urgent: {
      critical: todayRequests.filter((request) => request.priority === 5).length,
      medium: todayRequests.filter((request) => request.priority === 3).length,
      low: todayRequests.filter((request) => request.priority <= 2).length,
    },
    week: {
      received: currentWeek.length,
      resolved: 0,
      savedMinutes: 0,
      changePercent: 0,
    },
  };
}
