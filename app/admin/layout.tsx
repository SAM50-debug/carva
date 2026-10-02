import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin | CARAVAN '26",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0f1e] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
