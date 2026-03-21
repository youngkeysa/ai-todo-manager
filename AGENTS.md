<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## 프로젝트 규칙

이 프로젝트의 상세 규칙은 `.agents/rules/ai-todo-manager.md` 를 반드시 읽고 따른다.

## 핵심 주의 사항

- **Next.js 버전**: 현재 프로젝트는 **Next.js 16** 을 사용한다. v15 이하의 API 패턴(예: `getServerSideProps`, Pages Router 등)을 사용하지 않는다.
- **Tailwind CSS 버전**: **v4** 를 사용한다. v3의 `tailwind.config.js` 방식이 아닌 CSS-first 설정 방식을 따른다.
- **패키지 정보**: `package.json`을 먼저 확인하여 실제 설치된 패키지와 버전을 파악한 뒤 코드를 작성한다.
<!-- END:nextjs-agent-rules -->
