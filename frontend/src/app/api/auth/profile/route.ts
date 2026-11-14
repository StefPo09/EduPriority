import { NextResponse } from "next/server";
import { updateAccount } from "@/lib/server-auth";

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    id?: string;
    school?: string;
    class_name?: string;
    subjects?: string[];
  };
  if (!body.id || !Array.isArray(body.subjects)) {
    return NextResponse.json({ error: "Date de profil invalide." }, { status: 400 });
  }
  const account = await updateAccount(
    body.id,
    body.school,
    body.subjects,
    body.class_name,
  );
  return account
    ? NextResponse.json(account)
    : NextResponse.json({ error: "Contul nu a fost găsit." }, { status: 404 });
}
