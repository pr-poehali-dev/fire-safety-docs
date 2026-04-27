import Icon from "@/components/ui/icon";

export const sections = [
  { id: "general", label: "1. Общие сведения", icon: "Info" },
  { id: "stack", label: "2. Технический стек", icon: "Layers" },
  { id: "modules", label: "3. Функциональные модули", icon: "LayoutGrid" },
  { id: "database", label: "4. Структура БД", icon: "Database" },
  { id: "design", label: "5. Дизайн и UX", icon: "Palette" },
  { id: "nonfunctional", label: "6. Нефункциональные требования", icon: "Shield" },
  { id: "stages", label: "7. Этапы разработки", icon: "CalendarClock" },
];

export const modules = [
  {
    num: "3.1",
    title: "Личный кабинет",
    code: "ProfileTab",
    icon: "UserCircle",
    color: "bg-blue-500",
    items: [
      "ФИО, должность, образование, квалификация",
      "Удостоверения и сертификаты с отслеживанием сроков действия",
      "Фото профиля",
    ],
  },
  {
    num: "3.2",
    title: "Характеристика объекта",
    code: "CharacteristicTab",
    icon: "Building2",
    color: "bg-orange-500",
    items: [
      "Наименование, адрес, класс функциональной пожарной опасности",
      "Степень огнестойкости, конструктивная опасность",
      "Площадь, этажность, высота, объём",
      "Категория взрывопожарной опасности",
      "Системы защиты: АУПС, СОУЭ, АУПТ, противодымная вентиляция",
      "Фото объекта, карточки рисков",
    ],
  },
  {
    num: "3.3",
    title: "Информирование",
    code: "InformingTab",
    icon: "BookOpen",
    color: "bg-emerald-500",
    items: [
      "Нормативные документы по ПБ",
      "Лучшие практики",
      "Инструктажи",
    ],
  },
  {
    num: "3.4",
    title: "Документация",
    code: "DocumentationSection",
    icon: "FileText",
    color: "bg-violet-500",
    items: [
      "7 подразделов: приказы, инструкции, планы эвакуации, журналы инструктажей, акты проверок, проектная документация, договоры обслуживания",
      "Создание / редактирование / архивирование документов",
      "Статусы: действующий, на согласовании, архив",
    ],
  },
  {
    num: "3.5",
    title: "Мониторинг и управление АРМ",
    code: "MonitoringSection",
    icon: "Monitor",
    color: "bg-cyan-500",
    items: [
      "Автоматизированное рабочее место",
      "Мониторинг систем в реальном времени",
    ],
  },
  {
    num: "3.6",
    title: "Пожары — Учёт инцидентов",
    code: "FiresTab + FiresDashboard",
    icon: "Flame",
    color: "bg-red-500",
    items: [
      "Регистрация инцидентов: дата, место, площадь, время начала / ликвидации",
      "Пострадавшие, причина, ущерб, простой производства",
      "Дашборд со статистикой: графики, тренды",
      "Статусы: расследование, ликвидирован, закрыт",
    ],
  },
  {
    num: "3.7",
    title: "Журнал эксплуатации систем",
    code: "JournalSection",
    icon: "ClipboardList",
    color: "bg-amber-600",
    items: [
      "15 разделов (I\u2013XV) по типам систем: АУПС, СОУЭ, АУПТ, ВПВ, противодымная вентиляция, огнезадерживающие клапаны, двери с доводчиками, эвакуационное освещение, средства спасения с высоты, первичные средства пожаротушения, молниезащита, наружное водоснабжение, электроустановки, газовые установки, пожарные лестницы",
      "Каждая запись: дата, тип (проверка / неисправность / обслуживание), описание, исполнитель, статус",
    ],
  },
  {
    num: "3.8",
    title: "Чек-лист проверок",
    code: "ChecklistSection",
    icon: "CheckSquare",
    color: "bg-teal-500",
    items: [
      "19 обязательных пунктов проверки",
      "Статусы: выполнено / не выполнено / не применимо",
      "Сохранение результатов в БД",
    ],
  },
  {
    num: "3.9",
    title: "Оценка ПБ и риск-анализ",
    code: "AssessmentDashboard",
    icon: "BarChart3",
    color: "bg-indigo-500",
    items: [
      "Общий балл готовности объекта (%)",
      "Оценка по каждому разделу",
      "Графики: radar chart, bar chart (Recharts)",
      "Экспорт PDF-отчёта с графиками",
    ],
  },
  {
    num: "3.10",
    title: "Исполнительная документация",
    code: "ExecutiveDocsSection",
    icon: "FolderOpen",
    color: "bg-sky-500",
    items: [
      "Исполнительная документация по системам ПБ",
    ],
  },
  {
    num: "3.11",
    title: "Расчёты категорий помещений",
    code: "CalculationsSection",
    icon: "Calculator",
    color: "bg-pink-500",
    items: [
      "Расчёт категории взрывопожарной опасности",
      "Категории А, Б, В1\u2013В4, Г, Д",
    ],
  },
  {
    num: "3.12",
    title: "Проверки и аудиты",
    code: "AuditsSection",
    icon: "SearchCheck",
    color: "bg-lime-600",
    items: [
      "Плановые / внеплановые проверки",
      "Результаты, предписания, сроки устранения",
      "История аудитов",
    ],
  },
  {
    num: "3.13",
    title: "Декларация ПБ",
    code: "DeclarationSection",
    icon: "ScrollText",
    color: "bg-fuchsia-500",
    items: [
      "Формирование декларации пожарной безопасности",
      "Данные по разделам декларации",
    ],
  },
  {
    num: "3.14",
    title: "Страхование",
    code: "InsuranceSection",
    icon: "ShieldCheck",
    color: "bg-green-600",
    items: [
      "Данные о страховании объекта",
      "Полисы, сроки, покрытие",
    ],
  },
  {
    num: "3.15",
    title: "Уведомления",
    code: "NotificationsSection",
    icon: "Bell",
    color: "bg-yellow-500",
    items: [
      "Напоминания о сроках проверок",
      "Уведомления о событиях",
    ],
  },
  {
    num: "3.16",
    title: "Экспорт данных",
    code: "ExportSection",
    icon: "Download",
    color: "bg-stone-500",
    items: [
      "Выгрузка в Excel / CSV",
      "Экспорт PDF-отчётов",
    ],
  },
];

export const techStack = [
  { category: "Frontend", value: "React 18 + TypeScript + Vite", icon: "Code2" },
  { category: "UI-библиотека", value: "Tailwind CSS + Shadcn/UI + Lucide Icons + Recharts", icon: "Paintbrush" },
  { category: "Backend", value: "Python 3.11 (Cloud Functions)", icon: "Server" },
  { category: "База данных", value: "PostgreSQL", icon: "Database" },
  { category: "Экспорт", value: "html2canvas + jsPDF", icon: "FileDown" },
  { category: "Хостинг", value: "poehali.dev (облачная платформа)", icon: "Cloud" },
];

export const dbTables = [
  { name: "object_characteristics", desc: "Характеристики объекта защиты" },
  { name: "journal_entries", desc: "Записи журнала эксплуатации (разделы I\u2013XV)" },
  { name: "checklist_items", desc: "Результаты чек-листа проверок" },
  { name: "fire_incidents", desc: "Пожарные инциденты" },
  { name: "drills", desc: "Тренировки и эвакуации" },
  { name: "audits", desc: "Проверки и аудиты" },
  { name: "profile", desc: "Данные профиля пользователя" },
  { name: "certificates", desc: "Удостоверения и сертификаты" },
  { name: "declarations", desc: "Декларации пожарной безопасности" },
];

export const journalSections = [
  "I. Автоматическая пожарная сигнализация",
  "II. Система оповещения и управления эвакуацией",
  "III. Автоматическая установка пожаротушения",
  "IV. Внутренний противопожарный водопровод",
  "V. Противодымная вентиляция",
  "VI. Огнезадерживающие клапаны",
  "VII. Двери с доводчиками",
  "VIII. Эвакуационное освещение",
  "IX. Средства спасения с высоты",
  "X. Первичные средства пожаротушения",
  "XI. Молниезащита",
  "XII. Наружное водоснабжение",
  "XIII. Электроустановки",
  "XIV. Газовые установки",
  "XV. Пожарные лестницы",
];

export const stages = [
  { num: 1, name: "Проектирование и дизайн", duration: "2 недели", icon: "PenTool" },
  { num: 2, name: "Разработка базы данных", duration: "1 неделя", icon: "Database" },
  { num: 3, name: "Backend API", duration: "2 недели", icon: "Server" },
  { num: 4, name: "Frontend: основные модули", duration: "4 недели", icon: "Monitor" },
  { num: 5, name: "Frontend: дополнительные модули", duration: "2 недели", icon: "Puzzle" },
  { num: 6, name: "Тестирование и отладка", duration: "2 недели", icon: "Bug" },
  { num: 7, name: "Развёртывание и документация", duration: "1 неделя", icon: "Rocket" },
];

export const SectionHeading = ({
  number,
  title,
  icon,
}: {
  number: string;
  title: string;
  icon: string;
}) => (
  <div className="mb-5 flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-orange-500 text-sm font-bold text-white shadow-sm">
      {number}
    </div>
    <div className="flex items-center gap-2">
      <Icon name={icon} size={20} className="text-slate-400" />
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    </div>
    <div className="ml-2 h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
  </div>
);

export const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 border-b border-dashed border-slate-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:gap-4">
    <dt className="w-48 shrink-0 text-sm font-semibold text-slate-500">{label}</dt>
    <dd className="text-sm text-slate-800">{value}</dd>
  </div>
);

export default sections;
