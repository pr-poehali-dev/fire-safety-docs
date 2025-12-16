import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MonitoringSection = () => {
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Icon name="Info" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">Интеграция с ОРИОНПРО</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Данный раздел предназначен для подключения оборудования АПС и АУПТ через программное обеспечение ОРИОНПРО производства НВП «Болид»
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Icon name="Info" size={16} className="mr-2" />
            Общая информация
          </TabsTrigger>
          <TabsTrigger value="features">
            <Icon name="Zap" size={16} className="mr-2" />
            Возможности
          </TabsTrigger>
          <TabsTrigger value="modules">
            <Icon name="Package" size={16} className="mr-2" />
            Модули системы
          </TabsTrigger>
          <TabsTrigger value="integration">
            <Icon name="Link" size={16} className="mr-2" />
            Интеграция
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-blue-500/10 flex items-center justify-center">
                  <Icon name="Monitor" className="text-blue-500" size={24} />
                </div>
                <div>
                  <CardTitle>АРМ «Орион Про»</CardTitle>
                  <CardDescription>Программное обеспечение для мониторинга и управления</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong>АРМ «Орион Про»</strong> — это профессиональное программное обеспечение производства 
                НВП «Болид», предназначенное для организации компьютерных рабочих мест с целью повышения 
                эффективности оперативного контроля и автоматизации управления системами пожарной безопасности.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Building2" size={20} className="text-primary" />
                    <h4 className="font-semibold">Производитель</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    АО НВП «Болид» — ведущий российский производитель систем безопасности с 1992 года
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Award" size={20} className="text-primary" />
                    <h4 className="font-semibold">Сертификация</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Имеет сертификаты соответствия ФСТЭК и транспортной безопасности
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Network" size={20} className="text-primary" />
                    <h4 className="font-semibold">Масштабируемость</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Объединяет до 127 локальных систем «Орион» одним модулем управления
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Users" size={20} className="text-primary" />
                    <h4 className="font-semibold">Рабочие места</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    До 63 оперативных задач могут работать одновременно в составе АРМ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Zap" size={20} />
                Ключевые возможности системы
              </CardTitle>
              <CardDescription>
                Функциональные преимущества АРМ «Орион Про»
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="Eye" size={16} className="text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Мониторинг в реальном времени</h4>
                    <p className="text-sm text-muted-foreground">
                      Непрерывный контроль состояния всех подключенных систем пожарной сигнализации, 
                      автоматического пожаротушения и противодымной вентиляции с мгновенным оповещением о событиях
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="Sliders" size={16} className="text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Централизованное управление</h4>
                    <p className="text-sm text-muted-foreground">
                      Единая точка управления всеми подсистемами безопасности с возможностью программирования 
                      сценариев автоматического реагирования на различные ситуации
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="MapPin" size={16} className="text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Территориально распределенные объекты</h4>
                    <p className="text-sm text-muted-foreground">
                      Построение единой системы безопасности для нескольких удаленных объектов 
                      с централизованным контролем и управлением через сеть
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="Video" size={16} className="text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Интеграция с видеонаблюдением</h4>
                    <p className="text-sm text-muted-foreground">
                      Поддержка IP-видеокамер и видеорегистраторов с автоматическим переключением 
                      на камеры при срабатывании пожарных извещателей
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="FileText" size={16} className="text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Генерация отчетов</h4>
                    <p className="text-sm text-muted-foreground">
                      Автоматическое формирование отчетов по событиям, конфигурации объекта, 
                      времени работы систем и действиям операторов для предоставления контролирующим органам
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="Puzzle" size={16} className="text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Модульная структура</h4>
                    <p className="text-sm text-muted-foreground">
                      Гибкая настройка каждого рабочего места путем выбора необходимых функциональных 
                      модулей из общего пакета программ — платите только за используемые возможности
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Package" size={20} />
                Основные модули АРМ «Орион Про»
              </CardTitle>
              <CardDescription>
                Программный комплекс состоит из набора специализированных модулей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-blue-500">Базовый</Badge>
                    <h4 className="font-semibold">Сервер «Орион Про»</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Передача информации из базы данных рабочим местам системы. Поставляется с ключом защиты. 
                    Обеспечивает синхронизацию данных между всеми компонентами системы.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-green-500">Управление</Badge>
                    <h4 className="font-semibold">Оперативная задача (исп. 4, 20, 127, 512)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ядро опроса приборов и устройств ИСО «Орион». Различные исполнения поддерживают 
                    от 4 до 512 охраняемых зон. Включает мониторинг событий, управление оборудованием 
                    и визуализацию состояния объекта на интерактивных планах.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-purple-500">Отображение</Badge>
                    <h4 className="font-semibold">Монитор «Орион Про»</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Рабочее место с функциями управления и отображения информации по сети. 
                    Позволяет создавать дополнительные пульты операторов без полного функционала оперативной задачи.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-orange-500">Видео</Badge>
                    <h4 className="font-semibold">Видеосистема «Орион Про»</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Отображение и запись видео с сетевых камер (до 63 штук), воспроизведение из архива, 
                    настраиваемый детектор движения, автоматическое переключение камер при тревогах.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-yellow-500">Отчеты</Badge>
                    <h4 className="font-semibold">Генератор отчетов «Орион Про»</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Формирование отчетов по событиям и конфигурации объекта для предоставления 
                    контролирующим органам, анализа работы систем и действий персонала.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-cyan-500">База данных</Badge>
                    <h4 className="font-semibold">Администратор базы данных «Орион Про»</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Инструменты для настройки, обслуживания и резервного копирования базы данных системы. 
                    Управление правами доступа пользователей и конфигурацией объектов.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-pink-500">Интеграция</Badge>
                    <h4 className="font-semibold">Модуль интеграции «Орион Про»</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Обеспечивает взаимодействие с внешними системами и сторонним оборудованием через 
                    стандартные протоколы обмена данными (OPC, Modbus и др.).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Link" size={20} />
                Подключение оборудования
              </CardTitle>
              <CardDescription>
                Совместимость с системами пожарной безопасности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Icon name="CheckCircle" className="h-4 w-4" />
                <AlertTitle>Полная совместимость</AlertTitle>
                <AlertDescription>
                  АРМ «Орион Про» совместим со всеми приборами интегрированной системы охраны (ИСО) «Орион» 
                  производства НВП «Болид»
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Cpu" size={18} />
                  Поддерживаемое оборудование АПС и АУПТ:
                </h4>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-500 mt-1 shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      <strong>Приборы АУПС:</strong> С2000-4, С2000-КДЛ, С2000-АСПТ, С2000-КПБ и другие контрольные панели
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-500 mt-1 shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      <strong>Адресные извещатели:</strong> ДИП-34А, ДИП-50, ИП 212/101-18-А1R, ИП 212/101-29-А1R
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-500 mt-1 shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      <strong>Системы СОУЭ:</strong> С2000-Ревун, РИП-12 исп.01, РИП-24 исп.01, пульты и оповещатели
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-500 mt-1 shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      <strong>АУПТ:</strong> С2000-АСПТ, модули контроля и управления пожаротушением
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-green-500 mt-1 shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      <strong>Противодымная вентиляция:</strong> модули управления вентиляцией, клапанами, дымоудалением
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Icon name="AlertTriangle" size={20} className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                      Требования к интеграции
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• Наличие лицензии на соответствующий модуль АРМ «Орион Про»</li>
                      <li>• Прокладка линий связи RS-485 или Ethernet до приборов</li>
                      <li>• Настройка адресов устройств в единой сети</li>
                      <li>• Конфигурирование приборов через ПО «Орион»</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Download" size={18} />
                  Полезные ссылки:
                </h4>
                <div className="space-y-2">
                  <a 
                    href="https://bolid.ru/production/orion/po-orion/po-arm/arm_orion_pro.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Icon name="ExternalLink" size={14} />
                    Официальная страница АРМ «Орион Про» на сайте Болид
                  </a>
                  <a 
                    href="https://bolid.ru/production/orion/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Icon name="ExternalLink" size={14} />
                    Каталог оборудования ИСО «Орион»
                  </a>
                  <a 
                    href="https://bolid.ru/support/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Icon name="ExternalLink" size={14} />
                    Техническая поддержка и документация
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={20} />
                Планируемая интеграция
              </CardTitle>
              <CardDescription>
                Следующие этапы подключения систем
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Подготовка инфраструктуры</h4>
                    <p className="text-sm text-muted-foreground">
                      Установка сервера АРМ «Орион Про», настройка сети, создание базы данных объекта
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Подключение приборов АУПС</h4>
                    <p className="text-sm text-muted-foreground">
                      Интеграция контрольных панелей пожарной сигнализации, извещателей, дымовых датчиков
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Интеграция систем АУПТ</h4>
                    <p className="text-sm text-muted-foreground">
                      Подключение модулей управления автоматическим пожаротушением, контроль состояния баллонов
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm font-semibold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Настройка мониторинга</h4>
                    <p className="text-sm text-muted-foreground">
                      Создание интерактивных планов, настройка сценариев оповещения, обучение операторов
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringSection;
