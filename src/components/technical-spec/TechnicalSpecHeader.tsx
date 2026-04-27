import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sections } from "./TechnicalSpecData";

interface TechnicalSpecHeaderProps {
  onBack: () => void;
}

const TechnicalSpecHeader = ({ onBack }: TechnicalSpecHeaderProps) => {
  return (
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
            onClick={onBack}
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
  );
};

interface TechnicalSpecSidebarProps {
  activeSection: string;
  onScrollTo: (id: string) => void;
}

export const TechnicalSpecSidebar = ({ activeSection, onScrollTo }: TechnicalSpecSidebarProps) => (
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
              onClick={() => onScrollTo(s.id)}
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
);

export const TechnicalSpecHero = () => (
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
);

export const TechnicalSpecFooter = () => (
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
);

export default TechnicalSpecHeader;
