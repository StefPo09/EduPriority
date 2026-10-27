import { NextResponse } from "next/server";
import { listClasses } from "@/lib/server-requests";

export function GET() {
  return NextResponse.json(listClasses());
}
