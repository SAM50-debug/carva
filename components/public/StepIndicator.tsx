import { Check } from "lucide-react";

export function StepIndicator({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) {
  // Step 0 is the landing page, so we don't show the indicator there
  if (currentStep === 0 || currentStep > totalSteps) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full" />
        
        {/* Active Line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#c8102e] rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Steps */}
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNumber = i + 1;
          const isActive = stepNumber === currentStep;
          const isPast = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300
                  ${isActive ? 'bg-[#c8102e] text-white ring-4 ring-[#c8102e]/30' : 
                    isPast ? 'bg-[#c8102e] text-white' : 'bg-[#1f2937] text-slate-400 border border-white/20'}`}
              >
                {isPast ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
