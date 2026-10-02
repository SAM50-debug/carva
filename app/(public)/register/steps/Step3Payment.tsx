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
    
    if (data.isRIMT) {
      if (!data.idCardUrl) newErrors.idCardUrl = "Student ID Card is required";
    } else {
      if (!data.paymentProofUrl) newErrors.paymentProofUrl = "Payment Screenshot is required";
      if (!data.paymentDate) newErrors.paymentDate = "Payment Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {data.isRIMT ? (
        // RIMT Flow
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Student Verification</h2>
            <p className="text-slate-400">As a RIMT student, please upload your ID card for verification.</p>
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
      ) : (
        // Other University Flow
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Payment & Verification</h2>
            <p className="text-slate-400">Scan the QR code to pay the registration fee, then upload the receipt.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
              <h3 className="text-slate-800 font-bold mb-4">UPI Payment QR</h3>
              <div className="relative w-48 h-48 mb-4 border-4 border-slate-100 rounded-xl overflow-hidden">
                <Image src="/payment-qr.png" alt="Payment QR" fill className="object-contain bg-white" />
              </div>
              <p className="text-sm text-slate-600 font-medium">Scan using any UPI app</p>
              <p className="text-xs text-slate-500 mt-2">After successful payment, take a screenshot of the transaction ID.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Payment Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={data.paymentDate || ""} 
                  onChange={(e) => updateData({ paymentDate: e.target.value })} 
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/60" 
                />
                {errors.paymentDate && <p className="text-red-500 text-xs">{errors.paymentDate}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Upload Payment Screenshot <span className="text-red-500">*</span></label>
                <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${errors.paymentProofUrl ? 'border-red-500/50 bg-red-500/5' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}>
                  {data.paymentProofUrl ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-white text-sm font-medium">Screenshot Uploaded</p>
                      <button onClick={() => updateData({ paymentProofUrl: "" })} className="text-xs text-[#c8102e] hover:underline mt-2">
                        Replace file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-slate-400 mb-3" />
                      <label className="cursor-pointer">
                        <span className="text-[#c8102e] hover:underline font-medium">Click to upload</span>
                        <span className="text-slate-400 ml-1">or drag and drop</span>
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, "paymentProofUrl")} disabled={uploading} />
                      </label>
                      <p className="text-xs text-slate-500 mt-2">PNG, JPG up to 5MB</p>
                      {uploading && <p className="text-sm text-[#c8102e] mt-2 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</p>}
                    </div>
                  )}
                </div>
                {errors.paymentProofUrl && <p className="text-red-500 text-xs">{errors.paymentProofUrl}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

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
