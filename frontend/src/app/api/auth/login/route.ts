import { NextResponse } from "next/server";
import { authenticateAccount } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email?.trim() || !body.password) {
    return NextResponse.json(
      { error: "Completează emailul și parola." },
      { status: 400 },
    );
  }

  const account = authenticateAccount(body.email.trim(), body.password);
  if (!account) {
    return NextResponse.json(
      { error: "Email sau parolă incorectă." },
      { status: 401 },
    );
  }

  return NextResponse.json(account);
}
