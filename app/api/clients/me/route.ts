import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.clientId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { id: token.clientId as string },
    include: {
      appointments: {
        include: { service: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!client) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const { password: _, ...safeClient } = client;
  return NextResponse.json({ client: safeClient });
}
