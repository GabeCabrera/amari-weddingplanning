import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that don't require authentication
const publicRoutes = ["/login", "/forgot-password", "/reset-password"];

// Routes that require authentication but not tenant resolution
const authOnlyRoutes = ["/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Extract subdomain from host
  // In production: sarahandgabe.aisle.wedding
  // In development: sarahandgabe.localhost:3000
  const hostParts = host.split(".");
  let subdomain: string | null = null;

  if (process.env.NODE_ENV === "development") {
    // localhost:3000 -> no subdomain
    // sarahandgabe.localhost:3000 -> "sarahandgabe"
    if (hostParts.length > 1 && hostParts[0] !== "www") {
      subdomain = hostParts[0];
    }
  } else {
    // aisle.wedding -> no subdomain
    // sarahandgabe.aisle.wedding -> "sarahandgabe"
    // Assumes main domain is 2 parts (aisle.wedding)
    if (hostParts.length > 2 && hostParts[0] !== "www") {
      subdomain = hostParts[0];
    }
  }

  // If no subdomain, redirect to main marketing site (or show error)
  if (!subdomain) {
    // For now, just continue - in production you might redirect to marketing
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

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify user belongs to this tenant
  if (token.tenantSlug !== subdomain) {
    // User is trying to access a different tenant's site
    return NextResponse.redirect(new URL("/login", request.url));
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
