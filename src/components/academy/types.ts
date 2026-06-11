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

export const NAV_ITEMS: { id: Section; label: string; icon: string; roles: UserRole[] }[] = [
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
  { id: 1, title: "Тактика боя в городских условиях", instructor: "Кап. Воронов В.И.", date: "15.06.2024", status: "approved" },
  { id: 2, title: "Основы радиосвязи", instructor: "Ст. лейт. Панов Д.С.", date: "18.06.2024", status: "pending" },
  { id: 3, title: "Военная топография", instructor: "Майор Сидоров К.А.", date: "20.06.2024", status: "approved" },
];

export const MOCK_REPORTS = [
  { id: 1, title: "Рапорт на повышение в звании", date: "01.06.2024", status: "pending" },
  { id: 2, title: "Рапорт о прохождении практики", date: "28.05.2024", status: "approved" },
  { id: 3, title: "Запрос на дополнительное обучение", date: "20.05.2024", status: "rejected" },
];

export const MOCK_GRADES = [
  { subject: "Тактическая подготовка", grade: 5, date: "10.06.2024", instructor: "Кап. Воронов" },
  { subject: "Физическая подготовка", grade: 4, date: "08.06.2024", instructor: "Ст. лейт. Панов" },
  { subject: "Огневая подготовка", grade: 5, date: "05.06.2024", instructor: "Майор Сидоров" },
  { subject: "Военная история", grade: 4, date: "03.06.2024", instructor: "Подп. Ковалёв" },
  { subject: "Медицинская подготовка", grade: 3, date: "01.06.2024", instructor: "Кап. Зимина" },
];

export const MOCK_INSTRUCTOR_REQUESTS = [
  { id: 1, cadet: "Алексеев А.В.", type: "Лекция", subject: "Тактика", date: "14.06.2024", status: "pending" },
  { id: 2, cadet: "Борисов К.Н.", type: "Рапорт", subject: "Повышение", date: "13.06.2024", status: "pending" },
  { id: 3, cadet: "Васильев Д.О.", type: "Экзамен", subject: "Огневая подготовка", date: "12.06.2024", status: "approved" },
  { id: 4, cadet: "Григорьев П.М.", type: "Практика", subject: "Топография", date: "11.06.2024", status: "rejected" },
];

export const MOCK_MATERIALS = [
  { id: 1, title: "Устав Вооружённых Сил", category: "Нормативные документы", pages: 214, icon: "BookMarked" },
  { id: 2, title: "Тактика общевойскового боя", category: "Тактическая подготовка", pages: 180, icon: "Crosshair" },
  { id: 3, title: "Наставление по физической подготовке", category: "Физподготовка", pages: 96, icon: "Activity" },
  { id: 4, title: "Руководство по стрелковому оружию", category: "Огневая подготовка", pages: 156, icon: "Target" },
  { id: 5, title: "Военная топография и навигация", category: "Ориентирование", pages: 120, icon: "Map" },
  { id: 6, title: "Медицинская помощь в полевых условиях", category: "Медподготовка", pages: 88, icon: "Heart" },
];
