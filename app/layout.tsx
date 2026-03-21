// 앱 전체 레이아웃: 폰트, 메타데이터, Shadcn TooltipProvider 설정
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO 및 SNS 오픈그래프 메타데이터 (Next.js 15+ App Router 규격)
export const metadata: Metadata = {
  title: "AI 할일관리 서비스",
  description: "AI가 도와주는 똑똑한 일 관리 서비스",
  openGraph: {
    title: "AI 할일관리 서비스",
    description: "AI가 도와주는 똑똑한 일 관리 서비스",
    type: "website",
    locale: "ko_KR",
    siteName: "AI Todo Manager",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 할일관리 서비스",
    description: "AI가 도와주는 똑똑한 일 관리 서비스",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* TooltipProvider: Shadcn Tooltip 컴포넌트 사용을 위한 필수 래퍼 */}
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
