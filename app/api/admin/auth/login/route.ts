import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { apiError, apiSuccess } from "@/lib/api/helpers";
import bcrypt from "bcrypt";
import { authService } from "@/lib/services/authService";
import { rateLimiter } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown_ip";
    const rateCheck = rateLimiter.check(`login_${clientIp}`, 10, 5 * 60 * 1000); // 10 attempts per 5 minutes

    if (!rateCheck.success) {
      const waitMinutes = Math.ceil(rateCheck.resetMs / 60000);
      return NextResponse.json(
        { error: `Too many login attempts. Please wait ${waitMinutes} minute(s) before trying again.` },
        { status: 429, headers: { "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString() } }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return apiError("Email and password are required", 400);
    }

    const db = await getDb();
    const adminUser = await db.collection("adminUsers").findOne({ email });

    if (!adminUser) {
      return apiError("Invalid credentials", 401);
    }

    if (!adminUser.isActive) {
      return apiError("Account is disabled", 403);
    }

    const isValid = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isValid) {
      return apiError("Invalid credentials", 401);
    }

    // Create session
    await authService.createSession({
      userId: adminUser._id.toString(),
      role: adminUser.role,
      assignedEventIds: adminUser.assignedEventIds?.map((id: any) => id.toString()) || [],
      assignedCategoryIds: adminUser.assignedCategoryIds?.map((id: any) => id.toString()) || [],
    });

    // Update last login
    await db.collection("adminUsers").updateOne(
      { _id: adminUser._id },
      { $set: { lastLoginAt: new Date() } }
    );

    return apiSuccess({
      user: {
        name: adminUser.name,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return apiError("Internal server error", 500);
  }
}
