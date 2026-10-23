import { NextRequest, NextResponse } from "next/server";
import { detectUniversitySchema } from "@/lib/validators/certificateSchema";
import { certificateService } from "@/lib/services/certificateService";
import { rateLimiter } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown_ip";
    const rateCheck = rateLimiter.check(`cert_detect_${clientIp}`, 150, 60 * 1000); // 150 detection requests per minute
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Too many detection attempts. Please wait a moment." },
        { status: 429, headers: { "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString() } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = detectUniversitySchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const { mobile, name } = parseResult.data;
    const result = await certificateService.detectStudentUniversity(mobile, name);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in detect-university route:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while detecting university." },
      { status: 500 }
    );
  }
}
