import { NextResponse } from "next/server";
import { findRequest, updateRequest } from "@/lib/server-requests";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const request = await findRequest(id);
  return request
    ? NextResponse.json(request)
    : NextResponse.json({ error: "Cererea nu a fost găsită." }, { status: 404 });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const updated = await updateRequest(id, body);
  return updated
    ? NextResponse.json(updated)
    : NextResponse.json({ error: "Cererea nu a fost găsită." }, { status: 404 });
}
