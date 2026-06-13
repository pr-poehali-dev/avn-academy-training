import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { StatusBadge, GradeCircle, SectionHeader, StatCard } from "./UIComponents";
import { User, fetchRequests, fetchGrades, TrainingRequest, Grade } from "@/lib/api";
import { MOCK_MATERIALS } from "./types";
import { TYPE_LABEL, fmt, avg, Spinner, Empty, RequestSection } from "./SectionsShared";

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const QUICK_ACTIONS = [
  { label: "Подать на лекцию", icon: "BookOpen", section: "lectures" as import("./types").Section, color: "text-blue-400", bg: "bg-blue-900/20 border-blue-800/40" },
  { label: "Записаться на практику", icon: "Dumbbell", section: "practices" as import("./types").Section, color: "text-green-400", bg: "bg-green-900/20 border-green-800/40" },
  { label: "Экзамен", icon: "GraduationCap", section: "exams" as import("./types").Section, color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-800/40" },
  { label: "Рапорт", icon: "FileSignature", section: "reports" as import("./types").Section, color: "text-purple-400", bg: "bg-purple-900/20 border-purple-800/40" },
];

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function Dashboard({ authUser, onNavigate }: { authUser: User; onNavigate?: (s: import("./types").Section, id?: number) => void }) {
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    fetchRequests().then(setRequests).catch(() => {});
    fetchGrades().then(setGrades).catch(() => {});
  }, []);

  const myGrades = grades.filter((g) => g.cadet_id === authUser.id);
  const avgGrade = myGrades.length
    ? (myGrades.reduce((s, g) => s + g.grade, 0) / myGrades.length)
    : null;
  const avgGradeStr = avgGrade !== null ? avgGrade.toFixed(1) : "—";
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const recent = requests.slice(0, 4);

  const gradeDistribution = [5, 4, 3, 2].map((g) => ({
    grade: g,
    count: myGrades.filter((x) => x.grade === g).length,
  }));
  const maxCount = Math.max(...gradeDistribution.map((d) => d.count), 1);

  const activityByDay = DAYS.map((day, i) => {
    const count = requests.filter((r) => {
      const d = new Date(r.created_at).getDay();
      const adjusted = d === 0 ? 6 : d - 1;
      return adjusted === i;
    }).length;
    return { day, count };
  });
  const maxActivity = Math.max(...activityByDay.map((d) => d.count), 1);

  const gradeColor = (g: number) =>
    g >= 4.5 ? "text-green-400" : g >= 3.5 ? "text-yellow-400" : "text-red-400";

  const today = new Date();
  const greetingHour = today.getHours();
  const greeting = greetingHour < 12 ? "Доброе утро" : greetingHour < 18 ? "Добрый день" : "Добрый вечер";

  return (
    <div className="animate-fade-in space-y-5">
      {/* HEADER */}
      <div className="flex items-start justify-between border-b border-tactical-border pb-4">
        <div>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest mb-1">{greeting}</p>
          <h2 className="font-oswald text-3xl font-bold text-foreground tracking-widest uppercase">{authUser.name}</h2>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="rank-badge text-primary border border-primary/40 bg-primary/10 px-2 py-0.5">{authUser.rank || "—"}</span>
            <span className="text-muted-foreground text-xs font-mono">{authUser.unit} · ID {authUser.static_id}</span>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Icon name="Calendar" size={12} />
            {today.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-mono uppercase tracking-wider">Система активна</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Средний балл" value={avgGradeStr} icon="Star" accent={avgGrade ? gradeColor(avgGrade) : "text-muted-foreground"} />
        <StatCard label="Всего оценок" value={myGrades.length} icon="CheckSquare" accent="text-green-400" />
        <StatCard label="На рассмотрении" value={pendingCount} icon="Clock" accent="text-yellow-400" />
        <StatCard label="Одобрено" value={approvedCount} icon="ShieldCheck" accent="text-primary" />
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h3 className="font-oswald text-xs tracking-widest uppercase text-muted-foreground mb-2">Быстрые действия</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => onNavigate?.(a.section)}
              className={`flex items-center gap-2.5 p-3 border rounded hover:scale-[1.02] transition-transform text-left ${a.bg}`}
            >
              <Icon name={a.icon} size={16} className={a.color} />
              <span className={`text-xs font-ibm ${a.color}`}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* RECENT REQUESTS */}
        <div className="md:col-span-2 bg-tactical-card border border-tactical-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground">Последние запросы</h3>
            <button onClick={() => onNavigate?.("practices")} className="text-xs text-primary font-mono hover:underline">все →</button>
          </div>
          {recent.length === 0 ? (
            <Empty text="Нет запросов" />
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-tactical-border last:border-0">
                  <div className={`w-8 h-8 flex items-center justify-center border ${
                    r.type === "lecture" ? "border-blue-800 bg-blue-900/20" :
                    r.type === "practice" ? "border-green-800 bg-green-900/20" :
                    r.type === "exam" ? "border-yellow-800 bg-yellow-900/20" :
                    "border-purple-800 bg-purple-900/20"
                  }`}>
                    <Icon name={
                      r.type === "lecture" ? "BookOpen" :
                      r.type === "practice" ? "Dumbbell" :
                      r.type === "exam" ? "GraduationCap" : "FileSignature"
                    } size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{r.subject}</p>
                    <p className="text-xs text-muted-foreground font-mono">{TYPE_LABEL[r.type]} · {fmt(r.created_at)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GRADE DISTRIBUTION */}
        <div className="bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Оценки</h3>
          {myGrades.length === 0 ? (
            <Empty text="Нет оценок" />
          ) : (
            <div className="space-y-2.5">
              {gradeDistribution.map(({ grade, count }) => (
                <div key={grade} className="flex items-center gap-2">
                  <span className={`font-oswald text-lg w-4 text-center font-bold ${
                    grade === 5 ? "text-green-400" : grade === 4 ? "text-yellow-400" : grade === 3 ? "text-orange-400" : "text-red-400"
                  }`}>{grade}</span>
                  <div className="flex-1 bg-tactical-border h-2 rounded-sm overflow-hidden">
                    <div
                      className={`h-full rounded-sm transition-all duration-500 ${
                        grade === 5 ? "bg-green-500" : grade === 4 ? "bg-yellow-500" : grade === 3 ? "bg-orange-500" : "bg-red-500"
                      }`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono w-4 text-right">{count}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-tactical-border mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Средний</span>
                  <span className={`font-oswald text-xl font-bold ${avgGrade ? gradeColor(avgGrade) : ""}`}>{avgGradeStr}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVITY */}
      <div className="bg-tactical-card border border-tactical-border p-4">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Активность по дням недели</h3>
        <div className="flex items-end gap-2 h-16">
          {activityByDay.map(({ day, count }) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: "40px" }}>
                <div
                  className="w-full bg-primary/60 hover:bg-primary transition-colors rounded-sm"
                  style={{ height: `${Math.max((count / maxActivity) * 40, count > 0 ? 4 : 2)}px` }}
                  title={`${count} запросов`}
                />
              </div>
              <span className="text-xs text-muted-foreground font-mono">{day}</span>
            </div>
          ))}
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