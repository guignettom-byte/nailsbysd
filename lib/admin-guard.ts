import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { redirect } from "next/navigation";

export async function getAdminToken() {
  const cookieStore = await cookies();
  const raw =
    cookieStore.get("next-auth.session-token")?.value ||
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  if (!raw) return null;

  try {
    return await decode({ token: raw, secret: process.env.NEXTAUTH_SECRET! });
  } catch {
    return null;
  }
}

/** Use in server pages/components that require admin. Redirects if not admin. */
export async function requireAdmin() {
  const token = await getAdminToken();
  const isAdmin = (token as { role?: string } | null)?.role === "ADMIN";
  if (!isAdmin) redirect("/admin/login");
  return token;
}
