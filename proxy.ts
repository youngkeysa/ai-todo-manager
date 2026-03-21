// Next.js 미들웨어: 모든 요청에서 Supabase 세션을 자동으로 갱신
// 이 파일이 없으면 서버 컴포넌트에서 세션이 만료될 수 있음
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // 요청/응답에 쿠키를 주입해 세션 갱신
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
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 조회 (토큰 자동 갱신 포함)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 인증이 필요한 페이지 보호: 비로그인 상태면 /login으로 리디렉션
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  const isCallbackPage = request.nextUrl.pathname.startsWith("/auth/callback");

  // 로그인 상태에서 /login, /signup 접근 시 메인으로 리디렉션
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 로그인하지 않은 사용자가 인증/콜백 이외의 페이지에 접근할 경우 로그인 페이지로 리디렉트
  if (!user && !isAuthPage && !isCallbackPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// 미들웨어 적용 범위: 정적 파일 및 API를 제외한 모든 경로
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
