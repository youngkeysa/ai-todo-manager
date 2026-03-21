// Supabase 이메일 인증 후 리디렉션되는 콜백 Route Handler
// 이메일 인증 링크 클릭 → 이 엔드포인트에서 code를 토큰으로 교환 → 메인 페이지로 이동
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 인증 후 이동할 페이지 (기본: 메인)
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // code를 세션 토큰으로 교환
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 코드가 없거나 에러 시 로그인 페이지로 이동
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
