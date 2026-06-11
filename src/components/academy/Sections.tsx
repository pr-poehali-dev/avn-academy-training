import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  StatusBadge,
  GradeCircle,
  SectionHeader,
  StatCard,
} from "./UIComponents";
import { User } from "@/lib/api";
import {
  MOCK_LECTURES,
  MOCK_REPORTS,
  MOCK_GRADES,
  MOCK_INSTRUCTOR_REQUESTS,
  MOCK_MATERIALS,
} from "./types";

export function Dashboard({ authUser }: { authUser: User }) {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        title="Академия Войск Национальной Гвардии"
        sub={`Добро пожаловать, ${authUser.name}`}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Средний балл"
          value={4.3}
          icon="Star"
          accent="text-gold"
        />
        <StatCard
          label="Пройдено тем"
          value="12/20"
          icon="CheckSquare"
          accent="text-green-400"
        />
        <StatCard
          label="Активных рапортов"
          value={2}
          icon="FileText"
          accent="text-yellow-400"
        />
        <StatCard
          label="До экзамена"
          value="5 дн."
          icon="Clock"
          accent="text-primary"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">
            Личные данные
          </h3>
          <div className="space-y-2">
            {[
              { label: "Звание", value: authUser.rank || "—" },
              { label: "Подразделение", value: authUser.unit || "—" },
              { label: "Static ID", value: authUser.static_id },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-1.5 border-b border-tactical-border last:border-0"
              >
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-mono">
                  {item.label}
                </span>
                <span className="text-foreground text-sm font-ibm">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">
            Последние уведомления
          </h3>
          <div className="space-y-2">
            {[
              {
                text: "Запрос на лекцию одобрен",
                time: "2 ч. назад",
                type: "approved",
              },
              {
                text: "Рапорт на повышение на рассмотрении",
                time: "1 день назад",
                type: "pending",
              },
              {
                text: "Результат экзамена: Огневая подготовка — 5",
                time: "3 дня назад",
                type: "approved",
              },
            ].map((n, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-1.5 border-b border-tactical-border last:border-0"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${n.type === "approved" ? "bg-green-400" : "bg-yellow-400"}`}
                />
                <div>
                  <p className="text-sm text-foreground">{n.text}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {n.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-tactical-card border border-tactical-border p-4">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">
          Прогресс обучения
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "Отработка Штраф Задержание Арестна инструкторе.",
              pct: 75,
            },
            { label: "Огневая подготовка", pct: 60 },
            { label: "Физическая подготовка", pct: 90 },
            { label: "Военная история", pct: 45 },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-xs text-primary font-mono">
                  {item.pct}%
                </span>
              </div>
              <div className="h-1.5 bg-tactical-border overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Materials() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        title="Обучающие материалы"
        sub="Учебная библиотека академии АВНГ"
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_MATERIALS.map((m) => (
          <div
            key={m.id}
            className="corner-mark bg-tactical-card border border-tactical-border p-4 card-glow hover:border-primary/40 transition-colors group"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Icon
                  name={m.icon}
                  fallback="BookOpen"
                  size={18}
                  className="text-primary"
                />
              </div>
              <div>
                <h4 className="font-oswald text-base font-medium text-foreground leading-tight">
                  {m.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {m.category}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-tactical-border pt-3">
              <span className="rank-badge text-muted-foreground">
                {m.pages ? `${m.pages} стр.` : "Презентация"}
              </span>
              {m.url ? (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rank-badge text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  <Icon name="ExternalLink" size={12} />
                  Открыть
                </a>
              ) : (
                <button className="rank-badge text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                  <Icon name="Download" size={12} />
                  Скачать
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Lectures() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Лекции" sub="Запросы на прохождение лекций " />
      <div className="bg-tactical-card border border-tactical-border p-4">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-4">
          Новый запрос на лекцию
        </h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="rank-badge text-muted-foreground block mb-1">
              Вид лекции
            </label>
            <select className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors">
              <option>Прослушать вступительную лекцию.</option>
              <option>Прослушать лекцию по ФЗ о ФСВНГ и уставу ФСВНГ</option>
              <option>Лекция УК ПК КоАП</option>
              <option>Лекция О ФЗ закрытых территорий</option>
            </select>
          </div>
          <div>
            <label className="rank-badge text-muted-foreground block mb-1">
              Предпочтительная дата
            </label>
            <input
              type="date"
              className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <button className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-6 hover:bg-primary/90 transition-colors">
          Отправить запрос
        </button>
      </div>
      <div className="space-y-2">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">
          Мои запросы
        </h3>
        {MOCK_LECTURES.map((l) => (
          <div
            key={l.id}
            className="bg-tactical-card border border-tactical-border p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon name="GraduationCap" size={14} className="text-primary" />
              </div>
              <div>
                <h4 className="font-ibm text-sm font-medium text-foreground">
                  {l.title}
                </h4>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {l.instructor} · {l.date}
                </p>
              </div>
            </div>
            <StatusBadge status={l.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Practices() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        title="Практики"
        sub="Запросы на прохождение практических занятий"
      />
      <div className="bg-tactical-card border border-tactical-border p-4">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-4">
          Новый запрос на практику
        </h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="rank-badge text-muted-foreground block mb-1">
              Вид практики
            </label>
            <select className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors">
              <option>Отработка Штраф Задержание Ареста на инструкторе.</option>
              <option>Огневая подготовка</option>
              <option>Физическая подготовка</option>
              <option>Строевая подготовка</option>
              <option>Присяга</option>
            </select>
          </div>
          <div>
            <label className="rank-badge text-muted-foreground block mb-1">
              Предпочтительная дата
            </label>
            <input
              type="date"
              className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="rank-badge text-muted-foreground block mb-1">
            Цель практики
          </label>
          <textarea
            className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors resize-none"
            rows={2}
            placeholder="Опишите цель и ожидаемый результат..."
          />
        </div>
        <button className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-6 hover:bg-primary/90 transition-colors">
          Отправить запрос
        </button>
      </div>
      <div className="space-y-2">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">
          Расписание практик
        </h3>
        {[
          {
            title: "Отработка Штраф Задержание Ареста на инструкторе",
            date: "22.06.2024",
            time: "09:00–13:00",
            location: "Полигон №3",
            status: "approved",
          },
          {
            title: "Огневая подготовка — стрельбище",
            date: "25.06.2024",
            time: "14:00–17:00",
            location: "Тир №1",
            status: "pending",
          },
          {
            title: "Физическая подготовка — полигон",
            date: "28.06.2024",
            time: "08:00–12:00",
            location: "Учебный лес",
            status: "pending",
          },
          {
            title: "Физическая подготовка — полигон",
            date: "28.06.2024",
            time: "08:00–12:00",
            location: "Учебный лес",
            status: "pending",
          },
          {
            title: "Физическая подготовка — полигон",
            date: "28.06.2024",
            time: "08:00–12:00",
            location: "Учебный лес",
            status: "pending",
          },
        ].map((p, i) => (
          <div
            key={i}
            className="bg-tactical-card border border-tactical-border p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon name="Wrench" size={14} className="text-primary" />
              </div>
              <div>
                <h4 className="font-ibm text-sm font-medium text-foreground">
                  {p.title}
                </h4>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {p.date} · {p.time} · {p.location}
                </p>
              </div>
            </div>
            <StatusBadge status={p.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Exams() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Экзамен" sub="Запросы на прохождение экзаменов" />
      <div className="bg-tactical-card border border-tactical-border p-4">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-4">
          Новый запрос на экзамен
        </h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="rank-badge text-muted-foreground block mb-1">
              Вид экзамена
            </label>
            <select className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors">
              <option>
                Экзамен теоретические тесты — Устав ФСВНГ — ФЗ о ФСВНГ
              </option>
              <option>
                Экзамен процедуры практики — Штраф — Задержание — Арест
              </option>
              <option>
                Экзамен теоретические тесты — Штраф — Задержание — Арест
              </option>
            </select>
          </div>
          <div>
            <label className="rank-badge text-muted-foreground block mb-1">
              Предпочтительная дата
            </label>
            <input
              type="date"
              className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="rank-badge text-muted-foreground block mb-1">
            Цель экзамена
          </label>
          <textarea
            className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors resize-none"
            rows={2}
            placeholder="Опишите цель и ожидаемый результат..."
          />
        </div>
        <button className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-6 hover:bg-primary/90 transition-colors">
          Отправить запрос
        </button>
        )
      </div>
      <div className="space-y-3">
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground">
          Расписание экзаменов
        </h3>
        {[
          {
            subject: "Тактическая подготовка",
            date: "15.06.2024",
            time: "10:00",
            room: "Каб. 201",
            instructor: "Кап. Воронов",
            status: "pending",
          },
          {
            subject: "Военная история",
            date: "20.06.2024",
            time: "09:00",
            room: "Каб. 105",
            instructor: "Подп. Ковалёв",
            status: "pending",
          },
          {
            subject: "Огневая подготовка",
            date: "25.06.2024",
            time: "14:00",
            room: "Тир №2",
            instructor: "Майор Сидоров",
            status: "pending",
          },
        ].map((e, i) => (
          <div
            key={i}
            className="corner-mark bg-tactical-card border border-tactical-border p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon
                    name="ClipboardList"
                    size={16}
                    className="text-primary"
                  />
                </div>
                <div>
                  <h4 className="font-oswald text-base font-medium text-foreground tracking-wide">
                    {e.subject}
                  </h4>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground font-mono">
                      {e.date} · {e.time}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {e.room}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {e.instructor}
                    </span>
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
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">
          Пройденные экзамены
        </h3>
        <div className="space-y-2">
          {[
            { subject: "Физическая подготовка", date: "01.06.2024", grade: 5 },
            { subject: "Медицинская помощь", date: "25.05.2024", grade: 4 },
            { subject: "Радиосвязь", date: "15.05.2024", grade: 4 },
          ].map((e, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-tactical-border last:border-0"
            >
              <div>
                <p className="text-sm text-foreground font-ibm">{e.subject}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {e.date}
                </p>
              </div>
              <GradeCircle grade={e.grade} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Reports() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Рапорты"
          sub="Подача служебных рапортов и заявлений"
        />
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
          <h3 className="font-oswald text-sm tracking-widest uppercase text-primary mb-4">
            Подача рапорта
          </h3>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="rank-badge text-muted-foreground block mb-1">
                Тип рапорта
              </label>
              <select className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary">
                <option>Рапорт на повышение в звании</option>
                <option>Запрос дополнительного обучения</option>
              </select>
            </div>
            <div>
              <label className="rank-badge text-muted-foreground block mb-1">
                Адресат
              </label>
              <input
                className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary"
                placeholder="Кому адресован рапорт..."
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="rank-badge text-muted-foreground block mb-1">
              Содержание рапорта
            </label>
            <textarea
              className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary resize-none"
              rows={4}
              placeholder="Изложите суть рапорта..."
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-6 hover:bg-primary/90 transition-colors">
              Подать рапорт
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border border-tactical-border text-muted-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:border-primary/40 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {MOCK_REPORTS.map((r) => (
          <div
            key={r.id}
            className="bg-tactical-card border border-tactical-border p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon name="FileText" size={14} className="text-primary" />
              </div>
              <div>
                <h4 className="font-ibm text-sm font-medium text-foreground">
                  {r.title}
                </h4>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Подан: {r.date}
                </p>
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

export function Grades() {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        title="Система оценок"
        sub="Успеваемость и академические показатели"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Средний балл"
          value={4.3}
          icon="Star"
          accent="text-gold"
        />
        <StatCard
          label="Отличных оценок"
          value={3}
          icon="Award"
          accent="text-green-400"
        />
        <StatCard
          label="Хороших оценок"
          value={2}
          icon="ThumbsUp"
          accent="text-yellow-400"
        />
        <StatCard
          label="Удовлетворит."
          value={1}
          icon="Minus"
          accent="text-orange-400"
        />
      </div>
      <div className="bg-tactical-card border border-tactical-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-tactical-border bg-tactical-panel">
              <th className="text-left px-4 py-3 rank-badge text-muted-foreground">
                Дисциплина
              </th>
              <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">
                Инструктор
              </th>
              <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">
                Дата
              </th>
              <th className="text-center px-4 py-3 rank-badge text-muted-foreground">
                Оценка
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_GRADES.map((g, i) => (
              <tr
                key={i}
                className="border-b border-tactical-border last:border-0 hover:bg-primary/5 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-ibm text-foreground">
                  {g.subject}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">
                  {g.instructor}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">
                  {g.date}
                </td>
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
        <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-4">
          Динамика успеваемости
        </h3>
        <div className="flex items-end gap-2 h-24">
          {[3, 4, 4, 5, 4, 5, 5, 4, 5].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-mono text-muted-foreground">
                {v}
              </span>
              <div
                className="w-full bg-primary/60 hover:bg-primary transition-colors"
                style={{ height: `${(v / 5) * 64}px` }}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-mono mt-2 text-center">
          Последние 9 оценок
        </p>
      </div>
    </div>
  );
}

export function Profile({ authUser }: { authUser: User }) {
  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        title="Профиль курсанта"
        sub="Личные данные и служебная документация"
      />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="corner-mark bg-tactical-card border border-tactical-border p-6 card-glow flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
            <Icon name="User" size={36} className="text-primary" />
          </div>
          <h3 className="font-oswald text-lg tracking-wide text-foreground">
            {authUser.name}
          </h3>
          <p className="text-gold font-mono text-sm mt-1">
            {authUser.rank || "—"}
          </p>
          <div className="mt-3 px-3 py-1 bg-primary/10 border border-primary/20">
            <span className="rank-badge text-primary">
              ID: {authUser.static_id}
            </span>
          </div>
        </div>
        <div className="md:col-span-2 bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-4">
            Служебные данные
          </h3>
          <div className="space-y-3">
            {[
              { label: "Имя", value: authUser.name },
              { label: "Звание", value: authUser.rank || "—" },
              { label: "Подразделение", value: authUser.unit || "—" },
              { label: "Static ID", value: authUser.static_id },
              {
                label: "Роль",
                value:
                  authUser.role === "instructor" ? "Инструктор" : "Курсант",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-2 border-b border-tactical-border last:border-0"
              >
                <span className="rank-badge text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-sm font-ibm text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">
            Награды и поощрения
          </h3>
          <div className="space-y-2">
            {[
              { title: "Лучший курсант месяца", date: "Май 2024" },
              { title: "Грамота за отличную стрельбу", date: "Апр 2024" },
            ].map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 border-b border-tactical-border last:border-0"
              >
                <Icon
                  name="Award"
                  size={14}
                  className="text-gold flex-shrink-0"
                />
                <div>
                  <p className="text-sm text-foreground font-ibm">{a.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {a.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-tactical-card border border-tactical-border p-4">
          <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground mb-3">
            Документы
          </h3>
          <div className="space-y-2">
            {[
              { title: "Личное дело", icon: "FolderOpen" },
              { title: "Зачётная книжка", icon: "BookOpen" },
              { title: "Медицинская книжка", icon: "FileHeart" },
            ].map((d, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 py-2 border-b border-tactical-border last:border-0 hover:text-primary transition-colors group text-left"
              >
                <Icon
                  name={d.icon}
                  fallback="File"
                  size={14}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                />
                <span className="text-sm font-ibm">{d.title}</span>
                <Icon
                  name="ChevronRight"
                  size={12}
                  className="ml-auto text-muted-foreground"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type EditForm = {
  name: string;
  rank: string;
  unit: string;
  role: "cadet" | "instructor";
  password: string;
};

export function InstructorPanel() {
  const [activeTab, setActiveTab] = useState<
    "requests" | "cadets" | "schedule" | "whitelist"
  >("requests");
  const [wlUsers, setWlUsers] = useState<import("@/lib/api").AdminUser[]>([]);
  const [wlLoading, setWlLoading] = useState(false);
  const [wlLoaded, setWlLoaded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    static_id: "",
    password: "",
    name: "",
    rank: "Рядовой",
    unit: "",
    role: "cadet" as "cadet" | "instructor",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [editUser, setEditUser] = useState<
    import("@/lib/api").AdminUser | null
  >(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    rank: "",
    unit: "",
    role: "cadet",
    password: "",
  });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<number | null>(null);

  const loadWhitelist = async (force = false) => {
    if (wlLoaded && !force) return;
    setWlLoading(true);
    try {
      const { adminListUsers } = await import("@/lib/api");
      const users = await adminListUsers();
      setWlUsers(users);
      setWlLoaded(true);
    } catch (e) {
      console.error(e);
    }
    setWlLoading(false);
  };

  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === "whitelist") loadWhitelist();
  };

  const toggleWhitelist = async (id: number, current: boolean) => {
    const { adminUpdateUser } = await import("@/lib/api");
    await adminUpdateUser(id, { is_whitelisted: !current });
    setWlUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_whitelisted: !current } : u)),
    );
  };

  const openEdit = (u: import("@/lib/api").AdminUser) => {
    setEditUser(u);
    setEditForm({
      name: u.name,
      rank: u.rank,
      unit: u.unit,
      role: u.role,
      password: "",
    });
    setEditError("");
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditError("");
    setEditLoading(true);
    try {
      const { adminUpdateUser } = await import("@/lib/api");
      const payload: Parameters<typeof adminUpdateUser>[1] = {
        name: editForm.name,
        rank: editForm.rank,
        unit: editForm.unit,
        role: editForm.role,
      };
      if (editForm.password) payload.password = editForm.password;
      await adminUpdateUser(editUser.id, payload);
      setWlUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id ? { ...u, ...editForm, password: undefined } : u,
        ),
      );
      setEditUser(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Ошибка сохранения");
    }
    setEditLoading(false);
  };

  const handleRemove = async (id: number) => {
    const { adminRemoveUser } = await import("@/lib/api");
    await adminRemoveUser(id);
    setWlUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_whitelisted: false } : u)),
    );
    setRemoveConfirm(null);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const { adminCreateUser } = await import("@/lib/api");
      await adminCreateUser({ ...form, is_whitelisted: true });
      setShowAddForm(false);
      setForm({
        static_id: "",
        password: "",
        name: "",
        rank: "Рядовой",
        unit: "",
        role: "cadet",
      });
      loadWhitelist(true);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Ошибка");
    }
    setFormLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        title="Панель инструктора"
        sub="Управление курсантами, запросами и расписанием"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Новых запросов"
          value={4}
          icon="Bell"
          accent="text-yellow-400"
        />
        <StatCard
          label="Курсантов"
          value={wlUsers.filter((u) => u.role === "cadet").length || 28}
          icon="Users"
          accent="text-primary"
        />
        <StatCard
          label="Занятий сегодня"
          value={3}
          icon="Calendar"
          accent="text-green-400"
        />
        <StatCard
          label="Рапортов на рассм."
          value={2}
          icon="FileText"
          accent="text-gold"
        />
      </div>
      <div className="flex gap-1 border-b border-tactical-border overflow-x-auto">
        {(
          [
            { id: "requests", label: "Запросы" },
            { id: "cadets", label: "Курсанты" },
            { id: "schedule", label: "Расписание" },
            { id: "whitelist", label: "Вайтлист" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`font-oswald text-sm tracking-widest uppercase px-4 py-2 transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "requests" && (
        <div className="space-y-2 animate-fade-in">
          {MOCK_INSTRUCTOR_REQUESTS.map((r) => (
            <div
              key={r.id}
              className="bg-tactical-card border border-tactical-border p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon name="User" size={14} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-ibm text-sm font-medium text-foreground">
                      {r.cadet}
                    </h4>
                    <span className="rank-badge text-muted-foreground bg-tactical-panel px-1.5 py-0.5">
                      {r.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {r.subject} · {r.date}
                  </p>
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
                <th className="text-left px-4 py-3 rank-badge text-muted-foreground">
                  Курсант
                </th>
                <th className="text-left px-4 py-3 rank-badge text-muted-foreground hidden md:table-cell">
                  Подразделение
                </th>
                <th className="text-center px-4 py-3 rank-badge text-muted-foreground">
                  Ср. балл
                </th>
                <th className="text-center px-4 py-3 rank-badge text-muted-foreground">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "Алексеев А.В.",
                  unit: "1-й взвод",
                  avg: 4.3,
                  status: "active",
                },
                {
                  name: "Борисов К.Н.",
                  unit: "1-й взвод",
                  avg: 3.8,
                  status: "active",
                },
                {
                  name: "Васильев Д.О.",
                  unit: "2-й взвод",
                  avg: 4.7,
                  status: "active",
                },
                {
                  name: "Григорьев П.М.",
                  unit: "2-й взвод",
                  avg: 3.5,
                  status: "probation",
                },
                {
                  name: "Данилов С.В.",
                  unit: "3-й взвод",
                  avg: 4.1,
                  status: "active",
                },
              ].map((c, i) => (
                <tr
                  key={i}
                  className="border-b border-tactical-border last:border-0 hover:bg-primary/5 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-ibm text-foreground">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">
                    {c.unit}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-oswald text-base font-bold ${c.avg >= 4.5 ? "text-green-400" : c.avg >= 4.0 ? "text-yellow-400" : "text-orange-400"}`}
                    >
                      {c.avg}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rank-badge px-2 py-0.5 border rounded ${c.status === "active" ? "text-green-400 border-green-800 bg-green-900/20" : "text-orange-400 border-orange-800 bg-orange-900/20"}`}
                    >
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
            {
              time: "09:00–11:00",
              subject: "Тактическая подготовка",
              group: "1-й взвод",
              room: "Поле №1",
            },
            {
              time: "12:00–14:00",
              subject: "Огневая подготовка",
              group: "2-й взвод",
              room: "Тир №1",
            },
            {
              time: "15:00–17:00",
              subject: "Военная история",
              group: "3-й взвод",
              room: "Каб. 105",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-tactical-card border border-tactical-border p-4 flex items-center gap-4"
            >
              <div className="w-28 text-center flex-shrink-0">
                <span className="font-mono text-sm text-primary">{s.time}</span>
              </div>
              <div className="w-px h-10 bg-tactical-border flex-shrink-0" />
              <div>
                <h4 className="font-oswald text-base text-foreground">
                  {s.subject}
                </h4>
                <p className="text-xs text-muted-foreground font-mono">
                  {s.group} · {s.room}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === "whitelist" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Icon name="Plus" size={14} />
              Добавить пользователя
            </button>
          </div>
          {showAddForm && (
            <form
              onSubmit={handleAddUser}
              className="bg-tactical-card border border-primary/40 p-4 space-y-3 animate-fade-in"
            >
              <h3 className="font-oswald text-sm tracking-widest uppercase text-primary">
                Новый пользователь
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">
                    Static ID (6 цифр)
                  </label>
                  <input
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary transition-colors"
                    maxLength={6}
                    placeholder="000000"
                    value={form.static_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        static_id: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">
                    Пароль
                  </label>
                  <input
                    type="password"
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                    placeholder="Придумайте пароль"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">
                    Имя / Позывной
                  </label>
                  <input
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                    placeholder="Фамилия И.О."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">
                    Звание
                  </label>
                  <input
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                    placeholder="Рядовой"
                    value={form.rank}
                    onChange={(e) => setForm({ ...form, rank: e.target.value })}
                  />
                </div>
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">
                    Подразделение
                  </label>
                  <input
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                    placeholder="1-й учебный взвод"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">
                    Роль
                  </label>
                  <select
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value as "cadet" | "instructor",
                      })
                    }
                  >
                    <option value="cadet">Курсант</option>
                    <option value="instructor">Инструктор</option>
                  </select>
                </div>
              </div>
              {formError && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 px-3 py-2">
                  <Icon
                    name="AlertTriangle"
                    size={13}
                    className="text-red-400"
                  />
                  <p className="text-xs text-red-400">{formError}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-6 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {formLoading ? "Сохранение..." : "Добавить"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="border border-tactical-border text-muted-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:border-primary/40 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
          {wlLoading ? (
            <div className="flex items-center justify-center py-10">
              <Icon
                name="Loader2"
                size={24}
                className="text-primary animate-spin"
              />
            </div>
          ) : (
            <div className="bg-tactical-card border border-tactical-border overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-tactical-border bg-tactical-panel">
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground">
                      Static ID
                    </th>
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground">
                      Имя
                    </th>
                    <th className="text-left px-4 py-3 rank-badge text-muted-foreground">
                      Звание
                    </th>
                    <th className="text-center px-4 py-3 rank-badge text-muted-foreground">
                      Роль
                    </th>
                    <th className="text-center px-4 py-3 rank-badge text-muted-foreground">
                      Доступ
                    </th>
                    <th className="text-center px-4 py-3 rank-badge text-muted-foreground">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {wlUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-tactical-border last:border-0 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-sm text-primary">
                        {u.static_id}
                      </td>
                      <td className="px-4 py-3 text-sm font-ibm text-foreground">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {u.rank}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rank-badge px-2 py-0.5 border rounded ${u.role === "instructor" ? "text-primary border-primary/40 bg-primary/10" : "text-muted-foreground border-tactical-border"}`}
                        >
                          {u.role === "instructor" ? "Инструктор" : "Курсант"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            toggleWhitelist(u.id, u.is_whitelisted)
                          }
                          className={`rank-badge px-2 py-0.5 border rounded transition-colors ${u.is_whitelisted ? "text-green-400 border-green-800 bg-green-900/20 hover:bg-green-900/40" : "text-red-400 border-red-800 bg-red-900/20 hover:bg-red-900/40"}`}
                        >
                          {u.is_whitelisted ? "Разрешён" : "Заблокирован"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            title="Редактировать"
                            className="w-7 h-7 flex items-center justify-center border border-tactical-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                          >
                            <Icon name="Pencil" size={12} />
                          </button>
                          {removeConfirm === u.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRemove(u.id)}
                                className="rank-badge text-red-400 border border-red-800 bg-red-900/20 px-2 py-0.5 hover:bg-red-900/40 transition-colors"
                              >
                                Подтвердить
                              </button>
                              <button
                                onClick={() => setRemoveConfirm(null)}
                                className="rank-badge text-muted-foreground border border-tactical-border px-2 py-0.5 hover:border-primary/40 transition-colors"
                              >
                                Отмена
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRemoveConfirm(u.id)}
                              title="Удалить из вайтлиста"
                              className="w-7 h-7 flex items-center justify-center border border-tactical-border text-muted-foreground hover:text-red-400 hover:border-red-800 transition-colors"
                            >
                              <Icon name="UserX" size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {wlUsers.length === 0 && (
                <p className="text-center text-muted-foreground rank-badge py-8">
                  Пользователей нет
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {editUser && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          onClick={() => setEditUser(null)}
        >
          <div
            className="w-full max-w-md bg-tactical-panel border border-tactical-border p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-oswald text-base tracking-widest uppercase text-primary">
                Редактировать профиль
              </h3>
              <button
                onClick={() => setEditUser(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
            <p className="rank-badge text-muted-foreground">
              Static ID: {editUser.static_id}
            </p>
            <form onSubmit={handleEditSave} className="space-y-3">
              <div>
                <label className="rank-badge text-muted-foreground block mb-1">
                  Имя / Позывной
                </label>
                <input
                  className="w-full bg-tactical-card border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">
                    Звание
                  </label>
                  <input
                    className="w-full bg-tactical-card border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                    value={editForm.rank}
                    onChange={(e) =>
                      setEditForm({ ...editForm, rank: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="rank-badge text-muted-foreground block mb-1">
                    Роль
                  </label>
                  <select
                    className="w-full bg-tactical-card border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        role: e.target.value as "cadet" | "instructor",
                      })
                    }
                  >
                    <option value="cadet">Курсант</option>
                    <option value="instructor">Инструктор</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="rank-badge text-muted-foreground block mb-1">
                  Подразделение
                </label>
                <input
                  className="w-full bg-tactical-card border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                  value={editForm.unit}
                  onChange={(e) =>
                    setEditForm({ ...editForm, unit: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="rank-badge text-muted-foreground block mb-1">
                  Новый пароль{" "}
                  <span className="text-muted-foreground">
                    (оставьте пустым, чтобы не менять)
                  </span>
                </label>
                <input
                  type="password"
                  className="w-full bg-tactical-card border border-tactical-border px-3 py-2 text-sm text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                />
              </div>
              {editError && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 px-3 py-2">
                  <Icon
                    name="AlertTriangle"
                    size={13}
                    className="text-red-400"
                  />
                  <p className="text-xs text-red-400">{editError}</p>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-primary text-primary-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {editLoading ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="border border-tactical-border text-muted-foreground font-oswald text-sm tracking-widest uppercase py-2 px-4 hover:border-primary/40 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
