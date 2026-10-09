import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import { registrationRepository } from "@/lib/repositories/RegistrationRepository";
import { editRegistrationSchema } from "@/lib/validators/editRegistrationSchema";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Authorization check
    const payloadStr = req.headers.get("x-user-payload");
    const user = payloadStr ? JSON.parse(payloadStr) : null;

    if (!user || (user.role !== "super_admin" && user.role !== "sub_admin")) {
      return apiError("Forbidden: You do not have permission to edit this registration.", 403);
    }

    // 2. Validate input using strict Zod schema
    const validationResult = editRegistrationSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError(
        "Validation failed: " + validationResult.error.issues.map((issue: any) => issue.message).join(", "),
        400
      );
    }

    const validatedData = validationResult.data;

    // 3. Fetch existing registration
    const registration = await registrationRepository.findById(id);
    if (!registration) {
      return apiError("Registration not found", 404);
    }

    // 4. If sub_admin, verify they have permission for the events the user is registered for
    if (user.role === "sub_admin") {
      const assignedIds = user.assignedCategoryIds || [];
      const hasPermission = registration.selectedEvents?.some((evt: any) =>
        assignedIds.includes(evt.categoryId)
      );

      if (!hasPermission) {
        return apiError("Forbidden: You are not assigned to manage the events in this registration.", 403);
      }
    }

    // 5. Perform the update
    await registrationRepository.update(id, validatedData as any);

    return apiSuccess({
      message: "Registration updated successfully",
    });
  } catch (error) {
    console.error("Registration Edit API error:", error);
    return apiError("Internal server error", 500);
  }
}
