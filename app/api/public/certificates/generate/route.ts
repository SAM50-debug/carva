import { NextRequest, NextResponse } from "next/server";
import { certificateGenerateSchema } from "@/lib/validators/certificateSchema";
import { certificateService } from "@/lib/services/certificateService";
import { rateLimiter } from "@/lib/rateLimit";

import { getCanonicalBaseUrl } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown_ip";
    const rateCheck = rateLimiter.check(`cert_gen_${clientIp}`, 120, 60 * 1000); // 120 per minute
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

    // Resolve public URL origin (support reverse proxy headers)
    const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "") || "https";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
    const requestOrigin = host ? `${proto}://${host}` : req.nextUrl.origin;
    const origin = getCanonicalBaseUrl(requestOrigin);

    // Backend Gatekeeper: Participant must have submitted feedback before generating certificate
    const { getDb } = await import("@/lib/db/client");
    const db = await getDb();
    const cleanMobile = parseResult.data.mobile.trim().replace(/\D/g, "");
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;
    const { ObjectId } = await import("mongodb");

    const feedbackExists = await db.collection("feedback").findOne({
      $or: [
        { cleanMobile: last10 },
        { mobile: parseResult.data.mobile.trim() },
        ...(ObjectId.isValid(parseResult.data.registrationId)
          ? [{ registrationId: new ObjectId(parseResult.data.registrationId) }]
          : [{ registrationId: parseResult.data.registrationId }]),
      ],
    });

    if (!feedbackExists) {
      return NextResponse.json(
        {
          success: false,
          error: "Participant feedback is required before generating your certificate.",
          requiresFeedback: true,
        },
        { status: 403 }
      );
    }

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
