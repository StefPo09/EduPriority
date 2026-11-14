import { NextResponse } from "next/server";
import { listClasses } from "@/lib/server-requests";

export async function GET(request: Request) {
  const teacherId = new URL(request.url).searchParams.get("teacherId") ?? undefined;
  const classes = await listClasses(teacherId);
  return NextResponse.json(classes);
}
