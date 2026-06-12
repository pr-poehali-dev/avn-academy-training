import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  StatusBadge,
  GradeCircle,
  SectionHeader,
  StatCard,
} from "./UIComponents";
import { User } from "@/lib/api";
import {
  fetchRequests,
  createRequest,
  reviewRequest,
  fetchGrades,
  createGrade,
  fetchRatings,
  rateInstructor,
  TrainingRequest,
  Grade,
  InstructorRating,
} from "@/lib/api";
import { MOCK_MATERIALS } from "./types";

// ─── helpers ──────────────────────────────────────────────────────────────────
const TYPE_LABEL: Record<string, string> = {
  lecture: "Лекция",
  practice: "Практика",
  exam: "Экзамен",
  report: "Рапорт",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU");
}

function avg(grades: Grade[]) {
  if (!grades.length) return "—";
  return (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(1);
}

// ─── shared request list card ─────────────────────────────────────────────────
function RequestCard({
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

// ─── Loading / Empty states ───────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <Icon name="Loader2" size={24} className="text-primary animate-spin" />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
      <Icon name="Inbox" size={28} className="mb-2 opacity-40" />
      <p className="text-sm font-mono">{text}</p>
    </div>
  );
}

// ─── REQUEST FORM ─────────────────────────────────────────────────────────────
function RequestForm({
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

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function Dashboard({ authUser, onNavigate }: { authUser: User; onNavigate?: (s: import("./types").Section, id?: number) => void }) {
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    fetchRequests().then(setRequests).catch(() => {});
    fetchGrades().then(setGrades).catch(() => {});
  }, []);

  const myGrades = grades.filter((g) => g.cadet_id === authUser.id);
  const avgGrade = myGrades.length
    ? (myGrades.reduce((s, g) => s + g.grade, 0) / myGrades.length).toFixed(1)
    : "—";
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const recent = requests.slice(0, 3);

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        title="Академия Войск Национальной Гвардии"
        sub={`Добро пожаловать, ${authUser.name}`}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Средний балл" value={avgGrade} icon="Star" accent="text-gold" />
        <StatCard label="Всего оценок" value={myGrades.length} icon="CheckSquare" accent="text-green-400" />
        <StatCard label="Активных запросов" value={pendingCount} icon="FileText" accent="text-yellow-400" />
        <StatCard label="До экзамена" value="5 дн." icon="Clock" accent="text-primary" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Личные данные</h3>
          <div className="space-y-2">
            {[
              { label: "Звание", value: authUser.rank || "—" },
              { label: "Подразделение", value: authUser.unit || "—" },
              { label: "Static ID", value: authUser.static_id },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-tactical-border last:border-0">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-mono">{item.label}</span>
                <span className="text-foreground text-sm font-ibm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Последние запросы</h3>
          {recent.length === 0 ? (
            <Empty text="Нет запросов" />
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="flex items-start gap-3 py-1.5 border-b border-tactical-border last:border-0">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${r.status === "approved" ? "bg-green-400" : r.status === "rejected" ? "bg-red-400" : "bg-yellow-400"}`} />
                  <div>
                    <p className="text-sm text-foreground">{r.subject}</p>
                    <p className="text-xs text-muted-foreground font-mono">{TYPE_LABEL[r.type]} · {fmt(r.created_at)}</p>
                  </div>
                  <div className="ml-auto"><StatusBadge status={r.status} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MATERIALS
// ═══════════════════════════════════════════════════════════════════════════════
export function Materials() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Обучающие материалы" sub="Учебная библиотека академии АВНГ" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_MATERIALS.map((m) => (
          <div key={m.id} className="corner-mark bg-tactical-card border border-tactical-border p-4 card-glow hover:border-primary/40 transition-colors group">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Icon name={m.icon} fallback="BookOpen" size={18} className="text-primary" />
              </div>
              <div>
                <h4 className="font-oswald text-base font-medium text-foreground leading-tight">{m.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{m.category}</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-tactical-border pt-3">
              <span className="rank-badge text-muted-foreground">{m.pages ? `${m.pages} стр.` : "Презентация"}</span>
              {m.url ? (
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="rank-badge text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                  <Icon name="ExternalLink" size={12} />Открыть
                </a>
              ) : (
                <button className="rank-badge text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                  <Icon name="Download" size={12} />Скачать
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Generic section for cadet request types ──────────────────────────────────
function RequestSection({
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

// ═══════════════════════════════════════════════════════════════════════════════
// LECTURES
// ═══════════════════════════════════════════════════════════════════════════════
export function Lectures({ authUser, highlightRequestId }: { authUser: User; highlightRequestId?: number }) {
  return (
    <RequestSection
      authUser={authUser}
      type="lecture"
      icon="GraduationCap"
      title="Лекции"
      sub="Запросы на прохождение лекций"
      subjectOptions={[
        "Прослушать вступительную лекцию",
        "Лекция ФЗ о ФСВНГ и Внутреннему Уставу",
        "Лекция УК, ПК и КоАП",
        "Лекция о допуске к закрытой территории",
      ]}
      newLabel="Новый запрос"
      emptyText="Нет запросов на лекции"
      highlightRequestId={highlightRequestId}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRACTICES
// ═══════════════════════════════════════════════════════════════════════════════
export function Practices({ authUser, highlightRequestId }: { authUser: User; highlightRequestId?: number }) {
  return (
    <RequestSection
      authUser={authUser}
      type="practice"
      icon="Wrench"
      title="Практики"
      sub="Запросы на прохождение практических занятий"
      subjectOptions={[
        "Отработка Штраф Задержание Ареста на инструкторе",
        "Огневая подготовка",
        "Физическая подготовка",
        "Строевая подготовка",
        "Присяга",
      ]}
      newLabel="Новый запрос"
      emptyText="Нет запросов на практику"
      highlightRequestId={highlightRequestId}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMS
// ═══════════════════════════════════════════════════════════════════════════════
export function Exams({ authUser, highlightRequestId }: { authUser: User; highlightRequestId?: number }) {
  return (
    <RequestSection
      authUser={authUser}
      type="exam"
      icon="ClipboardList"
      title="Экзамены"
      sub="Запросы на прохождение экзаменов"
      subjectOptions={[
        "Экзамен теоретические тесты — Устав ФСВНГ — ФЗ о ФСВНГ",
        "Экзамен процедуры практики — Штраф — Задержание — Арест",
        "Экзамен теоретические тесты — Штраф — Задержание — Арест",
      ]}
      newLabel="Записаться"
      emptyText="Нет запросов на экзамены"
      highlightRequestId={highlightRequestId}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════
export function Reports({ authUser, highlightRequestId }: { authUser: User; highlightRequestId?: number }) {
  return (
    <RequestSection
      authUser={authUser}
      type="report"
      icon="FileText"
      title="Рапорты"
      sub="Подача служебных рапортов и заявлений"
      subjectOptions={[
        "Рапорт на повышение в звании",
        "Запрос дополнительного обучения",
        "Рапорт о прохождении практики",
        "Иное обращение",
      ]}
      newLabel="Новый рапорт"
      emptyText="Нет рапортов"
      highlightRequestId={highlightRequestId}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADES
// ═══════════════════════════════════════════════════════════════════════════════
export function Grades({ authUser }: { authUser: User }) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades()
      .then((all) => setGrades(all.filter((g) => g.cadet_id === authUser.id)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authUser.id]);

  const fives = grades.filter((g) => g.grade === 5).length;
  const fours = grades.filter((g) => g.grade === 4).length;
  const threes = grades.filter((g) => g.grade <= 3).length;

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Система оценок" sub="Успеваемость и академические показатели" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Средний балл" value={avg(grades)} icon="Star" accent="text-gold" />
        <StatCard label="Отличных (5)" value={fives} icon="Award" accent="text-green-400" />
        <StatCard label="Хороших (4)" value={fours} icon="ThumbsUp" accent="text-yellow-400" />
        <StatCard label="Удовлетв. (≤3)" value={threes} icon="Minus" accent="text-orange-400" />
      </div>
      {loading ? <Spinner /> : grades.length === 0 ? <Empty text="Оценок пока нет" /> : (
        <div className="bg-tactical-card border border-tactical-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tactical-border bg-tactical-panel">
                <th className="text-left px-4 py-3 rank-badge text-muted-foreground">Дисциплина</th>
                <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">Тип</th>
                <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">Инструктор</th>
                <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">Дата</th>
                <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Оценка</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id} className="border-b border-tactical-border last:border-0 hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3 text-sm font-ibm text-foreground">
                    {g.subject}
                    {g.comment && <p className="text-xs text-muted-foreground italic">{g.comment}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">{TYPE_LABEL[g.type]}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">{g.instructor_name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">{fmt(g.graded_at)}</td>
                  <td className="px-4 py-3"><div className="flex justify-center"><GradeCircle grade={g.grade} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
export function Profile({ authUser }: { authUser: User }) {
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadingR, setLoadingR] = useState(true);
  const [loadingG, setLoadingG] = useState(true);
  const [tab, setTab] = useState<"requests" | "grades">("requests");

  useEffect(() => {
    fetchRequests().then(setRequests).catch(() => {}).finally(() => setLoadingR(false));
    fetchGrades()
      .then((all) => setGrades(all.filter((g) => g.cadet_id === authUser.id)))
      .catch(() => {})
      .finally(() => setLoadingG(false));
  }, [authUser.id]);

  const avgGrade = grades.length
    ? (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(1)
    : "—";

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Профиль курсанта" sub="Личные данные и история обучения" />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="corner-mark bg-tactical-card border border-tactical-border p-6 card-glow flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
            <Icon name="User" size={36} className="text-primary" />
          </div>
          <h3 className="font-oswald text-lg tracking-wide text-foreground">{authUser.name}</h3>
          <p className="text-gold font-mono text-sm mt-1">{authUser.rank || "—"}</p>
          <div className="mt-3 px-3 py-1 bg-primary/10 border border-primary/20">
            <span className="rank-badge text-primary">ID: {authUser.static_id}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 w-full">
            <div className="bg-tactical-panel border border-tactical-border p-2 text-center">
              <p className="font-oswald text-xl text-gold">{avgGrade}</p>
              <p className="rank-badge text-muted-foreground">Средний балл</p>
            </div>
            <div className="bg-tactical-panel border border-tactical-border p-2 text-center">
              <p className="font-oswald text-xl text-primary">{requests.length}</p>
              <p className="rank-badge text-muted-foreground">Запросов</p>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-4">Служебные данные</h3>
          <div className="space-y-3">
            {[
              { label: "Имя", value: authUser.name },
              { label: "Звание", value: authUser.rank || "—" },
              { label: "Подразделение", value: authUser.unit || "—" },
              { label: "Static ID", value: authUser.static_id },
              { label: "Роль", value: authUser.role === "instructor" ? "Инструктор" : "Курсант" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-tactical-border last:border-0">
                <span className="rank-badge text-muted-foreground">{item.label}</span>
                <span className="text-sm font-ibm text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tactical-border">
        {([
          { id: "requests", label: "История запросов" },
          { id: "grades", label: "Оценки" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-oswald text-sm tracking-widest uppercase px-4 py-2 transition-colors border-b-2 ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "requests" && (
        loadingR ? <Spinner /> : requests.length === 0 ? <Empty text="Запросов нет" /> : (
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="bg-tactical-card border border-tactical-border p-3 flex items-center justify-between gap-3 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="FileText" size={12} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-ibm text-foreground">{r.subject}</p>
                    <p className="text-xs text-muted-foreground font-mono">{TYPE_LABEL[r.type]} · {fmt(r.created_at)}</p>
                    {r.instructor_comment && <p className="text-xs text-muted-foreground italic mt-0.5">"{r.instructor_comment}"</p>}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )
      )}

      {tab === "grades" && (
        loadingG ? <Spinner /> : grades.length === 0 ? <Empty text="Оценок нет" /> : (
          <div className="space-y-2">
            {grades.map((g) => (
              <div key={g.id} className="bg-tactical-card border border-tactical-border p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-ibm text-foreground">{g.subject}</p>
                  <p className="text-xs text-muted-foreground font-mono">{TYPE_LABEL[g.type]} · {g.instructor_name} · {fmt(g.graded_at)}</p>
                  {g.comment && <p className="text-xs text-muted-foreground italic mt-0.5">"{g.comment}"</p>}
                </div>
                <GradeCircle grade={g.grade} />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTRUCTOR PANEL
// ═══════════════════════════════════════════════════════════════════════════════
type EditForm = { name: string; rank: string; unit: string; role: "cadet" | "instructor"; password: string };

export function InstructorPanel({ authUser, highlightRequestId }: { authUser: User; highlightRequestId?: number }) {
  const [activeTab, setActiveTab] = useState<"requests" | "grades" | "cadets" | "whitelist" | "rating">("requests");

  // --- Requests tab ---
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState<Record<number, string>>({});
  const [reviewLoading, setReviewLoading] = useState<Record<number, boolean>>({});
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("pending");

  // --- Grades tab ---
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesLoaded, setGradesLoaded] = useState(false);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [gradeForm, setGradeForm] = useState({ cadet_id: 0, subject: "", type: "exam" as "lecture" | "practice" | "exam", grade: 5, comment: "", request_id: undefined as number | undefined });
  const [gradeError, setGradeError] = useState("");
  const [gradeLoading, setGradeLoading] = useState(false);

  // --- Whitelist tab ---
  const [wlUsers, setWlUsers] = useState<import("@/lib/api").AdminUser[]>([]);
  const [wlLoading, setWlLoading] = useState(false);
  const [wlLoaded, setWlLoaded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ static_id: "", password: "", name: "", rank: "Рядовой", unit: "", role: "cadet" as "cadet" | "instructor" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [editUser, setEditUser] = useState<import("@/lib/api").AdminUser | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", rank: "", unit: "", role: "cadet", password: "" });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    setReqLoading(true);
    const r = await fetchRequests().catch(() => []);
    setRequests(r);
    setReqLoading(false);
  }, []);

  const loadGrades = useCallback(async (force = false) => {
    if (gradesLoaded && !force) return;
    setGradesLoading(true);
    const g = await fetchGrades().catch(() => []);
    setAllGrades(g);
    setGradesLoaded(true);
    setGradesLoading(false);
  }, [gradesLoaded]);

  const loadWhitelist = useCallback(async (force = false) => {
    if (wlLoaded && !force) return;
    setWlLoading(true);
    const { adminListUsers } = await import("@/lib/api");
    const users = await adminListUsers().catch(() => []);
    setWlUsers(users);
    setWlLoaded(true);
    setWlLoading(false);
  }, [wlLoaded]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === "whitelist") loadWhitelist();
    if (tab === "grades") loadGrades();
    if (tab === "requests") loadRequests();
  };

  const handleReview = async (id: number, status: "approved" | "rejected") => {
    setReviewLoading((prev) => ({ ...prev, [id]: true }));
    await reviewRequest(id, status, reviewComment[id] || "").catch(() => {});
    await loadRequests();
    setReviewLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGradeError("");
    setGradeLoading(true);
    try {
      await createGrade(gradeForm);
      setShowGradeForm(false);
      setGradeForm({ cadet_id: 0, subject: "", type: "exam", grade: 5, comment: "", request_id: undefined });
      await loadGrades(true);
      await loadRequests();
    } catch (err: unknown) {
      setGradeError(err instanceof Error ? err.message : "Ошибка");
    }
    setGradeLoading(false);
  };

  const openGradeFromRequest = (r: TrainingRequest) => {
    setGradeForm({ cadet_id: r.cadet_id, subject: r.subject, type: r.type as "lecture" | "practice" | "exam", grade: 5, comment: "", request_id: r.id });
    setShowGradeForm(true);
    setActiveTab("grades");
  };

  const toggleWhitelist = async (id: number, current: boolean) => {
    const { adminUpdateUser } = await import("@/lib/api");
    await adminUpdateUser(id, { is_whitelisted: !current });
    setWlUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_whitelisted: !current } : u)));
  };

  const openEdit = (u: import("@/lib/api").AdminUser) => {
    setEditUser(u);
    setEditForm({ name: u.name, rank: u.rank, unit: u.unit, role: u.role, password: "" });
    setEditError("");
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditError("");
    setEditLoading(true);
    try {
      const { adminUpdateUser } = await import("@/lib/api");
      const payload: Parameters<typeof adminUpdateUser>[1] = { name: editForm.name, rank: editForm.rank, unit: editForm.unit, role: editForm.role };
      if (editForm.password) payload.password = editForm.password;
      await adminUpdateUser(editUser.id, payload);
      setWlUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, ...editForm } : u));
      setEditUser(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Ошибка");
    }
    setEditLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const { adminCreateUser } = await import("@/lib/api");
      await adminCreateUser({ ...form, is_whitelisted: true });
      setShowAddForm(false);
      setForm({ static_id: "", password: "", name: "", rank: "Рядовой", unit: "", role: "cadet" });
      loadWhitelist(true);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Ошибка");
    }
    setFormLoading(false);
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const cadets = wlUsers.filter((u) => u.role === "cadet");

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Панель инструктора" sub="Управление курсантами, запросами и оценками" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Новых запросов" value={pendingCount} icon="Bell" accent="text-yellow-400" />
        <StatCard label="Курсантов" value={wlUsers.filter((u) => u.role === "cadet").length || "—"} icon="Users" accent="text-primary" />
        <StatCard label="Всего оценок" value={allGrades.length} icon="Award" accent="text-green-400" />
        <StatCard label="Запросов всего" value={requests.length} icon="FileText" accent="text-gold" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tactical-border overflow-x-auto">
        {([
          { id: "requests", label: "Запросы" },
          { id: "grades", label: "Оценки" },
          { id: "cadets", label: "Курсанты" },
          { id: "whitelist", label: "Вайтлист" },
          { id: "rating", label: "Мой рейтинг" },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`font-oswald text-sm tracking-widest uppercase px-4 py-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
            {tab.id === "requests" && pendingCount > 0 && (
              <span className="ml-1.5 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── REQUESTS TAB ── */}
      {activeTab === "requests" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2 flex-wrap">
            <select
              className="bg-tactical-panel border border-tactical-border px-3 py-1.5 text-xs text-foreground font-ibm focus:outline-none focus:border-primary"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="pending">На рассмотрении</option>
              <option value="approved">Одобренные</option>
              <option value="rejected">Отклонённые</option>
              <option value="all">Все статусы</option>
            </select>
            <select
              className="bg-tactical-panel border border-tactical-border px-3 py-1.5 text-xs text-foreground font-ibm focus:outline-none focus:border-primary"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Все типы</option>
              <option value="lecture">Лекции</option>
              <option value="practice">Практики</option>
              <option value="exam">Экзамены</option>
              <option value="report">Рапорты</option>
            </select>
          </div>
          {reqLoading ? <Spinner /> : filteredRequests.length === 0 ? <Empty text="Нет запросов" /> : (
            <div className="space-y-3">
              {filteredRequests.map((r) => (
                <div key={r.id} className={`bg-tactical-card border p-4 space-y-3 transition-colors ${r.id === highlightRequestId ? "border-primary" : "border-tactical-border hover:border-primary/30"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon name="User" size={14} className="text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-ibm text-sm font-medium text-foreground">{r.cadet_rank} {r.cadet_name}</h4>
                          <span className="rank-badge text-muted-foreground bg-tactical-panel px-1.5 py-0.5">{TYPE_LABEL[r.type]}</span>
                        </div>
                        <p className="text-sm text-foreground mt-0.5">{r.subject}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {fmt(r.created_at)}
                          {r.preferred_date && ` · Дата: ${fmt(r.preferred_date)}`}
                        </p>
                        {r.description && <p className="text-xs text-muted-foreground mt-1 italic">"{r.description}"</p>}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.status === "pending" && (
                    <div className="border-t border-tactical-border pt-3 space-y-2">
                      <input
                        className="w-full bg-tactical-panel border border-tactical-border px-3 py-1.5 text-xs text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                        placeholder="Комментарий инструктора (необязательно)..."
                        value={reviewComment[r.id] || ""}
                        onChange={(e) => setReviewComment((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          disabled={reviewLoading[r.id]}
                          onClick={() => handleReview(r.id, "approved")}
                          className="rank-badge text-green-400 border border-green-800 px-3 py-1 hover:bg-green-900/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <Icon name="Check" size={12} />Одобрить
                        </button>
                        <button
                          disabled={reviewLoading[r.id]}
                          onClick={() => handleReview(r.id, "rejected")}
                          className="rank-badge text-red-400 border border-red-800 px-3 py-1 hover:bg-red-900/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <Icon name="X" size={12} />Отклонить
                        </button>
                        {r.type !== "report" && (
                          <button
                            onClick={() => openGradeFromRequest(r)}
                            className="rank-badge text-primary border border-primary/40 px-3 py-1 hover:bg-primary/10 transition-colors flex items-center gap-1"
                          >
                            <Icon name="Star" size={12} />Поставить оценку
                          </button>
                        )}
                        {reviewLoading[r.id] && <Icon name="Loader2" size={14} className="text-primary animate-spin" />}
                      </div>
                    </div>
                  )}
                  {r.status !== "pending" && r.reviewer_name && (
                    <p className="text-xs text-muted-foreground font-mono border-t border-tactical-border pt-2">
                      Рассмотрел: {r.reviewer_name}
                      {r.instructor_comment && ` · "${r.instructor_comment}"`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── GRADES TAB ── */}
      {activeTab === "grades" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <button
              onClick={() => setShowGradeForm(!showGradeForm)}
              className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Icon name="Plus" size={14} />Поставить оценку
            </button>
          </div>
          {showGradeForm && (
            <form onSubmit={handleGradeSubmit} className="bg-tactical-card border border-primary/40 p-4 animate-fade-in space-y-3">
              <h3 className="font-oswald text-sm tracking-widest uppercase text-primary">Выставить оценку</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">Курсант</label>
                  <select
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary"
                    value={gradeForm.cadet_id}
                    onChange={(e) => setGradeForm({ ...gradeForm, cadet_id: Number(e.target.value) })}
                    required
                  >
                    <option value={0}>— выберите курсанта —</option>
                    {cadets.map((c) => <option key={c.id} value={c.id}>{c.rank} {c.name}</option>)}
                    {cadets.length === 0 && <option disabled>Загрузите вайтлист</option>}
                  </select>
                </div>
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">Тип</label>
                  <select
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary"
                    value={gradeForm.type}
                    onChange={(e) => setGradeForm({ ...gradeForm, type: e.target.value as typeof gradeForm.type })}
                  >
                    <option value="exam">Экзамен</option>
                    <option value="practice">Практика</option>
                    <option value="lecture">Лекция</option>
                  </select>
                </div>
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">Дисциплина</label>
                  <input
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary"
                    placeholder="Название дисциплины"
                    value={gradeForm.subject}
                    onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">Оценка</label>
                  <select
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade: Number(e.target.value) })}
                  >
                    <option value={5}>5 — Отлично</option>
                    <option value={4}>4 — Хорошо</option>
                    <option value={3}>3 — Удовлетворительно</option>
                    <option value={2}>2 — Неудовлетворительно</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="rank-badge text-muted-foreground block mb-1">Комментарий (необязательно)</label>
                <input
                  className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary"
                  placeholder="Замечания или пояснения..."
                  value={gradeForm.comment}
                  onChange={(e) => setGradeForm({ ...gradeForm, comment: e.target.value })}
                />
              </div>
              {gradeError && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 px-3 py-2">
                  <Icon name="AlertTriangle" size={13} className="text-red-400" />
                  <p className="text-xs text-red-400">{gradeError}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={gradeLoading} className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-6 hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {gradeLoading ? "Сохранение..." : "Выставить"}
                </button>
                <button type="button" onClick={() => setShowGradeForm(false)} className="border border-tactical-border text-muted-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:border-primary/40 transition-colors">
                  Отмена
                </button>
              </div>
            </form>
          )}
          {gradesLoading ? <Spinner /> : allGrades.length === 0 ? <Empty text="Оценок пока нет" /> : (
            <div className="bg-tactical-card border border-tactical-border overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-tactical-border bg-tactical-panel">
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground">Курсант</th>
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground">Дисциплина</th>
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">Тип</th>
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">Дата</th>
                    <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Оценка</th>
                  </tr>
                </thead>
                <tbody>
                  {allGrades.map((g) => (
                    <tr key={g.id} className="border-b border-tactical-border last:border-0 hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-ibm text-foreground">{g.cadet_rank} {g.cadet_name}</td>
                      <td className="px-4 py-3 text-sm font-ibm text-foreground">
                        {g.subject}
                        {g.comment && <p className="text-xs text-muted-foreground italic">{g.comment}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">{TYPE_LABEL[g.type]}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">{fmt(g.graded_at)}</td>
                      <td className="px-4 py-3"><div className="flex justify-center"><GradeCircle grade={g.grade} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── CADETS TAB ── */}
      {activeTab === "cadets" && (
        <div className="animate-fade-in">
          {wlLoading ? <Spinner /> : (
            <div className="bg-tactical-card border border-tactical-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-tactical-border bg-tactical-panel">
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground">Курсант</th>
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">Звание</th>
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">Подразделение</th>
                    <th className="text-center px-4 py-3 rank-badge text-muted-foreground">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {wlUsers.filter((u) => u.role === "cadet" && u.is_whitelisted).length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">Нет курсантов. Загрузите вайтлист.</td></tr>
                  ) : wlUsers.filter((u) => u.role === "cadet" && u.is_whitelisted).map((c) => (
                    <tr key={c.id} className="border-b border-tactical-border last:border-0 hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-ibm text-foreground">{c.name}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">{c.rank}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">{c.unit || "—"}</td>
                      <td className="px-4 py-3 text-center font-mono text-sm text-primary">{c.static_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── WHITELIST TAB ── */}
      {activeTab === "whitelist" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Icon name="Plus" size={14} />Добавить пользователя
            </button>
          </div>
          {showAddForm && (
            <form onSubmit={handleAddUser} className="bg-tactical-card border border-primary/40 p-4 space-y-3 animate-fade-in">
              <h3 className="font-oswald text-sm tracking-widest uppercase text-primary">Новый пользователь</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { label: "Static ID (6 цифр)", key: "static_id", placeholder: "000000", mono: true },
                  { label: "Пароль", key: "password", placeholder: "Придумайте пароль", type: "password" },
                  { label: "Имя / Позывной", key: "name", placeholder: "Фамилия И.О." },
                  { label: "Звание", key: "rank", placeholder: "Рядовой" },
                  { label: "Подразделение", key: "unit", placeholder: "1-й учебный взвод" },
                ].map(({ label, key, placeholder, type, mono }) => (
                  <div key={key}>
                    <label className="rank-badge text-muted-foreground block mb-1">{label}</label>
                    <input
                      type={type || "text"}
                      className={`w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors ${mono ? "font-mono" : "font-ibm"}`}
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      maxLength={key === "static_id" ? 6 : undefined}
                      onChange={(e) => setForm({ ...form, [key]: key === "static_id" ? e.target.value.replace(/\D/g, "") : e.target.value })}
                      required={key !== "unit"}
                    />
                  </div>
                ))}
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">Роль</label>
                  <select className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "cadet" | "instructor" })}>
                    <option value="cadet">Курсант</option>
                    <option value="instructor">Инструктор</option>
                  </select>
                </div>
              </div>
              {formError && <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 px-3 py-2"><Icon name="AlertTriangle" size={13} className="text-red-400" /><p className="text-xs text-red-400">{formError}</p></div>}
              <div className="flex gap-2">
                <button type="submit" disabled={formLoading} className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-6 hover:bg-primary/90 transition-colors disabled:opacity-50">{formLoading ? "Сохранение..." : "Добавить"}</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="border border-tactical-border text-muted-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:border-primary/40 transition-colors">Отмена</button>
              </div>
            </form>
          )}

          {editUser && (
            <form onSubmit={handleEditSave} className="bg-tactical-card border border-yellow-800/50 p-4 space-y-3 animate-fade-in">
              <h3 className="font-oswald text-sm tracking-widest uppercase text-yellow-400">Редактировать: {editUser.name}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { label: "Имя", key: "name" },
                  { label: "Звание", key: "rank" },
                  { label: "Подразделение", key: "unit" },
                  { label: "Новый пароль", key: "password", type: "password", placeholder: "Оставьте пустым, если не менять" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="rank-badge text-muted-foreground block mb-1">{label}</label>
                    <input type={type || "text"} className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary" placeholder={placeholder} value={editForm[key as keyof EditForm]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">Роль</label>
                  <select className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as "cadet" | "instructor" })}>
                    <option value="cadet">Курсант</option>
                    <option value="instructor">Инструктор</option>
                  </select>
                </div>
              </div>
              {editError && <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 px-3 py-2"><Icon name="AlertTriangle" size={13} className="text-red-400" /><p className="text-xs text-red-400">{editError}</p></div>}
              <div className="flex gap-2">
                <button type="submit" disabled={editLoading} className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-6 hover:bg-primary/90 transition-colors disabled:opacity-50">{editLoading ? "Сохранение..." : "Сохранить"}</button>
                <button type="button" onClick={() => setEditUser(null)} className="border border-tactical-border text-muted-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:border-primary/40 transition-colors">Отмена</button>
              </div>
            </form>
          )}

          {wlLoading ? <Spinner /> : (
            <div className="bg-tactical-card border border-tactical-border overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-tactical-border bg-tactical-panel">
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground">Static ID</th>
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground">Имя</th>
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground">Звание</th>
                    <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Роль</th>
                    <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Доступ</th>
                    <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {wlUsers.map((u) => (
                    <tr key={u.id} className="border-b border-tactical-border last:border-0 hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm text-primary">{u.static_id}</td>
                      <td className="px-4 py-3 text-sm font-ibm text-foreground">{u.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{u.rank}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rank-badge px-2 py-0.5 border ${u.role === "instructor" ? "text-yellow-400 border-yellow-800 bg-yellow-900/20" : "text-primary border-primary/30 bg-primary/10"}`}>
                          {u.role === "instructor" ? "Инструктор" : "Курсант"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleWhitelist(u.id, u.is_whitelisted)}
                          className={`rank-badge px-2 py-0.5 border transition-colors ${u.is_whitelisted ? "text-green-400 border-green-800 hover:bg-red-900/20 hover:text-red-400 hover:border-red-800" : "text-red-400 border-red-800 hover:bg-green-900/20 hover:text-green-400 hover:border-green-800"}`}
                        >
                          {u.is_whitelisted ? "Активен" : "Заблокирован"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => openEdit(u)} className="rank-badge text-primary border border-primary/30 px-2 py-0.5 hover:bg-primary/10 transition-colors">
                          <Icon name="Pencil" size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── RATING TAB ── */}
      {activeTab === "rating" && (
        <InstructorRatingView instructorId={authUser.id} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTRUCTOR RATING VIEW (для вкладки инструктора)
// ═══════════════════════════════════════════════════════════════════════════════
function InstructorRatingView({ instructorId }: { instructorId: number }) {
  const [data, setData] = useState<{ instructors: InstructorRating[]; my_ratings: Record<number, { rating: number; comment: string | null }> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const me = data?.instructors.find((i) => i.id === instructorId);

  const renderStars = (rating: number | null) => {
    const val = rating ?? 0;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Icon key={s} name="Star" size={14} className={s <= Math.round(val) ? "text-yellow-400" : "text-muted-foreground/30"} />
        ))}
      </div>
    );
  };

  if (loading) return <Spinner />;
  if (!me) return <Empty text="Данные рейтинга не найдены" />;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="bg-tactical-card border border-primary/30 p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-2">
            <Icon name="Shield" size={28} className="text-primary" />
          </div>
          <p className="font-oswald text-base text-foreground tracking-wide">{me.rank} {me.name}</p>
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-tactical-panel border border-tactical-border p-3 text-center">
            <p className="font-oswald text-3xl text-yellow-400">{me.avg_rating?.toFixed(1) ?? "—"}</p>
            <p className="rank-badge text-muted-foreground mt-1">Средний балл</p>
            {me.avg_rating && <div className="flex justify-center mt-1">{renderStars(me.avg_rating)}</div>}
          </div>
          <div className="bg-tactical-panel border border-tactical-border p-3 text-center">
            <p className="font-oswald text-3xl text-primary">{me.rating_count}</p>
            <p className="rank-badge text-muted-foreground mt-1">Оценок получено</p>
          </div>
          <div className="bg-tactical-panel border border-tactical-border p-3 text-center">
            <p className="font-oswald text-3xl text-green-400">
              #{(data?.instructors.findIndex((i) => i.id === instructorId) ?? 0) + 1}
            </p>
            <p className="rank-badge text-muted-foreground mt-1">Место в рейтинге</p>
          </div>
        </div>
      </div>

      <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground">Рейтинг всех инструкторов</h3>
      <div className="bg-tactical-card border border-tactical-border overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-tactical-border bg-tactical-panel">
              <th className="text-center px-3 py-3 rank-badge text-muted-foreground w-10">#</th>
              <th className="text-left px-4 py-3 rank-badge text-muted-foreground">Инструктор</th>
              <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Рейтинг</th>
              <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Оценок</th>
            </tr>
          </thead>
          <tbody>
            {data?.instructors.map((inst, idx) => (
              <tr key={inst.id} className={`border-b border-tactical-border last:border-0 transition-colors ${inst.id === instructorId ? "bg-primary/10" : "hover:bg-primary/5"}`}>
                <td className="px-3 py-3 text-center font-oswald text-sm text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-ibm text-foreground">{inst.rank} {inst.name}</p>
                  {inst.unit && <p className="text-xs text-muted-foreground font-mono">{inst.unit}</p>}
                </td>
                <td className="px-4 py-3 text-center">
                  {inst.avg_rating ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-oswald text-yellow-400">{inst.avg_rating.toFixed(1)}</span>
                      {renderStars(inst.avg_rating)}
                    </div>
                  ) : <span className="text-muted-foreground text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-center text-sm font-mono text-muted-foreground">{inst.rating_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTRUCTOR RATINGS (для курсантов)
// ═══════════════════════════════════════════════════════════════════════════════
export function InstructorRatings() {
  const [data, setData] = useState<{ instructors: InstructorRating[]; my_ratings: Record<number, { rating: number; comment: string | null }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [success, setSuccess] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const d = await fetchRatings().catch(() => null);
    setData(d);
    if (d) {
      const init: Record<number, number> = {};
      Object.entries(d.my_ratings).forEach(([k, v]) => { init[Number(k)] = v.rating; });
      setSelected(init);
      const initC: Record<number, string> = {};
      Object.entries(d.my_ratings).forEach(([k, v]) => { initC[Number(k)] = v.comment ?? ""; });
      setComments(initC);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRate = async (instructorId: number) => {
    const rating = selected[instructorId];
    if (!rating) return;
    setSubmitting(instructorId);
    await rateInstructor(instructorId, rating, comments[instructorId] || undefined).catch(() => {});
    setSuccess(instructorId);
    setTimeout(() => setSuccess(null), 2000);
    setSubmitting(null);
    await load();
  };

  const renderStars = (instructorId: number, currentRating: number | null) => {
    const val = selected[instructorId] ?? 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setSelected((prev) => ({ ...prev, [instructorId]: s }))}
            className="transition-transform hover:scale-110"
          >
            <Icon name="Star" size={18} className={s <= val ? "text-yellow-400" : "text-muted-foreground/30 hover:text-yellow-400/50"} />
          </button>
        ))}
        {currentRating && (
          <span className="ml-2 text-xs text-muted-foreground font-mono">ср. {currentRating.toFixed(1)}</span>
        )}
      </div>
    );
  };

  if (loading) return <Spinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Оценка инструкторов" sub="Поставь оценку своим инструкторам" />
      {!data || data.instructors.length === 0 ? (
        <Empty text="Инструкторов не найдено" />
      ) : (
        <div className="space-y-3">
          {data.instructors.map((inst) => {
            const myRating = data.my_ratings[inst.id];
            return (
              <div key={inst.id} className="bg-tactical-card border border-tactical-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="Shield" size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-ibm text-sm font-semibold text-foreground">{inst.rank} {inst.name}</p>
                      {inst.unit && <p className="text-xs text-muted-foreground font-mono">{inst.unit}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-oswald text-xl text-yellow-400">{inst.avg_rating?.toFixed(1) ?? "—"}</p>
                    <p className="rank-badge text-muted-foreground">{inst.rating_count} оценок</p>
                  </div>
                </div>
                <div className="border-t border-tactical-border pt-3 space-y-2">
                  <p className="rank-badge text-muted-foreground">{myRating ? "Ваша оценка:" : "Оценить:"}</p>
                  {renderStars(inst.id, inst.avg_rating)}
                  <input
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-1.5 text-xs text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                    placeholder="Комментарий (необязательно)..."
                    value={comments[inst.id] ?? ""}
                    onChange={(e) => setComments((prev) => ({ ...prev, [inst.id]: e.target.value }))}
                  />
                  <button
                    disabled={!selected[inst.id] || submitting === inst.id}
                    onClick={() => handleRate(inst.id)}
                    className="bg-primary text-primary-foreground font-oswald text-xs tracking-widest uppercase py-1.5 px-4 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {submitting === inst.id ? <Icon name="Loader2" size={12} className="animate-spin" /> : <Icon name="Send" size={12} />}
                    {myRating ? "Обновить оценку" : "Отправить оценку"}
                  </button>
                  {success === inst.id && (
                    <p className="text-xs text-green-400 font-mono flex items-center gap-1">
                      <Icon name="Check" size={12} />Оценка сохранена
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}