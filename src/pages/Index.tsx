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
    { icon: 'Building2', label: 'Характеристика объекта', color: 'text-blue-500' },
    { icon: 'Clipboard', label: 'Журнал эксплуатации систем', color: 'text-green-500' },
    { icon: 'CheckSquare', label: 'Чек-листы проверок', color: 'text-purple-500' },
    { icon: 'Flame', label: 'Регистр пожарных инцидентов', color: 'text-red-500' },
    { icon: 'Calculator', label: 'Расчёт категорий помещений', color: 'text-amber-500' },
    { icon: 'BarChart3', label: 'Оценка ПБ и риск-анализ', color: 'text-emerald-500' },
    { icon: 'FileCheck', label: 'Декларация и страхование', color: 'text-rose-500' },
    { icon: 'Search', label: 'Проверки и аудиты', color: 'text-teal-500' },
  ];

  return (
    <>
      {isTransitioning && <LoadingIndicator />}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col">
        
        {/* Header */}
        <header className="w-full bg-white/80 backdrop-blur border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <Icon name="Flame" size={22} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg leading-tight block">ПожБезопасность</span>
              <span className="text-xs text-gray-500">Система управления ПБ</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img
              src="https://cdn.poehali.dev/projects/fc8972aa-4cef-4b81-a7f2-8d2dc556f071/files/logo-rusal.png"
              alt="РУСАЛ"
              className="h-8 object-contain opacity-80"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex items-center justify-center px-8 py-16">
          <div className="max-w-4xl w-full text-center space-y-8">

            {/* Логотип / иконка */}
            <div className="flex justify-center">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200">
                <Icon name="ShieldCheck" size={64} className="text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Система управления<br />
                <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  пожарной безопасностью
                </span>
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Комплексное решение для контроля и мониторинга противопожарных систем объекта
              </p>
            </div>

            <Button
              onClick={handleEnterSystem}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-blue-200 transition-all"
            >
              <Icon name="LogIn" size={22} className="mr-2" />
              Войти в систему
            </Button>

            {/* Возможности */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center"
                >
                  <Icon name={f.icon} size={28} className={f.color} />
                  <span className="text-xs text-gray-600 leading-snug">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-gray-100 bg-white/60 px-8 py-4 flex items-center justify-between text-xs text-gray-400">
          <span>© 2025 Система управления пожарной безопасностью</span>
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.poehali.dev/projects/fc8972aa-4cef-4b81-a7f2-8d2dc556f071/files/logo-mchs.png"
              alt="МЧС"
              className="h-6 object-contain opacity-60"
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
