import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { del } from "@vercel/blob";
import { logger } from "@/lib/logger";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  // Delete from Vercel Blob
  await del(photo.url).catch((e) => logger.error("Blob deletion failed", e, { photoId: id }));

  await prisma.photo.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
