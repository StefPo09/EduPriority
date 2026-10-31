export type RequestType = "Întrebare" | "Temă" | "Recuperare";
export type Priority = 1 | 2 | 3 | 4 | 5;

export type StudentRequest = {
  id: string;
  student: string;
  type: RequestType;
  deadline: string;
  text: string;
  createdAt: string;
  subject: string;
  priority: Priority;
  teacherId?: string;
  teacher?: string;
  status?: "pending" | "resolved" | string;
  estimatedTime?: string;
  suggestedAction?: string;
  aiSummary?: string;
};

export async function getRequests(): Promise<StudentRequest[]> {
  const response = await fetch("/api/requests", { cache: "no-store" });
  if (!response.ok) throw new Error("Nu s-au putut încărca cererile.");
  return response.json();
}

export async function getRequest(id: string): Promise<StudentRequest | undefined> {
  const response = await fetch(`/api/requests/${id}`, { cache: "no-store" });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error("Nu s-a putut încărca cererea.");
  return response.json();
}

export async function saveRequest(
  request: Omit<StudentRequest, "id" | "createdAt">,
): Promise<StudentRequest> {
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error("Cererea nu a putut fi salvată.");
  return response.json();
}

export async function updateRequest(
  id: string,
  updates: Partial<StudentRequest>,
): Promise<StudentRequest> {
  const response = await fetch(`/api/requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Cererea nu a putut fi actualizată.");
  return response.json();
}
