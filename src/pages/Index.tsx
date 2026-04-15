import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '@/components/LoadingIndicator';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const handleEnterSystem = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/app');
    }, 300);
  };

  const features = [
    { icon: 'Building2', label: 'Характеристика объекта', color: 'bg-blue-500/10 text-blue-600' },
    { icon: 'Clipboard', label: 'Журнал эксплуатации', color: 'bg-emerald-500/10 text-emerald-600' },
    { icon: 'CheckSquare', label: 'Чек-листы проверок', color: 'bg-violet-500/10 text-violet-600' },
    { icon: 'Flame', label: 'Регистр инцидентов', color: 'bg-red-500/10 text-red-600' },
    { icon: 'Calculator', label: 'Расчёт категорий', color: 'bg-amber-500/10 text-amber-600' },
    { icon: 'BarChart3', label: 'Оценка ПБ', color: 'bg-teal-500/10 text-teal-600' },
    { icon: 'FileCheck', label: 'Декларация', color: 'bg-rose-500/10 text-rose-600' },
    { icon: 'Search', label: 'Аудиты', color: 'bg-cyan-500/10 text-cyan-600' },
  ];

  return (
    <>
      {isTransitioning && <LoadingIndicator />}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col">

        <header className="w-full glass sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between gap-3 animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
              <Icon name="ShieldCheck" size={20} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-foreground text-base leading-tight block">ПожБезопасность</span>
              <span className="text-[11px] text-muted-foreground">Система управления ПБ</span>
            </div>
          </div>
          <img
            src="https://cdn.poehali.dev/projects/fc8972aa-4cef-4b81-a7f2-8d2dc556f071/bucket/52788c05-814d-443a-b962-066a244e4e19.png"
            alt="ЭН+ | РУСАЛ"
            className="h-10 md:h-12 object-contain"
          />
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-16">
          <div className="max-w-3xl w-full text-center space-y-10">

            <div className="animate-scale-in">
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-300/40 mb-8">
                <Icon name="ShieldCheck" size={52} className="text-white" />
              </div>
            </div>

            <div className="space-y-4 animate-slide-up">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
                Система управления<br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  пожарной безопасностью
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Комплексное решение для контроля и мониторинга противопожарных систем объекта
              </p>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <Button
                onClick={handleEnterSystem}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-6 text-base sm:text-lg rounded-2xl shadow-xl shadow-blue-300/30 transition-all active:scale-[0.98] w-full sm:w-auto"
              >
                <Icon name="LogIn" size={22} className="mr-2" />
                Войти в систему
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 animate-stagger">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-border/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center gap-2.5 text-center cursor-default"
                >
                  <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center`}>
                    <Icon name={f.icon} size={20} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground leading-snug">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="w-full border-t border-border/50 bg-white/60 backdrop-blur px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© 2025 Система управления пожарной безопасностью</span>
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.poehali.dev/projects/fc8972aa-4cef-4b81-a7f2-8d2dc556f071/files/logo-mchs.png"
              alt="МЧС"
              className="h-5 object-contain opacity-50"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span>Разработано для объектов защиты РФ</span>
          </div>
        </footer>

      </div>
    </>
  );
};

export default Index;
