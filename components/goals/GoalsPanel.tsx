"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Target, Calendar, Loader2 } from "lucide-react";
import { Goal, GoalType } from "@/types/todo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface GoalsPanelProps {
  userId: string;
}

/**
 * 개별 목표 입력 항목 컴포넌트
 */
interface GoalItemProps {
  type: GoalType;
  index: number;
  content: string;
  isSaving: boolean;
  onChange: (type: GoalType, index: number, value: string) => void;
  onSave: (type: GoalType, index: number) => void;
}

const GoalItem = ({ type, index, content, isSaving, onChange, onSave }: GoalItemProps) => {
  return (
    <div className="flex items-center gap-2 group">
      <span className="text-white/40 text-xs font-mono w-4 shrink-0 transition-colors group-focus-within:text-white/80">
        {index + 1}
      </span>
      <div className="relative flex-1">
        <Input
          value={content}
          onChange={(e) => onChange(type, index, e.target.value)}
          onBlur={() => onSave(type, index)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave(type, index);
          }}
          className="bg-transparent border-none text-white placeholder:text-white/20 focus-visible:ring-0 focus-within:bg-white/5 h-8 text-sm px-2 transition-all rounded"
          placeholder={`${index + 1}번째 목표를 입력하세요...`}
        />
        {isSaving && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="h-3 w-3 text-white/50 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 월간/주간 목표 카드 컴포넌트
 */
interface GoalCardProps {
  type: GoalType;
  title: string;
  icon: any;
  colorClass: string;
  goalList: string[];
  savingIndices: Set<number>;
  onChange: (type: GoalType, index: number, value: string) => void;
  onSave: (type: GoalType, index: number) => void;
}

const GoalCard = ({ 
  type, 
  title, 
  icon: Icon, 
  colorClass, 
  goalList, 
  savingIndices,
  onChange,
  onSave
}: GoalCardProps) => {
  return (
    <Card className={cn("overflow-hidden border-none shadow-md bg-linear-to-br transition-all duration-300", colorClass)}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs font-bold text-white/90 tracking-wider uppercase">{title}</span>
        </div>

        <div className="space-y-1">
          {goalList.map((content, idx) => (
            <GoalItem
              key={`${type}-${idx}`}
              type={type}
              index={idx}
              content={content}
              isSaving={savingIndices.has(idx)}
              onChange={onChange}
              onSave={onSave}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 월간/주간 목표(각 5개)를 관리하는 패널 컴포넌트
 */
export default function GoalsPanel({ userId }: GoalsPanelProps) {
  // 실제 DB 데이터와 매핑된 로컬 텍스트 상태
  const [goalStrings, setGoalStrings] = useState<Record<GoalType, string[]>>({
    monthly: ["", "", "", "", ""],
    weekly: ["", "", "", "", ""],
  });
  
  // 저장 중인 상태 관리 (타입별, 인덱스별)
  const [savingStatus, setSavingStatus] = useState<Record<GoalType, Set<number>>>({
    monthly: new Set(),
    weekly: new Set(),
  });

  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 데이터 로드
  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("목표 로딩 실패:", error);
      } else if (data) {
        const newGoalStrings = {
          monthly: ["", "", "", "", ""],
          weekly: ["", "", "", "", ""],
        };
        data.forEach((g: Goal) => {
          if (g.order_index >= 0 && g.order_index < 5) {
            newGoalStrings[g.type][g.order_index] = g.content;
          }
        });
        setGoalStrings(newGoalStrings);
      }
      setLoading(false);
    };

    if (userId) fetchGoals();
  }, [userId, supabase]);

  // 입력 변경 처리
  const handleInputChange = (type: GoalType, index: number, value: string) => {
    setGoalStrings(prev => {
      const newList = [...prev[type]];
      newList[index] = value;
      return { ...prev, [type]: newList };
    });
  };

  // 개별 목표 저장 로직
  const handleSaveGoal = async (type: GoalType, index: number) => {
    const content = goalStrings[type][index].trim();
    
    // 이전에 저장 중이었는지 확인
    if (savingStatus[type].has(index)) return;

    // 저장 상태 표시
    setSavingStatus(prev => {
      const newSet = new Set(prev[type]);
      newSet.add(index);
      return { ...prev, [type]: newSet };
    });

    try {
      // 해당 타입/인덱스에 이미 데이터가 있는지 확인하고 upsert
      // order_index를 보조 PK처럼 활용
      const { error } = await supabase
        .from("goals")
        .upsert(
          {
            user_id: userId,
            type,
            order_index: index,
            content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,type,order_index" } 
          // 참고: schema.sql에서 unique(user_id, type, order_index)를 추가해야 함
        );

      if (error) throw error;
    } catch (err) {
      console.error(`${type} ${index+1}번 목표 저장 실패:`, err);
    } finally {
      // 저장 상태 해제
      setSavingStatus(prev => {
        const newSet = new Set(prev[type]);
        newSet.delete(index);
        return { ...prev, [type]: newSet };
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <GoalCard 
        type="monthly" 
        title="Monthly Strategy (5)" 
        icon={Target} 
        colorClass="from-indigo-600 to-blue-500"
        goalList={goalStrings.monthly}
        savingIndices={savingStatus.monthly}
        onChange={handleInputChange}
        onSave={handleSaveGoal}
      />
      <GoalCard 
        type="weekly" 
        title="Weekly Sprint (5)" 
        icon={Calendar} 
        colorClass="from-emerald-600 to-teal-500" 
        goalList={goalStrings.weekly}
        savingIndices={savingStatus.weekly}
        onChange={handleInputChange}
        onSave={handleSaveGoal}
      />
    </div>
  );
}
