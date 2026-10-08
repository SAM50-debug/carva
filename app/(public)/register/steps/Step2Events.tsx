import { useState, useMemo } from "react";
import { RegistrationFormData } from "@/lib/validators/registrationSchema";
import { ArrowLeft, ArrowRight, Check, Users, Copy, X, Loader2 } from "lucide-react";
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
  
  const teamDetails = data.teamDetails || { teamName: "", leaderName: "" };
  const selectedEvents = data.selectedEvents || [];

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState("");
  
  // State for the modal
  const [activeModalEvent, setActiveModalEvent] = useState<any | null>(null);
  const [modalData, setModalData] = useState({ memberCount: 2, membersInfo: "" });
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});
  const [isChecking, setIsChecking] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const selectedCategoryIds = useMemo(() => {
    const ids = new Set<string>();
    selectedEvents.forEach(e => ids.add(e.categoryId));
    return Array.from(ids);
  }, [selectedEvents]);

  const [expandedCategories, setExpandedCategories] = useState<string[]>(selectedCategoryIds);

  const toggleExpandCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
      updateData({
        selectedEvents: selectedEvents.filter(e => e.categoryId !== categoryId)
      });
    } else {
      const currentActiveIds = new Set([...selectedCategoryIds, ...expandedCategories]);
      if (currentActiveIds.size >= 2 && !currentActiveIds.has(categoryId)) {
        showToast("Maximum 2 categories allowed.");
        return;
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
      // Set default team details size based on event
      const isFashionModeling = eventName.toLowerCase().includes("fashion modeling");
      const isBhangra = eventName.toLowerCase().includes("bhangra");
      let defaultMembers = 2;
      if (isFashionModeling) defaultMembers = 11;
      else if (isBhangra) defaultMembers = 8;

      updateData({
        selectedEvents: [...selectedEvents, {
          categoryId: catId,
          categoryName: catName,
          eventId,
          eventName,
          subEvent,
          ...(isTeam ? { teamDetails: { memberCount: defaultMembers, membersInfo: "" } } : {})
        }]
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (isTeam) {
      if (!teamDetails.teamName) newErrors.teamName = "Required";
      if (!teamDetails.leaderName) newErrors.leaderName = "Required";
      
      // Ensure all selected events have valid team details
      const missingDetails = selectedEvents.some(evt => {
        if (!evt.teamDetails) return true;
        const isFashionModeling = evt.eventName.toLowerCase().includes("fashion modeling");
        const isBhangra = evt.eventName.toLowerCase().includes("bhangra");
        let minMembers = 2;
        let maxMembers = 8;
        if (isFashionModeling) {
          minMembers = 11;
          maxMembers = 13;
        } else if (isBhangra) {
          minMembers = 8;
          maxMembers = 15;
        }
        if (evt.teamDetails.memberCount < minMembers || evt.teamDetails.memberCount > maxMembers) return true;
        if (!evt.teamDetails.membersInfo.trim()) return true;
        return false;
      });

      if (missingDetails) {
        newErrors.events = "Please add valid team details for all selected events.";
      }
    }

    if (selectedEvents.length === 0) {
      newErrors.events = "Please select at least one event";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    
    // Server-side check for Fashion Modeling exclusivity
    const hasFashion = selectedEvents.some(e => e.eventName.toLowerCase().includes("fashion modeling"));
    if (hasFashion && isTeam && data.university) {
      setIsChecking(true);
      try {
        const res = await fetch(`/api/public/check-university?university=${encodeURIComponent(data.university)}&event=${encodeURIComponent("fashion modeling")}`);
        if (res.ok) {
          const { registered } = await res.json();
          if (registered) {
            setErrors(prev => ({ ...prev, events: "Your university has already registered a team for Fashion Modeling. Only one team per university is allowed." }));
            window.scrollTo({ top: 0, behavior: "smooth" });
            setIsChecking(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to check university registration", err);
      }
      setIsChecking(false);
    }

    onNext();
  };

  const updateTeamDetails = (field: string, value: any) => {
    updateData({
      teamDetails: { ...teamDetails, [field]: value }
    });
  };

  // Modal Handlers
  const openModal = (evt: any) => {
    setActiveModalEvent(evt);
    if (evt.teamDetails) {
      setModalData({ memberCount: evt.teamDetails.memberCount, membersInfo: evt.teamDetails.membersInfo });
    } else {
      const isFashionModeling = evt.eventName.toLowerCase().includes("fashion modeling");
      const isBhangra = evt.eventName.toLowerCase().includes("bhangra");
      let defaultMembers = 2;
      if (isFashionModeling) defaultMembers = 11;
      else if (isBhangra) defaultMembers = 8;
      setModalData({ memberCount: defaultMembers, membersInfo: "" });
    }
    setModalErrors({});
  };

  const closeModal = () => {
    setActiveModalEvent(null);
  };

  const saveModalData = () => {
    if (!activeModalEvent) return;
    const isFashionModeling = activeModalEvent.eventName.toLowerCase().includes("fashion modeling");
    const isBhangra = activeModalEvent.eventName.toLowerCase().includes("bhangra");
    let minMembers = 2;
    let maxMembers = 8;
    if (isFashionModeling) {
      minMembers = 11;
      maxMembers = 13;
    } else if (isBhangra) {
      minMembers = 8;
      maxMembers = 15;
    }

    if (modalData.memberCount < minMembers || modalData.memberCount > maxMembers) {
      setModalErrors({ memberCount: `Must be between ${minMembers} and ${maxMembers} members.` });
      return;
    }
    if (!modalData.membersInfo.trim()) {
      setModalErrors({ membersInfo: "Required" });
      return;
    }

    const updatedEvents = selectedEvents.map(e => {
      if (e.eventId === activeModalEvent.eventId && e.subEvent === activeModalEvent.subEvent) {
        return { ...e, teamDetails: { ...modalData } };
      }
      return e;
    });

    updateData({ selectedEvents: updatedEvents });
    closeModal();
  };

  const usePreviousDetails = () => {
    if (!activeModalEvent) return;
    const otherEvent = selectedEvents.find(e => 
      !(e.eventId === activeModalEvent.eventId && e.subEvent === activeModalEvent.subEvent) && 
      e.teamDetails && 
      e.teamDetails.membersInfo.trim() !== ""
    );

    if (!otherEvent || !otherEvent.teamDetails) {
      showToast("No previous details found to copy.");
      return;
    }

    const isCurrentFashion = activeModalEvent.eventName.toLowerCase().includes("fashion modeling");
    const isCurrentBhangra = activeModalEvent.eventName.toLowerCase().includes("bhangra");
    
    // Check compatibility
    const otherCount = otherEvent.teamDetails.memberCount;
    let currentMin = 2;
    let currentMax = 8;
    if (isCurrentFashion) {
      currentMin = 11;
      currentMax = 13;
    } else if (isCurrentBhangra) {
      currentMin = 8;
      currentMax = 15;
    }

    if (otherCount < currentMin || otherCount > currentMax) {
      if (isCurrentFashion) {
        showToast(`Cannot copy: Fashion Modeling requires ${currentMin}-${currentMax} members, but your other event has ${otherCount}. Please adjust or enter manually.`);
      } else if (isCurrentBhangra) {
        showToast(`Cannot copy: Bhangra requires ${currentMin}-${currentMax} members, but your other event has ${otherCount}.`);
      } else {
        showToast(`Cannot copy: This event allows max ${currentMax} members, but your other event has ${otherCount}.`);
      }
      return;
    }

    setModalData({
      memberCount: otherEvent.teamDetails.memberCount,
      membersInfo: otherEvent.teamDetails.membersInfo
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {isTeam && (
        <div className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-bold text-white">Team Overview</h2>
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
            
            const availableEvents = cat.events.filter((e: any) => {
              if (isTeam) {
                return e.participation?.type !== "individual";
              } else {
                if (e.participation?.type === "individual") return true;
                if (e.participation?.min === 1) return true;
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
                      
                      let displaySubEvents = evt.subEvents;
                      if (displaySubEvents && displaySubEvents.length > 0) {
                        if (displaySubEvents.length === 0) return null;

                        return (
                          <div key={evt._id} className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                              {evt.name}
                              {evt.name.toLowerCase().includes("fashion modeling") && (
                                <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Special Rules</span>
                              )}
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {displaySubEvents.map((sub: string) => {
                                const selectedInstance = selectedEvents.find(se => se.eventId === evt._id && se.subEvent === sub);
                                const isSelected = !!selectedInstance;
                                const hasValidDetails = isSelected && isTeam && selectedInstance.teamDetails?.membersInfo?.trim();
                                
                                return (
                                  <div key={sub} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${isSelected ? 'bg-[#c8102e]/10 border-[#c8102e]/30' : 'border-white/10 hover:bg-white/5'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                                      <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={isSelected}
                                        onChange={() => handleEventToggle(cat._id, cat.name, evt._id, evt.name, sub)}
                                      />
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#c8102e] border-[#c8102e]' : 'border-white/20 bg-black/40'}`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                      <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>{sub}</span>
                                    </label>
                                    
                                    {isSelected && isTeam && (
                                      <button 
                                        onClick={() => openModal(selectedInstance)}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${hasValidDetails ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-[#c8102e]/10 text-[#c8102e] border-[#c8102e]/20 hover:bg-[#c8102e]/20'}`}
                                      >
                                        <Users className="w-3.5 h-3.5" />
                                        {hasValidDetails ? 'Edit Team' : 'Add Team Details'}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      // Standard event
                      const selectedInstance = selectedEvents.find(se => se.eventId === evt._id);
                      const isSelected = !!selectedInstance;
                      const hasValidDetails = isSelected && isTeam && selectedInstance.teamDetails?.membersInfo?.trim();

                      return (
                        <div key={evt._id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${isSelected ? 'bg-[#c8102e]/10 border-[#c8102e]/30' : 'border-white/10 bg-black/20 hover:bg-white/5'}`}>
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={isSelected}
                              onChange={() => handleEventToggle(cat._id, cat.name, evt._id, evt.name)}
                            />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#c8102e] border-[#c8102e]' : 'border-white/20 bg-black/40'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {evt.name}
                              {evt.name.toLowerCase().includes("fashion modeling") && (
                                <span className="ml-2 bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Special Rules</span>
                              )}
                            </span>
                          </label>
                          
                          {isSelected && isTeam && (
                            <button 
                              onClick={() => openModal(selectedInstance)}
                              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${hasValidDetails ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-[#c8102e]/10 text-[#c8102e] border-[#c8102e]/20 hover:bg-[#c8102e]/20 animate-pulse'}`}
                            >
                              <Users className="w-3.5 h-3.5" />
                              {hasValidDetails ? 'Edit Team Details' : 'Add Team Details'}
                            </button>
                          )}
                        </div>
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
          disabled={isChecking}
          className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a50e26] text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isChecking ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
          ) : (
            <>Next Step <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {toastMessage && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setToastMessage("")} />
          <div className="relative bg-[#111827] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <span className="text-2xl text-amber-500 font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Notice</h3>
            <p className="text-slate-400 mb-6 text-sm">{toastMessage}</p>
            <button 
              onClick={() => setToastMessage("")}
              className="w-full bg-[#c8102e] hover:bg-[#a50e26] text-white py-3 rounded-xl font-medium transition-colors active:scale-95"
            >
              Okay
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Team Details Modal */}
      {activeModalEvent && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-[#070d1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
              <div>
                <h3 className="text-lg font-bold text-white">Team Details</h3>
                <p className="text-xs text-slate-400 mt-1">{activeModalEvent.eventName} {activeModalEvent.subEvent ? `(${activeModalEvent.subEvent})` : ''}</p>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {activeModalEvent.eventName.toLowerCase().includes("fashion modeling") && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200/80">
                  <strong className="text-amber-400 block mb-1">⚠️ Fashion Modeling Rules:</strong>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Must have 11 to 13 participants.</li>
                    <li>Only one team allowed per university.</li>
                    <li>Prohibited on stage: original gun, sword, knife, fire, etc.</li>
                    <li>Performance time: 12 to 15 minutes (disqualification if violated).</li>
                  </ul>
                </div>
              )}

              {selectedEvents.some(e => e.teamDetails && e.teamDetails.membersInfo.trim() && !(e.eventId === activeModalEvent.eventId && e.subEvent === activeModalEvent.subEvent)) && (
                <button
                  type="button"
                  onClick={usePreviousDetails}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-medium transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Use Details from Previous Event
                </button>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Number of Team Members <span className="text-red-500">*</span></label>
                <select 
                  value={modalData.memberCount} 
                  onChange={(e) => setModalData(prev => ({ ...prev, memberCount: parseInt(e.target.value) || 2 }))} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60 [color-scheme:dark]"
                >
                  {(() => {
                    const isFash = activeModalEvent.eventName.toLowerCase().includes("fashion modeling");
                    const isBhang = activeModalEvent.eventName.toLowerCase().includes("bhangra");
                    let options = [];
                    if (isFash) options = [11, 12, 13];
                    else if (isBhang) options = [8, 9, 10, 11, 12, 13, 14, 15];
                    else options = [2, 3, 4, 5, 6, 7, 8];
                    return options.map(num => <option key={num} value={num} className="bg-[#111827]">{num}</option>);
                  })()}
                </select>
                {modalErrors.memberCount && <p className="text-red-500 text-xs">{modalErrors.memberCount}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Team Members Info <span className="text-red-500">*</span></label>
                <p className="text-xs text-slate-400 mb-1">List each member's Name, Course, Roll No, Mobile, and Email (one member per line)</p>
                <textarea 
                  rows={6} 
                  value={modalData.membersInfo} 
                  onChange={(e) => setModalData(prev => ({ ...prev, membersInfo: e.target.value }))} 
                  placeholder="1. John Doe, B.Tech CSE, 1234567, 9876543210, john@example.com&#10;2. Jane Smith, B.Tech ECE, 7654321, 9998887776, jane@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500/50 focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60 resize-none"
                />
                {modalErrors.membersInfo && <p className="text-red-500 text-xs">{modalErrors.membersInfo}</p>}
              </div>
            </div>

            <div className="p-5 border-t border-white/10 bg-white/5 flex gap-3">
              <button 
                onClick={closeModal}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveModalData}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-white bg-[#c8102e] hover:bg-[#a50e26] transition-colors"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
