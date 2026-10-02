import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, assignedCategoryIds } = await req.json();

    if (!name || !email || !password) {
      return apiError("Name, email, and password are required", 400);
    }

    const db = await getDb();
    
    // Check if email already exists
    const existing = await db.collection("adminUsers").findOne({ email });
    if (existing) {
      return apiError("Email is already in use by another staff member", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    const staffDoc = {
      name,
      email,
      passwordHash,
      role: "sub_admin",
      assignedCategoryIds: assignedCategoryIds.map((id: string) => new ObjectId(id)),
      assignedEventIds: [], // Keep for backward compatibility or individual event assignment
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("adminUsers").insertOne(staffDoc);

    return apiSuccess({
      message: "Sub-admin created successfully",
      staffId: result.insertedId
    });
  } catch (error) {
    console.error("Create staff error:", error);
    return apiError("Internal server error", 500);
  }
}
