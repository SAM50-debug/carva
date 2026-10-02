import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return apiError("Invalid staff ID", 400);
    }

    const { name, email, password, assignedCategoryIds } = await req.json();

    if (!name || !email) {
      return apiError("Name and email are required", 400);
    }

    const db = await getDb();
    
    // Get the staff member we're trying to update
    const targetStaff = await db.collection("adminUsers").findOne({ _id: new ObjectId(id) });
    if (!targetStaff) {
      return apiError("Staff member not found", 404);
    }
    
    if (targetStaff.role === "super_admin") {
      return apiError("Cannot modify a super admin account", 403);
    }
    
    // Check if email already exists for another user
    const existing = await db.collection("adminUsers").findOne({ email, _id: { $ne: new ObjectId(id) } });
    if (existing) {
      return apiError("Email is already in use by another staff member", 409);
    }

    const updateDoc: any = {
      $set: {
        name,
        email,
        assignedCategoryIds: assignedCategoryIds.map((cId: string) => new ObjectId(cId)),
        updatedAt: new Date(),
      }
    };

    if (password && password.trim() !== "") {
      updateDoc.$set.passwordHash = await bcrypt.hash(password, 12);
    }

    const result = await db.collection("adminUsers").updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );

    if (result.matchedCount === 0) {
      return apiError("Staff member not found", 404);
    }

    return apiSuccess({
      message: "Staff member updated successfully",
    });
  } catch (error) {
    console.error("Update staff error:", error);
    return apiError("Internal server error", 500);
  }
}
