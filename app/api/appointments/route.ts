import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSlotAvailable } from "@/lib/availability";
import { sendConfirmationEmail, sendAdminNotification } from "@/lib/email";
import { createCalendarEvent } from "@/lib/google-calendar";
import { addMinutes } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "CLIENT") {
      return NextResponse.json({ error: "Connexion requise", redirect: "/connexion" }, { status: 401 });
    }

    const body = await req.json();
    const { serviceId, date: dateStr, comment } = body;

    if (!serviceId || !dateStr) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: token.userId as string } });
    if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Prestation introuvable" }, { status: 404 });

    const date = new Date(dateStr);
    const endTime = addMinutes(date, service.duration);

    const available = await isSlotAvailable(date, service.duration);
    if (!available) {
      return NextResponse.json({ error: "Ce créneau n'est plus disponible" }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        serviceId,
        comment,
        date,
        endTime,
        price: service.price,
        status: "CONFIRMED",
      },
    });

    const emailData = {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      serviceName: service.name,
      date,
      endTime,
    };

    Promise.all([
      sendConfirmationEmail(emailData).catch(console.error),
      sendAdminNotification(emailData).catch(console.error),
      createCalendarEvent({
        summary: `RDV — ${client.firstName} ${client.lastName} (${service.name})`,
        description: `Tel: ${client.phone}\nEmail: ${client.email}${comment ? `\nNote: ${comment}` : ""}`,
        startTime: date,
        endTime,
      }).catch(console.error),
    ]);

    return NextResponse.json({ success: true, id: appointment.id });
  } catch (error) {
    console.error("Appointment creation error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(status && status !== "all" ? { status } : {}),
      ...(from ? { date: { gte: new Date(from) } } : {}),
      ...(to ? { date: { lte: new Date(to) } } : {}),
    },
    include: { service: true, client: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ appointments });
}
