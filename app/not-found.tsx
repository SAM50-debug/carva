import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { cookies } from "next/headers";
import "./globals.css"; // Ensure Tailwind is loaded

export default async function NotFound() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.has("admin_session");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#080d1a] text-white">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c8102e]/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-[#c8102e]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#c8102e]/20">
          <FileQuestion className="w-10 h-10 text-[#c8102e]" />
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-4 tracking-tighter">404</h1>
        <h2 className="text-xl font-semibold text-white mb-3">Page Not Found</h2>
        
        <p className="text-slate-400 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Check the URL or navigate back home.
        </p>

        <div className="flex flex-col gap-3">
          {!isAdmin ? (
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-[#c8102e] hover:bg-[#a50e26] text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-[#c8102e]/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          ) : (
            <Link 
              href="/admin"
              className="flex items-center justify-center gap-2 w-full bg-[#c8102e] hover:bg-[#a50e26] text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-[#c8102e]/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
