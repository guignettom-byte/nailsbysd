import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { sendReminderSMS } from "@/lib/sms";
import { addHours } from "date-fns";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.NEXTAUTH_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 48h email reminders
  const toEmail = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      reminderSent: false,
      date: { gte: addHours(now, 48), lte: addHours(now, 49) },
    },
    include: { service: true, client: true },
  });

  for (const appt of toEmail) {
    try {
      await sendReminderEmail({
        firstName: appt.client.firstName,
        lastName: appt.client.lastName,
        email: appt.client.email,
        phone: appt.client.phone,
        serviceName: appt.service.name,
        date: appt.date,
        endTime: appt.endTime,
      });
      await prisma.appointment.update({ where: { id: appt.id }, data: { reminderSent: true } });
    } catch (e) {
      console.error(`Email reminder failed for ${appt.id}:`, e);
    }
  }

  // 24h SMS reminders
  const toSms = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      smsSent: false,
      date: { gte: addHours(now, 24), lte: addHours(now, 25) },
    },
    include: { service: true, client: true },
  });

  for (const appt of toSms) {
    try {
      await sendReminderSMS(appt.client.phone, appt.client.firstName, appt.date, appt.service.name);
      await prisma.appointment.update({ where: { id: appt.id }, data: { smsSent: true } });
    } catch (e) {
      console.error(`SMS reminder failed for ${appt.id}:`, e);
    }
  }

  return NextResponse.json({ emailsSent: toEmail.length, smsSent: toSms.length });
}
