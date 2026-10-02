import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  // Skip if not an admin route or if it's the login page
  if (
    (!isAdminRoute && !isAdminApiRoute) ||
    pathname === "/admin/login" ||
    pathname === "/api/admin/auth/login"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;

  if (!token) {
    if (isAdminApiRoute) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    
    // Role-based access control
    const role = payload.role as string;
    
    if (role === "sub_admin") {
      // Allow only /admin/attendance or auth API routes
      if (
        !pathname.startsWith("/admin/attendance") && 
        !pathname.startsWith("/api/admin/auth") &&
        !pathname.startsWith("/api/admin/attendance")
      ) {
        if (isAdminApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/admin/attendance", request.url));
      }
    }

    // Forward decoded user payload to API routes via header
    const response = NextResponse.next();
    response.headers.set("x-user-payload", JSON.stringify(payload));
    return response;
  } catch {
    // Token expired or invalid
    if (isAdminApiRoute) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      response.cookies.delete("admin_session");
      return response;
    }
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("admin_session");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
