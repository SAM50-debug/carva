import { NextRequest } from "next/server";
import { requireAuth, requireSuperAdmin, apiError, apiSuccess } from "@/lib/api/helpers";
import { eventRepository } from "@/lib/repositories/EventRepository";
import { eventUpdateSchema } from "@/lib/validators/schemas";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = requireAuth(req);
  if (error) return error;

  const resolvedParams = await params;
  const event = await eventRepository.findById(resolvedParams.id);
  if (!event) return apiError("Event not found", 404);

  // Sub-admin can only view if assigned
  if (session.role === "sub_admin" && !session.assignedEventIds.includes(resolvedParams.id)) {
    return apiError("Forbidden", 403);
  }

  return apiSuccess(event);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = requireSuperAdmin(req);
  if (error) return error;

  const resolvedParams = await params;

  try {
    const body = await req.json();
    const parsed = eventUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation failed");

    if (parsed.data.slug) {
      const existing = await eventRepository.findBySlug(parsed.data.slug);
      if (existing && existing._id?.toString() !== resolvedParams.id) {
        return apiError("Slug already in use", 409);
      }
    }

    const updateData: any = { ...parsed.data };
    if (updateData.categoryId) {
      updateData.categoryId = new ObjectId(updateData.categoryId);
    }

    await eventRepository.update(resolvedParams.id, updateData);
    return apiSuccess({ success: true });
  } catch (err) {
    console.error("Update event error:", err);
    return apiError("Failed to update event", 500);
  }
}
