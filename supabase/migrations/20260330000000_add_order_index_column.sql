-- 기존 todos 테이블에 order_index 컬럼 추가
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0 NOT NULL;
