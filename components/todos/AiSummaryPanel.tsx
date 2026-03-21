"use client";

// AI 요약 패널: Collapsible로 접힘/펼침, 일일/주간 탭 전환
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronUp, CheckCircle2, AlertCircle, TrendingUp, Loader2, Lightbulb, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { type AiSummary } from "@/types/todo";

interface AiSummaryPanelProps {
  /** 패널 열림 여부 */
  isOpen: boolean;
  /** 패널 토글 콜백 */
  onToggle: () => void;
  /** AI 요약 데이터 (null이면 로딩 중) */
  summary: AiSummary | null;
  /** 로딩 중 여부 */
  isLoading?: boolean;
  /** 에러 메시지 */
  error?: string | null;
  /** 탭 전환 콜백 (탭 변경 시 화면 갱신 안함, 버튼 띄움 용도) */
  onTabChange: (tab: "daily" | "weekly") => void;
  /** 해당 탭 요약 불러오기 */
  onLoadSummary: (tab: "daily" | "weekly") => void;
  /** 현재 활성화된 UI 탭 */
  activeTab: "daily" | "weekly";
}

/**
 * AI 요약 패널 컴포넌트
 * - 상단 헤더 버튼 클릭으로 접힘/펼침
 * - 일일 / 주간 탭 전환
 * - 완료율, 완료 목록, 남은 작업, AI 코멘트 표시
 */
const AiSummaryPanel = ({
  isOpen,
  onToggle,
  summary,
  isLoading = false,
  error = null,
  onTabChange,
  onLoadSummary,
  activeTab,
}: AiSummaryPanelProps) => {

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      {/* 패널 헤더 */}
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border bg-linear-to-r from-primary/10 to-accent/10 px-4 py-3 cursor-pointer transition-all",
          isOpen && "rounded-b-none border-b-0"
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            AI 분석 요약
          </span>
          {summary && !isLoading && summary.type === activeTab && (
            <Badge variant="secondary" className="text-[10px] px-1.5 h-4 ml-2 bg-primary/10 text-primary border-none text-nowrap">
              업데이트 완료
            </Badge>
          )}
        </div>
        <ChevronUp
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            !isOpen && "rotate-180"
          )}
        />
      </div>

      {/* 패널 본문 */}
      <CollapsibleContent>
        <div className="rounded-b-xl border border-t-0 bg-card px-4 pb-4 pt-3">
          <Tabs
            value={activeTab}
            onValueChange={(v) => onTabChange(v as "daily" | "weekly")}
          >
            <TabsList className="mb-4 h-9 w-full grid grid-cols-2">
              <TabsTrigger value="daily" className="text-xs">
                오늘의 요약
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs">
                이번 주 요약
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0 outline-none">
              {isLoading ? (
                // 로딩 애니메이션
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">AI가 할 일을 꼼꼼히 분석하고 있습니다...</p>
                </div>
              ) : error ? (
                // 오류 발생 시
                <div className="flex flex-col items-center justify-center py-6 space-y-3 bg-destructive/5 rounded-lg border border-destructive/20 text-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <p className="text-xs text-destructive px-4">{error}</p>
                  <Button size="sm" variant="outline" onClick={() => onLoadSummary(activeTab)}>
                    재시도
                  </Button>
                </div>
              ) : summary && summary.type === activeTab ? (
                // 요약 표시
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* 통합 Summary (하이라이트) */}
                  <div className="rounded-xl border bg-linear-to-r from-primary/5 to-transparent px-4 py-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <p className="text-sm text-foreground font-medium flex items-start gap-2">
                      <span className="mt-0.5 text-lg">🤖</span>
                      <span className="leading-snug">{summary.summary}</span>
                    </p>
                    
                    {/* 진행바 표시 */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {activeTab === "daily" ? "오늘의" : "주간"} 완료율
                        </span>
                        <span className="text-xs font-bold text-primary">{summary.completion_rate}%</span>
                      </div>
                      <Progress value={summary.completion_rate} className="h-2" />
                    </div>
                  </div>

                  {/* 트렌드 그래프 (이번주 탭일 경우) */}
                  {activeTab === "weekly" && summary.weekly_trend && summary.weekly_trend.length > 0 && (
                    <Card className="shadow-none border-dashed bg-muted/30">
                      <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                          <TrendingUp className="h-3.5 w-3.5" />
                          요일별 생산성 패턴
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-2">
                        <div className="flex h-20 items-end justify-between gap-1 mt-2">
                          {summary.weekly_trend.map((t, idx) => {
                            const maxCount = Math.max(...summary.weekly_trend!.map(x => x.count), 1);
                            const heightPct = (t.count / maxCount) * 100;
                            return (
                              <div key={idx} className="flex flex-col items-center flex-1 group">
                                <div className="w-full max-w-[20px] bg-primary/10 rounded-t-sm relative h-full flex items-end">
                                  <div 
                                    className="w-full bg-primary rounded-t-sm transition-all duration-700 ease-out group-hover:bg-primary/80"
                                    style={{ height: `${heightPct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1.5 font-medium">{t.day}</span>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* 긴급 작업 */}
                    {summary.urgent_tasks.length > 0 && (
                      <Card className="shadow-none border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 sm:col-span-2">
                        <CardHeader className="p-3 pb-2">
                          <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-destructive">
                            <span className="text-sm">⚠️</span>
                            긴급 작업 (Urgent)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <ul className="space-y-1.5">
                            {summary.urgent_tasks.map((task, i) => (
                              <li key={i} className="text-xs text-foreground flex items-baseline gap-2">
                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-destructive/60 relative -top-px" />
                                <span className="flex-1 font-medium">{task}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* 인사이트 카드 */}
                    {summary.insights.length > 0 && (
                      <Card className="shadow-none">
                        <CardHeader className="p-3 pb-2">
                          <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-foreground/80">
                            <span className="text-sm">💡</span>
                            인사이트
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <ul className="space-y-2">
                            {summary.insights.map((insight, i) => (
                              <li key={i} className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
                                <span className="shrink-0 mt-1 mr-0.5">•</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* 추천 액션 카드 */}
                    {summary.recommendations.length > 0 && (
                      <Card className="shadow-none bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30">
                        <CardHeader className="p-3 pb-2">
                          <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                            <span className="text-sm">🎯</span>
                            {activeTab === "daily" ? "추천 액션" : "다음 주 제안"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <ul className="space-y-2">
                            {summary.recommendations.map((rec, i) => (
                              <li key={i} className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed flex items-start gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                // 요약 미생성 / 탭 전환 초기 상태 (버튼 표시)
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <Sparkles className="h-6 w-6 text-primary/60" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {activeTab === "daily" ? "오늘의 요약을 생성할까요?" : "이번 주 패턴을 분석해볼까요?"}
                  </p>
                  <p className="text-xs text-muted-foreground text-center max-w-[250px] mb-2">
                    {activeTab === "daily" 
                      ? "당일 집중 분석 및 우선순위, 긴급 작업을 파악합니다."
                      : "주간 트렌드 그래프와 전반적인 생산성 흐름을 파악합니다."}
                  </p>
                  <Button onClick={() => onLoadSummary(activeTab)} size="sm" className="h-8 shadow-xs">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    {activeTab === "daily" ? "[오늘의 요약] 보기" : "[이번 주 요약] 보기"}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AiSummaryPanel;
