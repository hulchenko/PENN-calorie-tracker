import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./lib/session";

const protectedRoutes = ["/dashboard", "/profile", "/day"];
const publicRoutes = ["/login"];

export default async function middleware(request: NextRequest) {
  const requestedUrl = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(requestedUrl);
  const isAuthRoute = publicRoutes.includes(requestedUrl);

  const session = await verifySession();
  const userId = session?.user?.user_id;

  if ((requestedUrl === "/" || isProtectedRoute) && !userId) {
    // not authorized + attempt to access protected routes or "/" -> default to /login
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if ((requestedUrl === "/" || isAuthRoute) && userId) {
    // authorized + route attempt to access "/login" or "/" -> default to /dashboard
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
