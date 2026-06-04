import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSlotAvailable } from "@/lib/availability";
import { sendConfirmationEmail, sendAdminNotification } from "@/lib/email";
import { createCalendarEvent } from "@/lib/google-calendar";
import { addMinutes } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, comment, serviceId, date: dateStr } = body;

    if (!firstName || !lastName || !email || !phone || !serviceId || !dateStr) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: "Prestation introuvable" }, { status: 404 });
    }

    const date = new Date(dateStr);
    const endTime = addMinutes(date, service.duration);

    const available = await isSlotAvailable(date, service.duration);
    if (!available) {
      return NextResponse.json({ error: "Ce créneau n'est plus disponible" }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        comment,
        serviceId,
        date,
        endTime,
        status: "CONFIRMED",
      },
    });

    // Send emails (non-blocking)
    const emailData = {
      firstName,
      lastName,
      email,
      phone,
      serviceName: service.name,
      date,
      endTime,
    };

    Promise.all([
      sendConfirmationEmail(emailData).catch(console.error),
      sendAdminNotification(emailData).catch(console.error),
      createCalendarEvent({
        summary: `RDV — ${firstName} ${lastName} (${service.name})`,
        description: `Tel: ${phone}\nEmail: ${email}${comment ? `\nNote: ${comment}` : ""}`,
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

// Admin: list appointments
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(status && { status }),
      ...(from && { date: { gte: new Date(from) } }),
      ...(to && { date: { lte: new Date(to) } }),
    },
    include: { service: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ appointments });
}
