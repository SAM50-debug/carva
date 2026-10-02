import { CheckCircle2, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Step5Confirmation({ result }: { result: { qrCode: string, registrationId: string } }) {
  // Use a public API to generate the QR code image from the nanoid string
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${result.qrCode}&format=png`;

  return (
    <div className="text-center animate-in zoom-in-95 duration-500 py-8">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-4">Registration Successful!</h1>
      <p className="text-xl text-slate-300 mb-8 max-w-lg mx-auto">
        Your registration for CARAVAN '26 has been submitted successfully.
      </p>

      <div className="bg-white rounded-3xl p-8 max-w-sm mx-auto shadow-2xl mb-8">
        <h2 className="text-slate-800 font-bold text-lg mb-6 uppercase tracking-wider">Your Entry Pass</h2>
        
        <div className="relative w-48 h-48 mx-auto mb-6">
          <Image 
            src={qrUrl} 
            alt="Registration QR Code" 
            fill 
            className="object-contain"
            unoptimized
          />
        </div>

        <div className="bg-slate-100 rounded-xl py-3 px-4 mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Registration ID</p>
          <p className="text-slate-900 font-mono font-bold tracking-widest">{result.registrationId.slice(-8).toUpperCase()}</p>
        </div>

        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Save / Print Pass
        </button>
      </div>

      <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
        Please take a screenshot of this QR code or save it. You will need to show it at the entry gates and registration desks on the day of the event.
      </p>

      <Link 
        href="/"
        className="inline-flex text-[#c8102e] hover:text-[#a50e26] font-medium hover:underline"
      >
        Return to Home Page
      </Link>
    </div>
  );
}
