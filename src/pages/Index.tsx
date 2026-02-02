import { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, FileText, CheckSquare, Droplet, Search, Calculator, Monitor, Building2, Shield, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Система управления пожарной безопасностью",
      subtitle: "Комплексное решение для контроля и мониторинга противопожарных систем",
      icon: <Flame className="w-24 h-24 text-orange-500" />,
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Характеристика объекта",
      subtitle: "Полная информация о здании и его параметрах",
      icon: <Building2 className="w-20 h-20 text-blue-500" />,
      gradient: "from-blue-500 to-cyan-600",
      features: [
        "Функциональный класс и дата ввода",
        "Степень огнестойкости и конструктивная пожарная опасность",
        "Площадь, этажность, высота, объем здания",
        "Категории помещений и рабочих мест",
        "Реквизиты систем защиты"
      ]
    },
    {
      title: "Журнал эксплуатации систем",
      subtitle: "Учёт всех проверок и обслуживания противопожарных систем",
      icon: <FileText className="w-20 h-20 text-green-500" />,
      gradient: "from-green-500 to-emerald-600",
      features: [
        "9 типов систем защиты (АУПС, СОУЭ, АУПТ и др.)",
        "Регистрация всех проверок и неисправностей",
        "История обслуживания с фильтрацией",
        "Статусы: исправно/неисправно/в работе",
        "Учёт огнетушителей и покрывал"
      ]
    },
    {
      title: "Чек-листы проверок",
      subtitle: "19 обязательных проверок для полного контроля",
      icon: <CheckSquare className="w-20 h-20 text-purple-500" />,
      gradient: "from-purple-500 to-violet-600",
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
      icon: <Flame className="w-20 h-20 text-red-500" />,
      gradient: "from-red-500 to-rose-600",
      features: [
        "Причины возгорания и последствия",
        "Площадь повреждения и пострадавшие",
        "Материальный ущерб",
        "Принятые меры и выводы",
        "Статистика и дашборд инцидентов"
      ]
    },
    {
      title: "Мониторинг и управление АРМ",
      subtitle: "Автоматизированное рабочее место диспетчера",
      icon: <Monitor className="w-20 h-20 text-indigo-500" />,
      gradient: "from-indigo-500 to-blue-600",
      features: [
        "Онлайн-мониторинг всех систем защиты",
        "Журнал событий и тревог",
        "Визуализация статусов оборудования",
        "Быстрый доступ к критичной информации",
        "Уведомления о неисправностях"
      ]
    },
    {
      title: "Расчеты категорий помещений",
      subtitle: "Автоматический расчёт категорий взрывопожарной опасности",
      icon: <Calculator className="w-20 h-20 text-amber-500" />,
      gradient: "from-amber-500 to-orange-600",
      features: [
        "Расчёт категорий А, Б, В1-В4, Г, Д",
        "Учёт горючих веществ и материалов",
        "Определение избыточного давления взрыва",
        "Расчёт пожарной нагрузки",
        "Экспорт результатов расчёта"
      ]
    },
    {
      title: "Проверки и аудиты объекта",
      subtitle: "Планирование и учёт проверок МЧС и внутренних аудитов",
      icon: <Search className="w-20 h-20 text-teal-500" />,
      gradient: "from-teal-500 to-cyan-600",
      features: [
        "График плановых проверок",
        "Внеплановые проверки МЧС",
        "Внутренние аудиты безопасности",
        "Выявленные нарушения и устранение",
        "Сроки исполнения предписаний"
      ]
    },
    {
      title: "Декларация и страхование",
      subtitle: "Управление декларацией ПБ и страховыми полисами",
      icon: <FileCheck className="w-20 h-20 text-rose-500" />,
      gradient: "from-rose-500 to-pink-600",
      features: [
        "Регистрация декларации ПБ",
        "Сроки действия и продления",
        "Страховые полисы объекта",
        "Страховые случаи и выплаты",
        "Уведомления об окончании сроков"
      ]
    },
    {
      title: "Оценка ПБ и риск-анализ",
      subtitle: "Онлайн-дашборд с аналитикой в реальном времени",
      icon: <Shield className="w-20 h-20 text-emerald-500" />,
      gradient: "from-emerald-500 to-green-600",
      features: [
        "Общая готовность объекта в процентах",
        "Статусы всех разделов (Отлично/Критично)",
        "Графики по системам защиты",
        "Динамика изменений за период",
        "Экспорт PDF-отчётов с графиками"
      ]
    },
    {
      title: "Учебные тренировки",
      subtitle: "Планирование и проведение учебных эвакуаций",
      icon: <Droplet className="w-20 h-20 text-blue-500" />,
      gradient: "from-blue-500 to-indigo-600",
      features: [
        "График плановых тренировок",
        "Количество участников эвакуации",
        "Время эвакуации по зданиям",
        "Выявленные замечания",
        "Меры по улучшению"
      ]
    },
    {
      title: "Готовы начать работу?",
      subtitle: "Все инструменты для управления пожарной безопасностью в одном месте",
      icon: <Flame className="w-20 h-20 text-orange-500" />,
      gradient: "from-orange-500 to-red-600",
      features: [
        "✅ Централизованное хранение данных",
        "✅ Онлайн-доступ из любой точки",
        "✅ Автоматические расчёты и аналитика",
        "✅ Соответствие требованиям МЧС",
        "✅ Экспорт отчётов в PDF",
        "✅ База данных PostgreSQL"
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

  const handleEnterSystem = () => {
    navigate('/app');
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

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

          <div className="p-12 min-h-[400px]">
            {slide.features && (
              <ul className="space-y-4 text-lg">
                {slide.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className={`text-2xl font-bold bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}>
                      {feature.startsWith('✅') ? '' : index + 1}
                    </span>
                    <span className="text-slate-700 pt-1">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {isLastSlide && (
              <div className="mt-8 text-center">
                <Button
                  onClick={handleEnterSystem}
                  size="lg"
                  className={`bg-gradient-to-r ${slide.gradient} hover:opacity-90 text-white px-8 py-6 text-xl`}
                >
                  Войти в систему →
                </Button>
              </div>
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

export default Index;