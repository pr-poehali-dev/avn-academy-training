import { useState } from "react";
import Icon from "@/components/ui/icon";

type Section =
  | "dashboard"
  | "materials"
  | "lectures"
  | "practices"
  | "exams"
  | "reports"
  | "grades"
  | "profile"
  | "instructor";

type UserRole = "cadet" | "instructor";

const NAV_ITEMS: { id: Section; label: string; icon: string; roles: UserRole[] }[] = [
  { id: "dashboard", label: "Главная", icon: "LayoutDashboard", roles: ["cadet", "instructor"] },
  { id: "materials", label: "Обучающие материалы", icon: "BookOpen", roles: ["cadet", "instructor"] },
  { id: "lectures", label: "Лекции", icon: "GraduationCap", roles: ["cadet", "instructor"] },
  { id: "practices", label: "Практики", icon: "Wrench", roles: ["cadet", "instructor"] },
  { id: "exams", label: "Экзамены", icon: "ClipboardList", roles: ["cadet", "instructor"] },
  { id: "reports", label: "Рапорты", icon: "FileText", roles: ["cadet", "instructor"] },
  { id: "grades", label: "Система оценок", icon: "BarChart3", roles: ["cadet", "instructor"] },
  { id: "profile", label: "Профиль курсанта", icon: "User", roles: ["cadet"] },
  { id: "instructor", label: "Панель инструктора", icon: "Shield", roles: ["instructor"] },
];

const MOCK_CADET = {
  name: "Курсант Алексеев А.В.",
  rank: "Рядовой",
  unit: "1-й учебный взвод",
  id: "КУР-2024-0147",
  grade_avg: 4.3,
  completed: 12,
  total: 20,
};

const MOCK_LECTURES = [
  { id: 1, title: "Тактика боя в городских условиях", instructor: "Кап. Воронов В.И.", date: "15.06.2024", status: "approved" },
  { id: 2, title: "Основы радиосвязи", instructor: "Ст. лейт. Панов Д.С.", date: "18.06.2024", status: "pending" },
  { id: 3, title: "Военная топография", instructor: "Майор Сидоров К.А.", date: "20.06.2024", status: "approved" },
];

const MOCK_REPORTS = [
  { id: 1, title: "Рапорт на повышение в звании", date: "01.06.2024", status: "pending" },
  { id: 2, title: "Рапорт о прохождении практики", date: "28.05.2024", status: "approved" },
  { id: 3, title: "Запрос на дополнительное обучение", date: "20.05.2024", status: "rejected" },
];

const MOCK_GRADES = [
  { subject: "Тактическая подготовка", grade: 5, date: "10.06.2024", instructor: "Кап. Воронов" },
  { subject: "Физическая подготовка", grade: 4, date: "08.06.2024", instructor: "Ст. лейт. Панов" },
  { subject: "Огневая подготовка", grade: 5, date: "05.06.2024", instructor: "Майор Сидоров" },
  { subject: "Военная история", grade: 4, date: "03.06.2024", instructor: "Подп. Ковалёв" },
  { subject: "Медицинская подготовка", grade: 3, date: "01.06.2024", instructor: "Кап. Зимина" },
];

const MOCK_INSTRUCTOR_REQUESTS = [
  { id: 1, cadet: "Алексеев А.В.", type: "Лекция", subject: "Тактика", date: "14.06.2024", status: "pending" },
  { id: 2, cadet: "Борисов К.Н.", type: "Рапорт", subject: "Повышение", date: "13.06.2024", status: "pending" },
  { id: 3, cadet: "Васильев Д.О.", type: "Экзамен", subject: "Огневая подготовка", date: "12.06.2024", status: "approved" },
  { id: 4, cadet: "Григорьев П.М.", type: "Практика", subject: "Топография", date: "11.06.2024", status: "rejected" },
];

const MOCK_MATERIALS = [
  { id: 1, title: "Устав Вооружённых Сил", category: "Нормативные документы", pages: 214, icon: "BookMarked" },
  { id: 2, title: "Тактика общевойскового боя", category: "Тактическая подготовка", pages: 180, icon: "Crosshair" },
  { id: 3, title: "Наставление по физической подготовке", category: "Физподготовка", pages: 96, icon: "Activity" },
  { id: 4, title: "Руководство по стрелковому оружию", category: "Огневая подготовка", pages: 156, icon: "Target" },
  { id: 5, title: "Военная топография и навигация", category: "Ориентирование", pages: 120, icon: "Map" },
  { id: 6, title: "Медицинская помощь в полевых условиях", category: "Медподготовка", pages: 88, icon: "Heart" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    approved: { label: "Одобрено", cls: "text-green-400 bg-green-900/30 border-green-800" },
    pending: { label: "На рассмотрении", cls: "text-yellow-400 bg-yellow-900/30 border-yellow-800" },
    rejected: { label: "Отклонено", cls: "text-red-400 bg-red-900/30 border-red-800" },
  };
  const s = map[status] ?? { label: status, cls: "text-gray-400 bg-gray-900/30 border-gray-700" };
  return (
    <span className={`rank-badge px-2 py-0.5 border rounded ${s.cls}`}>{s.label}</span>
  );
}

function GradeCircle({ grade }: { grade: number }) {
  const color = grade >= 5 ? "text-green-400" : grade >= 4 ? "text-yellow-400" : grade >= 3 ? "text-orange-400" : "text-red-400";
  return (
    <div className={`w-10 h-10 border flex items-center justify-center font-oswald text-xl font-bold border-current ${color}`}>
      {grade}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6 pb-3 border-b border-tactical-border">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-primary" />
        <div>
          <h2 className="font-oswald text-2xl font-semibold tracking-widest text-foreground uppercase">{title}</h2>
          {sub && <p className="text-muted-foreground text-sm font-ibm mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: string; accent?: string }) {
  return (
    <div className="corner-mark bg-tactical-card border border-tactical-border p-4 card-glow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-ibm uppercase tracking-widest mb-1">{label}</p>
          <p className={`font-oswald text-3xl font-bold ${accent ?? "text-foreground"}`}>{value}</p>
        </div>
        <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon name={icon} size={18} className="text-primary" />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Учебный дашборд" sub={`Добро пожаловать, ${MOCK_CADET.name}`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Средний балл" value={MOCK_CADET.grade_avg} icon="Star" accent="text-gold" />
        <StatCard label="Пройдено тем" value={`${MOCK_CADET.completed}/${MOCK_CADET.total}`} icon="CheckSquare" accent="text-green-400" />
        <StatCard label="Активных рапортов" value={2} icon="FileText" accent="text-yellow-400" />
        <StatCard label="До экзамена" value="5 дн." icon="Clock" accent="text-primary" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Личные данные</h3>
          <div className="space-y-2">
            {[
              { label: "Звание", value: MOCK_CADET.rank },
              { label: "Подразделение", value: MOCK_CADET.unit },
              { label: "Личный номер", value: MOCK_CADET.id },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-tactical-border last:border-0">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-mono">{item.label}</span>
                <span className="text-foreground text-sm font-ibm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Последние уведомления</h3>
          <div className="space-y-2">
            {[
              { text: "Запрос на лекцию одобрен", time: "2 ч. назад", type: "approved" },
              { text: "Рапорт на повышение на рассмотрении", time: "1 день назад", type: "pending" },
              { text: "Результат экзамена: Огневая подготовка — 5", time: "3 дня назад", type: "approved" },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-3 py-1.5 border-b border-tactical-border last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${n.type === "approved" ? "bg-green-400" : "bg-yellow-400"}`} />
                <div>
                  <p className="text-sm text-foreground">{n.text}</p>
                  <p className="text-xs text-muted-foreground font-mono">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-tactical-card border border-tactical-border p-4">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Прогресс обучения</h3>
        <div className="space-y-3">
          {[
            { label: "Тактическая подготовка", pct: 75 },
            { label: "Огневая подготовка", pct: 60 },
            { label: "Физическая подготовка", pct: 90 },
            { label: "Военная история", pct: 45 },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
                <span className="text-xs text-primary font-mono">{item.pct}%</span>
              </div>
              <div className="h-1.5 bg-tactical-border overflow-hidden">
                <div className="h-full bg-primary transition-all duration-700" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Materials() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Обучающие материалы" sub="Учебная библиотека академии АВНГ" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_MATERIALS.map((m) => (
          <div key={m.id} className="corner-mark bg-tactical-card border border-tactical-border p-4 card-glow hover:border-primary/40 transition-colors cursor-pointer group">
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
              <span className="rank-badge text-muted-foreground">{m.pages} стр.</span>
              <button className="rank-badge text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                <Icon name="Download" size={12} />
                Скачать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Lectures() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Лекции" sub="Запросы на посещение и расписание лекций" />
      <div className="bg-tactical-card border border-tactical-border p-4">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-4">Подать запрос на лекцию</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="rank-badge text-muted-foreground block mb-1">Тема лекции</label>
            <input className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors" placeholder="Укажите тему..." />
          </div>
          <div>
            <label className="rank-badge text-muted-foreground block mb-1">Дата</label>
            <input type="date" className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:bg-primary/90 transition-colors">
              Подать запрос
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Мои запросы</h3>
        {MOCK_LECTURES.map((l) => (
          <div key={l.id} className="bg-tactical-card border border-tactical-border p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon name="GraduationCap" size={14} className="text-primary" />
              </div>
              <div>
                <h4 className="font-ibm text-sm font-medium text-foreground">{l.title}</h4>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{l.instructor} · {l.date}</p>
              </div>
            </div>
            <StatusBadge status={l.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Practices() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Практики" sub="Запросы на прохождение практических занятий" />
      <div className="bg-tactical-card border border-tactical-border p-4">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-4">Новый запрос на практику</h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="rank-badge text-muted-foreground block mb-1">Вид практики</label>
            <select className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors">
              <option>Тактические учения</option>
              <option>Огневая подготовка</option>
              <option>Физическая подготовка</option>
              <option>Топография</option>
              <option>Медицинская подготовка</option>
            </select>
          </div>
          <div>
            <label className="rank-badge text-muted-foreground block mb-1">Предпочтительная дата</label>
            <input type="date" className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors" />
          </div>
        </div>
        <div className="mb-3">
          <label className="rank-badge text-muted-foreground block mb-1">Цель практики</label>
          <textarea className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors resize-none" rows={2} placeholder="Опишите цель и ожидаемый результат..." />
        </div>
        <button className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-6 hover:bg-primary/90 transition-colors">
          Отправить запрос
        </button>
      </div>
      <div className="space-y-2">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Расписание практик</h3>
        {[
          { title: "Тактические учения — полевые условия", date: "22.06.2024", time: "09:00–13:00", location: "Полигон №3", status: "approved" },
          { title: "Огневая подготовка — стрельбище", date: "25.06.2024", time: "14:00–17:00", location: "Тир №1", status: "pending" },
          { title: "Ориентирование на местности", date: "28.06.2024", time: "08:00–12:00", location: "Учебный лес", status: "pending" },
        ].map((p, i) => (
          <div key={i} className="bg-tactical-card border border-tactical-border p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon name="Wrench" size={14} className="text-primary" />
              </div>
              <div>
                <h4 className="font-ibm text-sm font-medium text-foreground">{p.title}</h4>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.date} · {p.time} · {p.location}</p>
              </div>
            </div>
            <StatusBadge status={p.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Exams() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Экзамены" sub="Запись на экзаменационные испытания" />
      <div className="grid md:grid-cols-3 gap-3">
        <StatCard label="Предстоящих" value={3} icon="Calendar" accent="text-yellow-400" />
        <StatCard label="Сдано" value={8} icon="CheckCircle" accent="text-green-400" />
        <StatCard label="Средний балл" value={4.4} icon="Award" accent="text-gold" />
      </div>
      <div className="space-y-3">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground">Расписание экзаменов</h3>
        {[
          { subject: "Тактическая подготовка", date: "15.06.2024", time: "10:00", room: "Каб. 201", instructor: "Кап. Воронов", status: "pending" },
          { subject: "Военная история", date: "20.06.2024", time: "09:00", room: "Каб. 105", instructor: "Подп. Ковалёв", status: "pending" },
          { subject: "Огневая подготовка", date: "25.06.2024", time: "14:00", room: "Тир №2", instructor: "Майор Сидоров", status: "pending" },
        ].map((e, i) => (
          <div key={i} className="corner-mark bg-tactical-card border border-tactical-border p-4 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="ClipboardList" size={16} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-oswald text-base font-medium text-foreground tracking-wide">{e.subject}</h4>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground font-mono">{e.date} · {e.time}</span>
                    <span className="text-xs text-muted-foreground font-mono">{e.room}</span>
                    <span className="text-xs text-muted-foreground font-mono">{e.instructor}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <StatusBadge status={e.status} />
                <button className="rank-badge text-primary border border-primary/30 px-2 py-0.5 hover:bg-primary/10 transition-colors">
                  Записаться
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-tactical-card border border-tactical-border p-4">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Пройденные экзамены</h3>
        <div className="space-y-2">
          {[
            { subject: "Физическая подготовка", date: "01.06.2024", grade: 5 },
            { subject: "Медицинская помощь", date: "25.05.2024", grade: 4 },
            { subject: "Радиосвязь", date: "15.05.2024", grade: 4 },
          ].map((e, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-tactical-border last:border-0">
              <div>
                <p className="text-sm text-foreground font-ibm">{e.subject}</p>
                <p className="text-xs text-muted-foreground font-mono">{e.date}</p>
              </div>
              <GradeCircle grade={e.grade} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Reports() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Рапорты" sub="Подача служебных рапортов и заявлений" />
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Icon name="Plus" size={14} />
          Новый рапорт
        </button>
      </div>
      {showForm && (
        <div className="bg-tactical-card border border-primary/40 p-4 animate-fade-in">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-primary mb-4">Подача рапорта</h3>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="rank-badge text-muted-foreground block mb-1">Тип рапорта</label>
              <select className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary">
                <option>Рапорт на повышение в звании</option>
                <option>Запрос дополнительного обучения</option>
                <option>Рапорт о происшествии</option>
                <option>Заявление на отпуск</option>
                <option>Прочее</option>
              </select>
            </div>
            <div>
              <label className="rank-badge text-muted-foreground block mb-1">Адресат</label>
              <input className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary" placeholder="Кому адресован рапорт..." />
            </div>
          </div>
          <div className="mb-3">
            <label className="rank-badge text-muted-foreground block mb-1">Содержание рапорта</label>
            <textarea className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary resize-none" rows={4} placeholder="Изложите суть рапорта..." />
          </div>
          <div className="flex gap-2">
            <button className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-6 hover:bg-primary/90 transition-colors">
              Подать рапорт
            </button>
            <button onClick={() => setShowForm(false)} className="border border-tactical-border text-muted-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:border-primary/40 transition-colors">
              Отмена
            </button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {MOCK_REPORTS.map((r) => (
          <div key={r.id} className="bg-tactical-card border border-tactical-border p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon name="FileText" size={14} className="text-primary" />
              </div>
              <div>
                <h4 className="font-ibm text-sm font-medium text-foreground">{r.title}</h4>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">Подан: {r.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={r.status} />
              <button className="rank-badge text-muted-foreground border border-tactical-border px-2 py-0.5 hover:text-foreground transition-colors">
                <Icon name="Eye" size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Grades() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Система оценок" sub="Успеваемость и академические показатели" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Средний балл" value={4.3} icon="Star" accent="text-gold" />
        <StatCard label="Отличных оценок" value={3} icon="Award" accent="text-green-400" />
        <StatCard label="Хороших оценок" value={2} icon="ThumbsUp" accent="text-yellow-400" />
        <StatCard label="Удовлетворит." value={1} icon="Minus" accent="text-orange-400" />
      </div>
      <div className="bg-tactical-card border border-tactical-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-tactical-border bg-tactical-panel">
              <th className="text-left px-4 py-3 rank-badge text-muted-foreground">Дисциплина</th>
              <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">Инструктор</th>
              <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">Дата</th>
              <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Оценка</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_GRADES.map((g, i) => (
              <tr key={i} className="border-b border-tactical-border last:border-0 hover:bg-primary/5 transition-colors">
                <td className="px-4 py-3 text-sm font-ibm text-foreground">{g.subject}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">{g.instructor}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">{g.date}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <GradeCircle grade={g.grade} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-tactical-card border border-tactical-border p-4">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-4">Динамика успеваемости</h3>
        <div className="flex items-end gap-2 h-24">
          {[3, 4, 4, 5, 4, 5, 5, 4, 5].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-mono text-muted-foreground">{v}</span>
              <div className="w-full bg-primary/60 hover:bg-primary transition-colors" style={{ height: `${(v / 5) * 64}px` }} />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-mono mt-2 text-center">Последние 9 оценок</p>
      </div>
    </div>
  );
}

function Profile() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Профиль курсанта" sub="Личные данные и служебная документация" />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="corner-mark bg-tactical-card border border-tactical-border p-6 card-glow flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
            <Icon name="User" size={36} className="text-primary" />
          </div>
          <h3 className="font-oswald text-lg tracking-wide text-foreground">{MOCK_CADET.name}</h3>
          <p className="text-gold font-mono text-sm mt-1">{MOCK_CADET.rank}</p>
          <div className="mt-3 px-3 py-1 bg-primary/10 border border-primary/20">
            <span className="rank-badge text-primary">{MOCK_CADET.id}</span>
          </div>
        </div>
        <div className="md:col-span-2 bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-4">Служебные данные</h3>
          <div className="space-y-3">
            {[
              { label: "Полное имя", value: "Алексеев Андрей Викторович" },
              { label: "Звание", value: "Рядовой" },
              { label: "Подразделение", value: "1-й учебный взвод, Рота А" },
              { label: "Личный номер", value: "КУР-2024-0147" },
              { label: "Дата зачисления", value: "01.09.2024" },
              { label: "Куратор", value: "Кап. Воронов В.И." },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-tactical-border last:border-0">
                <span className="rank-badge text-muted-foreground">{item.label}</span>
                <span className="text-sm font-ibm text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Награды и поощрения</h3>
          <div className="space-y-2">
            {[
              { title: "Лучший курсант месяца", date: "Май 2024" },
              { title: "Грамота за отличную стрельбу", date: "Апр 2024" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-tactical-border last:border-0">
                <Icon name="Award" size={14} className="text-gold flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-ibm">{a.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">Документы</h3>
          <div className="space-y-2">
            {[
              { title: "Личное дело", icon: "FolderOpen" },
              { title: "Зачётная книжка", icon: "BookOpen" },
              { title: "Медицинская книжка", icon: "FileHeart" },
            ].map((d, i) => (
              <button key={i} className="w-full flex items-center gap-3 py-2 border-b border-tactical-border last:border-0 hover:text-primary transition-colors group text-left">
                <Icon name={d.icon} fallback="File" size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-ibm">{d.title}</span>
                <Icon name="ChevronRight" size={12} className="ml-auto text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InstructorPanel() {
  const [activeTab, setActiveTab] = useState<"requests" | "cadets" | "schedule">("requests");
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Панель инструктора" sub="Управление курсантами, запросами и расписанием" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Новых запросов" value={4} icon="Bell" accent="text-yellow-400" />
        <StatCard label="Курсантов" value={28} icon="Users" accent="text-primary" />
        <StatCard label="Занятий сегодня" value={3} icon="Calendar" accent="text-green-400" />
        <StatCard label="Рапортов на рассм." value={2} icon="FileText" accent="text-gold" />
      </div>
      <div className="flex gap-1 border-b border-tactical-border">
        {([
          { id: "requests", label: "Запросы" },
          { id: "cadets", label: "Курсанты" },
          { id: "schedule", label: "Расписание" },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-oswald text-sm tracking-widest uppercase px-4 py-2 transition-colors border-b-2 ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "requests" && (
        <div className="space-y-2 animate-fade-in">
          {MOCK_INSTRUCTOR_REQUESTS.map((r) => (
            <div key={r.id} className="bg-tactical-card border border-tactical-border p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon name="User" size={14} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-ibm text-sm font-medium text-foreground">{r.cadet}</h4>
                    <span className="rank-badge text-muted-foreground bg-tactical-panel px-1.5 py-0.5">{r.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{r.subject} · {r.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <StatusBadge status={r.status} />
                {r.status === "pending" && (
                  <>
                    <button className="rank-badge text-green-400 border border-green-800 px-2 py-0.5 hover:bg-green-900/30 transition-colors">
                      Одобрить
                    </button>
                    <button className="rank-badge text-red-400 border border-red-800 px-2 py-0.5 hover:bg-red-900/30 transition-colors">
                      Отклонить
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === "cadets" && (
        <div className="bg-tactical-card border border-tactical-border overflow-hidden animate-fade-in">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tactical-border bg-tactical-panel">
                <th className="text-left px-4 py-3 rank-badge text-muted-foreground">Курсант</th>
                <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">Подразделение</th>
                <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Ср. балл</th>
                <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Статус</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Алексеев А.В.", unit: "1-й взвод", avg: 4.3, status: "active" },
                { name: "Борисов К.Н.", unit: "1-й взвод", avg: 3.8, status: "active" },
                { name: "Васильев Д.О.", unit: "2-й взвод", avg: 4.7, status: "active" },
                { name: "Григорьев П.М.", unit: "2-й взвод", avg: 3.5, status: "probation" },
                { name: "Данилов С.В.", unit: "3-й взвод", avg: 4.1, status: "active" },
              ].map((c, i) => (
                <tr key={i} className="border-b border-tactical-border last:border-0 hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3 text-sm font-ibm text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">{c.unit}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-oswald text-base font-bold ${c.avg >= 4.5 ? "text-green-400" : c.avg >= 4.0 ? "text-yellow-400" : "text-orange-400"}`}>{c.avg}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rank-badge px-2 py-0.5 border rounded ${c.status === "active" ? "text-green-400 border-green-800 bg-green-900/20" : "text-orange-400 border-orange-800 bg-orange-900/20"}`}>
                      {c.status === "active" ? "Активен" : "Наблюдение"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === "schedule" && (
        <div className="space-y-2 animate-fade-in">
          {[
            { time: "09:00–11:00", subject: "Тактическая подготовка", group: "1-й взвод", room: "Поле №1" },
            { time: "12:00–14:00", subject: "Огневая подготовка", group: "2-й взвод", room: "Тир №1" },
            { time: "15:00–17:00", subject: "Военная история", group: "3-й взвод", room: "Каб. 105" },
          ].map((s, i) => (
            <div key={i} className="bg-tactical-card border border-tactical-border p-4 flex items-center gap-4">
              <div className="w-28 text-center flex-shrink-0">
                <span className="font-mono text-sm text-primary">{s.time}</span>
              </div>
              <div className="w-px h-10 bg-tactical-border flex-shrink-0" />
              <div>
                <h4 className="font-oswald text-base text-foreground">{s.subject}</h4>
                <p className="text-xs text-muted-foreground font-mono">{s.group} · {s.room}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Index() {
  const [section, setSection] = useState<Section>("dashboard");
  const [role, setRole] = useState<UserRole>("cadet");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter((n) => n.roles.includes(role));

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <Dashboard />;
      case "materials": return <Materials />;
      case "lectures": return <Lectures />;
      case "practices": return <Practices />;
      case "exams": return <Exams />;
      case "reports": return <Reports />;
      case "grades": return <Grades />;
      case "profile": return <Profile />;
      case "instructor": return <InstructorPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-tactical-border bg-tactical-panel flex-shrink-0 z-20 relative">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Icon name="Menu" size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Icon name="Shield" size={14} className="text-primary" />
              </div>
              <div>
                <h1 className="font-oswald text-base font-semibold tracking-widest uppercase text-foreground leading-none">
                  АКАДЕМИЯ АВНГ
                </h1>
                <p className="text-[9px] font-mono text-muted-foreground tracking-[0.15em] uppercase leading-none mt-0.5">
                  Учебный портал · v1.0
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 border border-tactical-border bg-tactical-card px-1 py-1">
              {(["cadet", "instructor"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setSection(r === "instructor" ? "instructor" : "dashboard"); }}
                  className={`rank-badge px-3 py-1 transition-colors ${role === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {r === "cadet" ? "Курсант" : "Инструктор"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 border border-tactical-border bg-tactical-card px-3 py-1.5">
              <div className="w-5 h-5 bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Icon name="User" size={10} className="text-primary" />
              </div>
              <span className="rank-badge text-foreground hidden md:block">
                {role === "cadet" ? "Алексеев А.В." : "Кап. Воронов В.И."}
              </span>
            </div>
            <button className="text-muted-foreground hover:text-yellow-400 transition-colors relative">
              <Icon name="Bell" size={16} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 text-[7px] font-bold text-black flex items-center justify-center rounded-full">3</span>
            </button>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-30 md:z-auto
          w-56 bg-tactical-panel border-r border-tactical-border flex-shrink-0
          transform transition-transform duration-300 md:translate-x-0
          top-14 md:top-auto bottom-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <nav className="p-2 space-y-0.5 pt-4">
            {visibleNav.map((item) => (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors group
                  ${section === item.id
                    ? "nav-item-active text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                  }`}
              >
                <Icon
                  name={item.icon}
                  size={15}
                  className={section === item.id ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"}
                />
                <span className="font-ibm text-sm leading-tight">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="absolute bottom-4 left-0 right-0 px-3">
            <div className="border border-tactical-border bg-tactical-card p-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="rank-badge text-green-400">Система активна</span>
              </div>
              <p className="rank-badge text-muted-foreground">11.06.2026 · База А-7</p>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-20 md:hidden top-14" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}