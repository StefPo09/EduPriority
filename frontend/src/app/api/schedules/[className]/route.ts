import { NextResponse } from "next/server";
import { findSchedule } from "@/lib/server-requests";

export async function GET(
  request: Request,
  context: { params: Promise<{ className: string }> },
) {
  const { className } = await context.params;
  const teacherId = new URL(request.url).searchParams.get("teacherId") ?? undefined;
  const schedule = await findSchedule(decodeURIComponent(className), teacherId);
  return NextResponse.json(schedule);
}
