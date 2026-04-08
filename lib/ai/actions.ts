"use server";

import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * 1. 자연어 문장을 입력받아 할일 데이터(JSON)로 파싱합니다.
 */
export async function generateTodoFromText(prompt: string) {
  try {
    const today = new Date().toISOString();

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        title: z.string().describe("만들어야 하는 할일의 명확한 제목 (예: 팀 회의 준비)"),
        description: z.string().nullable().optional().describe("할일의 부가적인 상세 내용. 정보가 없으면 실제 null 값을 반환하세요 (문자열 'null' 금지)"),
        priority: z.enum(["high", "medium", "low"]).describe("할일의 중요도/우선순위. 없으면 기본값 medium"),
        category: z.enum(["업무", "개인", "학습", "기타"]).describe("가장 알맞은 할일의 카테고리. 없으면 기본값 기타"),
        dueDate: z.string().nullable().optional().describe("마감 기한이 파악된다면 ISO 8601 형식(YYYY-MM-DDTHH:mm:ss.sssZ)으로 변환. 파악 안되면 실제 null 값을 반환하세요 (문자열 'null' 금지). 오늘 시각 기준: " + today),
      }),
      prompt: `다음 사용자의 자연어 입력을 바탕으로 할일(Todo) 객체를 생성하세요.
정보가 부족하여 필드 값을 채울 수 없는 경우, 문자열 "null"이 아닌 실제 null 값을 반환해야 합니다.
입력원문: "${prompt}"`,
    });

    return { data: object, error: null };
  } catch (error: any) {
    console.error("AI Todo Generation Error:", error);
    return { data: null, error: "AI가 문장을 분석하는 데 실패했습니다." };
  }
}

/**
 * 2. 현재 사용자의 할일 목록을 바탕으로 생산성 코멘트를 JSON 구조로 생성합니다.
 */
export async function generateProductivitySummary(todos: any[], period: "daily" | "weekly") {
  try {
    if (!todos || todos.length === 0) {
      return { 
        data: {
          summary: period === "daily" ? "오늘 등록된 할 일이 없습니다." : "이번 주에 등록된 할 일이 없습니다.",
          completion_rate: 0,
          urgent_tasks: [],
          insights: ["아직 데이터가 없어 분석할 수 없습니다. 새로운 할 일을 추가해 보세요!"],
          recommendations: ["가벼운 목표부터 하나씩 등록해 다이어리를 채워나가 보세요."],
          weekly_trend: undefined,
        }, 
        error: null 
      };
    }

    const completedTodos = todos.filter((t) => t.completed);
    const pendingTodos = todos.filter((t) => !t.completed);

    const summaryContext = `
전체 할 일 수: ${todos.length}
완료된 할 일 수: ${completedTodos.length}
남은 할 일 수: ${pendingTodos.length}

[할 일 상세 목록]
${todos.map(t => `- 제목: ${t.title}, 상태: ${t.completed ? '완료' : '진행중'}, 우선순위: ${t.priority}, 기한: ${t.dueDate || t.due_date || '없음'}, 생성일: ${t.created_date}`).join("\n")}
`;

    const periodText = period === "daily" ? "오늘의 요약" : "이번 주 요약";

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        summary: z.string().describe("예: '총 8개의 할 일 중 5개 완료(62.5%)' 같은 전체적인 요약 1문장"),
        completion_rate: z.number().describe("완료율 정수 (0~100)"),
        urgentTasks: z.array(z.string()).describe("미완료 중 마감일 임박 및 우선순위가 높은 긴급 항목 (없으면 빈 배열)"),
        insights: z.array(z.string()).describe("완료율, 시간대/날짜별 몰림 현상 등을 바탕으로 한 1~2문장 통찰 배열"),
        recommendations: z.array(z.string()).describe("당장 실행 가능한 다음 행동 제안 배열"),
        weeklyTrend: z.array(
          z.object({ day: z.string(), count: z.number() })
        ).optional().describe("주간 요약(period==='weekly')일 경우, 월~일 중 활발했던 요일을 추정하여 {day:'월', count:2} 형태로 반환"),
      }),
      prompt: `당신은 사용자의 생산성을 응원하고 날카롭게 분석해 주는 친절한 AI 비서입니다.
주어진 데이터는 사용자의 [${periodText}] 할 일 목록입니다. 완료율, 마감일, 우선순위 분포, 데이터가 언제 생성되었는지 등 시간적인 흐름을 함께 분석하세요.
분석 결과를 바탕으로 사용자가 바로 실천할 수 있고 공감할 수 있는 따뜻한 조언과 인사이트를 한국어로 자연스럽고 친근한 문체로 작성하세요.

분석 대상 데이터:
${summaryContext}`,
    });

    // 매핑용 (프론트 통일)
    const result = {
      summary: object.summary,
      completion_rate: object.completion_rate,
      urgent_tasks: object.urgentTasks,
      insights: object.insights,
      recommendations: object.recommendations,
      weekly_trend: object.weeklyTrend,
    };

    return { data: result, error: null };
  } catch (error: any) {
    console.error("AI Summary Generation Error:", error);
    return { data: null, error: "요약을 생성하는 중 오류가 발생했습니다." };
  }
}

/**
 * 3. 작성된 일기와 할일 목록을 분석하여 AI 성찰/피드백을 생성합니다.
 */
export async function generateDayReflection(todos: any[], diaryContent: string) {
  try {
    const completedCount = (todos || []).filter((t) => t.completed).length;
    const totalCount = (todos || []).length;

    const { text } = await generateText({
      model: google("gemini-2.0-flash"), // 안정적인 2.0 모델 사용
      prompt: `당신은 사용자의 하루를 따뜻하게 안아주고 격려해주는 친절한 AI 멘토입니다.
사용자가 작성한 [오늘의 일기] 내용과 [할일 완료 현황]을 바탕으로, 오늘 하루 고생한 사용자를 위한 짧은 성찰과 격려의 메시지를 작성해주세요.

오늘의 할일 완료 현황: 총 ${totalCount}개 중 ${completedCount}개 완료
사용자의 일기 내용: "${diaryContent}"

답변 지침:
- 한국어로 작성하세요.
- 너무 길지 않게 2~3문장 정도로 핵심적인 격려를 해주세요.
- 일기의 감정과 할일의 성과를 연결지어 공감해주세요.
- 존댓말을 사용하며 아주 친절하고 따뜻한 어조를 유지하세요.`,
    });

    return { data: text, error: null };
  } catch (error: any) {
    console.error("AI Reflection Generation Error:", error);
    return { data: null, error: "AI 피드백을 생성하는 중 오류가 발생했습니다." };
  }
}
