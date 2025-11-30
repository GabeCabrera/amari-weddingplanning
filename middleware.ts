import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that don't require authentication
const publicRoutes = ["/login", "/forgot-password", "/reset-password"];

function getSubdomain(host: string): string | null {
  // Remove port if present
  const hostWithoutPort = host.split(":")[0];
  const parts = hostWithoutPort.split(".");

  // Development: localhost alone -> no subdomain
  if (hostWithoutPort === "localhost" || hostWithoutPort === "127.0.0.1") {
    return null;
  }

  // Development: sarahandgabe.localhost -> subdomain is "sarahandgabe"
  if (parts.length === 2 && parts[1] === "localhost") {
    return parts[0];
  }

  // Vercel preview URLs: something.vercel.app -> no subdomain (it's the project name)
  // sarahandgabe.amari-weddingplanning.vercel.app -> subdomain is "sarahandgabe"
  if (hostWithoutPort.endsWith(".vercel.app")) {
    // Count parts: project.vercel.app = 3 parts, subdomain.project.vercel.app = 4 parts
    if (parts.length > 3 && parts[0] !== "www") {
      return parts[0];
    }
    return null;
  }

  // Production: aisle.wedding -> no subdomain
  // sarahandgabe.aisle.wedding -> subdomain is "sarahandgabe"
  if (parts.length > 2 && parts[0] !== "www") {
    return parts[0];
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Extract subdomain
  const subdomain = getSubdomain(host);
  
  console.log(`[Middleware] Host: ${host}, Subdomain: ${subdomain}, Path: ${pathname}`);

  // If no subdomain, allow access (marketing site or root Vercel URL)
  if (!subdomain) {
    return NextResponse.next();
  }

  // Store subdomain in headers for use in pages
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", subdomain);

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Check authentication for protected routes
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log(`[Middleware] Token:`, token ? `User ${token.email}, Tenant: ${token.tenantSlug}` : "No token");

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify user belongs to this tenant
  if (token.tenantSlug !== subdomain) {
    console.log(`[Middleware] Tenant mismatch: token has ${token.tenantSlug}, URL has ${subdomain}`);
    // User is trying to access a different tenant's site
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user must change password
  if (token.mustChangePassword && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
