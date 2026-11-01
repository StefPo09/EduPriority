import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { insertMaterial, listMaterials } from "@/lib/server-requests";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(request: Request) {
  const teacherId = new URL(request.url).searchParams.get("teacherId") ?? undefined;
  const materials = await listMaterials(teacherId);
  return NextResponse.json(materials);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const teacherId = formData.get("teacherId");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Selectează un fișier." },
      { status: 400 },
    );
  }

  try {
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    if (typeof teacherId === "string") backendFormData.append("teacher_id", teacherId);
    const token = (await cookies()).get("edupriority_access_token")?.value;
    const backendRes = await fetch(`${BACKEND_URL}/api/materials`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: backendFormData,
    });
    if (backendRes.ok) {
      return NextResponse.json(await backendRes.json(), { status: 201 });
    }
  } catch {
    // Fallback to local
  }

  return NextResponse.json(
    await insertMaterial({
      name: file.name,
      size: file.size,
      type: file.type,
      teacherId: typeof teacherId === "string" ? teacherId : undefined,
    }),
    { status: 201 },
  );
}
