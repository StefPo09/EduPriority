import { NextResponse } from "next/server";
import { listClasses } from "@/lib/server-requests";

export async function GET() {
  const classes = await listClasses();
  return NextResponse.json(classes);
}
