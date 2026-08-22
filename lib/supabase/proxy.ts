import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin = pathname === "/login";
  const appMetadata = user?.app_metadata as { role?: string } | undefined;

  if (!user && isDashboard) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const isStaff =
    appMetadata?.role === "admin" || appMetadata?.role === "manager";

  if (user && isLogin && isStaff) {
    const requested = request.nextUrl.searchParams.get("next");
    const dest =
      requested?.startsWith("/") && !requested.startsWith("//")
        ? requested
        : "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = dest;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
