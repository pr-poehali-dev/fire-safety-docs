import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SectionItem {
  id: string;
  icon: string;
  title: string;
  color: string;
}

interface AppSidebarProps {
  sections: SectionItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  objectName?: string;
  onBackToList: () => void;
  onGoHome: () => void;
  onLogout: () => void;
}

export default function AppSidebar({
  sections,
  activeSection,
  onSectionChange,
  objectName,
  onBackToList,
  onGoHome,
  onLogout,
}: AppSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSectionClick = (id: string) => {
    onSectionChange(id);
    setMobileOpen(false);
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const activeTitle = sections.find(s => s.id === activeSection)?.title || '';
  const activeIcon = sections.find(s => s.id === activeSection)?.icon || 'Menu';

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 mobile-safe-bottom">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary active:scale-95 transition-transform"
          >
            <Icon name="Menu" size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{activeTitle}</p>
            {objectName && <p className="text-xs text-muted-foreground truncate">{objectName}</p>}
          </div>
          <button
            onClick={onBackToList}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground active:scale-95 transition-transform"
          >
            <Icon name="ArrowLeft" size={18} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-border/50 shadow-xl overflow-y-auto z-50 scrollbar-thin
          w-72
          transition-transform duration-300 ease-out
          lg:translate-x-0 lg:shadow-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="sticky top-0 z-10 bg-gradient-to-br from-slate-900 to-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/10 backdrop-blur rounded-xl px-3 py-2">
              <img
                src="https://cdn.poehali.dev/projects/fc8972aa-4cef-4b81-a7f2-8d2dc556f071/bucket/4ad57d25-eeff-4ea2-9c47-a108c700f08b.png"
                alt="Код безопасности РУСАЛ"
                className="h-10 object-contain"
              />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
          <h1 className="text-xs font-medium text-white/60 uppercase tracking-wider">
            Система управления ПБ
          </h1>
          {objectName && (
            <p className="text-sm text-white/90 font-medium mt-1 truncate">{objectName}</p>
          )}
        </div>

        <div className="p-3 border-b border-border/50 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { onBackToList(); setMobileOpen(false); }}
            className="flex-1 justify-start gap-2 text-muted-foreground hover:text-foreground h-9 text-xs"
          >
            <Icon name="ArrowLeft" size={16} />
            Объекты
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { onGoHome(); setMobileOpen(false); }}
            className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
          >
            <Icon name="Home" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { onLogout(); setMobileOpen(false); }}
            className="h-9 w-9 p-0 text-muted-foreground hover:text-red-600"
          >
            <Icon name="LogOut" size={16} />
          </Button>
        </div>

        <nav className="p-2 space-y-0.5">
          {sections.map((section, idx) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 group animate-slide-up`}
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? `${section.color} text-white shadow-md`
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                }`}>
                  <Icon name={section.icon} size={16} />
                </div>
                <span className={`text-sm truncate transition-colors ${
                  isActive ? 'text-foreground font-semibold' : 'text-muted-foreground group-hover:text-foreground'
                }`}>
                  {section.title}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-scale-in" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
