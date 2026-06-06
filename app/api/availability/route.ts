import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isBefore,
  startOfDay,
  addDays,
} from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "2026-06"
  const serviceId = searchParams.get("serviceId");

  if (!month || !serviceId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const [year, monthNum] = month.split("-").map(Number);
  const monthStart = startOfMonth(new Date(year, monthNum - 1));
  const monthEnd = endOfMonth(monthStart);
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const unavailableDates: string[] = [];

  for (const day of days) {
    // Skip past days
    if (isBefore(day, tomorrow)) continue;
    // Skip Sundays
    if (day.getDay() === 0) continue;

    const slots = await getAvailableSlots(day, service.duration);
    const hasAvailable = slots.some((s) => s.available);

    if (!hasAvailable) {
      unavailableDates.push(format(day, "yyyy-MM-dd"));
    }
  }

  return NextResponse.json({ unavailableDates });
}
