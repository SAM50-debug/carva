import { useState, useMemo } from "react";
import { RegistrationFormData } from "@/lib/validators/registrationSchema";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { createPortal } from "react-dom";

export function Step2Events({ 
  data, 
  updateData, 
  categories,
  onNext,
  onPrev
}: { 
  data: Partial<RegistrationFormData>; 
  updateData: (d: Partial<RegistrationFormData>) => void; 
  categories: any[];
  onNext: () => void;
  onPrev: () => void;
}) {
  const isTeam = data.participationType === "team";
  
  // Local state for team details to prevent constant re-renders on every keystroke at the root level if we want,
  // but for simplicity we'll just use the props
  const teamDetails = data.teamDetails || { teamName: "", leaderName: "", memberCount: 2, membersInfo: "" };
  const selectedEvents = data.selectedEvents || [];

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Compute selected category IDs from the selected events
  const selectedCategoryIds = useMemo(() => {
    const ids = new Set<string>();
    selectedEvents.forEach(e => ids.add(e.categoryId));
    return Array.from(ids);
  }, [selectedEvents]);

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      // Deselecting category removes all its events
      updateData({
        selectedEvents: selectedEvents.filter(e => e.categoryId !== categoryId)
      });
    } else {
      if (selectedCategoryIds.length >= 2) {
        showToast("You can only select up to 2 categories.");
        return;
      }
      // Just select it, no events yet
      // We don't really have a standalone 'selectedCategories' array in schema, we derive it from selectedEvents.
      // So checking a category doesn't strictly update schema until an event is picked, but we need UI state to show it's open.
    }
  };

  // We need local UI state for which categories are 'expanded' (user wants to select events from them)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(selectedCategoryIds);

  const toggleExpandCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
      updateData({
        selectedEvents: selectedEvents.filter(e => e.categoryId !== categoryId)
      });
    } else {
      if (selectedCategoryIds.length >= 2 && !selectedCategoryIds.includes(categoryId)) {
        // Can't expand a 3rd category if we already have events in 2 categories and this isn't one of them
        // Wait, if selectedCategoryIds.length is exactly 2, and they click a 3rd, they can't.
        const currentActiveIds = new Set([...selectedCategoryIds, ...expandedCategories]);
        if (currentActiveIds.size >= 2 && !currentActiveIds.has(categoryId)) {
          showToast("Maximum 2 categories allowed.");
          return;
        }
      }
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const handleEventToggle = (catId: string, catName: string, eventId: string, eventName: string, subEvent?: string) => {
    const exists = selectedEvents.find(e => e.eventId === eventId && e.subEvent === subEvent);
    
    if (exists) {
      updateData({
        selectedEvents: selectedEvents.filter(e => !(e.eventId === eventId && e.subEvent === subEvent))
      });
    } else {
      if (selectedEvents.length >= 2) {
        showToast("You can only select a maximum of 2 events total.");
        return;
      }
      updateData({
        selectedEvents: [...selectedEvents, {
          categoryId: catId,
          categoryName: catName,
          eventId,
          eventName,
          subEvent
        }]
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (isTeam) {
      if (!teamDetails.teamName) newErrors.teamName = "Required";
      if (!teamDetails.leaderName) newErrors.leaderName = "Required";
      if (!teamDetails.memberCount || teamDetails.memberCount < 2) newErrors.memberCount = "Minimum 2 members required";
      if (!teamDetails.membersInfo) newErrors.membersInfo = "Required";
    }

    if (selectedEvents.length === 0) {
      newErrors.events = "Please select at least one event";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const updateTeamDetails = (field: string, value: any) => {
    updateData({
      teamDetails: { ...teamDetails, [field]: value }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {isTeam && (
        <div className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-bold text-white">Team Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Team Name <span className="text-red-500">*</span></label>
              <input type="text" value={teamDetails.teamName} onChange={(e) => updateTeamDetails("teamName", e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
              {errors.teamName && <p className="text-red-500 text-xs">{errors.teamName}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Team Leader Name <span className="text-red-500">*</span></label>
              <input type="text" value={teamDetails.leaderName} onChange={(e) => updateTeamDetails("leaderName", e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
              {errors.leaderName && <p className="text-red-500 text-xs">{errors.leaderName}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Number of Team Members <span className="text-red-500">*</span></label>
              <select value={teamDetails.memberCount} onChange={(e) => updateTeamDetails("memberCount", parseInt(e.target.value) || 2)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60 [color-scheme:dark]">
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num} className="bg-[#111827]">{num}</option>
                ))}
              </select>
              {errors.memberCount && <p className="text-red-500 text-xs">{errors.memberCount}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-300">Team Members Info <span className="text-red-500">*</span></label>
              <p className="text-xs text-slate-400 mb-1">List each member's Name, Course, Roll No, Mobile, and Email (one member per line)</p>
              <textarea rows={4} value={teamDetails.membersInfo} onChange={(e) => updateTeamDetails("membersInfo", e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60"></textarea>
              {errors.membersInfo && <p className="text-red-500 text-xs">{errors.membersInfo}</p>}
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Event Selection</h2>
          <p className="text-slate-400">Select up to 2 categories, then choose your events.</p>
          {errors.events && <p className="text-red-500 text-sm mt-2 font-medium">{errors.events}</p>}
        </div>

        <div className="space-y-4">
          {categories.map((cat) => {
            const isExpanded = expandedCategories.includes(cat._id);
            const eventsInCategory = selectedEvents.filter(e => e.categoryId === cat._id).length;
            
            // Filter events by participation type
            const availableEvents = cat.events.filter((e: any) => {
              if (isTeam) {
                // Team can't participate in purely individual events
                return e.participation?.type !== "individual";
              } else {
                // Individual can participate in individual events
                if (e.participation?.type === "individual") return true;
                
                // Or if it's a team event but allows 1 participant
                if (e.participation?.min === 1) return true;

                // Or if it's a format-based event that contains a "Solo" subevent
                const hasSoloFormat = e.subEvents?.some((s: string) => /solo/i.test(s));
                if (hasSoloFormat) return true;

                return false;
              }
            });

            if (availableEvents.length === 0) return null;

            return (
              <div key={cat._id} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-[#c8102e]/50 bg-white/5' : 'border-white/10 bg-black/20/30 hover:bg-black/20/80'}`}>
                <div 
                  className="px-6 py-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpandCategory(cat._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#c8102e] border-[#c8102e]' : 'border-white/20 bg-black/20'}`}>
                      {isExpanded && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{cat.name}</h3>
                      {eventsInCategory > 0 && <p className="text-sm text-[#c8102e] font-medium">{eventsInCategory} event(s) selected</p>}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
                    {availableEvents.map((evt: any) => {
                      
                      // For sub-events (formats)
                      let displaySubEvents = evt.subEvents;
                      if (displaySubEvents && displaySubEvents.length > 0) {
                        const hasFormatKeywords = displaySubEvents.some((s: string) => /solo|duet|group/i.test(s));
                        if (hasFormatKeywords) {
                          displaySubEvents = displaySubEvents.filter((sub: string) => {
                            const isSoloFormat = sub.toLowerCase().includes("solo");
                            if (isTeam) return !isSoloFormat;
                            return isSoloFormat;
                          });
                        }
                        
                        if (displaySubEvents.length === 0) return null;

                        return (
                          <div key={evt._id} className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <h4 className="font-medium text-white mb-3">{evt.name}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {displaySubEvents.map((sub: string) => {
                                const isSelected = selectedEvents.some(se => se.eventId === evt._id && se.subEvent === sub);
                                return (
                                  <label key={sub} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-[#c8102e]/20 border-[#c8102e]/50 text-white' : 'border-white/10 hover:bg-white/5 text-slate-300'}`}>
                                    <input 
                                      type="checkbox" 
                                      className="hidden" 
                                      checked={isSelected}
                                      onChange={() => handleEventToggle(cat._id, cat.name, evt._id, evt.name, sub)}
                                    />
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-[#c8102e] border-[#c8102e]' : 'border-white/20 bg-black/40'}`}>
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-sm">{sub}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      // Standard event
                      const isSelected = selectedEvents.some(se => se.eventId === evt._id);
                      return (
                        <label key={evt._id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'bg-[#c8102e]/20 border-[#c8102e]/50 text-white' : 'border-white/10 bg-black/20 hover:bg-white/5 text-slate-300'}`}>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={isSelected}
                            onChange={() => handleEventToggle(cat._id, cat.name, evt._id, evt.name)}
                          />
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-[#c8102e] border-[#c8102e]' : 'border-white/20 bg-black/40'}`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="font-medium">{evt.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-slate-400 hover:text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a50e26] text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Next Step
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {toastMessage && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setToastMessage("")} />
          <div className="relative bg-[#111827] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <span className="text-3xl text-red-500 font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Limit Reached</h3>
            <p className="text-slate-400 mb-6">{toastMessage}</p>
            <button 
              onClick={() => setToastMessage("")}
              className="w-full bg-[#c8102e] hover:bg-[#a50e26] text-white py-3 rounded-xl font-medium transition-colors active:scale-95"
            >
              Understood
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
