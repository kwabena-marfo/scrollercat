import { NextRequest, NextResponse } from "next/server";

// better-auth's session cookie (the __Secure- prefix is added over HTTPS).
// Read by name rather than through better-auth/cookies, which drags its JWT
// code into the Edge bundle.
const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

// A quick cookie check so signed-out visitors go straight to the login page
// instead of seeing the admin shell flash. It doesn't validate the session —
// the API (middlewares/auth/authorize.ts) does that on every request.
export function middleware(request: NextRequest) {
  if (!SESSION_COOKIES.some((name) => request.cookies.has(name))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
