"use client";

// 회원가입 페이지: Supabase Auth signUp 실제 연동 버전
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
import { Bot, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { signup } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/client";

/**
 * 회원가입 페이지 컴포넌트
 * - Server Action(signup)을 호출해 Supabase signUp 실행
 * - 성공 시 이메일 인증 안내 화면으로 전환
 * - 실패 시 에러 메시지를 상태로 받아 화면에 표시
 */
export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  /** 비밀번호 강도 계산 */
  const passwordStrength = (() => {
    if (password.length === 0) return null;
    if (password.length < 8) return "weak";
    if (/\d/.test(password) && /[a-zA-Z]/.test(password)) return "strong";
    return "medium";
  })();

  const STRENGTH_INFO = {
    weak: { label: "너무 짧음", color: "text-destructive" },
    medium: { label: "보통", color: "text-amber-500" },
    strong: { label: "강함", color: "text-emerald-500" },
  };

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
    if (!confirm) {
      newErrors.confirm = "비밀번호를 한 번 더 입력하세요.";
    } else if (password !== confirm) {
      newErrors.confirm = "비밀번호가 일치하지 않습니다.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** 회원가입 제출: Server Action 호출 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError(null);
    try {
      const errorMsg = await signup(email, password);
      if (errorMsg) {
        setServerError(errorMsg);
      } else {
        // 성공: 이메일 인증 안내 화면으로 전환
        setIsDone(true);
      }
    } catch {
      setServerError("예기치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  /** 카카오 소셜 가입(로그인) */
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
      setServerError("카카오 인증 중 오류가 발생했습니다. 잠시 후 시도해주세요.");
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
        {/* ── 로고 ── */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <Bot className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Todo</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              무료로 시작하고, AI 생산성을 경험해보세요
            </p>
          </div>
        </div>

        {/* ── 이메일 인증 안내 화면 ── */}
        {isDone ? (
          <Card className="shadow-lg text-center">
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold">이메일을 확인해주세요</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{email}</span>{" "}
                  로 인증 링크를 발송했습니다.
                  <br />
                  이메일의 링크를 클릭하면 로그인할 수 있습니다.
                </p>
              </div>
              <Link href="/login">
                <Button variant="outline" size="sm" className="mt-2 text-xs">
                  로그인 페이지로
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* ── 회원가입 폼 카드 ── */
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">회원가입</CardTitle>
              <CardDescription className="text-xs">
                이메일과 비밀번호로 무료 계정을 만드세요
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
                  <Label htmlFor="signup-email" className="text-xs font-medium">이메일</Label>
                  <Input
                    id="signup-email"
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
                  <Label htmlFor="signup-password" className="text-xs font-medium">비밀번호</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="8자 이상 입력"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                    }}
                    className={errors.password ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {passwordStrength && !errors.password && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {["weak", "medium", "strong"].map((level, i) => (
                          <div
                            key={level}
                            className={`h-1 w-8 rounded-full transition-colors ${
                              ["weak", "medium", "strong"].indexOf(passwordStrength) >= i
                                ? passwordStrength === "weak"
                                  ? "bg-destructive"
                                  : passwordStrength === "medium"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs ${STRENGTH_INFO[passwordStrength].color}`}>
                        {STRENGTH_INFO[passwordStrength].label}
                      </span>
                    </div>
                  )}
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                {/* 비밀번호 확인 */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirm" className="text-xs font-medium">비밀번호 확인</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="비밀번호를 한 번 더 입력"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
                    }}
                    className={errors.confirm ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {confirm && !errors.confirm && (
                    <p className={`text-xs ${confirm === password ? "text-emerald-500" : "text-muted-foreground"}`}>
                      {confirm === password ? "✓ 비밀번호가 일치합니다" : "비밀번호를 확인 중..."}
                    </p>
                  )}
                  {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="w-full gap-2" disabled={isLoading} id="btn-signup">
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />처리 중...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" />무료로 시작하기</>
                  )}
                </Button>

                <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
                  가입 시{" "}
                  <Link href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">이용약관</Link>
                  {" "}및{" "}
                  <Link href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">개인정보처리방침</Link>
                  에 동의하는 것으로 간주합니다.
                </p>

                <div className="flex w-full items-center gap-3 pt-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap px-1">간편 가입</span>
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
                  카카오로 1초 만에 시작하기
                </Button>

                <div className="mt-2 text-center text-xs text-muted-foreground w-full">
                  이미 계정이 있으신가요?{" "}
                  <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4" id="link-login">
                    로그인
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
