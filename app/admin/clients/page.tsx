import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { appointments: true } },
      appointments: {
        where: { status: { not: "CANCELLED" } },
        select: { price: true },
      },
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-[#2a2018] mb-1">Clients</h1>
        <p className="text-sm text-gray-500">{clients.length} client{clients.length > 1 ? "es" : "e"} inscrit{clients.length > 1 ? "es" : "e"}</p>
      </div>

      <div className="bg-white border border-gray-100 overflow-hidden">
        {clients.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            Aucun client inscrit pour le moment
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Client", "Email", "Téléphone", "Visites", "Total dépensé", "Inscrit(e) le", ""].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client) => {
                  const totalSpent = client.appointments.reduce((s, a) => s + a.price, 0);
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-[#2a2018]">
                        {client.firstName} {client.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{client.email}</td>
                      <td className="px-6 py-4 text-gray-500">{client.phone}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-[#faf6f1] text-[#b8975a] font-medium text-sm">
                          {client._count.appointments}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-display text-lg text-[#b8975a]">
                        {formatPrice(totalSpent)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {format(new Date(client.createdAt), "d MMM yyyy", { locale: fr })}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/clients/${client.id}`}
                          className="text-xs text-[#b8975a] uppercase tracking-widest hover:text-[#2a2018] transition-colors">
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
