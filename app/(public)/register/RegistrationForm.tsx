"use client";

import { useState, useEffect } from "react";
import { StepIndicator } from "@/components/public/StepIndicator";
import { RegistrationFormData } from "@/lib/validators/registrationSchema";
import { Step0Info } from "@/app/(public)/register/steps/Step0Info";
import { Step1Details } from "@/app/(public)/register/steps/Step1Details";
import { Step2Events } from "@/app/(public)/register/steps/Step2Events";
import { Step3Payment } from "@/app/(public)/register/steps/Step3Payment";
import { Step4Declaration } from "@/app/(public)/register/steps/Step4Declaration";
import { Step5Confirmation } from "@/app/(public)/register/steps/Step5Confirmation";

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    university: "",
    selectedEvents: [],
  });
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [finalResult, setFinalResult] = useState<{ qrCode: string, registrationId: string } | null>(null);

  useEffect(() => {
    fetch("/api/public/events")
      .then((res) => res.json())
      .then((data) => {
        setCategoriesData(data.categories || []);
        setLoadingConfig(false);
      })
      .catch((err) => {
        console.error("Failed to load events", err);
        setLoadingConfig(false);
      });
  }, []);

  const updateFormData = (newData: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      const res = await fetch("/api/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Failed to submit registration");
      }
      
      setFinalResult(result);
      setCurrentStep(5); // Go to confirmation
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingConfig) {
    return <div className="text-center text-slate-400 py-20">Loading registration form...</div>;
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
      <StepIndicator currentStep={currentStep} totalSteps={4} />
      
      {currentStep === 0 && <Step0Info onNext={nextStep} />}
      {currentStep === 1 && <Step1Details data={formData} updateData={updateFormData} onNext={nextStep} />}
      {currentStep === 2 && <Step2Events data={formData} updateData={updateFormData} categories={categoriesData} onNext={nextStep} onPrev={prevStep} />}
      {currentStep === 3 && <Step3Payment data={formData} updateData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
      {currentStep === 4 && (
        <Step4Declaration 
          onPrev={prevStep} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
          error={submitError} 
        />
      )}
      {currentStep === 5 && finalResult && <Step5Confirmation result={finalResult} />}
    </div>
  );
}
