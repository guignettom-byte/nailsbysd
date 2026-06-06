import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import AdminSidebar from "@/components/admin/AdminSidebar";

async function getAdminToken() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("next-auth.session-token")?.value ||
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  if (!token) return null;

  try {
    return await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
    });
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = await getAdminToken();
  const isAdmin = (token as { role?: string } | null)?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isAdmin && <AdminSidebar />}
      <main className={`flex-1 ${isAdmin ? "ml-0 md:ml-64" : ""}`}>
        {children}
      </main>
    </div>
  );
}
