import { NextRequest } from "next/server";
import { requireAuth, requireSuperAdmin, apiError, apiSuccess } from "@/lib/api/helpers";
import { categoryRepository } from "@/lib/repositories/CategoryRepository";
import { categoryUpdateSchema } from "@/lib/validators/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = requireAuth(req);
  if (error) return error;

  const resolvedParams = await params;
  const category = await categoryRepository.findById(resolvedParams.id);
  if (!category) return apiError("Category not found", 404);

  return apiSuccess(category);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = requireSuperAdmin(req);
  if (error) return error;

  const resolvedParams = await params;

  try {
    const body = await req.json();
    const parsed = categoryUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation failed");

    // If slug is updated, ensure uniqueness
    if (parsed.data.slug) {
      const existing = await categoryRepository.findBySlug(parsed.data.slug);
      if (existing && existing._id?.toString() !== resolvedParams.id) {
        return apiError("Slug already in use", 409);
      }
    }

    await categoryRepository.update(resolvedParams.id, parsed.data);
    return apiSuccess({ success: true });
  } catch (err) {
    console.error("Update category error:", err);
    return apiError("Failed to update category", 500);
  }
}
