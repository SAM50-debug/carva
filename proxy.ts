import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  // Strip any untrusted incoming x-user-payload header to prevent role spoofing
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-user-payload");

  // Skip if not an admin route or if it's the login page
  if (
    (!isAdminRoute && !isAdminApiRoute) ||
    pathname === "/admin/login" ||
    pathname === "/api/admin/auth/login"
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
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
      // Allow /admin, /admin/attendance, /admin/attendance-records, /admin/registrations, or auth API routes
      if (
        pathname !== "/admin" &&
        !pathname.startsWith("/admin/attendance") && 
        !pathname.startsWith("/admin/attendance-records") && 
        !pathname.startsWith("/admin/registrations") && 
        !pathname.startsWith("/admin/gate") && 
        !pathname.startsWith("/api/admin/auth") &&
        !pathname.startsWith("/api/admin/attendance") &&
        !pathname.startsWith("/api/admin/registrations")
      ) {
        if (isAdminApiRoute) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    // Forward verified user payload to API routes via internal request headers
    requestHeaders.set("x-user-payload", JSON.stringify(payload));
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
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
