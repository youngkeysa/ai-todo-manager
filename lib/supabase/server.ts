// 서버 컴포넌트 / Server Actions / Route Handler에서 Supabase 접근 시 사용
// cookies()를 통해 세션을 관리 (SSR 안전)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 서버 사이드 Supabase 인스턴스를 생성해 반환
 * - Next.js 서버 컴포넌트 및 Route Handler에서만 사용 가능
 * - 쿠키를 읽고 쓰는 방식으로 세션을 유지
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 서버 컴포넌트에서 쿠키 쓰기가 불가능한 경우 무시
            // (미들웨어에서 세션 갱신을 처리하므로 문제 없음)
          }
        },
      },
    }
  );
};
