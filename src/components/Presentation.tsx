import { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Shield, FileText, CheckSquare, AlertTriangle, Users, BarChart3, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Presentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Система управления пожарной безопасностью",
      subtitle: "Комплексное решение для контроля и мониторинга противопожарных систем",
      icon: <Flame className="w-24 h-24 text-orange-500" />,
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Журнал эксплуатации систем",
      subtitle: "Учёт всех проверок и обслуживания противопожарных систем",
      icon: <FileText className="w-20 h-20 text-blue-500" />,
      gradient: "from-blue-500 to-cyan-600",
      features: [
        "9 типов систем защиты (АУПС, СОУЭ, АУПТ и др.)",
        "Регистрация всех проверок и неисправностей",
        "История обслуживания с фильтрацией",
        "Статусы: исправно/неисправно/в работе"
      ]
    },
    {
      title: "Чек-листы проверок",
      subtitle: "19 обязательных проверок для полного контроля",
      icon: <CheckSquare className="w-20 h-20 text-green-500" />,
      gradient: "from-green-500 to-emerald-600",
      features: [
        "Эвакуационные пути и выходы",
        "Первичные средства пожаротушения",
        "Электрооборудование и кабели",
        "Системы противопожарной защиты",
        "Документация и инструктажи"
      ]
    },
    {
      title: "Регистр пожарных инцидентов",
      subtitle: "Полный учёт всех происшествий и последствий",
      icon: <AlertTriangle className="w-20 h-20 text-red-500" />,
      gradient: "from-red-500 to-rose-600",
      features: [
        "Причины возгорания и последствия",
        "Площадь повреждения и пострадавшие",
        "Ущерб и принятые меры",
        "История всех инцидентов"
      ]
    },
    {
      title: "Тренировки и учебные эвакуации",
      subtitle: "Подготовка персонала к чрезвычайным ситуациям",
      icon: <Users className="w-20 h-20 text-purple-500" />,
      gradient: "from-purple-500 to-violet-600",
      features: [
        "Планирование учебных эвакуаций",
        "Учёт количества участников",
        "Оценка времени эвакуации",
        "Выявленные замечания и улучшения"
      ]
    },
    {
      title: "Оценка ПБ и риска",
      subtitle: "Онлайн-дашборд с аналитикой в реальном времени",
      icon: <BarChart3 className="w-20 h-20 text-indigo-500" />,
      gradient: "from-indigo-500 to-blue-600",
      features: [
        "Общая готовность объекта в процентах",
        "Статусы всех разделов (Отлично/Критично)",
        "Графики по системам защиты",
        "Экспорт PDF-отчётов с графиками"
      ]
    },
    {
      title: "Преимущества системы",
      subtitle: "Всё для контроля пожарной безопасности в одном месте",
      icon: <Shield className="w-20 h-20 text-teal-500" />,
      gradient: "from-teal-500 to-cyan-600",
      features: [
        "✅ Централизованное хранение данных",
        "✅ Онлайн-доступ из любой точки",
        "✅ Автоматические расчёты и аналитика",
        "✅ Соответствие требованиям МЧС",
        "✅ Экспорт отчётов в PDF"
      ]
    },
    {
      title: "База данных и надёжность",
      subtitle: "Все данные хранятся в защищённой базе PostgreSQL",
      icon: <Database className="w-20 h-20 text-slate-500" />,
      gradient: "from-slate-500 to-gray-600",
      features: [
        "Надёжное хранение всех записей",
        "Автоматическое резервное копирование",
        "Быстрый доступ к истории",
        "Защита от потери данных"
      ]
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className={`bg-gradient-to-r ${slide.gradient} p-12 text-white text-center`}>
            <div className="flex justify-center mb-6">
              {slide.icon}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{slide.title}</h1>
            <p className="text-xl md:text-2xl opacity-90">{slide.subtitle}</p>
          </div>

          <div className="p-12">
            {slide.features && (
              <ul className="space-y-4 text-lg">
                {slide.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className={`text-2xl font-bold bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}>
                      {index + 1}
                    </span>
                    <span className="text-slate-700 pt-1">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 border-t">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Назад
            </Button>

            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-gradient-to-r ' + slide.gradient + ' w-8'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Перейти к слайду ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={nextSlide}
              size="lg"
              className={`gap-2 bg-gradient-to-r ${slide.gradient} hover:opacity-90`}
            >
              Далее
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-center pb-4 text-slate-500 text-sm">
            Слайд {currentSlide + 1} из {slides.length}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Presentation;