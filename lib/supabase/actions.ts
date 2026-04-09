"use server";

// 인증 관련 Server Actions: 로그인, 회원가입, 로그아웃
// "use server"가 있어야 클라이언트 컴포넌트에서 안전하게 호출 가능
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// 로그인
// ============================================================

/**
 * 이메일/비밀번호로 로그인
 * @returns 에러 발생 시 에러 메시지 문자열, 성공 시 undefined
 */
export const login = async (email: string, password: string) => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // 사용자에게 보여줄 친절한 한국어 메시지로 변환
    if (error.message.includes("Invalid login credentials")) {
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    }
    if (error.message.includes("Email not confirmed")) {
      return "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.";
    }
    return "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }

  // 성공 시 대시보드 페이지로 리디렉션
  redirect("/dashboard");
};

// ============================================================
// 회원가입
// ============================================================

/**
 * 이메일/비밀번호로 회원가입
 * @returns 에러 발생 시 에러 메시지 문자열, 성공 시 undefined
 */
export const signup = async (email: string, password: string) => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 이메일 인증 후 리디렉션될 주소
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    console.error("Signup Supabase Error:", error);
    if (error.message.includes("User already registered")) {
      return "이미 가입된 이메일입니다. 로그인해주세요.";
    }
    return "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }

  // 에러 없으면 undefined 반환 → 호출 측에서 이메일 인증 안내 화면 표시
};

// ============================================================
// 로그아웃
// ============================================================

/**
 * 현재 세션을 종료하고 로그인 페이지로 이동
 */
export const logout = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
};
