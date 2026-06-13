import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { SectionHeader, StatCard, StatusBadge, GradeCircle } from "./UIComponents";
import { User, fetchRequests, reviewRequest, fetchGrades, createGrade, TrainingRequest, Grade } from "@/lib/api";
import { TYPE_LABEL, fmt, Spinner, Empty } from "./SectionsShared";
import { InstructorRatingView } from "./SectionsRatings";

type EditForm = { name: string; rank: string; unit: string; role: "cadet" | "instructor"; password: string };

// ═══════════════════════════════════════════════════════════════════════════════
// INSTRUCTOR PANEL
// ═══════════════════════════════════════════════════════════════════════════════
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