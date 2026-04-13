"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Plus, Bot, LogOut, Loader2, UserCircle2 } from "lucide-react";
import { generateTodoFromText, generateProductivitySummary } from "@/lib/ai/actions";
import TodoList from "@/components/todos/TodoList";
import SearchFilter from "@/components/todos/SearchFilter";
import AiSummaryPanel from "@/components/todos/AiSummaryPanel";
import TodoFormModal from "@/components/todos/TodoFormModal";
import GoalsPanel from "@/components/goals/GoalsPanel";
import DiarySection from "@/components/diary/DiarySection";
import {
  type Todo,
  type TodoCreateInput,
  type TodoFilter,
  type SortOption,
  type AiSummary,
} from "@/types/todo";
import { logout } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

/** 우선순위 정렬 가중치 */
const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

export default function DashboardPage() {
  // 현재 로그인한 사용자 정보 상태
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 할일 목록 상태 (Supabase에서 페치)
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 검색/필터/정렬 상태
  const [filter, setFilter] = useState<TodoFilter>({
    search: "",
    priority: "all",
    category: "all",
    status: "all",
  });
  const [sort, setSort] = useState<SortOption>({
    field: "order_index",
    direction: "desc",
  });

  // AI 요약 패널 상태
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summary, setSummary] = useState<AiSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [activeSummaryTab, setActiveSummaryTab] = useState<"daily" | "weekly">("daily");
  const [aiError, setAiError] = useState<string | null>(null);

  // AI 자연어 할일 입력 상태
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const requireLogin = useCallback(() => {
    alert("실제 데이터를 입력하고 저장하려면 로그인이 필요합니다.");
    router.push("/login");
  }, [router]);

  // ----------------------------------------------------------
  // 데이터 페치 (Read)
  // ----------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const fetchTodos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (isMounted) {
            setCurrentUser(null);
            setTodos([
              { 
                id: "demo-1", 
                title: "새로운 목표 세우기", 
                description: "우측 '목표 관리'에서 나만의 장기/단기 목표를 설정할 수 있습니다.", 
                completed: false, 
                priority: "high", 
                category: "목표", 
                order_index: 100, 
                created_date: new Date().toISOString() 
              },
              { 
                id: "demo-2", 
                title: "매일 저녁 9시 회고 작성하기", 
                description: "일기 기능과 연동하여 AI가 나의 하루를 따뜻하게 분석해 줍니다.", 
                completed: false, 
                priority: "medium", 
                category: "습관", 
                order_index: 50, 
                created_date: new Date().toISOString() 
              }
            ] as any[]);
            setIsInitialLoading(false);
          }
          return;
        }
        if (isMounted) setCurrentUser(user);

        // 1. order_index 기준 정렬 시도
        let { data, error } = await supabase
          .from("todos")
          .select("*")
          .order("order_index", { ascending: false });

        // 정렬 에러 발생 시 (컬럼 미생성 등) 폴백 처리
        if (error) {
          console.warn("order_index 정렬 실패, 생성일순으로 불러옵니다.");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("todos")
            .select("*")
            .order("created_date", { ascending: false });
          
          if (fallbackError) throw fallbackError;
          data = fallbackData;
        }

        if (isMounted && data) {
          setTodos(data as Todo[]);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };

    fetchTodos();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // ----------------------------------------------------------
  // 이벤트 핸들러 (Create, Update, Delete)
  // ----------------------------------------------------------

  /** 완료 체크박스 토글 (Update) - Optimistic UI 적용 */
  const handleToggle = useCallback(
    async (id: string) => {
      if (!currentUser) return requireLogin();
      const targetTodo = todos.find((t) => t.id === id);
      if (!targetTodo) return;

      const newStatus = !targetTodo.completed;
      const updatedTime = new Date().toISOString();

      // UI 즉시 반영 (낙관적 업데이트)
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: newStatus, updated_at: updatedTime } : t))
      );

      // DB 반영
      const { error } = await supabase
        .from("todos")
        .update({ completed: newStatus, updated_at: updatedTime })
        .eq("id", id);

      if (error) {
        console.error("상태 업데이트 실패:", error);
      }
    },
    [todos, supabase, currentUser, requireLogin]
  );

  /** 할일 삭제 (Delete) - Optimistic UI 적용 */
  const handleDelete = useCallback(
    async (id: string) => {
      if (!currentUser) return requireLogin();
      const previousTodos = [...todos];

      // UI 즉시 반영
      setTodos((prev) => prev.filter((t) => t.id !== id));

      // DB 삭재
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) {
        console.error("할일 삭제 실패:", error);
        setTodos(previousTodos); 
      }
    },
    [todos, supabase, currentUser, requireLogin]
  );

  // 모달 제어
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Todo | null>(null);

  const handleOpenAdd = useCallback(() => {
    if (!currentUser) return requireLogin();
    setEditTarget(null);
    setIsModalOpen(true);
  }, [currentUser, requireLogin]);

  const handleEdit = useCallback((todo: Todo) => {
    if (!currentUser) return requireLogin();
    setEditTarget(todo);
    setIsModalOpen(true);
  }, [currentUser, requireLogin]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditTarget(null);
  }, []);

  /** 할일 저장 (Create / Update) */
  const handleSave = useCallback(
    async (data: TodoCreateInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editTarget) {
        // [수정] DB 반영
        const updatedData = {
          title: data.title,
          description: data.description ?? null,
          due_date: data.due_date ?? null,
          priority: data.priority,
          category: data.category,
          updated_at: new Date().toISOString(),
        };

        const { data: result, error } = await supabase
          .from("todos")
          .update(updatedData)
          .eq("id", editTarget.id)
          .select()
          .single();

        if (error) {
          console.error("할일 수정 에러:", error);
          return;
        }

        if (result) {
          setTodos((prev) =>
            prev.map((t) => (t.id === editTarget.id ? (result as Todo) : t))
          );
        }
      } else {
        // [추가] DB 반영
        const newRecord = {
          user_id: user.id,
          title: data.title,
          description: data.description ?? null,
          due_date: data.due_date ?? null,
          priority: data.priority,
          category: data.category,
        };

        const { data: result, error } = await supabase
          .from("todos")
          .insert(newRecord)
          .select()
          .single();

        if (error) {
          console.error("할일 추가 에러:", error);
          return;
        }

        if (result) {
          setTodos((prev) => [result as Todo, ...prev]);
        }
      }
    },
    [editTarget, supabase]
  );

  /** 할일 순서 변경 (Drag & Drop) */
  const handleReorder = useCallback(
    async (newTodos: Todo[]) => {
      if (!currentUser) return requireLogin();
      setTodos(newTodos);

      try {
        const { error } = await supabase.from("todos").upsert(
          newTodos.map((t, i) => ({
            ...t,
            order_index: (newTodos.length - i) * 100,
            updated_at: new Date().toISOString(),
          }))
        );
        if (error) throw error;
      } catch (err) {
        console.error("순서 저장 실패:", err);
      }
    },
    [supabase, currentUser, requireLogin]
  );

  /** 필터/정렬 제어 */
  const handleFilterChange = useCallback((partial: Partial<TodoFilter>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilter({ search: "", priority: "all", category: "all", status: "all" });
  }, []);

  /** AI 요약 데이터 페칭 (일일/주간) */
  const loadAiSummary = useCallback(async (period: "daily" | "weekly") => {
    if (!currentUser) return requireLogin();
    setIsSummaryLoading(true);
    setActiveSummaryTab(period);
    setAiError(null);
    setSummary(null);

    const { data: result, error } = await generateProductivitySummary(todos, period);
    
    if (error || !result) {
      console.error(error);
      setAiError(error || "요약을 가져오는 중 오류가 발생했습니다.");
    } else {
      setSummary({
        type: period,
        summary: result.summary,
        completion_rate: result.completion_rate || 0,
        urgent_tasks: result.urgent_tasks || [],
        insights: result.insights || [],
        recommendations: result.recommendations || [],
        weekly_trend: result.weekly_trend,
      });
    }
    setIsSummaryLoading(false);
  }, [todos, currentUser, requireLogin]);

  /** AI 요약 패널 제어 */
  const handleSummaryToggle = useCallback(() => {
    setIsSummaryOpen(!isSummaryOpen);
  }, [isSummaryOpen]);

  /** 자연어로 AI 할일 자동 추가 */
  const handleAddAiTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return requireLogin();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    const { data: aiParsedTodo, error } = await generateTodoFromText(aiPrompt);
    
    if (error || !aiParsedTodo) {
      alert("AI 변환 실패: " + error);
      setIsAiLoading(false);
      return;
    }

    const newRecord = {
      user_id: currentUser.id,
      title: aiParsedTodo.title,
      description: (aiParsedTodo.description === "null" || !aiParsedTodo.description) ? null : aiParsedTodo.description,
      due_date: (aiParsedTodo.dueDate === "null" || !aiParsedTodo.dueDate) ? null : aiParsedTodo.dueDate,
      priority: aiParsedTodo.priority || "medium",
      category: aiParsedTodo.category || "기타",
    };

    const { data: result, error: insertError } = await supabase
      .from("todos")
      .insert(newRecord)
      .select()
      .single();

    if (insertError) {
      console.error("할일 추가 에러:", insertError);
      alert("DB 저장에 실패했습니다.");
    } else if (result) {
      setTodos((prev) => [result as Todo, ...prev]);
      setAiPrompt(""); 
    }
    setIsAiLoading(false);
  };

  /** 필터링 + 정렬 */
  const filteredTodos = useMemo(() => {
    let result = [...todos];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q)
      );
    }
    if (filter.priority && filter.priority !== "all") {
      result = result.filter((t) => t.priority === filter.priority);
    }
    if (filter.category && filter.category !== "all") {
      result = result.filter((t) => t.category === filter.category);
    }
    if (filter.status && filter.status !== "all") {
      const now = new Date();
      result = result.filter((t) => {
        if (filter.status === "completed") return t.completed;
        if (filter.status === "overdue")
          return !t.completed && t.due_date !== null && new Date(t.due_date) < now;
        return !t.completed;
      });
    }

    result.sort((a, b) => {
      if (sort.field === "priority") {
        return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      }
      if (sort.field === "due_date") {
        const da = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const db = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return sort.direction === "asc" ? da - db : db - da;
      }
      if (sort.field === "order_index") {
        return sort.direction === "asc" ? a.order_index - b.order_index : b.order_index - a.order_index;
      }
      const da = new Date(a.created_date).getTime();
      const db = new Date(b.created_date).getTime();
      return sort.direction === "asc" ? da - db : db - da;
    });

    return result;
  }, [todos, filter, sort]);

  const completedCount = todos.filter((t) => t.completed).length;

  if (isInitialLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight">AI Todo Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {!currentUser ? (
              <Button size="sm" variant="default" onClick={requireLogin}>
                로그인 / 가입
              </Button>
            ) : null}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 mr-2">
                {currentUser.user_metadata?.avatar_url ? (
                  <img
                    src={currentUser.user_metadata.avatar_url}
                    alt="Profile"
                    className="h-7 w-7 rounded-full object-cover shadow-sm ring-1 ring-border"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-medium leading-none">
                    {currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "사용자"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[100px] mt-1 leading-none">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            )}

            <Button
              variant={isSummaryOpen ? "default" : "outline"}
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleSummaryToggle}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI 요약
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => currentUser ? logout() : requireLogin()}
              aria-label="로그아웃"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-6">
        <AiSummaryPanel
          isOpen={isSummaryOpen}
          onToggle={handleSummaryToggle}
          summary={summary}
          isLoading={isSummaryLoading}
          activeTab={activeSummaryTab}
          onTabChange={setActiveSummaryTab}
          onLoadSummary={loadAiSummary}
          error={aiError}
        />

        <GoalsPanel userId={currentUser?.id} onRequireLogin={requireLogin} />

        <SearchFilter
          filter={filter}
          sort={sort}
          onFilterChange={handleFilterChange}
          onSortChange={setSort}
          onReset={handleFilterReset}
        />

        <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleAddAiTodo}>
          <div className="flex-1 flex items-center gap-2 rounded-md border bg-background px-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <input
              type="text"
              placeholder="자연어로 할일을 적어보세요..."
              className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground/70"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={isAiLoading}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              type="submit"
              className="gap-2 text-xs sm:text-sm whitespace-nowrap shadow-md hover:shadow-lg transition-all"
              disabled={isAiLoading || !aiPrompt.trim()}
            >
              {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "AI 자동 구조화"}
            </Button>
            <Button type="button" variant="outline" className="gap-2 text-xs sm:text-sm whitespace-nowrap" onClick={handleOpenAdd}>
              <Plus className="h-4 w-4" />
              직접 추가
            </Button>
          </div>
        </form>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{filteredTodos.length}개의 할일</p>
          <p className="text-xs text-muted-foreground">
            완료 <span className="font-medium text-primary">{completedCount}</span> / {todos.length}
          </p>
        </div>

        <TodoList
          todos={filteredTodos}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onReorder={handleReorder}
          canReorder={sort.field === "order_index" && filter.status === "all"}
        />

        <DiarySection userId={currentUser?.id} todos={todos} onRequireLogin={requireLogin} />
      </main>

      <TodoFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editTarget={editTarget}
      />
    </div>
  );
}
