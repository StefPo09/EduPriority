import { NextResponse } from "next/server";
import { insertMaterial, listMaterials } from "@/lib/server-requests";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET() {
  const materials = await listMaterials();
  return NextResponse.json(materials);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Selectează un fișier." },
      { status: 400 },
    );
  }

  try {
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    const backendRes = await fetch(`${BACKEND_URL}/api/materials`, {
      method: "POST",
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
    }),
    { status: 201 },
  );
}
