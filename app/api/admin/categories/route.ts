import { NextRequest } from "next/server";
import { requireAuth, requireSuperAdmin, apiError, apiSuccess } from "@/lib/api/helpers";
import { categoryRepository } from "@/lib/repositories/CategoryRepository";
import { categorySchema } from "@/lib/validators/schemas";

export async function GET(req: NextRequest) {
  const { error } = requireAuth(req);
  if (error) return error;

  const categories = await categoryRepository.findAll();
  return apiSuccess(categories);
}

export async function POST(req: NextRequest) {
  const { error } = requireSuperAdmin(req);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation failed");

    // Check if slug exists
    const existing = await categoryRepository.findBySlug(parsed.data.slug);
    if (existing) return apiError("Category with this slug already exists", 409);

    const created = await categoryRepository.create({
      ...parsed.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return apiSuccess(created, 201);
  } catch (err) {
    console.error("Create category error:", err);
    return apiError("Failed to create category", 500);
  }
}
