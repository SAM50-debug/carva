import { useState } from "react";
import { RegistrationFormData } from "@/lib/validators/registrationSchema";
import { ArrowRight } from "lucide-react";

export function Step1Details({ 
  data, 
  updateData, 
  onNext 
}: { 
  data: Partial<RegistrationFormData>; 
  updateData: (d: Partial<RegistrationFormData>) => void; 
  onNext: () => void; 
}) {
  const [universityType, setUniversityType] = useState(
    data.isRIMT ? "RIMT University" : (data.university ? "Other" : "")
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.university) newErrors.university = "Required";
    if (!data.studentName) newErrors.studentName = "Required";
    if (!data.rollNumber) newErrors.rollNumber = "Required";
    if (!data.course) newErrors.course = "Required";
    if (!data.year) newErrors.year = "Required";
    if (!data.gender) newErrors.gender = "Required";
    if (!data.mobile || !/^[0-9]{10}$/.test(data.mobile)) newErrors.mobile = "Valid 10-digit number required";
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) newErrors.email = "Valid email required";
    if (!data.facultyName) newErrors.facultyName = "Required";
    if (!data.facultyMobile) newErrors.facultyMobile = "Required";
    if (!data.facultyEmail) newErrors.facultyEmail = "Required";
    if (!data.participationType) newErrors.participationType = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Participant Details</h2>
        <p className="text-slate-400">Please provide your basic information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* University Selection */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-300">University / College <span className="text-red-500">*</span></label>
          <select 
            value={universityType}
            onChange={(e) => {
              setUniversityType(e.target.value);
              updateData({ 
                isRIMT: e.target.value === "RIMT University",
                university: e.target.value === "RIMT University" ? "RIMT University" : "" 
              });
            }}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60"
          >
            <option value="">Select University</option>
            <option value="RIMT University">RIMT University</option>
            <option value="Other">Other University / College</option>
          </select>
          {errors.university && <p className="text-red-500 text-xs">{errors.university}</p>}
        </div>

        {universityType === "Other" && (
          <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-medium text-slate-300">Enter University Name <span className="text-red-500">*</span></label>
            <input 
              type="text"
              value={data.university !== "RIMT University" ? data.university : ""}
              onChange={(e) => updateData({ university: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60"
              placeholder="Full name of your institution"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Student Name <span className="text-red-500">*</span></label>
          <input type="text" value={data.studentName || ""} onChange={(e) => updateData({ studentName: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          {errors.studentName && <p className="text-red-500 text-xs">{errors.studentName}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Roll Number <span className="text-red-500">*</span></label>
          <input type="text" value={data.rollNumber || ""} onChange={(e) => updateData({ rollNumber: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          {errors.rollNumber && <p className="text-red-500 text-xs">{errors.rollNumber}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Course / Program <span className="text-red-500">*</span></label>
          <input type="text" value={data.course || ""} onChange={(e) => updateData({ course: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          {errors.course && <p className="text-red-500 text-xs">{errors.course}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Year <span className="text-red-500">*</span></label>
          <select value={data.year || ""} onChange={(e) => updateData({ year: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60">
            <option value="">Select Year</option>
            <option value="1st">1st Year</option>
            <option value="2nd">2nd Year</option>
            <option value="3rd">3rd Year</option>
            <option value="4th">4th Year</option>
            <option value="Other">Other</option>
          </select>
          {errors.year && <p className="text-red-500 text-xs">{errors.year}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Gender <span className="text-red-500">*</span></label>
          <select value={data.gender || ""} onChange={(e) => updateData({ gender: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Mobile Number <span className="text-red-500">*</span></label>
          <input type="tel" value={data.mobile || ""} onChange={(e) => updateData({ mobile: e.target.value })} placeholder="10-digit number" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          {errors.mobile && <p className="text-red-500 text-xs">{errors.mobile}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-300">Email ID <span className="text-red-500">*</span></label>
          <input type="email" value={data.email || ""} onChange={(e) => updateData({ email: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
        </div>
        
        {/* Faculty Coordinator Info */}
        <div className="md:col-span-2 border-t border-white/10 pt-6 mt-2">
          <h3 className="text-lg font-medium text-white mb-4">Faculty Coordinator Details</h3>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Coordinator Name <span className="text-red-500">*</span></label>
          <input type="text" value={data.facultyName || ""} onChange={(e) => updateData({ facultyName: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          {errors.facultyName && <p className="text-red-500 text-xs">{errors.facultyName}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Coordinator Mobile <span className="text-red-500">*</span></label>
          <input type="tel" value={data.facultyMobile || ""} onChange={(e) => updateData({ facultyMobile: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          {errors.facultyMobile && <p className="text-red-500 text-xs">{errors.facultyMobile}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-300">Coordinator Email <span className="text-red-500">*</span></label>
          <input type="email" value={data.facultyEmail || ""} onChange={(e) => updateData({ facultyEmail: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" />
          {errors.facultyEmail && <p className="text-red-500 text-xs">{errors.facultyEmail}</p>}
        </div>

        {/* Participation Type */}
        <div className="md:col-span-2 border-t border-white/10 pt-6 mt-2">
          <label className="block text-sm font-medium text-slate-300 mb-4">Participation Type <span className="text-red-500">*</span></label>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
              ${data.participationType === "individual" ? "bg-[#c8102e]/10 border-[#c8102e] text-white" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}>
              <input 
                type="radio" 
                name="ptype" 
                className="hidden" 
                checked={data.participationType === "individual"}
                onChange={() => updateData({ participationType: "individual", teamDetails: undefined })}
              />
              <span className="font-semibold">Individual</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
              ${data.participationType === "team" ? "bg-[#c8102e]/10 border-[#c8102e] text-white" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}>
              <input 
                type="radio" 
                name="ptype" 
                className="hidden" 
                checked={data.participationType === "team"}
                onChange={() => updateData({ participationType: "team" })}
              />
              <span className="font-semibold">Team</span>
            </label>
          </div>
          {errors.participationType && <p className="text-red-500 text-xs mt-2">{errors.participationType}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a50e26] text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Next Step
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
