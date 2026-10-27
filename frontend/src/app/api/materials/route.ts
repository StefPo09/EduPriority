import { NextResponse } from "next/server";
import { insertMaterial, listMaterials } from "@/lib/server-requests";

export function GET() {
  return NextResponse.json(listMaterials());
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

  return NextResponse.json(
    insertMaterial({
      name: file.name,
      size: file.size,
      type: file.type,
    }),
    { status: 201 },
  );
}
