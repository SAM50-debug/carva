import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import { uploadService } from "@/lib/services/uploadService";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "caravan26_public";

    if (!file) return apiError("No file provided");

    // File size check (max 15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      return apiError("File is too large (max 15MB)", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadService.upload(buffer, folder);
    return apiSuccess(result);
  } catch (err) {
    console.error("Public upload error:", err);
    return apiError("Upload failed", 500);
  }
}
