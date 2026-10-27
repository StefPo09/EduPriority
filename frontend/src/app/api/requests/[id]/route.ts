import { NextResponse } from "next/server";
import { findRequest } from "@/lib/server-requests";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const request = findRequest(id);
  return request
    ? NextResponse.json(request)
    : NextResponse.json({ error: "Cererea nu a fost găsită." }, { status: 404 });
}
