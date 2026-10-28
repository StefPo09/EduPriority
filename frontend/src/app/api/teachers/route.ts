import { NextResponse } from "next/server";
import { listTeachers } from "@/lib/server-auth";

export function GET() {
  return NextResponse.json(listTeachers());
}
