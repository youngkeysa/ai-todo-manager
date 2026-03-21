"use client";

// 할일 추가/수정 모달 폼: Dialog + 입력 필드 전체 구성
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Todo, type TodoCreateInput, type Priority, type Category } from "@/types/todo";

interface TodoFormModalProps {
  /** 모달 열림 여부 */
  open: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 저장 콜백 (추가 또는 수정) */
  onSave: (data: TodoCreateInput) => void;
  /** 수정 시 기존 데이터 (없으면 추가 모드) */
  editTarget?: Todo | null;
}

/** 폼 초기값 */
const DEFAULT_FORM: TodoCreateInput = {
  title: "",
  description: "",
  due_date: "",
  priority: "medium",
  category: "업무",
};

/**
 * 할일 추가 / 수정 모달
 * - open: true이면 Dialog 열림
 * - editTarget이 있으면 수정 모드, 없으면 추가 모드
 * - 저장 버튼 클릭 시 onSave 콜백 호출
 */
const TodoFormModal = ({ open, onClose, onSave, editTarget }: TodoFormModalProps) => {
  const isEditMode = !!editTarget;

  // 폼 상태
  const [form, setForm] = useState<TodoCreateInput>(DEFAULT_FORM);
  const [titleError, setTitleError] = useState("");

  // 수정 모드이면 기존 데이터로 폼 초기화
  useEffect(() => {
    if (open) {
      if (editTarget) {
        setForm({
          title: editTarget.title,
          description: editTarget.description ?? "",
          due_date: editTarget.due_date
            ? new Date(editTarget.due_date).toISOString().slice(0, 16) // datetime-local 형식
            : "",
          priority: editTarget.priority,
          category: editTarget.category,
        });
      } else {
        setForm(DEFAULT_FORM);
      }
      setTitleError("");
    }
  }, [open, editTarget]);

  /** 저장 처리: 유효성 검사 후 onSave 호출 */
  const handleSave = () => {
    if (!form.title.trim()) {
      setTitleError("제목은 필수 항목입니다.");
      return;
    }

    onSave({
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      due_date: form.due_date
        ? new Date(form.due_date).toISOString()
        : undefined,
      priority: form.priority,
      category: form.category,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {isEditMode ? "할일 수정" : "새 할일 추가"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            할일의 제목과 상세, 우선순위 등을 입력하는 모달입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 제목 (필수) */}
          <div className="space-y-1.5">
            <Label htmlFor="form-title" className="text-xs font-medium">
              제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="form-title"
              placeholder="할일 제목을 입력하세요"
              value={form.title}
              onChange={(e) => {
                setForm((p) => ({ ...p, title: e.target.value }));
                if (e.target.value.trim()) setTitleError("");
              }}
              className={titleError ? "border-destructive" : ""}
              autoFocus
            />
            {titleError && (
              <p className="text-xs text-destructive">{titleError}</p>
            )}
          </div>

          {/* 설명 (선택) */}
          <div className="space-y-1.5">
            <Label htmlFor="form-desc" className="text-xs font-medium">
              설명{" "}
              <span className="text-muted-foreground font-normal">(선택)</span>
            </Label>
            <Textarea
              id="form-desc"
              placeholder="상세 내용을 입력하세요"
              rows={2}
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="resize-none"
            />
          </div>

          {/* 우선순위 + 카테고리 행 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="form-priority" className="text-xs font-medium">
                우선순위
              </Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, priority: v as Priority }))
                }
              >
                <SelectTrigger id="form-priority" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 높음</SelectItem>
                  <SelectItem value="medium">🟡 중간</SelectItem>
                  <SelectItem value="low">🟢 낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="form-category" className="text-xs font-medium">
                카테고리
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, category: v as Category }))
                }
              >
                <SelectTrigger id="form-category" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="업무">💼 업무</SelectItem>
                  <SelectItem value="개인">🏠 개인</SelectItem>
                  <SelectItem value="학습">📚 학습</SelectItem>
                  <SelectItem value="기타">📌 기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 마감일 (선택) */}
          <div className="space-y-1.5">
            <Label htmlFor="form-due" className="text-xs font-medium">
              마감일{" "}
              <span className="text-muted-foreground font-normal">(선택)</span>
            </Label>
            <Input
              id="form-due"
              type="datetime-local"
              value={form.due_date ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, due_date: e.target.value }))
              }
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            취소
          </Button>
          <Button size="sm" onClick={handleSave} id="btn-save-todo">
            {isEditMode ? "저장" : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TodoFormModal;
