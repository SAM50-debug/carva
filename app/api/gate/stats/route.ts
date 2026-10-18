import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import { GATE_SECURITY_KEY } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || req.headers.get("x-gate-key");

    if (key !== GATE_SECURITY_KEY) {
      return apiError("Unauthorized: Invalid Gate Security Key.", 401);
    }

    const db = await getDb();

    // Query statistics
    const [totalEntries, recentScans, headcountAgg, universityList] = await Promise.all([
      db.collection("gate_entries").countDocuments(),
      db.collection("gate_entries")
        .find()
        .sort({ scannedAt: -1 })
        .limit(10)
        .project({
          studentName: 1,
          university: 1,
          admittedCount: 1,
          participationType: 1,
          gateName: 1,
          scannedAt: 1,
          isReEntry: 1,
        })
        .toArray(),
      db.collection("gate_entries").aggregate([
        { $match: { isReEntry: { $ne: true } } },
        { $group: { _id: null, totalHeadcount: { $sum: "$admittedCount" } } }
      ]).toArray(),
      db.collection("gate_entries").distinct("university")
    ]);

    const totalHeadcount = headcountAgg[0]?.totalHeadcount || totalEntries;

    return apiSuccess({
      totalEntries,
      totalHeadcount,
      totalUniversities: universityList.length,
      recentScans,
    });
  } catch (error) {
    console.error("Gate stats error:", error);
    return apiError("Internal server error", 500);
  }
}
