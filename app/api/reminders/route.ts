import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { sendReminderSMS } from "@/lib/sms";
import { addHours, isAfter, isBefore } from "date-fns";

// Called by a cron job (e.g., Vercel Cron or external service)
// Secured with a secret header
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.NEXTAUTH_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 48h email reminders
  const in48h = addHours(now, 48);
  const in49h = addHours(now, 49);

  const toEmail = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      reminderSent: false,
      date: { gte: in48h, lte: in49h },
    },
    include: { service: true },
  });

  for (const appt of toEmail) {
    try {
      await sendReminderEmail({
        firstName: appt.firstName,
        lastName: appt.lastName,
        email: appt.email,
        phone: appt.phone,
        serviceName: appt.service.name,
        date: appt.date,
        endTime: appt.endTime,
      });
      await prisma.appointment.update({
        where: { id: appt.id },
        data: { reminderSent: true },
      });
    } catch (e) {
      console.error(`Email reminder failed for ${appt.id}:`, e);
    }
  }

  // 24h SMS reminders
  const in24h = addHours(now, 24);
  const in25h = addHours(now, 25);

  const toSms = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      smsSent: false,
      date: { gte: in24h, lte: in25h },
    },
    include: { service: true },
  });

  for (const appt of toSms) {
    try {
      await sendReminderSMS(appt.phone, appt.firstName, appt.date, appt.service.name);
      await prisma.appointment.update({
        where: { id: appt.id },
        data: { smsSent: true },
      });
    } catch (e) {
      console.error(`SMS reminder failed for ${appt.id}:`, e);
    }
  }

  return NextResponse.json({
    emailsSent: toEmail.length,
    smsSent: toSms.length,
  });
}
