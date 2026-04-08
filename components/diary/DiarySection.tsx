"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, BookOpen, Loader2, Save, Sparkles, Quote } from "lucide-react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { Diary, Todo } from "@/types/todo";
import { cn } from "@/lib/utils";
import { generateDayReflection } from "@/lib/ai/actions";
import { toast } from "sonner";

interface DiarySectionProps {
  userId: string;
  todos: Todo[];
}

/**
 * 오늘의 일기/다짐 섹션 컴포넌트
 * 날짜별 기록 및 AI 하루 회고 피드백 기능 포함
 */
export default function DiarySection({ userId, todos }: DiarySectionProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [content, setContent] = useState("");
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState("");
  
  const supabase = createClient();
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // 해당 날짜의 일기 데이터 불러오기
  const fetchDiary = useCallback(async () => {
    setIsLoading(true);
    setAiReflection(null);
    const { data, error } = await supabase
      .from("diaries")
      .select("*")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("일기 로딩 에러:", error);
    }

    const fetchedContent = data?.content || "";
    setContent(fetchedContent);
    setLastSavedContent(fetchedContent);
    setAiReflection(data?.ai_reflection || null);
    setIsLoading(false);
  }, [userId, dateStr, supabase]);

  useEffect(() => {
    if (userId) fetchDiary();
  }, [userId, fetchDiary]);

  // 일기 저장 (Upsert)
  const saveDiary = async (forcedContent?: string, reflection?: string | null) => {
    const contentToSave = (forcedContent ?? content).trim();
    const reflectionToSave = reflection === undefined ? aiReflection : reflection;
    
    // 내용이 없고 피드백도 없으면 저장 스킵 (완전 비우기 아닐 경우)
    if (contentToSave === lastSavedContent && reflectionToSave === aiReflection) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from("diaries")
      .upsert({
        user_id: userId,
        date: dateStr,
        content: contentToSave,
        ai_reflection: reflectionToSave,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,date"
      });

    if (error) {
      console.error("일기 저장 실패:", error);
      toast.error("저장에 실패했습니다.");
    } else {
      setLastSavedContent(contentToSave);
      toast.success("기록이 저장되었습니다.");
    }
    setIsSaving(false);
  };

  // AI 하루 회고 생성
  const handleAiAnalyze = async () => {
    if (!content.trim()) {
      toast.error("먼저 오늘의 일기를 작성해 주세요!");
      return;
    }

    setIsAiLoading(true);
    // 현재 날짜에 해당하는 당일 할일들 필터링
    const selectedDateTodos = todos.filter(t => {
      const todoDate = t.due_date ? format(new Date(t.due_date), "yyyy-MM-dd") : format(new Date(t.created_date), "yyyy-MM-dd");
      return todoDate === dateStr;
    });

    const { data, error } = await generateDayReflection(selectedDateTodos, content);

    if (error || !data) {
      toast.error(error || "AI 분석 중 오류가 발생했습니다.");
    } else {
      setAiReflection(data);
      // 생성된 피드백도 즉시 저장
      await saveDiary(content, data);
      toast.success("AI가 오늘의 회고를 작성했습니다 ✨");
    }
    setIsAiLoading(false);
  };

  // 날짜 이동 핸들러
  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleToday = () => setSelectedDate(new Date());

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <section className="w-full mt-10 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-none shadow-2xl bg-linear-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 overflow-hidden ring-1 ring-slate-200/50 dark:ring-slate-800/50">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-inner">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">오늘의 일기 & 회고</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">나의 하루를 가장 따뜻하게 기록하는 방법</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-xl border border-white dark:border-slate-700 shadow-sm">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-700" onClick={handlePrevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-3 min-w-[150px] justify-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                <CalendarIcon className="h-4 w-4 text-primary" />
                {format(selectedDate, "yyyy년 MM월 dd일 (eee)", { locale: ko })}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-700" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-8 px-6 sm:px-8 pb-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
              <p className="text-sm font-medium animate-pulse">오늘의 기록을 찾아보고 있어요...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 일기 입력 섹션 */}
              <div className="relative group">
                <div className="absolute -top-3 left-4 px-2 bg-white dark:bg-slate-900 text-[10px] font-bold text-primary uppercase tracking-widest z-10">
                  Daily Record
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={() => saveDiary()}
                  placeholder={isToday ? "오늘 하루는 어땠나요? 달성한 성과나 내일의 다짐을 편하게 기록해보세요." : "이날은 일기가 작성되지 않았습니다."}
                  className="min-h-[180px] resize-none bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-slate-800 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-base leading-relaxed p-5 rounded-2xl placeholder:text-muted-foreground/50 shadow-xs"
                />
                
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm", content.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                    <span className="text-[11px] font-bold text-muted-foreground/70 uppercase">
                      {content.length > 0 ? `${content.length} Characters` : "Empty"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAiAnalyze}
                      disabled={isAiLoading || !content.trim()}
                      className="h-9 gap-2 px-4 rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary transition-all shadow-xs"
                    >
                      {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 fill-primary/20" />}
                      <span className="font-bold">AI 하루 회고 받기</span>
                    </Button>
                    <Button 
                      size="sm" 
                      disabled={isSaving || content === lastSavedContent}
                      onClick={() => saveDiary()}
                      className="h-9 gap-2 px-5 rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span className="font-bold">저장</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI 피드백 섹션 */}
              {(aiReflection || isAiLoading) && (
                <div className="relative animate-in zoom-in-95 fade-in duration-500">
                  <div className="absolute -left-1 top-0 bottom-0 w-1 bg-linear-to-b from-primary to-blue-500 rounded-full" />
                  <div className="bg-linear-to-br from-primary/5 via-blue-50/30 to-transparent dark:from-primary/10 dark:via-transparent dark:to-transparent p-6 rounded-2xl border border-primary/10 shadow-inner">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      <span className="text-xs font-black text-primary tracking-tighter uppercase">AI Reflection</span>
                    </div>
                    
                    {isAiLoading ? (
                      <div className="flex items-center gap-3 py-2">
                         <div className="flex gap-1">
                           <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                           <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                           <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></span>
                         </div>
                         <p className="text-sm italic text-muted-foreground">AI 멘토가 당신의 하루를 따뜻하게 읽어보고 있어요...</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <Quote className="absolute -left-2 -top-2 h-8 w-8 text-primary/5 -z-10" />
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {aiReflection}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
