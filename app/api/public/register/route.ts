import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { registrationSchema } from "@/lib/validators/registrationSchema";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import { isRegistrationClosed } from "@/lib/constants";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import QRCode from "qrcode";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Security & Business Rule: Server-side registration cutoff
    if (isRegistrationClosed()) {
      return apiError("Registrations for CARAVAN '26 have officially closed.", 403);
    }

    const body = await req.json();

    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
    }

    const data = parsed.data;

    // Additional backend validation: max 2 categories
    const categoriesSet = new Set(data.selectedEvents.map((e) => e.categoryId));
    if (categoriesSet.size > 2) {
      return apiError("You can select events from a maximum of 2 categories", 400);
    }

    const db = await getDb();

    // Check Fashion Modeling exclusivity: 1 model for solo modeling, 1 duet team, and 1 group team (4-13) per university
    const hasFashionModeling = data.selectedEvents.some(e => e.eventName.toLowerCase().includes("fashion modeling"));
    if (hasFashionModeling) {
      const fashionEvt = data.selectedEvents.find(e => e.eventName.toLowerCase().includes("fashion modeling"));
      const count = fashionEvt?.teamDetails?.memberCount;
      const fName = fashionEvt?.eventName?.toLowerCase() || "";
      const isSolo = data.participationType === "individual" || count === 1 || fName.includes("(solo)");
      const isDuet = (data.participationType === "team" && count === 2) || fName.includes("(duet)");
      const isTeam = (data.participationType === "team" && (count ? count >= 4 && count <= 13 : false)) || fName.includes("(team)");

      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const existingDocs = await db.collection("registrations").find({
        university: { $regex: new RegExp(`^${escapeRegex(data.university)}$`, "i") },
        "selectedEvents.eventName": { $regex: /fashion modeling/i },
        status: { $ne: "rejected" }
      }).toArray();

      if (isSolo) {
        const hasExistingSolo = existingDocs.some((r: any) =>
          r.participationType === "individual" ||
          r.selectedEvents?.some((e: any) =>
            e.eventName?.toLowerCase().includes("fashion modeling") &&
            (e.teamDetails?.memberCount === 1 || e.eventName?.toLowerCase().includes("(solo)"))
          )
        );
        if (hasExistingSolo) {
          return apiError("Your university has already registered a model for Solo Fashion Modeling (limit: 1 per university).", 400);
        }
      }

      if (isDuet) {
        const hasExistingDuet = existingDocs.some((r: any) =>
          r.participationType === "team" &&
          r.selectedEvents?.some((e: any) =>
            e.eventName?.toLowerCase().includes("fashion modeling") &&
            (e.teamDetails?.memberCount === 2 || e.eventName?.toLowerCase().includes("(duet)"))
          )
        );
        if (hasExistingDuet) {
          return apiError("Your university has already registered a team for Duet Fashion Modeling (limit: 1 duet team per university).", 400);
        }
      }

      if (isTeam) {
        const hasExistingTeam = existingDocs.some((r: any) =>
          r.participationType === "team" &&
          r.selectedEvents?.some((e: any) =>
            e.eventName?.toLowerCase().includes("fashion modeling") &&
            ((e.teamDetails?.memberCount >= 4 && e.teamDetails?.memberCount <= 13) || e.eventName?.toLowerCase().includes("(team)"))
          )
        );
        if (hasExistingTeam) {
          return apiError("Your university has already registered a team for Group Fashion Modeling (limit: 1 team of 4-13 members per university).", 400);
        }
      }
    }

    const qrCode = nanoid(16);

    const registrationDoc = {
      ...data,
      qrCode,
      status: "verified",
      submittedAt: new Date(),
    };

    const result = await db.collection("registrations").insertOne(registrationDoc);

    // Generate QR Code as Buffer for email attachment
    try {
      const qrBuffer = await QRCode.toBuffer(qrCode, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 300,
        margin: 2
      });

      // Email is gated behind RESEND_ENABLED=true — set in .env.local when domain is verified
      if (process.env.RESEND_ENABLED === 'true') {
        resend.emails.send({
          from: process.env.RESEND_FROM || 'CARAVAN \'26 <onboarding@resend.dev>',
          to: data.email,
          subject: "Your CARAVAN '26 Ticket & QR Code",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #c8102e;">Welcome to CARAVAN '26!</h2>
              <p>Hi <strong>${data.studentName}</strong>,</p>
              <p>Your registration is confirmed. Please find your event entry ticket attached to this email.</p>
              <p>You must present this QR code at the entry gates and at your specific event venues.</p>
              <div style="margin: 20px 0;">
                <strong>Roll Number:</strong> ${data.rollNumber}<br/>
                <strong>Events Registered:</strong> ${data.selectedEvents.length}
              </div>
              <p>We look forward to seeing you there!</p>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">- CARAVAN '26 Organizing Committee</p>
            </div>
          `,
          attachments: [
            {
              filename: 'caravan26-ticket.png',
              content: qrBuffer
            }
          ]
        }).catch(err => console.error("Resend error:", err));
      }
    } catch (qrErr) {
      console.error("QR Generation error for email:", qrErr);
    }

    return apiSuccess({
      registrationId: result.insertedId,
      qrCode,
      message: "Registration submitted successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return apiError("Internal server error", 500);
  }
}
