import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const blockedDays = await prisma.blockedDay.findMany({
    where: {
      ...(from && to
        ? { date: { gte: new Date(from), lte: new Date(to) } }
        : {}),
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ blockedDays });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, reason, label } = body;

  const blockedDay = await prisma.blockedDay.upsert({
    where: { date: startOfDay(new Date(date)) },
    create: { date: startOfDay(new Date(date)), reason, label },
    update: { reason, label },
  });

  return NextResponse.json({ blockedDay });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "Missing date" }, { status: 400 });

  await prisma.blockedDay.deleteMany({
    where: {
      date: {
        gte: startOfDay(new Date(date)),
        lte: endOfDay(new Date(date)),
      },
    },
  });

  return NextResponse.json({ success: true });
}
