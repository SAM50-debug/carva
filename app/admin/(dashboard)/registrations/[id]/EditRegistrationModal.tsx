"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Edit2, X, Loader2 } from "lucide-react";

export function EditRegistrationModal({ 
  registration, 
  compact = false,
  onSuccess
}: { 
  registration: any;
  compact?: boolean;
  onSuccess?: (updatedReg: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    studentName: registration.studentName || "",
    university: registration.university || "",
    rollNumber: registration.rollNumber || "",
    course: registration.course || "",
    year: registration.year || "1st",
    gender: registration.gender || "male",
    mobile: registration.mobile || "",
    email: registration.email || "",
    facultyName: registration.facultyName || "",
    facultyMobile: registration.facultyMobile || "",
    facultyEmail: registration.facultyEmail || "",
    teamName: registration.teamDetails?.teamName || "",
    leaderName: registration.teamDetails?.leaderName || "",
    memberCount: registration.teamDetails?.memberCount || "",
    membersInfo: registration.teamDetails?.membersInfo || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload: any = {
        studentName: formData.studentName,
        university: formData.university,
        rollNumber: formData.rollNumber,
        course: formData.course,
        year: formData.year?.replace(" Year", ""),
        gender: formData.gender?.toLowerCase(),
        mobile: formData.mobile,
        email: formData.email,
        facultyName: formData.facultyName,
        facultyMobile: formData.facultyMobile,
      };

      if (formData.facultyEmail) payload.facultyEmail = formData.facultyEmail;

      if (registration.participationType === "team") {
        payload.teamDetails = {
          teamName: formData.teamName,
          leaderName: formData.leaderName,
          memberCount: Number(formData.memberCount),
          membersInfo: formData.membersInfo,
        };
      }

      const res = await fetch(`/api/admin/registrations/${registration._id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update registration");

      setIsOpen(false);
      
      // Update local state if provided, otherwise refresh server component
      if (onSuccess) {
        onSuccess(payload);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#c8102e]/50 focus:bg-white/5 transition-all duration-300";
  const labelClass = "block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          compact
            ? "inline-flex items-center justify-center w-8 h-8 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all active:scale-95 duration-200"
            : "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all text-sm"
        }
      >
        <Edit2 className="w-4 h-4" />
        {!compact && "Edit Details"}
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-left">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0f172a]/95 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden ring-1 ring-white/5">
            
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-6 bg-white/[0.02] border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Edit Registration</h2>
                <p className="text-xs text-slate-400 mt-1">Update participant information securely.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {error}
                  </div>
                )}

                {/* Participant Info */}
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-[#c8102e] uppercase tracking-widest flex items-center gap-3">
                    Participant Info
                    <div className="h-px flex-1 bg-gradient-to-r from-[#c8102e]/20 to-transparent" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Student Name</label>
                      <input name="studentName" value={formData.studentName} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>University/College</label>
                      <input name="university" value={formData.university} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Roll Number</label>
                      <input name="rollNumber" value={formData.rollNumber} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile</label>
                      <input name="mobile" value={formData.mobile} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Course</label>
                      <input name="course" value={formData.course} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Year</label>
                      <select name="year" value={formData.year} onChange={handleChange} className={inputClass}>
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Faculty Info */}
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-[#c8102e] uppercase tracking-widest flex items-center gap-3">
                    Faculty Info
                    <div className="h-px flex-1 bg-gradient-to-r from-[#c8102e]/20 to-transparent" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Faculty Name</label>
                      <input name="facultyName" value={formData.facultyName} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Faculty Mobile</label>
                      <input name="facultyMobile" value={formData.facultyMobile} onChange={handleChange} required className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Team Info */}
                {registration.participationType === "team" && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-[#c8102e] uppercase tracking-widest flex items-center gap-3">
                      Team Info
                      <div className="h-px flex-1 bg-gradient-to-r from-[#c8102e]/20 to-transparent" />
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Team Name</label>
                        <input name="teamName" value={formData.teamName} onChange={handleChange} required className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Team Leader Name</label>
                        <input name="leaderName" value={formData.leaderName} onChange={handleChange} required className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Total Members</label>
                        <input type="number" name="memberCount" value={formData.memberCount} onChange={handleChange} required className={inputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Members Info</label>
                        <textarea name="membersInfo" value={formData.membersInfo} onChange={handleChange} rows={3} required className={`${inputClass} resize-none`} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c8102e] hover:bg-[#a00d25] shadow-lg shadow-[#c8102e]/20 text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>, document.body
      )}
    </>
  );
}
