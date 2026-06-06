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
  TrendingUp,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/appointments", icon: Calendar, label: "Rendez-vous" },
  { href: "/admin/clients", icon: Users, label: "Clients" },
  { href: "/admin/comptabilite", icon: TrendingUp, label: "Comptabilité" },
  { href: "/admin/galerie", icon: Images, label: "Galerie" },
  { href: "/admin/services", icon: Scissors, label: "Prestations" },
  { href: "/admin/blocked-days", icon: BanIcon, label: "Jours bloqués" },
  { href: "/admin/working-hours", icon: Settings, label: "Horaires" },
];

function SignOutButton() {
  return (
    <button
      onClick={async () => {
        await signOut({ callbackUrl: "/admin/login", redirect: true });
      }}
      className="flex items-center gap-3 px-4 py-3 text-sm text-[#5a5a5a] hover:text-[#2a2018] hover:bg-[#e2e2e4] w-full transition-colors rounded-sm"
    >
      <LogOut size={18} />
      Se déconnecter
    </button>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40 hidden md:flex"
      style={{ backgroundColor: "#f0f0f1", borderRight: "1px solid #e2e2e4" }}>

      {/* Logo */}
      <div className="p-6" style={{ borderBottom: "1px solid #e2e2e4" }}>
        <p className="font-display text-2xl text-[#2a2018]">Nailsbysd</p>
        <p className="text-xs tracking-widest uppercase text-[#78716c]">Administration</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm transition-colors",
                active
                  ? "bg-[#e2e2e4] text-[#2a2018] font-medium"
                  : "text-[#5a5a5a] hover:bg-[#e8e8e9] hover:text-[#2a2018]"
              )}
            >
              <Icon size={17} className={active ? "text-[#78716c]" : "text-[#9ca3af]"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 space-y-0.5" style={{ borderTop: "1px solid #e2e2e4" }}>
        <SignOutButton />
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#9ca3af] hover:text-[#5a5a5a] hover:bg-[#e8e8e9] rounded-sm transition-colors"
        >
          ← Voir le site
        </Link>
      </div>
    </aside>
  );
}
