
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const isProtectedRoute = (path) => {
  const protectedRoutes = [
    "/dashboard",
    "/account",
    "/transaction",
  ];
  return protectedRoutes.some((route) => path.startsWith(route));
};

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("token")?.value;

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
