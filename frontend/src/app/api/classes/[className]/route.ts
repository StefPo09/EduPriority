import { NextResponse } from "next/server";
import { findClassSummary } from "@/lib/server-requests";

export async function GET(
  request: Request,
  context: { params: Promise<{ className: string }> },
) {
  const { className } = await context.params;
  const teacherId = new URL(request.url).searchParams.get("teacherId") ?? undefined;
  const summary = await findClassSummary(decodeURIComponent(className), teacherId);
  return NextResponse.json(summary);
}
