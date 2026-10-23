import { NextRequest } from "next/server";
import { requireAuth, requireSuperAdmin, apiError, apiSuccess } from "@/lib/api/helpers";
import { certificateRepository } from "@/lib/repositories/CertificateRepository";
import { publishEventResultsSchema } from "@/lib/validators/certificateSchema";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  const { error } = requireAuth(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  if (eventId) {
    const result = await certificateRepository.findResultByEventId(eventId);
    return apiSuccess(result || { eventId, winners: [] });
  }

  const results = await certificateRepository.findAllResults();
  return apiSuccess(results);
}

export async function POST(req: NextRequest) {
  const { session, error } = requireSuperAdmin(req);
  if (error) return error;

  try {
    const body = await req.json();
    const parse = publishEventResultsSchema.safeParse(body);
    if (!parse.success) {
      return apiError(parse.error.issues[0]?.message || "Validation failed", 400);
    }

    const { eventId, eventName, categoryId, categoryName, winners } = parse.data;

    const formattedWinners = winners.map((w) => ({
      position: w.position,
      studentName: w.studentName.trim(),
      university: w.university.trim(),
      mobile: w.mobile ? w.mobile.trim() : undefined,
      rollNumber: w.rollNumber ? w.rollNumber.trim() : undefined,
      registrationId: w.registrationId && ObjectId.isValid(w.registrationId) ? new ObjectId(w.registrationId) : undefined,
    }));

    const saved = await certificateRepository.saveEventResult({
      eventId,
      eventName,
      categoryId,
      categoryName,
      winners: formattedWinners,
      publishedBy: session?.userId ? new ObjectId(session.userId) : undefined,
      publishedAt: new Date(),
    });

    // Automatically upgrade any certificates already generated to the Winner tier
    const { certificateService } = await import("@/lib/services/certificateService");
    const upgradeRes = await certificateService.syncWinnersAndUpgradeCertificates(eventId, formattedWinners);

    return apiSuccess({
      ...saved,
      upgradedCertificatesCount: upgradeRes.upgradedCount,
    });
  } catch (err: any) {
    console.error("Save event results error:", err);
    return apiError("Failed to save event results", 500);
  }
}
