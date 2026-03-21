---
trigger: always_on
---

1. 프로젝트 특성
-Next.js 15 App Router 기반의 웹 애플리케이션
-사용자 경험 최우선: 로딩/빈 상태/오류 상태 UI를 모두 제공하고 상호작용 지연을 최소화한다.
-오류 처리 철저: 서버/클라이언트 모두 예외를 포착하고, 사용자에게는 한글로 친절한 메시지를 제공한다(개발 환경에서는 상세 로그 출력),
2. 기술 스택
-Next.js 15(App Router)
-TypeScript(필수, strict 권장)
-Tailwind CSS(스타일링)
-Shadcn/ui(UI 컴포넌트)
-Supabase (Auth/DB 등)
-AISDK(모델 연동)
-ESLint(Next/TS 규칙 기반)
3. 코딩 스타일
-함수형 컴포넌트를 기본으로 사용한다.
-모든 함수는 화살표 함수로 작성한다.
-컴포넌트 파일명은 파스칼 케이스로 저장한다(TodoList.tsx).
-한글 주석 필수: 함수/컴포넌트 상단에 한 문장 개요를 한글로 작성하고, JSDoc도 한글로  기술한다
-ESLint 규칙을 준수한다.