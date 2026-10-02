import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FormBuilderPage() {
  return (
    <div className="p-8">
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-white mb-8">Form Builder</h1>
      <div className="bg-[#111827]/50 rounded-2xl border border-white/10 p-8 backdrop-blur-sm text-center">
        <p className="text-slate-400">
          The Form Builder is currently in read-only mode for Phase 5. The registration form logic is hardcoded for maximum stability and speed during the event.
        </p>
      </div>
    </div>
  );
}
