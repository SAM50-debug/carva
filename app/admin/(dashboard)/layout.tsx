import AdminSidebar from "@/components/admin/AdminSidebar";
import { headers } from "next/headers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const payloadStr = headersList.get("x-user-payload");
  const user = payloadStr ? JSON.parse(payloadStr) : null;
  const role = user?.role || "super_admin";

  return (
    <div className="min-h-screen bg-[#070d1a] flex">
      <AdminSidebar role={role} />
      {/* Main content — offset by sidebar width on desktop */}
      <main className="flex-1 min-w-0 lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
