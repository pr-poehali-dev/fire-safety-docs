import Icon from "@/components/ui/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading, dbTables, stages } from "./TechnicalSpecData";

const TechnicalSpecDetails = () => {
  return (
    <>
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
                  Чат-ассистент для помощи пользователю
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Activity" size={14} className="text-blue-500" />
                  История активности пользователя
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
    </>
  );
};

export default TechnicalSpecDetails;
