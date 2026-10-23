import { NextRequest, NextResponse } from "next/server";
import { certificateGenerateSchema } from "@/lib/validators/certificateSchema";
import { certificateService } from "@/lib/services/certificateService";
import { rateLimiter } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown_ip";
    const rateCheck = rateLimiter.check(`cert_gen_${clientIp}`, 20, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString() } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = certificateGenerateSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const origin = req.nextUrl.origin || "https://caravanrimt.com";
    const certificate = await certificateService.generateCertificate({
      ...parseResult.data,
      origin,
    });

    return NextResponse.json({
      success: true,
      certificate,
    });
  } catch (error: any) {
    console.error("Error in certificate generate route:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate certificate." },
      { status: 500 }
    );
  }
}
