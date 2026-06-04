import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, phone, password } = await req.json();

  if (!firstName || !lastName || !email || !phone || !password) {
    return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  const existing = await prisma.client.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const client = await prisma.client.create({
    data: { firstName, lastName, email, phone, password: hashed },
  });

  return NextResponse.json({ id: client.id, email: client.email });
}
