"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Calendar, Edit2, Check, Loader2 } from "lucide-react";
import { Goal, GoalType } from "@/types/todo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface GoalsPanelProps {
  userId: string;
}

/**
 * 월간/주간 목표를 표시하고 편집할 수 있는 패널 컴포넌트
 */
export default function GoalsPanel({ userId }: GoalsPanelProps) {
  const [goals, setGoals] = useState<Record<GoalType, string>>({
    monthly: "",
    weekly: "",
  });
  const [editing, setEditing] = useState<GoalType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<GoalType | null>(null);
  
  const supabase = createClient();

  // 목표 페칭
  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("목표 로딩 실패:", error);
      } else if (data) {
        const goalMap = { monthly: "", weekly: "" };
        data.forEach((g: Goal) => {
          goalMap[g.type] = g.content;
        });
        setGoals(goalMap);
      }
      setLoading(false);
    };

    if (userId) fetchGoals();
  }, [userId, supabase]);

  // 목표 저장 (Upsert)
  const handleSave = async (type: GoalType) => {
    if (saving) return;
    setSaving(type);
    
    const content = goals[type];
    
    const { error } = await supabase
      .from("goals")
      .upsert({
        user_id: userId,
        type,
        content,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,type"
      });

    if (error) {
      console.error(`${type} 목표 저장 실패:`, error);
    } else {
      setEditing(null);
    }
    setSaving(null);
  };

  const GoalCard = ({ type, title, icon: Icon, colorClass }: { 
    type: GoalType; 
    title: string; 
    icon: any; 
    colorClass: string;
  }) => {
    const isEditing = editing === type;
    const isSaving = saving === type;

    return (
      <Card className={cn("overflow-hidden border-none shadow-md bg-linear-to-br transition-all duration-300", colorClass)}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-bold text-white/90 tracking-wider uppercase">{title}</span>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setEditing(type)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="relative flex items-center gap-2">
              <Input
                autoFocus
                value={goals[type]}
                onChange={(e) => setGoals({ ...goals, [type]: e.target.value })}
                onBlur={() => handleSave(type)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave(type);
                  if (e.key === "Escape") setEditing(null);
                }}
                disabled={isSaving}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30 h-10 text-lg font-medium"
                placeholder={`${title}을 입력하세요...`}
              />
              {isSaving ? (
                <Loader2 className="h-5 w-5 text-white animate-spin shrink-0" />
              ) : (
                <button onClick={() => handleSave(type)} className="text-white hover:scale-110 transition-transform">
                  <Check className="h-5 w-5" />
                </button>
              )}
            </div>
          ) : (
            <div 
              onClick={() => setEditing(type)}
              className="min-h-12 cursor-pointer group"
            >
              <p className={cn(
                "text-xl sm:text-2xl font-bold text-white leading-tight break-all",
                !goals[type] && "text-white/40 italic font-normal text-lg"
              )}>
                {goals[type] || `${title}을 설정해보세요`}
              </p>
              <div className="mt-2 h-0.5 w-0 group-hover:w-full bg-white/30 transition-all duration-500 rounded-full" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
      <GoalCard 
        type="monthly" 
        title="Monthly Goal" 
        icon={Target} 
        colorClass="from-indigo-600 to-blue-500" 
      />
      <GoalCard 
        type="weekly" 
        title="Weekly Goal" 
        icon={Calendar} 
        colorClass="from-emerald-600 to-teal-500" 
      />
    </div>
  );
}
