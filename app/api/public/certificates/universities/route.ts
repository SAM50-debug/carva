import { NextResponse } from "next/server";
import { certificateService } from "@/lib/services/certificateService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const universities = await certificateService.getDistinctUniversities();
    return NextResponse.json({
      success: true,
      universities,
    });
  } catch (error) {
    console.error("Failed to fetch universities for certificates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load universities list" },
      { status: 500 }
    );
  }
}
