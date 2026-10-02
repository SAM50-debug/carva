import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import { uploadService } from "@/lib/services/uploadService";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "caravan26_public";

    if (!file) return apiError("No file provided");

    // Optional: simple file size check (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return apiError("File is too large (max 5MB)", 400);
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
