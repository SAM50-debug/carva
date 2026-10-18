import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import { uploadService } from "@/lib/services/uploadService";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "caravan26_public";

    if (!file) return apiError("No file provided", 400);

    // Validate MIME types (images and PDFs only)
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedMimeTypes.includes(file.type)) {
      return apiError("Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.", 400);
    }

    // Validate folder against strict whitelist to prevent arbitrary folder traversal
    const allowedFolders = ["caravan26_public", "caravan26_payments", "caravan26_idcards"];
    const targetFolder = allowedFolders.includes(folder) ? folder : "caravan26_public";

    // File size check (max 15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      return apiError("File is too large (max 15MB)", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadService.upload(buffer, targetFolder);
    return apiSuccess(result);
  } catch (err) {
    console.error("Public upload error:", err);
    return apiError("Upload failed", 500);
  }
}
