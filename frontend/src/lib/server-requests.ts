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

const requests: StudentRequest[] = [];
const materials: Material[] = [];
const classSummaries: ClassSummary[] = [];
const schedules: Schedule[] = [];

/*
 * Database boundary:
 * Replace these functions with queries from the database when it is added.
 * The API route already keeps the UI independent from the database client.
 */
export function listRequests() {
  return [...requests].sort(
    (first, second) => second.priority - first.priority,
  );
}

export function findRequest(id: string) {
  return requests.find((request) => request.id === id);
}

export function insertRequest(
  input: Omit<StudentRequest, "id" | "createdAt">,
) {
  const request: StudentRequest = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  requests.unshift(request);
  return request;
}

export function listMaterials() {
  return materials;
}

export function insertMaterial(file: {
  name: string;
  size: number;
  type: string;
}) {
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

export function findClassSummary(className: string) {
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

export function listClasses() {
  return classSummaries.map((summary) => summary.className);
}

export function findSchedule(className: string): Schedule {
  return (
    schedules.find((schedule) => schedule.className === className) ?? {
      className,
      slots: [],
      curriculum: [],
    }
  );
}

export function getOverview() {
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
      critical: todayRequests.filter((request) => request.priority === 5)
        .length,
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
