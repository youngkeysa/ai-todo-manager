"use client";

// 개별 할일 아이템 컴포넌트: 체크박스, 내용, 배지, 수정/삭제 액션 표시
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Todo, type Priority, type Category } from "@/types/todo";

/** 우선순위별 배지 색상 매핑 */
const PRIORITY_VARIANT: Record<
  Priority,
  "destructive" | "default" | "secondary"
> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

/** 우선순위 한글 표시 */
const PRIORITY_LABEL: Record<Priority, string> = {
  high: "높음",
  medium: "중간",
  low: "낮음",
};

/** 카테고리별 색상 클래스 */
const CATEGORY_COLOR: Record<Category, string> = {
  업무: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  학습: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  개인: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  기타: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

interface TodoItemProps {
  todo: Todo;
  /** 완료 상태 토글 콜백 */
  onToggle: (id: string) => void;
  /** 삭제 콜백 */
  onDelete: (id: string) => void;
  /** 수정 콜백 */
  onEdit: (todo: Todo) => void;
}

/**
 * 할일 카드 컴포넌트
 * - 완료 시 취소선 + 흐림 처리
 * - 마감일이 지난 미완료 항목은 빨간 날짜 표시
 */
const TodoItem = ({ todo, onToggle, onDelete, onEdit }: TodoItemProps) => {
  // 마감 지연 여부: 마감일이 현재보다 이전이고 미완료인 경우
  const isOverdue =
    !todo.completed &&
    todo.due_date !== null &&
    new Date(todo.due_date) < new Date();

  // 마감일 포맷: 'MM/DD HH:MM' 형식
  const formatDueDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        todo.completed && "opacity-50"
      )}
    >
      {/* 완료 체크박스 */}
      <Checkbox
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="mt-0.5 shrink-0"
      />

      {/* 할일 내용 */}
      <div className="flex-1 min-w-0">
        <label
          htmlFor={`todo-${todo.id}`}
          className={cn(
            "block text-sm font-medium cursor-pointer leading-snug",
            todo.completed && "line-through text-muted-foreground"
          )}
        >
          {todo.title}
        </label>

        {/* 설명 */}
        {todo.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {todo.description}
          </p>
        )}

        {/* 배지 + 마감일 행 */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {/* 우선순위 배지 */}
          <Badge
            variant={PRIORITY_VARIANT[todo.priority]}
            className="text-xs px-1.5 py-0"
          >
            {PRIORITY_LABEL[todo.priority]}
          </Badge>

          {/* 카테고리 배지 */}
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              CATEGORY_COLOR[todo.category]
            )}
          >
            {todo.category}
          </span>

          {/* 마감일 */}
          {todo.due_date && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs",
                isOverdue
                  ? "text-destructive font-medium"
                  : "text-muted-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              {isOverdue && "지연 · "}
              {formatDueDate(todo.due_date)}
            </span>
          )}
        </div>
      </div>

      {/* 수정 / 삭제 버튼 (호버 시 표시) */}
      <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(todo)}
          aria-label="할일 수정"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(todo.id)}
          aria-label="할일 삭제"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default TodoItem;
