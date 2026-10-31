import { NextResponse } from "next/server";
import { getOverview } from "@/lib/server-requests";

export async function GET() {
  const overview = await getOverview();
  return NextResponse.json(overview);
}
