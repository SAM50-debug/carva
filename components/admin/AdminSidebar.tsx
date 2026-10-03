"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  FolderOpen,
  ClipboardList,
  Users,
  ScanLine,
  FormInput,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/form-builder", label: "Form Builder", icon: FormInput },
  { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: ScanLine },
  { href: "/admin/attendance-records", label: "Marked Attendance", icon: ClipboardList },
];

export default function AdminSidebar({ role = "super_admin" }: { role?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  // Sub admins see Attendance, Attendance Records, and Registrations
  const filteredNav = NAV.filter(item => {
    if (role === "super_admin") return true;
    return (
      item.href === "/admin/attendance" || 
      item.href === "/admin/attendance-records" || 
      item.href === "/admin/registrations"
    );
  });

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {filteredNav.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setMobileOpen(false)}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] duration-200",
            isActive(href, exact)
              ? "bg-[#c8102e] text-white shadow-lg shadow-red-900/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#111827] border border-white/10 rounded-xl text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-[#0d1424] border-r border-white/8 flex flex-col z-50 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
          <div>
            <p className="font-bold text-white text-sm">CARAVAN &apos;26</p>
            <p className="text-xs text-slate-500">Admin Portal</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <NavLinks />

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
