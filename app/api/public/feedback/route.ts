import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { feedbackSubmissionSchema } from "@/lib/validators/feedbackSchema";
import { rateLimiter } from "@/lib/rateLimit";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown_ip";
    const rateCheck = rateLimiter.check(`feedback_${clientIp}`, 60, 60 * 1000); // 60 submissions per min
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = feedbackSubmissionSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const data = parseResult.data;
    const cleanMobile = data.mobile.trim().replace(/\D/g, "");
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;

    const db = await getDb();
    const feedbackColl = db.collection("feedback");

    // Ensure unique index exists on cleanMobile to guarantee single submission per participant
    try {
      await feedbackColl.createIndex({ cleanMobile: 1 }, { unique: true });
    } catch {
      // Index might already exist or be in creation
    }

    // Check if participant has already submitted feedback
    const existing = await feedbackColl.findOne({
      $or: [
        { cleanMobile: last10 },
        { mobile: data.mobile.trim() }
      ]
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Feedback already submitted. Thank you!",
        alreadySubmitted: true,
      });
    }

    // Sanitize comments
    const sanitizedComments = data.comments
      ? data.comments.replace(/<[^>]*>?/gm, "").trim().slice(0, 1000)
      : "";

    const userAgent = req.headers.get("user-agent") || "unknown";

    const feedbackDoc = {
      registrationId: ObjectId.isValid(data.registrationId) ? new ObjectId(data.registrationId) : data.registrationId,
      studentName: data.studentName.trim(),
      mobile: data.mobile.trim(),
      cleanMobile: last10,
      university: data.university.trim(),
      eventName: data.eventName.trim(),
      ratings: data.ratings,
      comments: sanitizedComments,
      submittedAt: new Date(),
      ipAddress: clientIp,
      userAgent,
    };

    try {
      await feedbackColl.insertOne(feedbackDoc);
    } catch (dbErr: any) {
      // Catch duplicate key race condition gracefully
      if (dbErr.code === 11000) {
        return NextResponse.json({
          success: true,
          message: "Feedback already recorded.",
          alreadySubmitted: true,
        });
      }
      throw dbErr;
    }

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully! Your certificate is now unlocked.",
      alreadySubmitted: false,
    });
  } catch (error: any) {
    console.error("Error in feedback submission API:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error saving feedback." },
      { status: 500 }
    );
  }
}
