"use client";

// 할일 목록 컨테이너: 필터링된 결과 렌더링 및 빈 상태 처리
import { ClipboardList } from "lucide-react";
import TodoItem from "./TodoItem";
import { type Todo } from "@/types/todo";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onReorder?: (newTodos: Todo[]) => void;
  canReorder?: boolean;
}

/**
 * 할일 목록 컴포넌트
 * - 할일이 없으면 Empty State UI 표시
 * - 완료된 항목은 하단에 구분선과 함께 분리 표시
 */
const TodoList = ({ todos, onToggle, onDelete, onEdit, onReorder, canReorder }: TodoListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = todos.findIndex((t) => t.id === active.id);
      const newIndex = todos.findIndex((t) => t.id === over.id);

      const newTodos = arrayMove(todos, oldIndex, newIndex);
      onReorder(newTodos);
    }
  };

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  // 할일이 전혀 없는 경우
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card/50 py-16 text-center">
        <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            할일이 없습니다
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            위의 버튼으로 새로운 할일을 추가해보세요!
          </p>
        </div>
      </div>
    );
  }

  if (canReorder) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={todos} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                isSortable={true}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className="space-y-2">
      {/* 진행 중인 할일 */}
      {activeTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}

      {/* 완료된 할일 구분선 */}
      {completedTodos.length > 0 && activeTodos.length > 0 && (
        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">
            완료 {completedTodos.length}개
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      {/* 완료된 할일 */}
      {completedTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default TodoList;
