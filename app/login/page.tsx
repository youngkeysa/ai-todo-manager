"use client";

// 로그인 페이지: Supabase Auth signInWithPassword 실제 연동 버전
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, Sparkles, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { login } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/client";

/**
 * 로그인 페이지 컴포넌트
 * - Server Action(login)을 호출해 Supabase signInWithPassword 실행
 * - 성공 시 Server Action 내부에서 redirect("/") 처리
 * - 실패 시 에러 메시지를 상태로 받아 화면에 표시
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  /** 클라이언트 유효성 검사 */
  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = "이메일을 입력하세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }
    if (!password) {
      newErrors.password = "비밀번호를 입력하세요.";
    } else if (password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** 로그인 제출: Server Action 호출 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError(null);
    try {
      // Server Action이 에러 메시지(string)를 반환하면 화면에 표시
      // 성공 시 Server Action 내에서 redirect("/")가 실행됨
      const errorMsg = await login(email, password);
      if (errorMsg) setServerError(errorMsg);
    } catch {
      setServerError("예기치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  /** 카카오 소셜 로그인 */
  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // OAuth의 경우 곧바로 리디렉션됨
    } catch {
      setServerError("카카오 로그인 중 오류가 발생했습니다. 잠시 후 시도해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* 배경 장식 */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-accent/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-6">
        {/* ── 로고 + 서비스 소개 ── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <Bot className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Todo</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              자연어로 할일을 추가하고, AI가 생산성을 분석해드려요
            </p>
          </div>

          <ul className="mt-1 space-y-1 text-left">
            {[
              "자연어 입력 → AI 자동 구조화",
              "일일 / 주간 생산성 AI 분석",
              "우선순위 · 카테고리 스마트 관리",
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* ── 로그인 카드 ── */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">로그인</CardTitle>
            <CardDescription className="text-xs">
              계정에 로그인하여 할일을 관리하세요
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4">
              {/* 서버 에러 메시지 */}
              {serverError && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {serverError}
                </div>
              )}

              {/* 이메일 */}
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-medium">이메일</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="hello@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    if (serverError) setServerError(null);
                  }}
                  className={errors.email ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* 비밀번호 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-medium">비밀번호</Label>
                  <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                    if (serverError) setServerError(null);
                  }}
                  className={errors.password ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button type="submit" className="w-full gap-2" disabled={isLoading} id="btn-login">
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />로그인 중...</>
                ) : (
                  <><Sparkles className="h-4 w-4" />로그인</>
                )}
              </Button>

              <div className="flex w-full items-center gap-3 pt-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground whitespace-nowrap px-1">소셜 로그인</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 bg-[#FEE500] text-black hover:bg-[#FEE500]/90 border-0 shadow-sm"
                onClick={handleKakaoLogin}
                disabled={isLoading}
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3c-5.52 0-10 3.8-10 8.48 0 2.97 1.8 5.58 4.54 7.02l-1.15 4.22c-.08.28.2.5.45.39l4.98-3.35c.38.03.77.06 1.18.06 5.52 0 10-3.8 10-8.48C22 6.8 17.52 3 12 3z"/>
                </svg>
                카카오로 시작하기
              </Button>

              <div className="mt-2 text-center text-xs text-muted-foreground w-full">
                아직 계정이 없으신가요?{" "}
                <Link href="/signup" className="font-medium text-primary hover:underline underline-offset-4" id="link-signup">
                  회원가입
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
