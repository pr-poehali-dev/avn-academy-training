import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { StatusBadge, SectionHeader } from "./UIComponents";
import { User } from "@/lib/api";
import { fetchRequests, createRequest, TrainingRequest } from "@/lib/api";

export const TYPE_LABEL: Record<string, string> = {
  lecture: "Лекция",
  practice: "Практика",
  exam: "Экзамен",
  report: "Рапорт",
};

export function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU");
}

export function avg(grades: { grade: number }[]) {
  if (!grades.length) return "—";
  return (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(1);
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <Icon name="Loader2" size={24} className="text-primary animate-spin" />
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
      <Icon name="Inbox" size={28} className="mb-2 opacity-40" />
      <p className="text-sm font-mono">{text}</p>
    </div>
  );
}

export function RequestCard({
  r,
  icon,
  highlight,
  onInstructorReview,
}: {
  r: TrainingRequest;
  icon: string;
  highlight?: boolean;
  onInstructorReview?: (r: TrainingRequest) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (highlight) setExpanded(true);
  }, [highlight]);

  return (
    <div
      className={`bg-tactical-card border p-4 transition-colors cursor-pointer ${
        highlight ? "border-primary animate-pulse-once" : "border-tactical-border hover:border-primary/30"
      }`}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name={icon} fallback="FileText" size={14} className="text-primary" />
          </div>
          <div>
            <h4 className="font-ibm text-sm font-medium text-foreground">{r.subject}</h4>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {TYPE_LABEL[r.type]} · {fmt(r.created_at)}
              {r.preferred_date && ` · Дата: ${fmt(r.preferred_date)}`}
            </p>
            {r.cadet_name && (
              <p className="text-xs text-muted-foreground font-mono">{r.cadet_rank} {r.cadet_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={r.status} />
          <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={14} className="text-muted-foreground" />
        </div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-tactical-border space-y-2 animate-fade-in">
          {r.description && (
            <p className="text-xs text-muted-foreground font-ibm">
              <span className="text-foreground font-semibold">Пояснение: </span>{r.description}
            </p>
          )}
          {r.instructor_comment && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              <span className="text-foreground font-semibold not-italic">Комментарий инструктора: </span>
              "{r.instructor_comment}"
            </p>
          )}
          {r.reviewer_name && (
            <p className="text-xs text-muted-foreground font-mono">Рассмотрел: {r.reviewer_name}</p>
          )}
          {onInstructorReview && r.status === "pending" && (
            <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              <button
                className="bg-green-700 hover:bg-green-600 text-white font-oswald text-xs tracking-widest uppercase py-1.5 px-3 transition-colors"
                onClick={() => onInstructorReview(r)}
              >
                Перейти к рассмотрению
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RequestForm({
  type,
  subjectOptions,
  onSubmit,
  onClose,
}: {
  type: "lecture" | "practice" | "exam" | "report";
  subjectOptions: string[];
  onSubmit: () => void;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState(subjectOptions[0] || "");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createRequest({ type, subject, description, preferred_date: date || undefined });
      onSubmit();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-tactical-card border border-primary/40 p-4 animate-fade-in space-y-3">
      <h3 className="font-oswald text-sm tracking-widest uppercase text-primary">
        Новый запрос — {TYPE_LABEL[type]}
      </h3>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="rank-badge text-muted-foreground block mb-1">Тема</label>
          <select
            className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjectOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="rank-badge text-muted-foreground block mb-1">Предпочтительная дата</label>
          <input
            type="date"
            className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="rank-badge text-muted-foreground block mb-1">Пояснение (необязательно)</label>
        <textarea
          className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors resize-none"
          rows={2}
          placeholder="Опишите цель..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 px-3 py-2">
          <Icon name="AlertTriangle" size={13} className="text-red-400" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-6 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Отправка..." : "Отправить"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="border border-tactical-border text-muted-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:border-primary/40 transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

export function RequestSection({
  authUser,
  type,
  icon,
  title,
  sub,
  subjectOptions,
  newLabel,
  emptyText,
  highlightRequestId,
}: {
  authUser: User;
  type: "lecture" | "practice" | "exam" | "report";
  icon: string;
  title: string;
  sub: string;
  subjectOptions: string[];
  newLabel: string;
  emptyText: string;
  highlightRequestId?: number;
}) {
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const isInstructor = authUser.role === "instructor";

  const load = useCallback(async () => {
    setLoading(true);
    const all = await fetchRequests().catch(() => []);
    setRequests(all.filter((r) => r.type === type));
    setLoading(false);
  }, [type]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title={title} sub={sub} />
        {!isInstructor && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Icon name="Plus" size={14} />{newLabel}
          </button>
        )}
      </div>
      {!isInstructor && showForm && (
        <RequestForm
          type={type}
          subjectOptions={subjectOptions}
          onSubmit={() => { setShowForm(false); load(); }}
          onClose={() => setShowForm(false)}
        />
      )}
      {loading ? <Spinner /> : requests.length === 0 ? <Empty text={emptyText} /> : (
        <div className="space-y-2">
          {requests.map((r) => (
            <RequestCard
              key={r.id}
              r={r}
              icon={icon}
              highlight={r.id === highlightRequestId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
