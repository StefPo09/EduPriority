import { NextResponse } from "next/server";
import { insertRequest, listRequests } from "@/lib/server-requests";
import type { StudentRequest } from "@/lib/requests";

export function GET() {
  return NextResponse.json(listRequests());
}

export async function POST(request: Request) {
  const input = (await request.json()) as Omit<StudentRequest, "id" | "createdAt">;
  if (!input.student?.trim() || !input.deadline || !input.text?.trim()) {
    return NextResponse.json({ error: "Câmpuri obligatorii lipsă." }, { status: 400 });
  }
  return NextResponse.json(insertRequest(input), { status: 201 });
}
