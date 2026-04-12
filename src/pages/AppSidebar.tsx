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
  const [scrolled, setScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    const el = sidebarRef.current;
    if (!el) return;
    setScrolled(el.scrollTop > 10);
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 10);
  }, []);

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

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-orange-500 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setMobileOpen(true)} className="text-white p-1">
            <Icon name="Menu" size={24} />
          </button>
          <div className="flex-1 text-center min-w-0 px-3">
            <p className="text-white text-sm font-medium truncate">{activeTitle}</p>
          </div>
          <div className="w-8" />
        </div>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        onScroll={handleScroll}
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-50
          w-80
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {scrolled && (
          <div className="sticky top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/10 to-transparent z-10 pointer-events-none" />
        )}
        <div className={`p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-orange-500 ${scrolled ? '-mt-4' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="bg-white rounded-xl px-4 py-3 inline-block mb-3">
              <img
                src="https://cdn.poehali.dev/projects/fc8972aa-4cef-4b81-a7f2-8d2dc556f071/bucket/4ad57d25-eeff-4ea2-9c47-a108c700f08b.png"
                alt="Код безопасности РУСАЛ"
                className="h-14 object-contain"
              />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-white/80 hover:text-white p-1 mb-3"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
          <h1 className="text-sm font-semibold text-white/90 leading-snug">
            Система управления<br />пожарной безопасностью
          </h1>
          {objectName && (
            <p className="text-xs text-white/70 mt-2 truncate">{objectName}</p>
          )}
        </div>

        <div className="p-4 space-y-1">
          <Button
            variant="ghost"
            onClick={() => { onBackToList(); setMobileOpen(false); }}
            className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900"
          >
            <Icon name="ArrowLeft" size={20} />
            <span>К списку объектов</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => { onGoHome(); setMobileOpen(false); }}
            className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900"
          >
            <Icon name="Home" size={20} />
            <span>На главную</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => { onLogout(); setMobileOpen(false); }}
            className="w-full justify-start gap-2 text-gray-600 hover:text-red-600"
          >
            <Icon name="LogOut" size={20} />
            <span>Выйти</span>
          </Button>
        </div>

        <nav className="px-4 pb-4 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 ${
                activeSection === section.id
                  ? section.color + ' text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon
                name={section.icon}
                size={20}
                className={activeSection === section.id ? '' : 'text-gray-500'}
              />
              <span className="text-sm">{section.title}</span>
            </button>
          ))}
        </nav>
        {!atBottom && (
          <div className="sticky bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        )}
      </div>
    </>
  );
}
