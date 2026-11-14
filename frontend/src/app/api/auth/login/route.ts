import { NextResponse } from "next/server";
import { authenticateAccount, type AccountRole } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    role?: AccountRole;
  };

  if (
    !body.email?.trim() ||
    !body.password ||
    (body.role !== "teacher" && body.role !== "student")
  ) {
    return NextResponse.json(
      { error: "Completează emailul și parola." },
      { status: 400 },
    );
  }

  const account = await authenticateAccount(body.email.trim(), body.password, body.role);
  if (!account) {
    return NextResponse.json(
      { error: "Email sau parolă incorectă." },
      { status: 401 },
    );
  }

  const safeAccount = { ...account } as typeof account & {
    accessToken?: string;
    access_token?: string;
  };
  delete safeAccount.accessToken;
  delete safeAccount.access_token;
  const response = NextResponse.json(safeAccount);
  if ("accessToken" in account && account.accessToken) {
    response.cookies.set("edupriority_access_token", account.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }
  return response;
}
