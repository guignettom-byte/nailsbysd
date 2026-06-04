import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const hours = await prisma.workingHours.findMany({ orderBy: { dayOfWeek: "asc" } });
  return NextResponse.json({ hours });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const workingHour = await prisma.workingHours.create({ data: body });
  return NextResponse.json({ workingHour });
}
