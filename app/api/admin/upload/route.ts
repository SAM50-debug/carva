import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiError, apiSuccess } from "@/lib/api/helpers";
import { uploadService } from "@/lib/services/uploadService";

export async function POST(req: NextRequest) {
  const { session, error } = requireAuth(req);
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "caravan26";

    if (!file) return apiError("No file provided");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadService.upload(buffer, folder);
    return apiSuccess(result);
  } catch (err) {
    console.error("Upload error:", err);
    return apiError("Upload failed", 500);
  }
}
