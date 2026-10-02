import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

const secretKey = process.env.JWT_SECRET || "fallback-secret-for-development-only";
const key = new TextEncoder().encode(secretKey);

export type AdminUserPayload = {
  userId: string;
  role: "super_admin" | "sub_admin";
  assignedEventIds: string[];
  assignedCategoryIds: string[];
};

export const authService = {
  async createSession(payload: AdminUserPayload) {
    const expires = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(key);

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  },

  async verifySession(token: string) {
    try {
      const { payload } = await jwtVerify(token, key, {
        algorithms: ["HS256"],
      });
      return payload as AdminUserPayload;
    } catch (error) {
      return null;
    }
  },

  async deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
  },

  async getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return null;
    return await this.verifySession(token);
  }
};
