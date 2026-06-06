import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_DOMAIN = "nailsbysd.com";
const ADMIN_DOMAIN = `admin.${PUBLIC_DOMAIN}`;

export default withAuth(
  function middleware(req) {
    const host = req.headers.get("host") || "";
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token as { role?: string } | null;

    const isAdminSubdomain = host === ADMIN_DOMAIN || host === `www.${ADMIN_DOMAIN}`;
    const isCustomDomain = host === PUBLIC_DOMAIN || host === `www.${PUBLIC_DOMAIN}`;
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    // Vercel preview/prod URLs (*.vercel.app) — traiter comme localhost
    const isVercel = host.includes("vercel.app");

    // ── admin.nailsbysd.com ──────────────────────────────────────────────
    if (isAdminSubdomain) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    // ── nailsbysd.com (domaine public custom) ───────────────────────────
    // Rediriger /admin vers le sous-domaine admin uniquement sur le vrai domaine
    if (isCustomDomain && pathname.startsWith("/admin")) {
      const target = `https://${ADMIN_DOMAIN}${pathname}${req.nextUrl.search}`;
      return NextResponse.redirect(target);
    }

    // ── localhost & vercel.app : protection simple sans redirection ──────
    if (isLocalhost || isVercel) {
      if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
        if (!token || token.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/admin/login", req.url));
        }
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const host = req.headers.get("host") || "";
        const pathname = req.nextUrl.pathname;
        const isAdminSubdomain = host === ADMIN_DOMAIN;
        const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
        const isVercel = host.includes("vercel.app");

        // Login page toujours accessible
        if (pathname.startsWith("/admin/login")) return true;

        // Routes publiques
        if (!pathname.startsWith("/admin")) return true;

        // Admin routes : token requis
        if (isAdminSubdomain || isLocalhost || isVercel) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
