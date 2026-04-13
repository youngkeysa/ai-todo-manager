// Next.js 미들웨어: 모든 요청에서 Supabase 세션을 자동으로 갱신하고 접근 권한을 관리
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 표준 미들웨어 함수
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // 1. Supabase 클라이언트 생성 (SSR 호환 쿠키 관리)
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

  // 2. 세션 정보 조회 (토큰 자동 갱신 포함)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. 페이지 유형 분류
  const { pathname } = request.nextUrl;
  
  // 인증 관련 페이지 (/login, /signup)
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  // 할일 관리 서비스 대시보드 (보호 대상)
  const isDashboardPage = pathname.startsWith("/dashboard");
  // 인증 콜백 경로
  const isCallbackPage = pathname.startsWith("/auth/callback");

  // 4. 접근 제어 로직
  
  // 로그인 상태에서 /login 또는 /signup 접근 시 대시보드로 리디렉션
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 로그인하지 않은 사용자가 대시보드에 접근할 경우 로그인 페이지로 리디렉션
  // (임시 허용: 랜딩 페이지를 통한 "미리 체험하기" 기능 제공을 위함)
  /*
  if (!user && isDashboardPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  */

  // / 경로는 랜딩 페이지이므로 누구나 접근 가능하되, 
  // 로그인한 사용자가 / 에 접속하면 자동으로 대시보드로 보낼지 결정 가능 (현재는 랜딩 보여줌)

  return supabaseResponse;
}

// 미들웨어 적용 범위 설정
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
