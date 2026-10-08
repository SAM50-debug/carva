import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { registrationSchema } from "@/lib/validators/registrationSchema";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import QRCode from "qrcode";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
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

    // Check Fashion Modeling exclusivity: Only 1 team per university
    const hasFashionModeling = data.selectedEvents.some(e => e.eventName.toLowerCase().includes("fashion modeling"));
    if (hasFashionModeling && data.participationType === "team") {
      const existing = await db.collection("registrations").findOne({
        university: { $regex: new RegExp(`^${data.university}$`, "i") },
        "selectedEvents.eventName": { $regex: /fashion modeling/i },
        status: { $ne: "rejected" }
      });

      if (existing) {
        return apiError("Your university has already registered a team for Fashion Modeling.", 400);
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
