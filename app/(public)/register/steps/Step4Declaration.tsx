import { useState } from "react";
import { ArrowLeft, Loader2, Check } from "lucide-react";

export function Step4Declaration({ 
  onPrev, 
  onSubmit, 
  isSubmitting, 
  error 
}: { 
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string;
}) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Final Step</h2>
        <p className="text-slate-400">Please review the declaration below before submitting.</p>
      </div>

      <div className="bg-black/20 rounded-2xl p-6 md:p-8 border border-[#c8102e]/20 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-white mb-4">Declaration</h3>
        
        <p className="text-slate-300 mb-6 leading-relaxed">
          By submitting this registration, I hereby confirm that all the information provided is correct and genuine. 
          I understand that providing false information will lead to immediate disqualification.
        </p>

        <label className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-colors ${agreed ? 'bg-[#c8102e]/10 border-[#c8102e]/50' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}>
          <div className="mt-0.5">
            <input 
              type="checkbox" 
              className="hidden" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${agreed ? 'bg-[#c8102e] border-[#c8102e]' : 'border-white/20 bg-black/40'}`}>
              {agreed && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>
          <span className={`font-medium ${agreed ? 'text-white' : 'text-slate-300'}`}>
            I confirm that the information provided is correct and I agree to follow the rules, regulations and guidelines of CARAVAN '26 and the decisions of the organising committee.
          </span>
        </label>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex justify-between max-w-2xl mx-auto pt-8 border-t border-white/10">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="flex items-center gap-2 text-slate-400 hover:text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!agreed || isSubmitting}
          className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a50e26] disabled:bg-[#c8102e]/50 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-[#c8102e]/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Registration"
          )}
        </button>
      </div>
    </div>
  );
}
