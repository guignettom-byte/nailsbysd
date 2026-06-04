import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isAdmin && <AdminSidebar />}
      <main className={`flex-1 ${isAdmin ? "ml-0 md:ml-64" : ""}`}>
        {children}
      </main>
    </div>
  );
}
