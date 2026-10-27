import { NextResponse } from "next/server";
import { getOverview } from "@/lib/server-requests";

export function GET() {
  return NextResponse.json(getOverview());
}
