import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import arcjet, { shield, detectBot } from "@arcjet/next";

const isProtectedRoute = (path) => {
  const protectedRoutes = [
    "/dashboard",
    "/account",
    "/transaction",
  ];
  return protectedRoutes.some((route) => path.startsWith(route));
};

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("token")?.value;

  // Run Arcjet bot protection
  const decision = await aj.protect(req);

  // Block if denied by Arcjet
  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      return NextResponse.json(
        { error: "Bot detected", reason: "bot" },
        { status: 403 }
      );
    }
    if (decision.reason.isShield()) {
      return NextResponse.json(
        { error: "Suspicious activity detected", reason: "shield" },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }

  // Check authentication for protected routes
  if (isProtectedRoute(path)) {
    if (!token) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
