import { useState } from "react";
import { RegistrationFormData } from "@/lib/validators/registrationSchema";
import { ArrowLeft, ArrowRight, Upload, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export function Step3Payment({ 
  data, 
  updateData, 
  onNext,
  onPrev
}: { 
  data: Partial<RegistrationFormData>; 
  updateData: (d: Partial<RegistrationFormData>) => void; 
  onNext: () => void;
  onPrev: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "idCardUrl" | "paymentProofUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrors(prev => ({ ...prev, [field]: "" }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "caravan26_public");

    try {
      const res = await fetch("/api/public/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Upload failed");
      
      updateData({ [field]: result.url });
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [field]: err.message || "Failed to upload file. Please try again." }));
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.idCardUrl) newErrors.idCardUrl = "Student ID Card is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Student Verification</h2>
          <p className="text-slate-400">Please upload your University/College ID card for verification.</p>
        </div>

        <div className="bg-black/20 rounded-2xl p-8 border border-white/10 text-center">
          {data.idCardUrl ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-white font-medium">ID Card Uploaded Successfully</p>
                <button onClick={() => updateData({ idCardUrl: "" })} className="text-sm text-[#c8102e] hover:underline mt-2">
                  Upload a different file
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#c8102e]/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-[#c8102e]" />
              </div>
              <div>
                <p className="text-white font-medium mb-2">Upload Student ID Card <span className="text-red-500">*</span></p>
                <p className="text-sm text-slate-400 mb-4">JPEG, PNG, or PDF up to 5MB</p>
                <label className="relative cursor-pointer bg-[#c8102e] hover:bg-[#a50e26] text-white px-6 py-2.5 rounded-xl font-medium transition-colors inline-flex items-center gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Choose File"}
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, "idCardUrl")} disabled={uploading} />
                </label>
              </div>
              {errors.idCardUrl && <p className="text-red-500 text-sm mt-2">{errors.idCardUrl}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-white/10 mt-8">
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
    </div>
  );
}
