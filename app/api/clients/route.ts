import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { appointments: true } },
      appointments: {
        select: { price: true, status: true },
      },
    },
  });

  const enriched = clients.map((c) => {
    const { password: _, ...rest } = c;
    const totalSpent = c.appointments
      .filter((a) => a.status !== "CANCELLED")
      .reduce((sum, a) => sum + a.price, 0);
    return { ...rest, totalSpent };
  });

  return NextResponse.json({ clients: enriched });
}
