import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const buildContentSecurityPolicy = () =>
  [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    [
      "script-src",
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
    ].join(" "),
    [
      "connect-src",
      "'self'",
      "https:",
      "wss:",
      "https://www.google-analytics.com",
      "https://region1.google-analytics.com",
      "https://*.supabase.co",
    ].join(" "),
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "form-action 'self' https://checkout.stripe.com",
  ].join("; ");

const applySecurityHeaders = (response: NextResponse) => {
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy());
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
};

const isAdminPath = (pathname: string) => {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  return routing.locales.some(
    (locale) =>
      pathname === `/${locale}/admin` || pathname.startsWith(`/${locale}/admin/`)
  );
};

const getAdminAuthConfig = () => ({
  user: process.env.ADMIN_BASIC_AUTH_USER ?? "",
  pass: process.env.ADMIN_BASIC_AUTH_PASS ?? "",
});

const isAuthorizedAdminRequest = (request: NextRequest) => {
  const { user, pass } = getAdminAuthConfig();
  if (!user || !pass) return false;

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;

  try {
    const encoded = auth.slice("Basic ".length);
    const decoded = atob(encoded);
    const delimiter = decoded.indexOf(":");
    if (delimiter < 0) return false;
    const reqUser = decoded.slice(0, delimiter);
    const reqPass = decoded.slice(delimiter + 1);
    return reqUser === user && reqPass === pass;
  } catch {
    return false;
  }
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname)) {
    const { user, pass } = getAdminAuthConfig();
    const hasAdminAuthConfig = Boolean(user && pass);

    if (!hasAdminAuthConfig && process.env.NODE_ENV === "production") {
      const response = NextResponse.json({ error: "Not Found" }, { status: 404 });
      applySecurityHeaders(response);
      return response;
    }

    if (hasAdminAuthConfig && !isAuthorizedAdminRequest(request)) {
      const response = new NextResponse("Authentication required.", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Console"',
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      });
      applySecurityHeaders(response);
      return response;
    }
  }

  const response = intlMiddleware(request);
  applySecurityHeaders(response);

  if (isAdminPath(pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
