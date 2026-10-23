"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, ExternalLink, Check, Copy, RefreshCw } from "lucide-react";
import Link from "next/link";

interface CertificateCanvasProps {
  studentName: string;
  university: string;
  eventName: string;
  templateUrl: string; // e.g. "/certificate/1st.png"
  serialNumber: string; // e.g. "RIMT/CARVAN26/W-[T.1]"
  suffix: string; // e.g. "[T.1]"
  position: number;
  qrUrl: string; // verification URL
  certificateId: string;
}

export default function CertificateCanvas({
  studentName,
  university,
  eventName,
  templateUrl,
  serialNumber,
  suffix,
  position,
  qrUrl,
  certificateId,
}: CertificateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [copied, setCopied] = useState(false);

  const drawCertificate = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed certificate dimensions
    canvas.width = 1748;
    canvas.height = 1240;

    // Load template image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = templateUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Draw base certificate background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Ensure Quattrocento font is loaded
    try {
      await (document as any).fonts.load("bold 48px Quattrocento");
      await (document as any).fonts.load("bold 42px Quattrocento");
      await (document as any).fonts.load("bold 40px Quattrocento");
      await (document as any).fonts.load("bold 20px Quattrocento");
    } catch {
      // Font fallback is handled gracefully
    }

    // 1. Render Serial Number Suffix in top-left
    // Template already has "Certificate No: RIMT/CARVAN26/W-" or ".../P-"
    const cleanSuffix = (suffix || "").replace(/[\[\]]/g, "").trim();
    ctx.fillStyle = "#111827";
    ctx.font = "bold 26px 'Quattrocento', Georgia, serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    // For Winner (W-) text ends around X=494. For Participation (P-) text ends around X=482.
    // Shifted down slightly to Y=48 to align with pre-printed baseline
    const suffixX = position > 0 ? 494 : 482;
    const suffixY = 45;
    ctx.fillText(cleanSuffix, suffixX, suffixY);

    // 2. Render Student Name above first horizontal line (Y=594)
    ctx.fillStyle = "#1f1a14";
    ctx.font = "bold 48px 'Quattrocento', Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const nameX = 912;
    const nameY = 580;

    // Truncate or scale if name is exceptionally long
    let displayName = studentName.trim();
    if (displayName.length > 40) {
      ctx.font = "bold 40px 'Quattrocento', Georgia, serif";
    }
    ctx.fillText(displayName, nameX, nameY);

    // 3. Render University / College Name above second line (Y=741)
    // Increased font size for prominence
    ctx.fillStyle = "#1f1a14";
    ctx.font = "bold 40px 'Quattrocento', Georgia, serif";
    ctx.textAlign = "center";
    let displayUniv = university.trim();
    if (displayUniv.length > 55) {
      ctx.font = "bold 32px 'Quattrocento', Georgia, serif";
    }
    const univX = 912;
    const univY = 726;
    ctx.fillText(displayUniv, univX, univY);

    // 4. Render Event Name above third line (Y=880)
    // Centered horizontally (X=912) and increased font size
    ctx.fillStyle = "#1f1a14";
    ctx.font = "bold 42px 'Quattrocento', Georgia, serif";
    ctx.textAlign = "center";
    let displayEvent = eventName.trim();
    if (displayEvent.length > 55) {
      ctx.font = "bold 34px 'Quattrocento', Georgia, serif";
    }
    const eventX = 912;
    const eventY = 866;
    ctx.fillText(displayEvent, eventX, eventY);

    // 5. Generate and draw Dynamic Verification QR Code
    // Placed in empty space between the two dignitary signatures at the bottom
    try {
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 130,
        color: {
          dark: "#111827",
          light: "#FFFFFF",
        },
      });

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((res) => {
        qrImg.onload = res;
      });

      const qrSize = 120;
      const qrX = 814;
      const qrY = 970;

      // Draw subtle white pill background behind QR for clean contrast
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      ctx.roundRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 26, 8);
      ctx.fill();

      // Draw QR image
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Micro label under QR
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Scan to Verify", qrX + qrSize / 2, qrY + qrSize + 14);
    } catch (err) {
      console.error("Failed to render QR Code on certificate", err);
    }

    setIsRendered(true);
  };

  useEffect(() => {
    drawCertificate();
  }, [studentName, university, eventName, templateUrl, suffix, position, qrUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const safeName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
    const safeEvent = eventName.replace(/[^a-zA-Z0-9]/g, "_");
    link.download = `Caravan26_Certificate_${safeName}_${safeEvent}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Certificate - ${studentName}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; background: #fff; min-height: 100vh; }
            img { width: 100%; max-width: 100vw; height: auto; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Canvas Display Card with ambient glow */}
      <div className="w-full relative rounded-2xl overflow-hidden border border-brand-gold/30 shadow-[0_0_50px_rgba(201,162,39,0.15)] bg-black/60 p-2 sm:p-4 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full max-w-4xl h-auto rounded-xl shadow-2xl block transition-all"
          style={{ aspectRatio: "1748 / 1240" }}
        />
        {!isRendered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
            <RefreshCw className="w-8 h-8 text-brand-gold animate-spin" />
            <p className="text-sm font-semibold text-brand-gold">Rendering Official Certificate...</p>
          </div>
        )}
      </div>

      {/* Action Buttons Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          onClick={handleDownload}
          disabled={!isRendered}
          className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-brand-gold to-amber-500 text-black hover:opacity-95 shadow-lg shadow-brand-gold/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Download High-Res Certificate (PNG)
        </button>

        <button
          onClick={handlePrint}
          disabled={!isRendered}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          Print Ready
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all hover:scale-105 active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? "Link Copied!" : "Copy Verification Link"}
        </button>

        <Link
          href={`/verify/${certificateId}`}
          target="_blank"
          className="flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <ExternalLink className="w-4 h-4" />
          View Public Verification
        </Link>
      </div>

      {/* Info Badge */}
      <div className="text-center text-xs text-slate-400">
        Official Certificate No: <span className="font-mono font-bold text-brand-gold">{(serialNumber || "").replace(/[\[\]]/g, "")}</span> • Digital ID: <span className="font-mono text-slate-300">{certificateId}</span>
      </div>
    </div>
  );
}
