import { useState, useEffect } from 'react';
import { ChevronDown, Flame, FileText, CheckSquare, Droplet, Search, Calculator, Monitor, Building2, Shield, FileCheck, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '@/components/LoadingIndicator';

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Система управления пожарной безопасностью",
      subtitle: "Комплексное решение для контроля и мониторинга противопожарных систем",
      icon: <Flame className="w-32 h-32 text-orange-500 animate-pulse" />,
      gradient: "from-orange-500 via-red-500 to-rose-600",
      image: "https://cdn.poehali.dev/projects/fc8972aa-4cef-4b81-a7f2-8d2dc556f071/files/28ff012c-fee8-4cde-b18c-bff17093ef68.jpg",
      description: "Всё для управления пожарной безопасностью в одном месте"
    },
    {
      title: "Характеристика объекта",
      subtitle: "Полная информация о здании и его параметрах",
      icon: <Building2 className="w-24 h-24 text-blue-500" />,
      gradient: "from-blue-500 to-cyan-600",
      features: [
        "📋 Функциональный класс и дата ввода в эксплуатацию",
        "🔥 Степень огнестойкости и пожарная опасность",
        "📐 Площадь, этажность, высота, объем здания",
        "⚠️ Категории помещений и рабочих мест",
        "🛡️ Реквизиты всех систем защиты"
      ]
    },
    {
      title: "Журнал эксплуатации систем",
      subtitle: "Учёт всех проверок и обслуживания противопожарных систем",
      icon: <FileText className="w-24 h-24 text-green-500" />,
      gradient: "from-green-500 to-emerald-600",
      image: "https://cdn.poehali.dev/projects/fc8972aa-4cef-4b81-a7f2-8d2dc556f071/files/1fb8fdab-c6b7-432b-ae13-e31ab63c6ab6.jpg",
      features: [
        "🚨 АУПС - Автоматическая пожарная сигнализация",
        "📢 СОУЭ - Система оповещения и эвакуации",
        "💨 Противодымная вентиляция",
        "💧 АУПТ - Автоматическое пожаротушение",
        "🧯 Учёт огнетушителей и покрывал"
      ]
    },
    {
      title: "Чек-листы проверок",
      subtitle: "19 обязательных проверок для полного контроля",
      icon: <CheckSquare className="w-24 h-24 text-purple-500" />,
      gradient: "from-purple-500 to-violet-600",
      features: [
        "🚪 Эвакуационные пути и выходы",
        "🧯 Первичные средства пожаротушения",
        "⚡ Электрооборудование и кабельные линии",
        "🛡️ Системы противопожарной защиты",
        "📚 Документация и инструктажи персонала"
      ]
    },
    {
      title: "Регистр пожарных инцидентов",
      subtitle: "Полный учёт всех происшествий и последствий",
      icon: <Flame className="w-24 h-24 text-red-500" />,
      gradient: "from-red-500 to-rose-600",
      image: "https://cdn.poehali.dev/projects/fc8972aa-4cef-4b81-a7f2-8d2dc556f071/files/5112a6ed-6c29-4458-887c-87e5eee668b1.jpg",
      features: [
        "📅 Дата и время каждого происшествия",
        "🔥 Причины возгорания и описание",
        "💰 Оценка материального ущерба",
        "👥 Количество пострадавших",
        "📋 Акты расследования и выводы"
      ]
    },
    {
      title: "Мониторинг и управление АРМ",
      subtitle: "Автоматизированное рабочее место диспетчера",
      icon: <Monitor className="w-24 h-24 text-indigo-500" />,
      gradient: "from-indigo-500 to-blue-600",
      features: [
        "🖥️ Онлайн-мониторинг всех систем защиты",
        "📝 Журнал событий и тревожных сообщений",
        "🎨 Визуализация статусов оборудования",
        "⚡ Быстрый доступ к критичной информации",
        "🔔 Уведомления о неисправностях",
        "📊 Статистика и дашборд инцидентов"
      ]
    },
    {
      title: "Расчеты категорий помещений",
      subtitle: "Автоматический расчёт категорий взрывопожарной опасности",
      icon: <Calculator className="w-24 h-24 text-amber-500" />,
      gradient: "from-amber-500 to-orange-600",
      features: [
        "🔢 Расчёт категорий А, Б, В1-В4, Г, Д",
        "🧪 Учёт горючих веществ и материалов",
        "💥 Определение избыточного давления взрыва",
        "🔥 Расчёт удельной пожарной нагрузки",
        "📄 Экспорт результатов в документы"
      ]
    },
    {
      title: "Проверки и аудиты объекта",
      subtitle: "Планирование и учёт проверок МЧС и внутренних аудитов",
      icon: <Search className="w-24 h-24 text-teal-500" />,
      gradient: "from-teal-500 to-cyan-600",
      features: [
        "📅 График плановых проверок МЧС",
        "⚠️ Внеплановые проверки и инспекции",
        "🔍 Внутренние аудиты безопасности",
        "📋 Выявленные нарушения и план устранения",
        "⏱️ Контроль сроков исполнения предписаний"
      ]
    },
    {
      title: "Декларация и страхование",
      subtitle: "Управление декларацией ПБ и страховыми полисами",
      icon: <FileCheck className="w-24 h-24 text-rose-500" />,
      gradient: "from-rose-500 to-pink-600",
      features: [
        "📜 Регистрация декларации пожарной безопасности",
        "⏰ Контроль сроков действия и продления",
        "🛡️ Учёт страховых полисов объекта",
        "💼 Страховые случаи и выплаты",
        "🔔 Автоматические уведомления об окончании сроков"
      ]
    },
    {
      title: "Оценка ПБ и риск-анализ",
      subtitle: "Онлайн-дашборд с аналитикой в реальном времени",
      icon: <BarChart3 className="w-24 h-24 text-emerald-500" />,
      gradient: "from-emerald-500 to-green-600",
      features: [
        "📊 Общая готовность объекта в процентах",
        "🎯 Статусы всех разделов (Отлично/Удовлетворительно/Критично)",
        "📈 Графики и диаграммы по системам защиты",
        "📉 Динамика изменений показателей за период",
        "📑 Экспорт PDF-отчётов с графиками"
      ]
    },
    {
      title: "Учебные тренировки",
      subtitle: "Планирование и проведение учебных эвакуаций",
      icon: <Users className="w-24 h-24 text-blue-500" />,
      gradient: "from-blue-500 to-indigo-600",
      features: [
        "📅 График плановых учебных тренировок",
        "👥 Учёт количества участников эвакуации",
        "⏱️ Фиксация времени эвакуации по зданиям",
        "📝 Выявленные замечания и недостатки",
        "✅ План мероприятий по улучшению"
      ]
    },
    {
      title: "Готовы начать работу?",
      subtitle: "Все инструменты для управления пожарной безопасностью в одном месте",
      icon: <Shield className="w-24 h-24 text-orange-500 animate-bounce" />,
      gradient: "from-orange-500 to-red-600",
      features: [
        "✅ Централизованное хранение всех данных",
        "✅ Онлайн-доступ из любой точки мира",
        "✅ Автоматические расчёты и аналитика",
        "✅ Соответствие требованиям МЧС России",
        "✅ Экспорт отчётов в PDF формате",
        "✅ Надёжная база данных PostgreSQL"
      ]
    }
  ];

  const scrollToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    
    const element = document.getElementById(`slide-${index}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => setIsAnimating(false), 800);
  };

  const handleScroll = () => {
    const slides = document.querySelectorAll('.slide-section');
    let newSlide = 0;
    
    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
        newSlide = index;
      }
    });
    
    if (newSlide !== currentSlide && !isAnimating) {
      setCurrentSlide(newSlide);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSlide, isAnimating]);

  const handleEnterSystem = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/app');
    }, 300);
  };

  return (
    <>
      {isTransitioning && <LoadingIndicator />}
    <div className="relative">
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-3 h-8 bg-gradient-to-b from-orange-500 to-red-500'
                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Перейти к слайду ${index + 1}`}
          />
        ))}
      </div>

      {slides.map((slide, index) => {
        const isLastSlide = index === slides.length - 1;
        
        return (
          <section
            key={index}
            id={`slide-${index}`}
            className="slide-section min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${
                index % 2 === 0 
                  ? 'rgb(15 23 42) 0%, rgb(30 41 59) 50%, rgb(51 65 85) 100%'
                  : 'rgb(17 24 39) 0%, rgb(31 41 55) 50%, rgb(55 65 81) 100%'
              })`
            }}
          >
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
              <Card className={`bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden transform transition-all duration-700 ${
                currentSlide === index ? 'scale-100 opacity-100' : 'scale-95 opacity-70'
              }`}>
                <div className={`bg-gradient-to-r ${slide.gradient} p-8 md:p-16 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-6 animate-float">
                      {slide.icon}
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-center animate-fade-in">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-2xl opacity-90 text-center animate-fade-in-delay">
                      {slide.subtitle}
                    </p>
                    {slide.description && (
                      <p className="text-base md:text-xl opacity-75 text-center mt-4 animate-fade-in-delay-2">
                        {slide.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-8 md:p-12">
                  {slide.image && !slide.features && (
                    <div className="mb-6 overflow-hidden rounded-2xl shadow-lg animate-slide-up">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}

                  {slide.features && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {slide.image && (
                        <div className="overflow-hidden rounded-2xl shadow-lg animate-slide-right">
                          <img 
                            src={slide.image} 
                            alt={slide.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      )}
                      <ul className={`space-y-4 text-lg ${slide.image ? '' : 'md:col-span-2'}`}>
                        {slide.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-slate-100 hover:to-slate-200 transition-all duration-300 shadow-sm hover:shadow-md animate-slide-up"
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            <span className="text-2xl flex-shrink-0">{feature.substring(0, 2)}</span>
                            <span className="text-slate-700 pt-1 leading-relaxed">
                              {feature.substring(2).trim()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isLastSlide && (
                    <div className="mt-12 text-center animate-bounce-in">
                      <Button
                        onClick={handleEnterSystem}
                        size="lg"
                        className={`bg-gradient-to-r ${slide.gradient} hover:opacity-90 text-white px-12 py-8 text-2xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105`}
                      >
                        🚀 Войти в систему
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-center pb-6 text-slate-400 text-sm">
                  Слайд {index + 1} из {slides.length}
                </div>
              </Card>

              {index < slides.length - 1 && (
                <div className="text-center mt-8 animate-bounce">
                  <ChevronDown 
                    className="w-12 h-12 text-white/50 mx-auto cursor-pointer hover:text-white/80 transition-colors"
                    onClick={() => scrollToSlide(index + 1)}
                  />
                </div>
              )}
            </div>
          </section>
        );
      })}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.5); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s backwards;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s backwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-right {
          animation: slide-right 0.6s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
    </>
  );
};

export default Index;