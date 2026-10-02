import { NextRequest } from "next/server";
import { requireAuth, requireSuperAdmin, apiError, apiSuccess } from "@/lib/api/helpers";
import { eventRepository } from "@/lib/repositories/EventRepository";
import { eventSchema } from "@/lib/validators/schemas";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  const { session, error } = requireAuth(req);
  if (error) return error;

  const events = await eventRepository.findForAdmin(session.role, session.assignedEventIds);
  return apiSuccess(events);
}

export async function POST(req: NextRequest) {
  const { error } = requireSuperAdmin(req);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation failed");

    const existing = await eventRepository.findBySlug(parsed.data.slug);
    if (existing) return apiError("Event with this slug already exists", 409);

    const created = await eventRepository.create({
      ...parsed.data,
      categoryId: new ObjectId(parsed.data.categoryId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return apiSuccess(created, 201);
  } catch (err) {
    console.error("Create event error:", err);
    return apiError("Failed to create event", 500);
  }
}
