import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep dashboard transitions snappy: avoid a network auth check here.
  // Dashboard pages still enforce auth/org server-side via requireDashboardOrg/getOrgForUser.
  if (pathname.startsWith("/dashboard")) {
    const hasAuthCookie = request.cookies
      .getAll()
      .some(({ name }) => name.startsWith("sb-") && name.includes("auth-token"));

    if (!hasAuthCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

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
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session — must not run any other supabase calls in between
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users away from auth pages.
  // Final destination is resolved server-side in /auth/post-login.
  if ((pathname === "/login" || pathname === "/signup") && user) {
    const postLoginUrl = request.nextUrl.clone();
    postLoginUrl.pathname = "/auth/post-login";
    return NextResponse.redirect(postLoginUrl);
  }

  if (pathname.startsWith("/onboarding") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
