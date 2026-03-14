import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

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
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (hasAdminAuthConfig && !isAuthorizedAdminRequest(request)) {
      return new NextResponse("Authentication required.", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Console"',
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      });
    }
  }

  const response = intlMiddleware(request);

  if (isAdminPath(pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
