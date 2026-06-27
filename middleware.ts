import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow internal assets, API routes, /admin control panel, and the /maintenance page itself to skip checks
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/admin") || // Allows you to log in and turn it off!
    pathname === "/maintenance" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    // 2. Fetch the live status directly from your Supabase REST endpoint
    // We use a standard fetch here to keep the Edge Middleware fast
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/system_settings?id=eq.maintenance_config&select=is_maintenance_active`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 10 }, // Cache check for 10 seconds to keep performance snappy
      }
    );

    const data = await response.json();
    const isMaintenanceActive = data?.[0]?.is_maintenance_active ?? false;

    // 3. If maintenance mode is true, redirect the simple visitor to the hold screen
    if (isMaintenanceActive) {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Maintenance configuration parsing bypass fail:", error);
  }

  return NextResponse.next();
}

// Limit the middleware to run on standard page layouts
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};