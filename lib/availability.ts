import { prisma } from "./prisma";
import {
  startOfDay,
  endOfDay,
  addMinutes,
  format,
  isAfter,
  isBefore,
  parseISO,
  setHours,
  setMinutes,
} from "date-fns";

export interface TimeSlot {
  time: string; // "09:00"
  available: boolean;
}

function parseTime(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  let d = setHours(baseDate, hours);
  d = setMinutes(d, minutes);
  return d;
}

export async function getAvailableSlots(
  date: Date,
  serviceDuration: number // in minutes
): Promise<TimeSlot[]> {
  const dayOfWeek = date.getDay();

  // Check if day is blocked
  const blocked = await prisma.blockedDay.findFirst({
    where: {
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
  });

  if (blocked) return [];

  // Get working hours for this day
  const workingHours = await prisma.workingHours.findFirst({
    where: { dayOfWeek, active: true },
  });

  if (!workingHours) return [];

  // Get existing appointments for this day
  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: startOfDay(date), lte: endOfDay(date) },
      status: { not: "CANCELLED" },
    },
    select: { date: true, endTime: true },
  });

  const slots: TimeSlot[] = [];
  const start = parseTime(workingHours.startTime, date);
  const end = parseTime(workingHours.endTime, date);
  const now = new Date();

  let current = start;
  while (isBefore(addMinutes(current, serviceDuration), end) ||
         format(addMinutes(current, serviceDuration), "HH:mm") === workingHours.endTime) {
    const slotEnd = addMinutes(current, serviceDuration);

    // Skip past slots
    if (isBefore(current, now)) {
      current = addMinutes(current, 30);
      continue;
    }

    // Check overlap with existing appointments
    const hasOverlap = appointments.some((appt) => {
      const apptStart = new Date(appt.date);
      const apptEnd = new Date(appt.endTime);
      return (
        (isAfter(current, apptStart) && isBefore(current, apptEnd)) ||
        (isAfter(slotEnd, apptStart) && isBefore(slotEnd, apptEnd)) ||
        (isBefore(current, apptStart) && isAfter(slotEnd, apptEnd)) ||
        format(current, "HH:mm") === format(apptStart, "HH:mm")
      );
    });

    slots.push({
      time: format(current, "HH:mm"),
      available: !hasOverlap,
    });

    current = addMinutes(current, 30);
  }

  return slots;
}

export async function isSlotAvailable(
  date: Date,
  serviceDuration: number
): Promise<boolean> {
  const slots = await getAvailableSlots(date, serviceDuration);
  const timeStr = format(date, "HH:mm");
  const slot = slots.find((s) => s.time === timeStr);
  return slot?.available ?? false;
}
