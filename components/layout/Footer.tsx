"use client";

import { Github, Mail, ExternalLink, Heart } from "lucide-react";

/**
 * 전역 하단 푸터 컴포넌트
 * 제작자인 Youngkey님을 알리고 프리미엄 감성을 더함
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-background/50 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* 브랜드 및 저작권 */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="flex items-center gap-2 font-bold tracking-tight text-primary">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] text-primary-foreground">
                AI
              </span>
              <span>AI Todo Manager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {currentYear} Created with <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> by{" "}
              <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-default">
                Youngkey
              </span>
            </p>
          </div>

          {/* 링크 섹션 */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="mailto:youngkey@nate.com"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">youngkey@nate.com</span>
            </a>
            <div className="h-4 w-px bg-border hidden sm:block"></div>
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
              Built with AI
              <ExternalLink className="h-2.5 w-2.5" />
            </div>
          </div>
        </div>
        
        {/* 하단 장식선 */}
        <div className="mt-8 h-1 w-full bg-linear-to-r from-transparent via-primary/10 to-transparent rounded-full" />
      </div>
    </footer>
  );
}
