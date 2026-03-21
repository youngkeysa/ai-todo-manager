// ============================================================
// 할일 관련 TypeScript 타입 정의
// PRD 5.2(데이터 구조)와 4.2(기술 스택) 기반으로 작성
// ============================================================

/** 우선순위: 높음 / 중간 / 낮음 */
export type Priority = "high" | "medium" | "low";

/** 카테고리: 업무 / 개인 / 학습 / 기타 */
export type Category = "업무" | "개인" | "학습" | "기타";

/** 진행 상태: 진행중 / 완료 / 지연(마감 초과) */
export type TodoStatus = "active" | "completed" | "overdue";

/** 정렬 기준 필드 */
export type SortField = "priority" | "due_date" | "created_date";

/** 정렬 방향 */
export type SortDirection = "asc" | "desc";

// ------------------------------------------------------------
// 핵심 Todo 엔티티 (Supabase todos 테이블과 1:1 대응)
// ------------------------------------------------------------
export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_date: string; // TIMESTAMPTZ → ISO string
  due_date: string | null;
  priority: Priority;
  category: Category;
  completed: boolean;
  updated_at: string;
}

// ------------------------------------------------------------
// 할일 생성 시 입력 데이터 (user_id, id는 서버에서 자동 생성)
// ------------------------------------------------------------
export interface TodoCreateInput {
  title: string;
  description?: string;
  due_date?: string;
  priority: Priority;
  category: Category;
}

// ------------------------------------------------------------
// 검색 / 필터 옵션
// ------------------------------------------------------------
export interface TodoFilter {
  search?: string;
  priority?: Priority | "all";
  category?: Category | "all";
  status?: TodoStatus | "all";
}

// ------------------------------------------------------------
// 정렬 옵션
// ------------------------------------------------------------
export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

// ------------------------------------------------------------
// AI 요약 결과 (일일 / 주간 공통 구조)
// ------------------------------------------------------------
export interface AiSummary {
  type: "daily" | "weekly";
  summary: string;
  completion_rate: number;
  urgent_tasks: string[];
  insights: string[];
  recommendations: string[];
  weekly_trend?: { day: string; count: number }[];
}
