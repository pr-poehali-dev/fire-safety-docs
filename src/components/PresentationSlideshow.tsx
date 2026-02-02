import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Slide {
  title: string;
  description: string;
  icon: string;
  color: string;
  screenshot: string;
}

const slides: Slide[] = [
  {
    title: 'Главная панель',
    description: 'Единое пространство для управления всеми аспектами пожарной безопасности объекта',
    icon: 'LayoutDashboard',
    color: 'from-blue-500 to-cyan-500',
    screenshot: 'dashboard'
  },
  {
    title: 'Профиль объекта',
    description: 'Управление данными организации и ответственных лиц',
    icon: 'User',
    color: 'from-purple-500 to-pink-500',
    screenshot: 'profile'
  },
  {
    title: 'Характеристика объекта',
    description: 'Детальная информация о техническом состоянии и системах безопасности',
    icon: 'Building',
    color: 'from-green-500 to-emerald-500',
    screenshot: 'characteristics'
  },
  {
    title: 'Журналы учета',
    description: 'Электронный учет всех мероприятий и событий пожарной безопасности',
    icon: 'BookOpen',
    color: 'from-orange-500 to-red-500',
    screenshot: 'journals'
  },
  {
    title: 'Документация',
    description: 'Централизованное хранилище всех нормативных документов и инструкций',
    icon: 'FileText',
    color: 'from-indigo-500 to-blue-500',
    screenshot: 'documentation'
  },
  {
    title: 'Чек-листы проверок',
    description: 'Систематические проверки и контроль состояния систем безопасности',
    icon: 'ClipboardCheck',
    color: 'from-teal-500 to-cyan-500',
    screenshot: 'checklists'
  },
  {
    title: 'Учения и инструктажи',
    description: 'Планирование и учет противопожарных мероприятий и обучения персонала',
    icon: 'Users',
    color: 'from-rose-500 to-pink-500',
    screenshot: 'drills'
  },
  {
    title: 'Оценка рисков',
    description: 'Анализ и управление пожарными рисками на объекте',
    icon: 'AlertTriangle',
    color: 'from-yellow-500 to-orange-500',
    screenshot: 'assessment'
  },
  {
    title: 'Мониторинг систем',
    description: 'Онлайн контроль работы всех систем пожарной безопасности',
    icon: 'Activity',
    color: 'from-cyan-500 to-blue-500',
    screenshot: 'monitoring'
  },
  {
    title: 'История пожаров',
    description: 'Учет и анализ всех пожарных происшествий',
    icon: 'Flame',
    color: 'from-red-500 to-orange-500',
    screenshot: 'fires'
  }
];

export default function PresentationSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isPlaying) {
      setProgress(0);
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 0;
          return prev + 1;
        });
      }, 50);

      interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
        setProgress(0);
      }, 5000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        <Card className="overflow-hidden shadow-2xl border-0">
          <div className={`bg-gradient-to-r ${slide.color} p-12 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <Icon name={slide.icon} size={48} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white/80 mb-1">
                    Слайд {currentSlide + 1} из {slides.length}
                  </div>
                  <h1 className="text-5xl font-bold">{slide.title}</h1>
                </div>
              </div>
              
              <p className="text-xl text-white/90 max-w-3xl leading-relaxed">
                {slide.description}
              </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-8">
            <div className="grid grid-cols-5 gap-3 mb-6">
              {slides.map((s, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setProgress(0);
                  }}
                  className={`p-3 rounded-lg transition-all ${
                    index === currentSlide
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon name={s.icon} size={20} className="mx-auto mb-1" />
                  <div className="text-xs font-medium truncate">{s.title}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrev}
                className="gap-2"
              >
                <Icon name="ChevronLeft" size={20} />
                Назад
              </Button>

              <Button
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`gap-2 min-w-32 ${
                  isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
                {isPlaying ? 'Пауза' : 'Воспроизвести'}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleNext}
                className="gap-2"
              >
                Вперед
                <Icon name="ChevronRight" size={20} />
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600">
              <Icon name="Info" size={16} />
              <span>Автоматическая смена слайдов каждые 5 секунд</span>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            size="lg"
            className="text-white hover:text-white hover:bg-white/10 gap-2"
            onClick={() => window.location.href = '/'}
          >
            <Icon name="ArrowLeft" size={20} />
            Вернуться к приложению
          </Button>
        </div>
      </div>
    </div>
  );
}
