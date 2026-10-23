import { NextRequest, NextResponse } from "next/server";
import { certificateService } from "@/lib/services/certificateService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    const { certId } = await params;
    if (!certId || typeof certId !== "string") {
      return NextResponse.json({ success: false, error: "Missing certificate ID" }, { status: 400 });
    }

    const verificationResult = await certificateService.verifyCertificate(certId);

    if (!verificationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          isValid: false,
          isAuthentic: false,
          error: verificationResult.message || "Certificate not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...verificationResult,
    });
  } catch (error) {
    console.error("Error in certificate verification route:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
