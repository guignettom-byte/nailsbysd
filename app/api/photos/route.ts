import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { put } from "@vercel/blob";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const photos = await prisma.photo.findMany({
    where: category && category !== "Tous" ? { category } : {},
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ photos });
}

export async function POST(req: NextRequest) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const serviceId = formData.get("serviceId") as string | null;

  if (!file) return NextResponse.json({ error: "Fichier requis" }, { status: 400 });

  const blob = await put(`gallery/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  const photo = await prisma.photo.create({
    data: {
      url: blob.url,
      title: title || null,
      category: category || "Autre",
      serviceId: serviceId || null,
    },
  });

  return NextResponse.json({ photo });
}
