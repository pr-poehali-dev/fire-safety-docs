import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

const FAQSection = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="instructions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="instructions">
            <Icon name="BookOpen" size={16} className="mr-2" />
            Инструкция по заполнению
          </TabsTrigger>
          <TabsTrigger value="faq">
            <Icon name="HelpCircle" size={16} className="mr-2" />
            Часто задаваемые вопросы
          </TabsTrigger>
          <TabsTrigger value="support">
            <Icon name="Headphones" size={16} className="mr-2" />
            Техническая поддержка
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BookOpen" size={20} />
                Руководство по использованию системы
              </CardTitle>
              <CardDescription>
                Пошаговые инструкции для эффективной работы с платформой
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Шаг 1</Badge>
                      <span>Характеристики объекта</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-muted-foreground">
                    <p>Начните с заполнения основных характеристик объекта защиты:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Наименование:</strong> Введите полное название объекта</li>
                      <li><strong>Класс функциональной пожарной опасности:</strong> Выберите класс по СП 112.13330.2011 (например, Ф1.1, Ф2.1, Ф3.1)</li>
                      <li><strong>Дата ввода в эксплуатацию:</strong> Укажите дату начала работы объекта</li>
                      <li><strong>Адрес:</strong> Введите полный юридический адрес</li>
                      <li><strong>Степень огнестойкости:</strong> Укажите степень (I, II, III, IV, V) согласно проектной документации</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Шаг 2</Badge>
                      <span>Работа с журналами</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-muted-foreground">
                    <p>Ведите записи в соответствующих разделах журнала эксплуатации:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>АУПС:</strong> Заполните параметры установки (адресная/безадресная), дату ввода. Добавляйте записи о проверках и работах</li>
                      <li><strong>СОУЭ:</strong> Укажите тип системы (1-5), ведите учет проверок оповещения</li>
                      <li><strong>Пожаротушение:</strong> Документируйте проверки автоматических систем пожаротушения</li>
                      <li><strong>Каждая запись должна содержать:</strong> дату, место, вид работ, результат, ответственное лицо</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Шаг 3</Badge>
                      <span>Документация и файлы</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-muted-foreground">
                    <p>Загружайте и систематизируйте документы:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Используйте раздел <strong>"Документация"</strong> для нормативных актов, приказов, инструкций</li>
                      <li><strong>"Исполнительная документация"</strong> — для проектов, актов, паспортов систем</li>
                      <li>Поддерживаемые форматы: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</li>
                      <li>Рекомендуется использовать понятные названия файлов с указанием даты</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Шаг 4</Badge>
                      <span>Чек-лист и контроль</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-muted-foreground">
                    <p>Используйте чек-лист для систематического контроля:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Отмечайте выполнение каждого пункта проверки</li>
                      <li>Устанавливайте напоминания для периодических задач</li>
                      <li>Система автоматически рассчитывает процент выполнения</li>
                      <li>Используйте раздел "Уведомления" для отслеживания сроков</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Шаг 5</Badge>
                      <span>Экспорт данных</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-muted-foreground">
                    <p>Формируйте отчеты для проверяющих органов:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Используйте функцию <strong>"Экспорт в Excel"</strong> для выгрузки журналов</li>
                      <li>Выбирайте нужные разделы и периоды</li>
                      <li>Файлы формируются в соответствии с требованиями нормативной документации</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="HelpCircle" size={20} />
                Часто задаваемые вопросы
              </CardTitle>
              <CardDescription>
                Ответы на популярные вопросы пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>
                    Как часто нужно заполнять журналы эксплуатации?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>Периодичность зависит от типа системы и нормативных требований:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li><strong>АУПС и СОУЭ:</strong> ежемесячно (визуальный осмотр), ежеквартально (техническое обслуживание)</li>
                      <li><strong>Системы пожаротушения:</strong> ежемесячно (внешний осмотр), ежегодно (полная проверка)</li>
                      <li><strong>Противодымная вентиляция:</strong> ежеквартально</li>
                      <li><strong>Первичные средства:</strong> не реже 1 раза в 10 дней</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2">
                  <AccordionTrigger>
                    Что делать, если я допустил ошибку в записи?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>В системе предусмотрено редактирование записей:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>Найдите нужную запись в соответствующем разделе журнала</li>
                      <li>Нажмите кнопку редактирования (иконка карандаша)</li>
                      <li>Внесите исправления и сохраните</li>
                      <li>Система автоматически зафиксирует дату последнего изменения</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3">
                  <AccordionTrigger>
                    Как добавить новую систему противопожарной защиты?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>Для добавления новой системы:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>Перейдите в раздел "Журнал эксплуатации систем"</li>
                      <li>Выберите нужный тип системы из подразделов (I-VII)</li>
                      <li>Заполните шапку раздела: тип установки, дату ввода в эксплуатацию</li>
                      <li>Начните добавлять записи о работах и проверках</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-4">
                  <AccordionTrigger>
                    Можно ли работать с системой без подключения к интернету?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>Нет, система работает только при наличии интернет-соединения, так как:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>Данные хранятся в облачной базе данных для обеспечения безопасности</li>
                      <li>Гарантируется синхронизация между устройствами</li>
                      <li>Автоматически создаются резервные копии</li>
                      <li>Обеспечивается доступ для проверяющих органов</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-5">
                  <AccordionTrigger>
                    Как настроить уведомления о предстоящих проверках?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>Настройка уведомлений:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>Откройте раздел "Уведомления и напоминания"</li>
                      <li>Нажмите "Добавить напоминание"</li>
                      <li>Выберите тип события (проверка АУПС, ТО, плановая проверка)</li>
                      <li>Укажите дату и время</li>
                      <li>Система отправит уведомление за указанный срок</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-6">
                  <AccordionTrigger>
                    Какие форматы файлов можно загружать?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>Поддерживаемые форматы документов:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li><strong>Документы:</strong> PDF, DOC, DOCX</li>
                      <li><strong>Таблицы:</strong> XLS, XLSX</li>
                      <li><strong>Изображения:</strong> JPG, PNG, BMP</li>
                      <li><strong>Максимальный размер файла:</strong> 10 МБ</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-7">
                  <AccordionTrigger>
                    Как экспортировать данные для проверяющих органов?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>Для формирования отчета:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>Перейдите в раздел "Экспорт данных в Excel"</li>
                      <li>Выберите нужные разделы журнала (можно несколько)</li>
                      <li>Укажите период (за месяц, квартал, год)</li>
                      <li>Нажмите "Экспортировать"</li>
                      <li>Система сформирует файл Excel с полной информацией</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Headphones" size={20} />
                Техническая поддержка
              </CardTitle>
              <CardDescription>
                Свяжитесь с нами для получения помощи
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon name="User" size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Разработчик системы</h3>
                    <p className="text-muted-foreground mb-3">
                      Ответственный за разработку и поддержку платформы цифровизации пожарной безопасности
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon name="User" size={16} className="text-muted-foreground" />
                        <span className="font-medium">Бикбов Ильяс Хамматович</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Mail" size={16} className="text-muted-foreground" />
                        <a 
                          href="mailto:iliyas.bikbov@rusal.com" 
                          className="text-primary hover:underline"
                        >
                          iliyas.bikbov@rusal.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Icon name="MessageSquare" size={18} />
                  Как получить помощь
                </h4>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Используйте всплывающий помощник в правом нижнем углу экрана для быстрых вопросов</li>
                  <li>Отправьте email с описанием проблемы на указанный адрес</li>
                  <li>Приложите скриншоты, если это поможет объяснить ситуацию</li>
                  <li>Среднее время ответа: 1-2 рабочих дня</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Icon name="AlertCircle" size={18} />
                  При обращении укажите
                </h4>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Название объекта</li>
                  <li>Раздел системы, в котором возникла проблема</li>
                  <li>Подробное описание ошибки или вопроса</li>
                  <li>Время возникновения проблемы</li>
                  <li>Используемый браузер и устройство</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Рабочее время поддержки
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Понедельник - Пятница: 9:00 - 18:00 (МСК)
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

export default FAQSection;
