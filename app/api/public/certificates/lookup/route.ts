import { NextRequest, NextResponse } from "next/server";
import { certificateLookupSchema } from "@/lib/validators/certificateSchema";
import { certificateService } from "@/lib/services/certificateService";
import { rateLimiter } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown_ip";
    const rateCheck = rateLimiter.check(`cert_lookup_${clientIp}`, 20, 60 * 1000); // 20 lookups per minute
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Too many lookup attempts. Please wait a moment." },
        { status: 429, headers: { "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString() } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = certificateLookupSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const { name, mobile, university } = parseResult.data;
    const lookupResult = await certificateService.lookupStudentEvents(name, mobile, university);

    return NextResponse.json({
      success: true,
      data: lookupResult,
    });
  } catch (error) {
    console.error("Error in certificate lookup route:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while looking up events." },
      { status: 500 }
    );
  }
}
