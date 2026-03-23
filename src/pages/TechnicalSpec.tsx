import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sections = [
  { id: "general", label: "1. Общие сведения", icon: "Info" },
  { id: "stack", label: "2. Технический стек", icon: "Layers" },
  { id: "modules", label: "3. Функциональные модули", icon: "LayoutGrid" },
  { id: "database", label: "4. Структура БД", icon: "Database" },
  { id: "design", label: "5. Дизайн и UX", icon: "Palette" },
  { id: "nonfunctional", label: "6. Нефункциональные требования", icon: "Shield" },
  { id: "stages", label: "7. Этапы разработки", icon: "CalendarClock" },
];

const modules = [
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

const techStack = [
  { category: "Frontend", value: "React 18 + TypeScript + Vite", icon: "Code2" },
  { category: "UI-библиотека", value: "Tailwind CSS + Shadcn/UI + Lucide Icons + Recharts", icon: "Paintbrush" },
  { category: "Backend", value: "Python 3.11 (Cloud Functions)", icon: "Server" },
  { category: "База данных", value: "PostgreSQL", icon: "Database" },
  { category: "Экспорт", value: "html2canvas + jsPDF", icon: "FileDown" },
  { category: "Хостинг", value: "poehali.dev (облачная платформа)", icon: "Cloud" },
];

const dbTables = [
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

const journalSections = [
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

const stages = [
  { num: 1, name: "Проектирование и дизайн", duration: "2 недели", icon: "PenTool" },
  { num: 2, name: "Разработка базы данных", duration: "1 неделя", icon: "Database" },
  { num: 3, name: "Backend API", duration: "2 недели", icon: "Server" },
  { num: 4, name: "Frontend: основные модули", duration: "4 недели", icon: "Monitor" },
  { num: 5, name: "Frontend: дополнительные модули", duration: "2 недели", icon: "Puzzle" },
  { num: 6, name: "Тестирование и отладка", duration: "2 недели", icon: "Bug" },
  { num: 7, name: "Развёртывание и документация", duration: "1 неделя", icon: "Rocket" },
];

const TechnicalSpec = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("general");

  useEffect(() => {
    const handleScroll = () => {
      const offsets = sections.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return { id: s.id, top: Infinity };
        return { id: s.id, top: Math.abs(el.getBoundingClientRect().top - 100) };
      });
      const closest = offsets.reduce((a, b) => (a.top < b.top ? a : b));
      setActiveSection(closest.id);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-['Nunito']">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { font-size: 11pt; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      <header className="no-print sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-orange-500">
              <Icon name="Flame" size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">
                Техническое задание
              </h1>
              <p className="text-xs text-slate-500">Система управления пожарной безопасностью</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-1.5"
            >
              <Icon name="ArrowLeft" size={16} />
              <span className="hidden sm:inline">На главную</span>
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
            >
              <Icon name="Printer" size={16} />
              <span className="hidden sm:inline">Печать</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6">
        <aside className="no-print sticky top-20 hidden h-fit w-64 shrink-0 lg:block">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Icon name="List" size={16} />
                Содержание
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <nav className="flex flex-col gap-0.5">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-all ${
                      activeSection === s.id
                        ? "bg-gradient-to-r from-blue-50 to-orange-50 font-semibold text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      name={s.icon}
                      size={15}
                      className={
                        activeSection === s.id ? "text-orange-500" : "text-slate-400"
                      }
                    />
                    <span className="leading-tight">{s.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-10 rounded-2xl bg-gradient-to-r from-blue-600 to-orange-500 p-8 text-white shadow-xl sm:p-12">
            <Badge className="mb-4 border-white/30 bg-white/20 text-white hover:bg-white/30">
              Версия 1.0
            </Badge>
            <h2 className="mb-3 text-2xl font-extrabold leading-tight sm:text-3xl">
              Система управления пожарной безопасностью объекта защиты
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-white/90">
              Техническое задание на разработку комплексного веб-приложения для ведения документации,
              контроля и мониторинга пожарной безопасности объектов защиты в соответствии
              с требованиями законодательства Российской Федерации
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Icon name="Calendar" size={14} />
                23 марта 2026
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="Tag" size={14} />
                v1.0
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="FileCode" size={14} />
                Веб-приложение (SPA)
              </span>
            </div>
          </div>

          <section id="general" className="mb-12 scroll-mt-24">
            <SectionHeading number="1" title="Общие сведения" icon="Info" />
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="space-y-5">
                  <InfoRow
                    label="Полное название"
                    value="Система управления пожарной безопасностью объекта защиты"
                  />
                  <InfoRow
                    label="Назначение"
                    value="Комплексное веб-приложение для ведения документации, контроля и мониторинга пожарной безопасности объектов защиты в соответствии с требованиями законодательства РФ"
                  />
                  <InfoRow
                    label="Целевая аудитория"
                    value="Специалисты по пожарной безопасности, ответственные за ПБ на предприятиях, инженеры по охране труда"
                  />
                  <InfoRow
                    label="Платформа"
                    value="Веб-приложение (SPA), доступ через браузер, адаптивная вёрстка"
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="stack" className="mb-12 scroll-mt-24">
            <SectionHeading number="2" title="Технический стек" icon="Layers" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {techStack.map((item) => (
                <Card
                  key={item.category}
                  className="border-slate-200 transition-shadow hover:shadow-md"
                >
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-orange-100">
                      <Icon name={item.icon} size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {item.category}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="modules" className="mb-12 scroll-mt-24">
            <SectionHeading number="3" title="Функциональные модули" icon="LayoutGrid" />
            <p className="mb-6 text-sm text-slate-600">
              Система включает 16 функциональных модулей, обеспечивающих полный цикл управления пожарной безопасностью.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {modules.map((m) => (
                <Card
                  key={m.num}
                  className="border-slate-200 transition-all hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${m.color} text-white shadow-sm`}
                      >
                        <Icon name={m.icon} size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-400">{m.num}</p>
                        <CardTitle className="text-base font-bold leading-snug text-slate-800">
                          {m.title}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1 text-[10px] font-mono">
                          {m.code}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <ul className="space-y-1.5">
                      {m.items.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-600">
                          <Icon
                            name="ChevronRight"
                            size={14}
                            className="mt-0.5 shrink-0 text-orange-400"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6 border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="ClipboardList" size={18} className="text-amber-600" />
                  Разделы журнала эксплуатации систем (модуль 3.7)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {journalSections.map((js, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[10px] font-bold text-amber-700">
                        {i + 1}
                      </span>
                      <span>{js.replace(/^[IVXL]+\.\s*/, "")}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="database" className="mb-12 scroll-mt-24 print-break">
            <SectionHeading number="4" title="Структура базы данных" icon="Database" />
            <Card className="border-slate-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gradient-to-r from-blue-50 to-orange-50">
                        <th className="px-6 py-3 text-left font-semibold text-slate-700">
                          Таблица
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-700">
                          Описание
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbTables.map((t, i) => (
                        <tr
                          key={t.name}
                          className={`border-b last:border-0 ${
                            i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          }`}
                        >
                          <td className="px-6 py-3">
                            <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">
                              {t.name}
                            </code>
                          </td>
                          <td className="px-6 py-3 text-slate-600">{t.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="design" className="mb-12 scroll-mt-24">
            <SectionHeading number="5" title="Дизайн и UX" icon="Palette" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-500">
                    Цветовая схема
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-12 w-12 rounded-lg bg-[#2563EB] shadow-inner" />
                      <span className="font-mono text-[10px] text-slate-500">#2563EB</span>
                      <span className="text-xs text-slate-600">Синий</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-12 w-12 rounded-lg bg-[#EA580C] shadow-inner" />
                      <span className="font-mono text-[10px] text-slate-500">#EA580C</span>
                      <span className="text-xs text-slate-600">Оранжевый</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#EA580C] shadow-inner" />
                      <span className="font-mono text-[10px] text-slate-500">Gradient</span>
                      <span className="text-xs text-slate-600">Акцент</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-500">
                    Типографика
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-extrabold text-slate-800">Nunito</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Основной шрифт приложения. Поддержка начертаний: 400, 500, 600, 700, 800.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-500">
                    UI-компоненты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Shadcn/UI</Badge>
                    <Badge variant="secondary">Radix UI</Badge>
                    <Badge variant="outline">Lucide Icons</Badge>
                    <Badge variant="secondary">Recharts</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-500">
                    UX-решения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <Icon name="Smartphone" size={14} className="text-blue-500" />
                      Адаптивность: mobile-first
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="PanelTop" size={14} className="text-blue-500" />
                      Система табов для навигации между модулями
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="MessageCircle" size={14} className="text-blue-500" />
                      Чат-помощник (плавающая кнопка)
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="History" size={14} className="text-blue-500" />
                      История действий (плавающая кнопка)
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="nonfunctional" className="mb-12 scroll-mt-24 print-break">
            <SectionHeading number="6" title="Нефункциональные требования" icon="Shield" />
            <Accordion type="multiple" defaultValue={["perf", "security", "scale", "compat"]}>
              <AccordionItem value="perf">
                <AccordionTrigger className="text-sm font-semibold">
                  <span className="flex items-center gap-2">
                    <Icon name="Zap" size={16} className="text-amber-500" />
                    Производительность
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-green-500" />
                      Быстрая загрузка за счёт SPA-архитектуры
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-green-500" />
                      Lazy loading для модулей и маршрутов
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-green-500" />
                      Оптимизация бандла через Vite (tree shaking, code splitting)
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security">
                <AccordionTrigger className="text-sm font-semibold">
                  <span className="flex items-center gap-2">
                    <Icon name="Lock" size={16} className="text-red-500" />
                    Безопасность
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-green-500" />
                      Настройка CORS-политик
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-green-500" />
                      Параметризованные SQL-запросы (защита от SQL-инъекций)
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-green-500" />
                      Хранение секретов в переменных окружения
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scale">
                <AccordionTrigger className="text-sm font-semibold">
                  <span className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={16} className="text-blue-500" />
                    Масштабируемость
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-green-500" />
                      Облачные функции с автоматическим масштабированием
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-green-500" />
                      PostgreSQL с поддержкой горизонтального масштабирования
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-green-500" />
                      Регулярное резервное копирование БД
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="compat">
                <AccordionTrigger className="text-sm font-semibold">
                  <span className="flex items-center gap-2">
                    <Icon name="Globe" size={16} className="text-indigo-500" />
                    Совместимость
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-green-500" />
                      Поддержка всех современных браузеров (Chrome, Firefox, Safari, Edge)
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-green-500" />
                      Адаптивный дизайн для мобильных устройств, планшетов и десктопов
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section id="stages" className="mb-12 scroll-mt-24">
            <SectionHeading number="7" title="Этапы разработки" icon="CalendarClock" />
            <Card className="border-slate-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gradient-to-r from-blue-50 to-orange-50">
                        <th className="w-12 px-4 py-3 text-center font-semibold text-slate-700">
                          #
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">
                          Этап
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-700">
                          Срок
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stages.map((s, i) => (
                        <tr
                          key={s.num}
                          className={`border-b last:border-0 ${
                            i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          }`}
                        >
                          <td className="px-4 py-3 text-center">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-orange-500 text-xs font-bold text-white">
                              {s.num}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Icon name={s.icon} size={16} className="text-slate-400" />
                              <span className="font-medium text-slate-800">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant="outline" className="font-mono text-xs">
                              {s.duration}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-gradient-to-r from-blue-50 to-orange-50">
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3 font-bold text-slate-800">Итого</td>
                        <td className="px-4 py-3 text-right">
                          <Badge className="bg-gradient-to-r from-blue-600 to-orange-500 font-mono text-xs">
                            ~14 недель
                          </Badge>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          <footer className="mt-16 border-t border-slate-200 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-orange-500">
                  <Icon name="Flame" size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Система управления пожарной безопасностью
                  </p>
                  <p className="text-xs text-slate-500">Техническое задание</p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Дата составления: 23 марта 2026 г.</p>
                <p>Версия документа: 1.0</p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

const SectionHeading = ({
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

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 border-b border-dashed border-slate-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:gap-4">
    <dt className="w-48 shrink-0 text-sm font-semibold text-slate-500">{label}</dt>
    <dd className="text-sm text-slate-800">{value}</dd>
  </div>
);

export default TechnicalSpec;
