// 브라우저(클라이언트 컴포넌트)에서 Supabase 접근 시 사용
// "use client" 컴포넌트에서 import해서 사용
import { createBrowserClient } from "@supabase/ssr";

/**
 * 클라이언트 사이드 Supabase 인스턴스를 생성해 반환
 * - 매번 새 인스턴스를 만드는 것이 아니라 싱글톤으로 재사용 권장
 * - 환경변수는 NEXT_PUBLIC_ 접두사가 있어야 브라우저에서 접근 가능
 */
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
