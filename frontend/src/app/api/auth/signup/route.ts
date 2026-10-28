import { NextResponse } from "next/server";
import { createAccount, type AccountRole } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: AccountRole;
  };

  if (
    !body.name?.trim() ||
    !body.email?.trim() ||
    !body.password ||
    body.password.length < 8 ||
    (body.role !== "teacher" && body.role !== "student")
  ) {
    return NextResponse.json(
      {
        error:
          "Completează toate câmpurile. Parola trebuie să aibă cel puțin 8 caractere.",
      },
      { status: 400 },
    );
  }

  const account = createAccount(
    body.name.trim(),
    body.email.trim(),
    body.password,
    body.role,
  );
  if (!account) {
    return NextResponse.json(
      { error: "Există deja un cont cu acest email." },
      { status: 409 },
    );
  }

  return NextResponse.json(account, { status: 201 });
}
