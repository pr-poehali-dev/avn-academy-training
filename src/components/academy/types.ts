export type Section =
  | "dashboard"
  | "materials"
  | "lectures"
  | "practices"
  | "exams"
  | "reports"
  | "grades"
  | "profile"
  | "instructor";

export type UserRole = "cadet" | "instructor";

export const NAV_ITEMS: {
  id: Section;
  label: string;
  icon: string;
  roles: UserRole[];
}[] = [
  {
    id: "dashboard",
    label: "Главная",
    icon: "LayoutDashboard",
    roles: ["cadet", "instructor"],
  },
  {
    id: "materials",
    label: "Обучающие материалы",
    icon: "BookOpen",
    roles: ["cadet", "instructor"],
  },
  {
    id: "lectures",
    label: "Лекции",
    icon: "GraduationCap",
    roles: ["cadet", "instructor"],
  },
  {
    id: "practices",
    label: "Практики",
    icon: "Wrench",
    roles: ["cadet", "instructor"],
  },
  {
    id: "exams",
    label: "Экзамены",
    icon: "ClipboardList",
    roles: ["cadet", "instructor"],
  },
  {
    id: "reports",
    label: "Рапорты",
    icon: "FileText",
    roles: ["cadet", "instructor"],
  },
  {
    id: "grades",
    label: "Система оценок",
    icon: "BarChart3",
    roles: ["cadet", "instructor"],
  },
  { id: "profile", label: "Профиль курсанта", icon: "User", roles: ["cadet"] },
  {
    id: "instructor",
    label: "Панель инструктора",
    icon: "Shield",
    roles: ["instructor"],
  },
];

export const MOCK_CADET = {
  name: "Курсант Алексеев А.В.",
  rank: "Рядовой",
  unit: "1-й учебный взвод",
  id: "КУР-2024-0147",
  grade_avg: 4.3,
  completed: 12,
  total: 20,
};

export const MOCK_LECTURES = [
  {
    id: 1,
    title: "Тактика боя в городских условиях",
    instructor: "Кап. Воронов В.И.",
    date: "15.06.2024",
    status: "approved",
  },
  {
    id: 2,
    title: "Основы радиосвязи",
    instructor: "Ст. лейт. Панов Д.С.",
    date: "18.06.2024",
    status: "pending",
  },
  {
    id: 3,
    title: "Военная топография",
    instructor: "Майор Сидоров К.А.",
    date: "20.06.2024",
    status: "approved",
  },
];

export const MOCK_REPORTS = [
  {
    id: 1,
    title: "Рапорт на повышение в звании",
    date: "01.06.2024",
    status: "pending",
  },
  {
    id: 2,
    title: "Рапорт о прохождении практики",
    date: "28.05.2024",
    status: "approved",
  },
  {
    id: 3,
    title: "Запрос на дополнительное обучение",
    date: "20.05.2024",
    status: "rejected",
  },
];

export const MOCK_GRADES = [
  {
    subject: "Тактическая подготовка",
    grade: 5,
    date: "10.06.2024",
    instructor: "Кап. Воронов",
  },
  {
    subject: "Физическая подготовка",
    grade: 4,
    date: "08.06.2024",
    instructor: "Ст. лейт. Панов",
  },
  {
    subject: "Огневая подготовка",
    grade: 5,
    date: "05.06.2024",
    instructor: "Майор Сидоров",
  },
  {
    subject: "Военная история",
    grade: 4,
    date: "03.06.2024",
    instructor: "Подп. Ковалёв",
  },
  {
    subject: "Медицинская подготовка",
    grade: 3,
    date: "01.06.2024",
    instructor: "Кап. Зимина",
  },
];

export const MOCK_INSTRUCTOR_REQUESTS = [
  {
    id: 1,
    cadet: "Алексеев А.В.",
    type: "Лекция",
    subject: "Тактика",
    date: "14.06.2024",
    status: "pending",
  },
  {
    id: 2,
    cadet: "Борисов К.Н.",
    type: "Рапорт",
    subject: "Повышение",
    date: "13.06.2024",
    status: "pending",
  },
  {
    id: 3,
    cadet: "Васильев Д.О.",
    type: "Экзамен",
    subject: "Огневая подготовка",
    date: "12.06.2024",
    status: "approved",
  },
  {
    id: 4,
    cadet: "Григорьев П.М.",
    type: "Практика",
    subject: "Топография",
    date: "11.06.2024",
    status: "rejected",
  },
];

export const MOCK_MATERIALS = [
  {
    id: 1,
    title: "Вступительная лекция",
    category: "Лекции",
    pages: null,
    icon: "Presentation",
    url: "https://docs.google.com/presentation/d/1TunNnou9K9ZH_QDsmx0N-OKhSSRQot6o6J09dMgcp5c/edit?slide=id.p#slide=id.p",
  },
  {
    id: 2,
    title: "Лекция ФЗ о ФСВНГ и Внутреннему Уставу",
    category: "Лекции",
    pages: null,
    icon: "Presentation",
    url: "https://docs.google.com/document/d/1fir1wtveTcp5n5MQ-dJ25syfUWJ_QsyOaxjpjx6Vci8/edit?tab=t.0#heading=h.9m17jtlreqi2",
  },
  {
    id: 3,
    title: "Лекция УК,ПК и КОАП",
    category: "Лекции",
    pages: null,
    icon: "Presentation",
    url: "https://docs.google.com/presentation/d/18NqJPtXdvhpl5ChP-1VRfBP77ZsCmVSYOhGbDVqdygA/edit?slide=id.g3ed1b51981d_0_21#slide=id.g3ed1b51981d_0_21",
  },
  {
    id: 4,
    title: "Лекция Допуск к закрытой и охраняемой территории",
    category: "Лекции",
    pages: null,
    icon: "Presentation",
    url: "https://docs.google.com/presentation/d/1rk_v4cruYlBn4gd1zI2jgemZycuJnQqYseNnP5ARsG8/edit?slide=id.p#slide=id.p",
  },
  {
    id: 5,
    title: "Руководство по стрелковому оружию",
    category: "Огневая подготовка",
    pages: 156,
    icon: "Target",
    url: null,
  },
  {
    id: 6,
    title: "Военная топография и навигация",
    category: "Ориентирование",
    pages: 120,
    icon: "Map",
    url: null,
  },
  {
    id: 7,
    title: "Медицинская помощь в полевых условиях",
    category: "Медподготовка",
    pages: 88,
    icon: "Heart",
    url: null,
  },
];
