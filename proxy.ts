import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Protect /admin/* — requires authenticated user
  // Actual role check (admin vs customer) lives in requireAdmin() inside each page
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const dest = new URL("/", request.url);
      dest.searchParams.set("modal", "login");
      dest.searchParams.set("next", pathname);
      return NextResponse.redirect(dest);
    }
  }

  // Protect /checkout, /account, /orders
  if (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders")
  ) {
    if (!user) {
      const dest = new URL("/", request.url);
      dest.searchParams.set("modal", "login");
      dest.searchParams.set("next", pathname);
      return NextResponse.redirect(dest);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static, _next/image (static files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
