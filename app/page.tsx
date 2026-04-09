"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, Target, Calendar, Zap, ArrowRight, CheckCircle2, Star } from "lucide-react";

/**
 * 신규 프리미엄 랜딩 페이지 컴포넌트
 * - 미인증 사용자에게 서비스의 가치와 UI 미리보기를 제공
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* 1. 네비게이션 */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI Todo</span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">
              <Link href="/login">
                로그인
              </Link>
            </Button>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-500/30">
              <Link href="/signup">
                무료로 시작하기
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* 2. 히어로 섹션 */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-600/20 blur-[120px] -z-10 rounded-full" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="h-4 w-4" />
            <span>AI 기반 할일 관리의 미래</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] animate-in fade-in slide-in-from-top-8 duration-700 delay-100">
            당신의 <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">생산성</span>을<br />
            AI가 직접 설계합니다
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed animate-in fade-in slide-in-from-top-12 duration-700 delay-200">
            복잡한 생각은 AI에게 맡기세요. 자연어 입력만으로 할일을 구조화하고, 
            지능적인 목표 설정과 회고를 통해 매일 더 나은 자신을 만나보세요.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-top-16 duration-1000 delay-300">
            <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 gap-2">
              <Link href="/dashboard">
                무료로 체험하기 <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3. 앱 미리보기 섹션 (Dashboard Preview) */}
      <section className="px-6 py-20 relative">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/50 backdrop-blur-sm group p-2">
             <div className="aspect-video bg-white rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
                {/* 상단 브라우저 탭 느낌 */}
                <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 text-xs text-slate-400 text-center font-mono font-medium">ai-todo.manager/dashboard</div>
                </div>

                {/* 화려한 내부 목업 레이아웃 (Light Mode) */}
                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50">
                  {/* 사이드/목표 패널 가상 영역 */}
                  <div className="hidden md:flex col-span-4 flex-col gap-4">
                    <div className="h-10 border border-emerald-100 rounded-xl bg-emerald-50 flex items-center px-4 gap-3">
                      <Target className="h-4 w-4 text-emerald-500" />
                      <div className="h-3 w-1/3 bg-emerald-200 rounded" />
                    </div>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3 hover:border-indigo-100 transition-colors">
                         <div className="h-3 w-1/2 bg-slate-200 rounded" />
                         <div className="h-2 w-full bg-slate-100 rounded" />
                         <div className="h-2 w-3/4 bg-slate-100 rounded" />
                      </div>
                    ))}
                    <div className="mt-auto h-32 border border-indigo-100 rounded-2xl bg-linear-to-t from-indigo-50 to-white flex items-center justify-center relative overflow-hidden shadow-sm">
                       <Bot className="h-12 w-12 text-indigo-300 absolute" />
                    </div>
                  </div>

                  {/* 메인 할일 영역 */}
                  <div className="col-span-1 md:col-span-8 flex flex-col gap-4">
                    <div className="h-14 bg-white rounded-xl border border-indigo-100 w-full flex items-center px-4 gap-3 shadow-sm ring-2 ring-indigo-50">
                       <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                       <div className="h-3 w-2/3 bg-slate-200 rounded" />
                    </div>
                    
                    <div className="flex-1 space-y-3 overflow-hidden mask-image:linear-gradient(to_bottom,white_50%,transparent)">
                       {[1, 2, 3, 4, 5].map((i) => (
                         <div key={i} className="h-16 bg-white hover:bg-slate-50 transition-colors rounded-xl border border-slate-100 shadow-sm flex items-center px-5 gap-4">
                            <div className="h-5 w-5 rounded-full border-2 border-slate-200" />
                            <div className="flex flex-col gap-2 flex-1">
                               <div className="h-3 w-1/2 bg-slate-300 rounded" />
                               <div className="h-2 w-1/4 bg-slate-100 rounded" />
                            </div>
                            {i % 2 === 0 && (
                              <div className="h-6 px-3 bg-rose-50 rounded-md text-[10px] items-center text-rose-500 font-medium flex border border-rose-100">
                                 High Priority
                              </div>
                            )}
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
             </div>
             
             {/* 은은한 빛 효과 */}
             <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
             <div className="absolute -inset-1 bg-linear-to-b from-indigo-500/20 to-purple-500/20 blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          </div>
        </div>
      </section>

      {/* 4. 핵심 기능 카드 */}
      <section className="px-6 py-32 bg-slate-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard 
            icon={Zap}
            title="AI 자연어 구조화"
            description="'내일 오후 2시 회의'라고만 적으세요. 마감일, 우선순위, 카테고리를 AI가 알아서 정리합니다."
            color="indigo"
          />
          <FeatureCard 
            icon={Target}
            title="지능형 목표 설계"
            description="월간/주간/일간 전략을 한눈에 관리하고, 당신의 성장 경로를 단계별로 추적합니다."
            color="emerald"
          />
          <FeatureCard 
            icon={Sparkles}
            title="AI 하루 회고"
            description="작성한 일기와 할일 목록을 바탕으로 AI가 따뜻하고 객관적인 피드백을 전달합니다."
            color="rose"
          />
        </div>
      </section>

      {/* 5. CTA 섹션 */}
      <section className="px-6 py-32 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-linear-to-t from-indigo-900/40 to-transparent -z-10" />
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="flex justify-center flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />)}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold">지금까지 경험하지 못한<br />새로운 생산성을 만나보세요</h2>
          <Button asChild size="lg" className="h-16 px-12 text-xl font-black bg-white text-slate-950 hover:bg-slate-200 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95">
            <Link href="/dashboard">
              미리 체험해보기
            </Link>
          </Button>
          <p className="text-slate-500 font-medium">별도의 카드 정보 없이 즉시 이용 가능합니다.</p>
        </div>
      </section>

      {/* 푸터 (자체 푸터가 layout에 있을 수 있으니 간소하게) */}
      <footer className="py-10 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>© 2026 AI Todo Manager. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  const colorMap: any = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  
  return (
    <div className="group p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-white/10 hover:bg-slate-800/50 transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colorMap[color]}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-indigo-300 transition-colors">
        {title} <CheckCircle2 className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </h3>
      <p className="text-slate-400 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
