# 📋 PRD (Product Requirements Document)
# AI 기반 할일 관리 서비스

> **문서 버전:** v1.0  
> **작성일:** 2026-03-20  
> **상태:** 초안 (Draft)

---

## 1. 프로젝트 개요

### 1.1 제품 소개

자연어 입력과 AI 분석을 결합한 스마트 할일 관리 웹 애플리케이션. 사용자는 자연어로 할일을 입력하면 AI가 자동으로 구조화된 데이터로 변환하며, AI 요약·분석 기능을 통해 일일/주간 생산성을 확인할 수 있다.

### 1.2 핵심 가치 제안

| 구분 | 내용 |
|------|------|
| **대상 사용자** | 업무·학습·개인 생활을 통합 관리하려는 개인 사용자 |
| **핵심 차별점** | AI 자연어 입력 → 구조화 자동 변환 + AI 요약 분석 |
| **플랫폼** | 웹 (반응형, 모바일 대응) |

### 1.3 목표 및 성공 지표

- 할일 생성 소요 시간 50% 단축 (자연어 AI 입력 활용 기준)
- 일일 활성 사용자(DAU) 목표: 런칭 3개월 내 500명
- AI 기능 사용률: 전체 할일 생성의 40% 이상

---

## 2. 주요 기능 정의

### 2.1 사용자 인증 (Authentication)

#### 기능 설명
Supabase Auth를 활용한 이메일/비밀번호 기반 인증 시스템

#### 세부 요구사항

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 회원가입 | 이메일 + 비밀번호 입력, 이메일 인증, 카카오 간편가입 | P0 |
| 로그인 | 이메일/비밀번호 로그인, 카카오 소셜 로그인, JWT 토큰 발급 | P0 |
| 로그아웃 | 세션 종료 및 토큰 무효화 | P0 |
| 비밀번호 재설정 | 이메일 링크 발송 → 재설정 | P1 |
| 세션 유지 | 브라우저 새로고침 시 로그인 상태 유지 | P0 |

#### 인증 플로우
```
[회원가입]
이메일 입력 → 비밀번호 설정 → Supabase Auth 등록
→ 이메일 인증 → 로그인 가능 상태

[로그인]
일반: 이메일/비밀번호 입력 → Supabase Auth 검증
소셜: 카카오 OAuth 인증 → 콜백(/auth/callback) 처리
→ JWT 발급 → 메인 화면 이동
```

---

### 2.2 할일 관리 CRUD

#### 기능 설명
할일(Todo) 항목의 생성·조회·수정·삭제 기능 전체 지원

#### 할일 데이터 필드

| 필드명 | 타입 | 설명 | 필수 여부 |
|--------|------|------|-----------|
| `id` | UUID | 고유 식별자 (자동 생성) | 자동 |
| `user_id` | UUID | 사용자 ID (FK) | 자동 |
| `title` | VARCHAR(255) | 할일 제목 | ✅ 필수 |
| `description` | TEXT | 상세 설명 | 선택 |
| `created_date` | TIMESTAMPTZ | 생성일시 (자동) | 자동 |
| `due_date` | TIMESTAMPTZ | 마감일시 | 선택 |
| `priority` | ENUM | 우선순위: `high` / `medium` / `low` | ✅ 필수 |
| `category` | VARCHAR(50) | 카테고리: `업무` / `개인` / `학습` / `기타` | ✅ 필수 |
| `completed` | BOOLEAN | 완료 여부 (기본값: false) | 자동 |
| `updated_at` | TIMESTAMPTZ | 최종 수정일시 | 자동 |

#### CRUD 세부 요구사항

**CREATE (생성)**
- 수동 입력 폼 또는 AI 자연어 입력 두 가지 방식 지원
- 제목 필수, 나머지 필드 선택 입력
- 생성일은 현재 시각 자동 기록

**READ (조회)**
- 로그인한 사용자의 할일만 조회 (RLS 적용)
- 기본 정렬: 생성일 내림차순
- 페이지네이션 또는 무한스크롤 지원 (아이템 20개 단위)

**UPDATE (수정)**
- 모든 필드 수정 가능
- 완료 체크박스 원클릭 토글
- 수정 시 `updated_at` 자동 갱신

**DELETE (삭제)**
- 단건 삭제
- 삭제 전 확인 다이얼로그 표시
- 소프트 삭제(soft delete) 고려 (복구 기능 확장 대비)

---

### 2.3 검색 · 필터 · 정렬

#### 검색

| 항목 | 내용 |
|------|------|
| 검색 대상 | `title` + `description` 동시 검색 |
| 검색 방식 | 부분 일치 (ILIKE 또는 Full-text search) |
| 실시간 검색 | 입력 300ms 디바운스 후 자동 검색 |

#### 필터

| 필터 유형 | 옵션 |
|-----------|------|
| 우선순위 | 높음 (high) / 중간 (medium) / 낮음 (low) |
| 카테고리 | 업무 / 개인 / 학습 / 기타 |
| 진행 상태 | 진행 중 / 완료 / 지연 (due_date 초과 + 미완료) |

- 복수 필터 동시 적용 가능
- 필터 초기화 버튼 제공
- 적용된 필터 태그 형태로 UI에 표시

#### 정렬

| 정렬 기준 | 방향 |
|-----------|------|
| 우선순위순 | high → medium → low |
| 마감일순 | 빠른 마감일 우선 |
| 생성일순 | 최신순 / 오래된순 토글 |

---

### 2.4 AI 할일 자동 생성

#### 기능 설명
사용자가 자연어로 입력한 문장을 Google Gemini API가 분석하여 구조화된 할일 데이터로 자동 변환

#### 입출력 예시

**입력:**
```
내일 오전 10시에 팀 회의 준비
```

**변환 결과:**
```json
{
  "title": "팀 회의 준비",
  "description": "내일 오전 10시에 있을 팀 회의를 위해 자료 작성하기",
  "created_date": "2026-03-20T09:00:00",
  "due_date": "2026-03-21T10:00:00",
  "priority": "high",
  "category": "업무",
  "completed": false
}
```

#### 세부 요구사항

| 항목 | 내용 |
|------|------|
| API | Google Gemini API (AI SDK) |
| 입력 방식 | 자연어 텍스트 (최대 500자) |
| 응답 형식 | JSON 구조화 데이터 |
| 미리보기 | 변환 결과 확인 후 수정 가능한 UI 제공 |
| 저장 | 미리보기 확인 → "저장" 클릭 시 DB 저장 |
| 오류 처리 | 변환 실패 시 수동 입력 폼으로 대체 |
| 로딩 상태 | AI 처리 중 스피너 + 비활성화 처리 |

#### Gemini 프롬프트 설계 (핵심)
```
시스템: 당신은 자연어 텍스트를 할일 데이터로 변환하는 어시스턴트입니다.
        반드시 JSON 형식으로만 응답하세요.
        오늘 날짜: {current_date}
        카테고리는 업무/개인/학습/기타 중 하나로 분류하세요.
        우선순위는 high/medium/low 중 하나로 판단하세요.

사용자 입력: {user_input}
```

---

### 2.5 AI 요약 및 분석

#### 기능 설명
버튼 클릭 한 번으로 전체 할일 데이터를 AI가 분석하여 요약 리포트 제공

#### 요약 유형

**일일 요약**
- 오늘 완료된 항목 수 및 목록
- 오늘 남은 작업 수 및 목록
- 마감 임박 항목 (24시간 이내) 알림
- 간단한 AI 코멘트 (예: "오늘 생산성이 높네요! 3개 완료했습니다.")

**주간 요약**
- 이번 주 전체 할일 수 / 완료 수 / 완료율
- 카테고리별 완료율 비교
- 가장 많이 지연된 카테고리 분석
- 다음 주 우선 처리 권장 항목 제안

#### UI 요구사항
- 메인 화면 상단에 "AI 요약 보기" 버튼 배치
- 요약 결과는 슬라이드 다운 패널 또는 모달로 표시
- 일일/주간 탭으로 전환 가능
- 요약 생성 중 로딩 스켈레톤 표시

---

## 3. 화면 구성 (UI/UX)

### 3.1 화면 목록

| 화면 | 경로 | 설명 |
|------|------|------|
| 로그인 | `/login` | 이메일/비밀번호 로그인 |
| 회원가입 | `/signup` | 신규 계정 생성 |
| 메인 (할일 관리) | `/` | 핵심 기능 화면 |
| 통계 (확장) | `/stats` | 시각화 대시보드 (Phase 2) |

### 3.2 로그인 / 회원가입 화면

```
┌─────────────────────────────────┐
│         🤖 AI Todo              │
│                                 │
│  ┌───────────────────────────┐  │
│  │  이메일                    │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  비밀번호                  │  │
│  └───────────────────────────┘  │
│                                 │
│  [        로그인        ]        │
│                                 │
│  계정이 없으신가요? 회원가입      │
│  비밀번호를 잊으셨나요?           │
└─────────────────────────────────┘
```

**요구사항:**
- 입력 유효성 검사 (이메일 형식, 비밀번호 8자 이상)
- 오류 메시지 인라인 표시
- 로딩 상태 버튼 처리

### 3.3 메인 화면 (할일 관리)

```
┌────────────────────────────────────────────┐
│  AI Todo     [👤 사용자 이름/이메일] [AI 요약] [로그아웃] │
├────────────────────────────────────────────┤
│  🔍 [검색창                           ]     │
│  필터: [우선순위▼] [카테고리▼] [상태▼]      │
│  정렬: [우선순위순▼]                        │
├────────────────────────────────────────────┤
│  ✨ [AI로 할일 추가]   [+ 직접 추가]        │
├────────────────────────────────────────────┤
│  ☐  팀 회의 준비          [업무] [높음]     │
│     내일 오전 10시 마감                     │
│                          [수정] [삭제]      │
├────────────────────────────────────────────┤
│  ✅ React 컴포넌트 작성   [학습] [중간]     │
│     완료됨                                  │
│                          [수정] [삭제]      │
└────────────────────────────────────────────┘
```

**레이아웃 요구사항:**
- 와이드 레이아웃 적용 (최대 너비 1024px, `max-w-5xl`)
- 반응형 (모바일 375px ~ 데스크톱 1024px 이상)
- 다크모드 지원 (Tailwind CSS `dark:` 클래스)
- 완료된 항목은 취소선 + 흐림 처리
- 헤더 우측에 현재 로그인한 사용자 프로필(사진, 이름, 이메일) 표시

### 3.4 AI 요약 패널

```
┌──────────────────────────────────┐
│  AI 분석 요약        [일일] [주간] │
├──────────────────────────────────┤
│  📊 오늘의 요약                   │
│  완료: 3개 / 전체: 7개 (43%)     │
│                                  │
│  ✅ 완료된 항목                   │
│  • 팀 회의 자료 준비              │
│  • 이메일 답변                    │
│                                  │
│  ⏳ 남은 작업                     │
│  • React 공부 (마감 오늘 23:59)  │
│                                  │
│  🤖 AI 코멘트                     │
│  "오늘 절반 정도 완료했네요!      │
│   마감 임박 항목 1개가 있습니다." │
└──────────────────────────────────┘
```

### 3.5 통계 화면 (Phase 2 - 확장 계획)

| 컴포넌트 | 내용 |
|----------|------|
| 주간 활동량 차트 | 요일별 완료 개수 바 차트 |
| 완료율 게이지 | 전체 완료율 원형 차트 |
| 카테고리별 통계 | 업무/개인/학습 비율 도넛 차트 |
| 우선순위 분포 | 높음/중간/낮음 누적 차트 |

---

## 4. 기술 스택

### 4.1 전체 아키텍처

```
[클라이언트 - Next.js]
       │
       ├── UI: Tailwind CSS + Shadcn/ui
       ├── 상태관리: Zustand 또는 React Query
       └── AI 연동: AI SDK (Google Gemini)
       │
       ▼
[Supabase]
       ├── Auth: 사용자 인증 (JWT)
       ├── Database: PostgreSQL (todos, users)
       ├── RLS: Row Level Security (데이터 격리)
       └── Realtime: 실시간 업데이트 (선택)
       │
       ▼
[Google Gemini API]
       ├── 자연어 → 할일 구조화 변환
       └── 할일 목록 요약 및 분석
```

### 4.2 기술 스택 상세

| 분류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **프레임워크** | Next.js | 16.x (App Router) | 풀스택 웹 프레임워크 |
| **스타일링** | Tailwind CSS | 4.x | 유틸리티 CSS (CSS-first 설정) |
| **UI 컴포넌트** | Shadcn/ui | 최신 | 접근성 기반 컴포넌트 |
| **백엔드/DB** | Supabase | 최신 | Auth + PostgreSQL + RLS |
| **AI** | Google Gemini API | gemini-1.5-flash | 자연어 처리 |
| **AI SDK** | Vercel AI SDK | 3.x | AI 스트리밍 처리 |
| **언어** | TypeScript | 5.x | 타입 안정성 |
| **패키지 매니저** | pnpm | 최신 | 빠른 의존성 관리 |

### 4.3 환경 변수

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

---

## 5. 데이터 구조 (Supabase)

### 5.1 users 테이블

> Supabase Auth와 자동 연동. `auth.users` 테이블을 참조하는 공개 프로필 테이블.

```sql
-- public.users (Supabase Auth와 연동)
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 신규 사용자 자동 등록 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5.2 todos 테이블

```sql
-- 우선순위 ENUM 타입
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');

-- 카테고리 ENUM 타입
CREATE TYPE todo_category AS ENUM ('업무', '개인', '학습', '기타');

-- todos 테이블
CREATE TABLE public.todos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  due_date     TIMESTAMPTZ,
  priority     priority_level NOT NULL DEFAULT 'medium',
  category     todo_category NOT NULL DEFAULT '기타',
  completed    BOOLEAN DEFAULT FALSE NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 (성능 최적화)
CREATE INDEX idx_todos_user_id     ON public.todos(user_id);
CREATE INDEX idx_todos_due_date    ON public.todos(due_date);
CREATE INDEX idx_todos_completed   ON public.todos(completed);
CREATE INDEX idx_todos_priority    ON public.todos(priority);
CREATE INDEX idx_todos_category    ON public.todos(category);

-- 전문 검색 인덱스
CREATE INDEX idx_todos_search ON public.todos
  USING GIN(to_tsvector('korean', title || ' ' || COALESCE(description, '')));

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 5.3 Row Level Security (RLS) 정책

```sql
-- RLS 활성화
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- todos: 본인 데이터만 접근 가능
CREATE POLICY "users_own_todos_select"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_own_todos_insert"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_todos_update"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users_own_todos_delete"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);

-- users: 본인 프로필만 조회/수정
CREATE POLICY "users_own_profile"
  ON public.users FOR ALL
  USING (auth.uid() = id);
```

### 5.4 주요 쿼리 예시

```typescript
// 할일 목록 조회 (필터 + 정렬)
const { data } = await supabase
  .from('todos')
  .select('*')
  .eq('user_id', userId)
  .eq('priority', 'high')           // 필터
  .eq('category', '업무')            // 필터
  .ilike('title', `%${searchTerm}%`) // 검색
  .order('due_date', { ascending: true }); // 정렬

// 완료 상태 토글
const { data } = await supabase
  .from('todos')
  .update({ completed: true })
  .eq('id', todoId)
  .eq('user_id', userId);
```

---

## 6. API 설계

### 6.1 Next.js API Routes

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/ai/generate-todo` | 자연어 → 할일 변환 |
| `POST` | `/api/ai/summarize` | 할일 목록 AI 요약 |

### 6.2 AI 할일 생성 API

```typescript
// POST /api/ai/generate-todo
// Request
{
  "input": "내일 오전 10시에 팀 회의 준비"
}

// Response
{
  "success": true,
  "data": {
    "title": "팀 회의 준비",
    "description": "내일 오전 10시에 있을 팀 회의를 위해 자료 작성하기",
    "due_date": "2026-03-21T10:00:00",
    "priority": "high",
    "category": "업무",
    "completed": false
  }
}
```

### 6.3 AI 요약 API

```typescript
// POST /api/ai/summarize
// Request
{
  "type": "daily" | "weekly",
  "todos": Todo[]
}

// Response
{
  "success": true,
  "summary": {
    "completed_count": 3,
    "total_count": 7,
    "completion_rate": 43,
    "completed_items": ["팀 회의 자료 준비", "이메일 답변"],
    "pending_items": ["React 공부"],
    "ai_comment": "오늘 절반 정도 완료했네요! 마감 임박 항목 1개가 있습니다."
  }
}
```

---

## 7. 프로젝트 디렉토리 구조

```
ai-todo/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx              # 메인 할일 관리
│   │   └── stats/
│   │       └── page.tsx          # 통계 (Phase 2)
│   ├── api/
│   │   └── ai/
│   │       ├── generate-todo/
│   │       │   └── route.ts
│   │       └── summarize/
│   │           └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── todos/
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoForm.tsx          # 수동 입력 폼
│   │   ├── AiTodoInput.tsx       # AI 자연어 입력
│   │   ├── SearchFilter.tsx      # 검색/필터/정렬
│   │   └── AiSummaryPanel.tsx    # AI 요약 패널
│   └── ui/                       # Shadcn/ui 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # 클라이언트 Supabase
│   │   └── server.ts             # 서버 Supabase
│   ├── ai/
│   │   └── gemini.ts             # Gemini API 설정
│   └── utils.ts
├── types/
│   └── todo.ts                   # TypeScript 타입 정의
├── hooks/
│   ├── useTodos.ts
│   └── useAiGenerate.ts
└── CLAUDE.md                     # AI 어시스턴트 지침
```

---

## 8. TypeScript 타입 정의

```typescript
// types/todo.ts

export type Priority = 'high' | 'medium' | 'low';
export type Category = '업무' | '개인' | '학습' | '기타';
export type TodoStatus = 'active' | 'completed' | 'overdue';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_date: string;
  due_date: string | null;
  priority: Priority;
  category: Category;
  completed: boolean;
  updated_at: string;
}

export interface TodoCreateInput {
  title: string;
  description?: string;
  due_date?: string;
  priority: Priority;
  category: Category;
}

export interface TodoFilter {
  search?: string;
  priority?: Priority;
  category?: Category;
  status?: TodoStatus;
}

export type SortField = 'priority' | 'due_date' | 'created_date';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

export interface AiSummary {
  completed_count: number;
  total_count: number;
  completion_rate: number;
  completed_items: string[];
  pending_items: string[];
  overdue_items: string[];
  ai_comment: string;
}
```

---

## 9. CLAUDE.md (AI 어시스턴트 지침)

> 프로젝트 루트에 위치시킬 CLAUDE.md 초안

```markdown
# AI Todo 프로젝트 지침

## 기술 스택
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Shadcn/ui
- Supabase (Auth + PostgreSQL), Google Gemini API

## 코딩 규칙
- 모든 컴포넌트는 TypeScript + 함수형 컴포넌트
- 파일명: 컴포넌트는 PascalCase, 유틸은 camelCase
- Supabase 쿼리는 항상 user_id 조건 포함 (RLS 이중 보호)
- 환경 변수 직접 코드 삽입 금지

## 금지 사항
- console.log 커밋 금지
- any 타입 사용 금지
- Supabase service_role_key를 클라이언트에 노출 금지

## API 패턴
- AI 관련 로직은 반드시 API Route에서 처리 (키 보호)
- 에러는 항상 try-catch로 처리 후 적절한 HTTP 상태코드 반환
```

---

## 10. 개발 단계 (Milestone)

### Phase 1 - MVP (4주)

| 주차 | 작업 |
|------|------|
| 1주 | 프로젝트 셋업, Supabase 연동, 인증 화면 |
| 2주 | 할일 CRUD, 기본 UI 구현 |
| 3주 | 검색/필터/정렬, AI 할일 생성 |
| 4주 | AI 요약 분석, 반응형 최적화, 배포 |

### Phase 2 - 확장 (이후)

- 통계 및 시각화 대시보드 (Recharts)
- 알림 기능 (마감 임박 푸시 알림)
- 구글/깃허브 소셜 로그인
- 할일 공유 및 협업 기능

---

## 11. 배포 환경

| 항목 | 내용 |
|------|------|
| **호스팅** | Vercel (Next.js 최적화) |
| **DB/Auth** | Supabase Cloud (Free tier → Pro) |
| **도메인** | Vercel 기본 도메인 → 커스텀 도메인 |
| **CI/CD** | GitHub Actions + Vercel 자동 배포 |
| **환경** | `main` → Production / `develop` → Preview |

---

*문서 버전: v1.0 | 최종 수정: 2026-03-20*