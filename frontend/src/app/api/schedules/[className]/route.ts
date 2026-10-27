import { NextResponse } from "next/server";
import { findSchedule } from "@/lib/server-requests";

export async function GET(
  _request: Request,
  context: { params: Promise<{ className: string }> },
) {
  const { className } = await context.params;
  return NextResponse.json(findSchedule(decodeURIComponent(className)));
}
