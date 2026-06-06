import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { differenceInHours } from "date-fns";

const MIN_HOURS_BEFORE_CANCEL = 24;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "CLIENT") {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!appt) return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });

  // Vérifier que c'est bien le RDV de ce client
  if (appt.client.id !== token.userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (appt.status === "CANCELLED") {
    return NextResponse.json({ error: "Déjà annulé" }, { status: 400 });
  }

  // Vérifier le délai minimum d'annulation
  const hoursUntil = differenceInHours(new Date(appt.date), new Date());
  if (hoursUntil < MIN_HOURS_BEFORE_CANCEL) {
    return NextResponse.json({
      error: `L'annulation doit être faite au moins ${MIN_HOURS_BEFORE_CANCEL}h avant le rendez-vous.`,
    }, { status: 400 });
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true });
}
