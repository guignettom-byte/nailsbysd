"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Calendar,
  Users,
  Scissors,
  Settings,
  LogOut,
  LayoutDashboard,
  BanIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/appointments", icon: Calendar, label: "Rendez-vous" },
  { href: "/admin/clients", icon: Users, label: "Clients" },
  { href: "/admin/services", icon: Scissors, label: "Prestations" },
  { href: "/admin/blocked-days", icon: BanIcon, label: "Jours bloqués" },
  { href: "/admin/working-hours", icon: Settings, label: "Horaires" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#2a2018] text-white flex flex-col z-40 hidden md:flex">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <p className="font-display text-2xl text-white">Nailsbysd</p>
        <p className="text-xs tracking-widest uppercase text-[#b8975a]">Administration</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                active
                  ? "bg-[#b8975a] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white w-full transition-colors"
        >
          <LogOut size={18} />
          Se déconnecter
        </button>
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          ← Voir le site
        </Link>
      </div>
    </aside>
  );
}
