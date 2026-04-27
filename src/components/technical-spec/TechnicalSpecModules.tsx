import Icon from "@/components/ui/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SectionHeading,
  InfoRow,
  modules,
  techStack,
  journalSections,
} from "./TechnicalSpecData";

const TechnicalSpecModules = () => {
  return (
    <>
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
    </>
  );
};

export default TechnicalSpecModules;
