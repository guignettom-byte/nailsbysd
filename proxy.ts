import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_DOMAIN = "nailsbysd.com";
const ADMIN_DOMAIN = `admin.${PUBLIC_DOMAIN}`;

export default withAuth(
  function middleware(req) {
    const host = req.headers.get("host") || "";
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token as { role?: string } | null;

    const isAdminSubdomain =
      host === ADMIN_DOMAIN || host === `www.${ADMIN_DOMAIN}`;
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

    // ── LOCALHOST : comportement actuel conservé ─────────────────────────────
    if (isLocalhost) {
      if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
        if (!token || token.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/admin/login", req.url));
        }
      }
      return NextResponse.next();
    }

    // ── admin.nailsbysd.com ──────────────────────────────────────────────────
    if (isAdminSubdomain) {
      // Non authentifié ou non admin → page de login
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      // Racine du sous-domaine → dashboard
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    // ── nailsbysd.com ────────────────────────────────────────────────────────
    // Accès direct à /admin sur le domaine public → rediriger vers sous-domaine
    if (pathname.startsWith("/admin")) {
      const target = `https://${ADMIN_DOMAIN}${pathname}${req.nextUrl.search}`;
      return NextResponse.redirect(target);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const host = req.headers.get("host") || "";
        const isAdminSubdomain = host === ADMIN_DOMAIN || host === `www.${ADMIN_DOMAIN}`;
        const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
        const pathname = req.nextUrl.pathname;

        // Routes publiques : toujours autorisées
        if (!isAdminSubdomain && !pathname.startsWith("/admin")) return true;

        // localhost /admin : besoin d'un token
        if (isLocalhost && pathname.startsWith("/admin")) {
          if (pathname.startsWith("/admin/login")) return true;
          return !!token;
        }

        // admin subdomain : besoin d'un token
        if (isAdminSubdomain) {
          if (pathname.startsWith("/admin/login")) return true;
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
    // Toutes les routes sauf fichiers statiques Next.js
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
