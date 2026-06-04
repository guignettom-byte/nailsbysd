import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionProvider from "@/components/admin/SessionProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Login page doesn't need auth
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50 flex">
        {session && <AdminSidebar />}
        <main className={`flex-1 ${session ? "ml-0 md:ml-64" : ""}`}>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
