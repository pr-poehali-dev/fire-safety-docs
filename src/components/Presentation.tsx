import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Slide {
  title: string;
  subtitle: string;
  iconName: string;
  gradient: string;
  features?: string[];
  stats?: { label: string; value: string }[];
}

const Presentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides: Slide[] = [
    {
      title: "Система управления пожарной безопасностью",
      subtitle: "Комплексное веб-приложение для контроля, мониторинга и документирования противопожарных систем объекта защиты",
      iconName: "Flame",
      gradient: "from-orange-500 to-red-600",
      stats: [
        { label: "Модулей", value: "16" },
        { label: "Разделов журнала", value: "15" },
        { label: "Пунктов чек-листа", value: "19" },
        { label: "Таблиц БД", value: "9" },
      ],
    },
    {
      title: "Личный кабинет и профиль объекта",
      subtitle: "Управление данными специалиста и характеристиками объекта защиты",
      iconName: "UserCircle",
      gradient: "from-blue-500 to-cyan-600",
      features: [
        "ФИО, должность, образование, квалификация специалиста",
        "Удостоверения и сертификаты с отслеживанием сроков действия",
        "Характеристика объекта: адрес, площадь, этажность, высота",
        "Класс функциональной пожарной опасности и степень огнестойкости",
        "Категория взрывопожарной опасности помещений",
        "Фото объекта и фото профиля",
      ],
    },
    {
      title: "Журнал эксплуатации систем",
      subtitle: "15 разделов по всем типам противопожарных систем",
      iconName: "ClipboardList",
      gradient: "from-amber-500 to-orange-600",
      features: [
        "I–V: АУПС, СОУЭ, АУПТ, ВПВ, противодымная вентиляция",
        "VI–X: огнезадерживающие клапаны, двери, освещение, спасение, огнетушители",
        "XI–XV: молниезащита, водоснабжение, электроустановки, газ, лестницы",
        "Каждая запись: дата, тип, описание, исполнитель, статус",
        "Фильтрация по типу: проверка / неисправность / обслуживание",
        "Полная история обслуживания каждой системы",
      ],
    },
    {
      title: "Чек-листы проверок",
      subtitle: "19 обязательных пунктов для полного контроля ПБ объекта",
      iconName: "CheckSquare",
      gradient: "from-green-500 to-emerald-600",
      features: [
        "Эвакуационные пути и выходы",
        "Первичные средства пожаротушения",
        "Электрооборудование и кабельные линии",
        "Системы противопожарной защиты",
        "Документация и инструктажи",
        "Статусы: выполнено / не выполнено / не применимо",
      ],
    },
    {
      title: "Регистр пожарных инцидентов",
      subtitle: "Полный учёт происшествий с дашбордом статистики",
      iconName: "Flame",
      gradient: "from-red-500 to-rose-600",
      features: [
        "Дата, место, площадь пожара, время начала и ликвидации",
        "Причины возгорания и установленные последствия",
        "Количество пострадавших и материальный ущерб",
        "Длительность простоя производства",
        "Статусы: расследование / ликвидирован / закрыт",
        "Дашборд: графики трендов, статистика по периодам",
      ],
    },
    {
      title: "Тренировки и учебные эвакуации",
      subtitle: "Подготовка персонала к чрезвычайным ситуациям",
      iconName: "Users",
      gradient: "from-purple-500 to-violet-600",
      features: [
        "Планирование учебных эвакуаций по графику",
        "Учёт количества участников тренировок",
        "Фиксация времени эвакуации и сценария",
        "Выявленные замечания и рекомендации",
        "Оценка результатов и история тренировок",
      ],
    },
    {
      title: "Оценка ПБ и риск-анализ",
      subtitle: "Аналитический дашборд с графиками в реальном времени",
      iconName: "BarChart3",
      gradient: "from-indigo-500 to-blue-600",
      features: [
        "Общий балл готовности объекта в процентах",
        "Оценка по каждому разделу: отлично / хорошо / критично",
        "Radar Chart — визуализация по направлениям",
        "Bar Chart — сравнение показателей систем",
        "Экспорт PDF-отчёта с графиками и выводами",
      ],
    },
    {
      title: "Документация и нормативная база",
      subtitle: "7 подразделов для полного документооборота",
      iconName: "FileText",
      gradient: "from-violet-500 to-purple-600",
      features: [
        "Приказы и распоряжения по ПБ",
        "Инструкции о мерах пожарной безопасности",
        "Планы эвакуации и их актуализация",
        "Журналы инструктажей по ПБ",
        "Акты проверок и проектная документация",
        "Договоры на обслуживание систем",
      ],
    },
    {
      title: "Расчёты, декларация и страхование",
      subtitle: "Специализированные модули для оформления документов",
      iconName: "Calculator",
      gradient: "from-pink-500 to-rose-600",
      features: [
        "Расчёт категории взрывопожарной опасности (А, Б, В1–В4, Г, Д)",
        "Формирование декларации пожарной безопасности",
        "Данные о страховании объекта: полисы, сроки, покрытие",
        "Исполнительная документация по системам ПБ",
        "Проверки и аудиты: плановые/внеплановые, предписания",
      ],
    },
    {
      title: "Мониторинг, экспорт и уведомления",
      subtitle: "Инструменты оперативного управления",
      iconName: "Monitor",
      gradient: "from-cyan-500 to-teal-600",
      features: [
        "АРМ: мониторинг систем защиты в реальном времени",
        "Статусы систем: АУПС 96%, СОУЭ 98%, АУПТ 87%",
        "Экспорт данных в Excel / CSV",
        "Уведомления о сроках проверок и событиях",
        "Чат-помощник и история действий",
      ],
    },
    {
      title: "Технический стек",
      subtitle: "Современные технологии для надёжной работы",
      iconName: "Code2",
      gradient: "from-slate-600 to-gray-700",
      features: [
        "Frontend: React 18 + TypeScript + Vite",
        "UI: Tailwind CSS + Shadcn/UI + Recharts",
        "Backend: Python 3.11 (Cloud Functions)",
        "База данных: PostgreSQL (9 таблиц)",
        "Экспорт: html2canvas + jsPDF",
        "Хостинг: облачная платформа poehali.dev",
      ],
    },
    {
      title: "Преимущества системы",
      subtitle: "Всё для контроля пожарной безопасности в одном месте",
      iconName: "ShieldCheck",
      gradient: "from-teal-500 to-emerald-600",
      features: [
        "Централизованное хранение всей документации ПБ",
        "Онлайн-доступ из любой точки через браузер",
        "Автоматические расчёты и аналитика рисков",
        "Соответствие требованиям законодательства РФ и МЧС",
        "Адаптивная вёрстка для мобильных устройств",
        "Экспорт отчётов в PDF, Excel, CSV",
      ],
    },
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
        <div className="flex items-center justify-between mb-4 px-2">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
          >
            <Icon name="ArrowLeft" size={18} />
            На главную
          </Button>
          <Button
            onClick={() => navigate('/technical-spec')}
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
          >
            <Icon name="FileText" size={18} />
            Техническое задание
          </Button>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className={`bg-gradient-to-r ${slide.gradient} p-10 md:p-12 text-white text-center relative`}>
            <div className="flex justify-center mb-5">
              <Icon name={slide.iconName} size={72} className="text-white/90" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3">{slide.title}</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">{slide.subtitle}</p>

            {slide.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
                {slide.stats.map((stat) => (
                  <div key={stat.label} className="bg-white/15 backdrop-blur rounded-xl p-4">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-80">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-8 md:p-12">
            {slide.features && (
              <ul className="space-y-3 text-lg">
                {slide.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className={`text-xl font-bold bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent min-w-[28px]`}>
                      {index + 1}
                    </span>
                    <span className="text-slate-700 pt-0.5">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between p-5 bg-slate-50 border-t">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Icon name="ChevronLeft" size={20} />
              Назад
            </Button>

            <div className="flex gap-1.5 flex-wrap justify-center max-w-md">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-gradient-to-r ' + slide.gradient + ' w-7'
                      : 'bg-slate-300 hover:bg-slate-400 w-2.5'
                  }`}
                  aria-label={`Слайд ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={nextSlide}
              size="lg"
              className={`gap-2 bg-gradient-to-r ${slide.gradient} hover:opacity-90`}
            >
              Далее
              <Icon name="ChevronRight" size={20} />
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
