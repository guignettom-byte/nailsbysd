import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireAdmin(): Promise<true | null> {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") return null;
  return true;
}
