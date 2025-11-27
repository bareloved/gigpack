import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Create i18n middleware
const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip i18n middleware for API routes, static files, and public gig pages
  // Public gig pages (/g/slug) should work without locale prefix
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/g/")
  ) {
    return NextResponse.next();
  }

  // First, handle i18n routing
  const intlResponse = await intlMiddleware(request);
  
  // If i18n middleware returns a redirect, return it immediately
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }
  
  // Extract locale from pathname (e.g., /en/... or /he/...)
  const localeMatch = pathname.match(/^\/(en|he)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
  const pathWithoutLocale = localeMatch ? pathname.replace(`/${locale}`, "") || "/" : pathname;

  // Use the response from i18n middleware or create a new one
  const response = intlResponse || NextResponse.next({
    request,
  });

  // Skip auth logic for API routes and public routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathWithoutLocale.startsWith("/g/")
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  // Protect /gigpacks routes (with locale prefix)
  if (pathWithoutLocale.startsWith("/gigpacks") && !user) {
    return NextResponse.redirect(new URL(`/${locale}/auth/sign-in`, request.url));
  }

  // Redirect authenticated users away from auth pages (with locale prefix)
  if (pathWithoutLocale.startsWith("/auth") && user) {
    return NextResponse.redirect(new URL(`/${locale}/gigpacks`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

