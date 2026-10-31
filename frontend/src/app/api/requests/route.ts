import { NextResponse } from "next/server";
import { insertRequest, listRequests } from "@/lib/server-requests";
import { listTeachers } from "@/lib/server-auth";
import type { StudentRequest } from "@/lib/requests";

export async function GET() {
  const requests = await listRequests();
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const input = (await request.json()) as Omit<StudentRequest, "id" | "createdAt">;
  if (!input.student?.trim() || !input.deadline || !input.text?.trim()) {
    return NextResponse.json({ error: "Câmpuri obligatorii lipsă." }, { status: 400 });
  }

  const teachers = await listTeachers();
  if (
    !input.teacherId ||
    !teachers.some((teacher) => teacher.id === input.teacherId)
  ) {
    return NextResponse.json(
      { error: "Selectează un profesor valid." },
      { status: 400 },
    );
  }

  const saved = await insertRequest(input);
  return NextResponse.json(saved, { status: 201 });
}
