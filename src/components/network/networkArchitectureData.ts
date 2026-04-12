export interface FirewallRule {
  id: string;
  direction: string;
  source: string;
  srcPort: string;
  dstPort: string;
  protocol: string;
  destination: string;
  action: string;
  responsible: string;
  justification: string;
}

export interface InteractionRow {
  from: string;
  port: string;
  protocol: string;
  to: string;
  dataType: string;
  frequency: string;
  classification: string;
}

export interface NetworkZone {
  zone: string;
  color: string;
  components: string[];
}

export const INBOUND_RULES: FirewallRule[] = [
  {
    id: 'IN-01',
    direction: 'Входящее',
    source: 'Пользователи (Интернет)',
    srcPort: '*',
    dstPort: '443',
    protocol: 'TCP/TLS 1.3',
    destination: 'Веб-приложение (SPA)',
    action: 'ALLOW',
    responsible: 'Администратор ИБ',
    justification: 'Доступ к веб-интерфейсу системы пожарной безопасности. Единственная точка входа для пользователей.',
  },
  {
    id: 'IN-02',
    direction: 'Входящее',
    source: 'Администраторы (VPN)',
    srcPort: '*',
    dstPort: '22',
    protocol: 'TCP/SSH',
    destination: 'Сервер управления',
    action: 'ALLOW',
    responsible: 'Системный администратор',
    justification: 'Административный доступ по SSH с аутентификацией по ключу. Только из VPN-сети администраторов.',
  },
  {
    id: 'IN-03',
    direction: 'Входящее',
    source: 'Любой источник',
    srcPort: '*',
    dstPort: '80',
    protocol: 'TCP/HTTP',
    destination: 'Веб-приложение',
    action: 'REDIRECT→443',
    responsible: 'Администратор ИБ',
    justification: 'Перенаправление HTTP→HTTPS. Гарантия шифрования всех соединений.',
  },
  {
    id: 'IN-04',
    direction: 'Входящее',
    source: 'Любой источник',
    srcPort: '*',
    dstPort: '*',
    protocol: 'Любой',
    destination: 'Все серверы',
    action: 'DENY',
    responsible: 'Администратор ИБ',
    justification: 'Запрет по умолчанию. Все не перечисленные выше входящие соединения блокируются.',
  },
];

export const OUTBOUND_RULES: FirewallRule[] = [
  {
    id: 'OUT-01',
    direction: 'Исходящее',
    source: 'Бэкенд (Cloud Functions)',
    srcPort: '*',
    dstPort: '5432',
    protocol: 'TCP/PostgreSQL',
    destination: 'БД PostgreSQL (managed)',
    action: 'ALLOW',
    responsible: 'Администратор БД',
    justification: 'Подключение к управляемой БД для чтения/записи данных. Шифрованное соединение (SSL). DSN через переменную окружения.',
  },
  {
    id: 'OUT-02',
    direction: 'Исходящее',
    source: 'Веб-приложение',
    srcPort: '*',
    dstPort: '443',
    protocol: 'TCP/HTTPS',
    destination: 'functions.poehali.dev',
    action: 'ALLOW',
    responsible: 'Администратор ИБ',
    justification: 'Вызов серверных функций (auth, db, security-log). 3 эндпоинта через HTTPS API.',
  },
  {
    id: 'OUT-03',
    direction: 'Исходящее',
    source: 'Веб-приложение',
    srcPort: '*',
    dstPort: '443',
    protocol: 'TCP/HTTPS',
    destination: 'cdn.poehali.dev',
    action: 'ALLOW',
    responsible: 'Администратор ИБ',
    justification: 'Загрузка статических ресурсов платформы (JS-скрипты, изображения).',
  },
  {
    id: 'OUT-04',
    direction: 'Исходящее',
    source: 'Веб-приложение',
    srcPort: '*',
    dstPort: '443',
    protocol: 'TCP/HTTPS',
    destination: 'mc.yandex.ru',
    action: 'ALLOW',
    responsible: 'Администратор ИБ',
    justification: 'Яндекс.Метрика — аналитика посещений, вебвизор. Может быть отключена при необходимости.',
  },
  {
    id: 'OUT-05',
    direction: 'Исходящее',
    source: 'Серверы',
    srcPort: '*',
    dstPort: '443/80',
    protocol: 'TCP/HTTPS',
    destination: 'Репозитории ОС (apt/yum)',
    action: 'ALLOW',
    responsible: 'Системный администратор',
    justification: 'Обновление пакетов ОС, патчи безопасности. Обязательно для поддержания актуального состояния.',
  },
  {
    id: 'OUT-06',
    direction: 'Исходящее',
    source: 'Серверы',
    srcPort: '*',
    dstPort: '587/465',
    protocol: 'TCP/SMTP+TLS',
    destination: 'SMTP-сервер (планируемый)',
    action: 'ALLOW',
    responsible: 'Администратор ИБ',
    justification: 'Отправка email-уведомлений: инциденты ИБ, истечение сроков документов, отчёты. Зарезервировано.',
  },
  {
    id: 'OUT-07',
    direction: 'Исходящее',
    source: 'Серверы',
    srcPort: '*',
    dstPort: '443',
    protocol: 'TCP/HTTPS',
    destination: 'api.telegram.org',
    action: 'ALLOW',
    responsible: 'Администратор ИБ',
    justification: 'Отправка уведомлений в Telegram-бот: критические инциденты ИБ, алерты. Зарезервировано.',
  },
  {
    id: 'OUT-08',
    direction: 'Исходящее',
    source: 'Серверы',
    srcPort: '*',
    dstPort: '123',
    protocol: 'UDP/NTP',
    destination: 'ntp.ubuntu.com / pool.ntp.org',
    action: 'ALLOW',
    responsible: 'Системный администратор',
    justification: 'Синхронизация системного времени. Критично для корректности журналов аудита и JWT-токенов.',
  },
  {
    id: 'OUT-09',
    direction: 'Исходящее',
    source: 'Бэкенд',
    srcPort: '*',
    dstPort: '443',
    protocol: 'TCP/HTTPS',
    destination: 'bucket.poehali.dev',
    action: 'ALLOW',
    responsible: 'Администратор ИБ',
    justification: 'S3-совместимое хранилище файлов — загрузка/выгрузка документов, бэкапов.',
  },
  {
    id: 'OUT-10',
    direction: 'Исходящее',
    source: 'Все серверы',
    srcPort: '*',
    dstPort: '*',
    protocol: 'Любой',
    destination: 'Любой',
    action: 'DENY',
    responsible: 'Администратор ИБ',
    justification: 'Запрет по умолчанию. Все не перечисленные выше исходящие соединения блокируются.',
  },
];

export const INTERACTION_TABLE: InteractionRow[] = [
  { from: 'Браузер пользователя', port: '443', protocol: 'HTTPS/TLS 1.3', to: 'SPA (CDN poehali.dev)', dataType: 'HTML, JS, CSS, изображения', frequency: 'При открытии', classification: 'Открытые' },
  { from: 'SPA (фронтенд)', port: '443', protocol: 'HTTPS REST API', to: 'Auth Function', dataType: 'Логин, регистрация, JWT-токены', frequency: 'При аутентификации', classification: 'Конфиденциальные' },
  { from: 'SPA (фронтенд)', port: '443', protocol: 'HTTPS REST API', to: 'DB Function', dataType: 'CRUD-операции, данные объектов', frequency: 'Постоянно', classification: 'Служебные' },
  { from: 'SPA (фронтенд)', port: '443', protocol: 'HTTPS REST API', to: 'Security-Log Function', dataType: 'События ИБ, журналы', frequency: 'При действиях', classification: 'Конфиденциальные' },
  { from: 'Auth Function', port: '5432', protocol: 'PostgreSQL/SSL', to: 'БД PostgreSQL', dataType: 'Учётные записи, токены, ПДн', frequency: 'При запросах', classification: 'Конфиденциальные' },
  { from: 'DB Function', port: '5432', protocol: 'PostgreSQL/SSL', to: 'БД PostgreSQL', dataType: 'Чек-листы, объекты, журналы', frequency: 'При запросах', classification: 'Служебные' },
  { from: 'Бэкенд', port: '443', protocol: 'HTTPS S3 API', to: 'bucket.poehali.dev', dataType: 'Файлы документов, бэкапы', frequency: 'При загрузке', classification: 'Конфиденциальные' },
  { from: 'Браузер', port: '443', protocol: 'HTTPS', to: 'mc.yandex.ru', dataType: 'Аналитика посещений', frequency: 'При открытии страницы', classification: 'Открытые' },
  { from: 'Серверы', port: '123', protocol: 'NTP/UDP', to: 'pool.ntp.org', dataType: 'Время', frequency: 'Периодически', classification: 'Открытые' },
  { from: 'Серверы (план.)', port: '587', protocol: 'SMTP/TLS', to: 'SMTP-сервер', dataType: 'Email-уведомления', frequency: 'По событиям', classification: 'Служебные' },
  { from: 'Серверы (план.)', port: '443', protocol: 'HTTPS', to: 'api.telegram.org', dataType: 'Алерты в Telegram', frequency: 'По инцидентам', classification: 'Служебные' },
];

export const NETWORK_DIAGRAM_ZONES: NetworkZone[] = [
  { zone: 'DMZ (Демилитаризованная зона)', color: 'bg-blue-100 border-blue-300', components: ['Веб-приложение (SPA)', 'CDN (cdn.poehali.dev)', 'Яндекс.Метрика'] },
  { zone: 'Прикладная зона', color: 'bg-green-100 border-green-300', components: ['Auth Function', 'DB Function', 'Security-Log Function', 'S3 Storage'] },
  { zone: 'Зона данных', color: 'bg-amber-100 border-amber-300', components: ['PostgreSQL (managed)', 'Бэкапы (зашифрованные)'] },
  { zone: 'Служебная зона', color: 'bg-slate-100 border-slate-300', components: ['NTP-серверы', 'Репозитории ОС', 'SMTP (зарезервировано)', 'Telegram API (зарезервировано)'] },
];
