import { NextResponse } from "next/server";
import { findClassSummary } from "@/lib/server-requests";

export async function GET(
  _request: Request,
  context: { params: Promise<{ className: string }> },
) {
  const { className } = await context.params;
  return NextResponse.json(findClassSummary(decodeURIComponent(className)));
}
