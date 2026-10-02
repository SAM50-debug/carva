import { FileText, ArrowRight } from "lucide-react";

export function Step0Info({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          CARAVAN <span className="text-[#c8102e]">'26</span>
        </h1>
        <p className="text-xl text-slate-300">Participant Registration</p>
      </div>

      <div className="bg-black/20 rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Before you begin</h2>
        <p className="text-slate-400 mb-6 leading-relaxed">
          Please download and read the official event rules, guidelines, and invitation carefully before proceeding with your registration. 
          Make sure you have your team details and payment information ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <a 
            href="/Final Events Caravan'26.pdf" 
            target="_blank" 
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-xl text-white transition-colors flex-1"
          >
            <FileText className="w-5 h-5 text-[#c8102e]" />
            <div className="text-left">
              <div className="font-medium">Final Events Guidelines</div>
              <div className="text-xs text-slate-400">PDF Document</div>
            </div>
          </a>
          <a 
            href="/Invitation to Universities.pdf" 
            target="_blank" 
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-xl text-white transition-colors flex-1"
          >
            <FileText className="w-5 h-5 text-[#c8102e]" />
            <div className="text-left">
              <div className="font-medium">Invitation to Universities</div>
              <div className="text-xs text-slate-400">PDF Document</div>
            </div>
          </a>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a50e26] text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#c8102e]/20"
          >
            Begin Registration
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
