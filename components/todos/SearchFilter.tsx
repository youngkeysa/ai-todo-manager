"use client";

// 검색/필터/정렬 컨트롤 컴포넌트
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { type TodoFilter, type SortOption } from "@/types/todo";

interface SearchFilterProps {
  filter: TodoFilter;
  sort: SortOption;
  onFilterChange: (filter: Partial<TodoFilter>) => void;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
}

/**
 * 검색/필터/정렬 바 컴포넌트
 * - 실시간 검색 (300ms 디바운스는 상위 컴포넌트에서 처리)
 * - 우선순위 / 카테고리 / 상태 드롭다운 필터
 * - 정렬 기준 선택
 */
const SearchFilter = ({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  onReset,
}: SearchFilterProps) => {
  // 필터가 기본값에서 변경되었는지 확인 (초기화 버튼 표시 여부)
  const hasActiveFilter =
    (filter.search && filter.search.length > 0) ||
    (filter.priority && filter.priority !== "all") ||
    (filter.category && filter.category !== "all") ||
    (filter.status && filter.status !== "all");

  return (
    <div className="space-y-2">
      {/* 검색 인풋 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="todo-search"
          placeholder="할일 검색..."
          value={filter.search ?? ""}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-9 bg-background"
        />
        {filter.search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onFilterChange({ search: "" })}
            aria-label="검색어 초기화"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 필터 + 정렬 드롭다운 행 */}
      <div className="flex flex-wrap gap-2">
        {/* 우선순위 필터 */}
        <Select
          value={filter.priority ?? "all"}
          onValueChange={(v) =>
            onFilterChange({ priority: v as TodoFilter["priority"] })
          }
        >
          <SelectTrigger id="filter-priority" className="h-8 w-[100px] text-xs">
            <SelectValue placeholder="우선순위" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="high">높음</SelectItem>
            <SelectItem value="medium">중간</SelectItem>
            <SelectItem value="low">낮음</SelectItem>
          </SelectContent>
        </Select>

        {/* 카테고리 필터 */}
        <Select
          value={filter.category ?? "all"}
          onValueChange={(v) =>
            onFilterChange({ category: v as TodoFilter["category"] })
          }
        >
          <SelectTrigger id="filter-category" className="h-8 w-[100px] text-xs">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="업무">업무</SelectItem>
            <SelectItem value="개인">개인</SelectItem>
            <SelectItem value="학습">학습</SelectItem>
            <SelectItem value="기타">기타</SelectItem>
          </SelectContent>
        </Select>

        {/* 상태 필터 */}
        <Select
          value={filter.status ?? "all"}
          onValueChange={(v) =>
            onFilterChange({ status: v as TodoFilter["status"] })
          }
        >
          <SelectTrigger id="filter-status" className="h-8 w-[100px] text-xs">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">진행 중</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="overdue">지연</SelectItem>
          </SelectContent>
        </Select>

        {/* 정렬 */}
        <Select
          value={`${sort.field}-${sort.direction}`}
          onValueChange={(v) => {
            const [field, direction] = v.split("-") as [
              SortOption["field"],
              SortOption["direction"],
            ];
            onSortChange({ field, direction });
          }}
        >
          <SelectTrigger id="sort-option" className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority-desc">우선순위순</SelectItem>
            <SelectItem value="due_date-asc">마감일 빠른순</SelectItem>
            <SelectItem value="created_date-desc">최신순</SelectItem>
            <SelectItem value="created_date-asc">오래된순</SelectItem>
          </SelectContent>
        </Select>

        {/* 필터 초기화 버튼 - 활성 필터가 있을 때만 표시 */}
        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={onReset}
          >
            <X className="mr-1 h-3 w-3" />
            초기화
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
