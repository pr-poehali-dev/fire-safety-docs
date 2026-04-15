import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { createPDF, setFontBold, setFontNormal } from '@/lib/pdfUtils';

const SYSTEM_COMPONENTS = [
  { id: 'C-01', name: 'SPA-приложение (Frontend)', type: 'Клиентский модуль', tech: 'React 18, TypeScript, Vite', deploy: 'CDN poehali.dev', description: 'Веб-интерфейс пользователя. 20 функциональных разделов, ролевая модель доступа.' },
  { id: 'C-02', name: 'Auth Function', type: 'Серверная функция', tech: 'Python 3.11, Cloud Function', deploy: 'functions.poehali.dev', description: 'Аутентификация, авторизация, управление сессиями, JWT-токены, CSRF, rate-limiting, капча.' },
  { id: 'C-03', name: 'DB Function', type: 'Серверная функция', tech: 'Python 3.11, Cloud Function', deploy: 'functions.poehali.dev', description: 'CRUD-операции с whitelist-валидацией таблиц и полей, аудит изменений данных.' },
  { id: 'C-04', name: 'Security-Log Function', type: 'Серверная функция', tech: 'Python 3.11, Cloud Function', deploy: 'functions.poehali.dev', description: 'Журналирование событий ИБ, поиск и анализ инцидентов, статистика.' },
  { id: 'C-05', name: 'PostgreSQL (managed)', type: 'СУБД', tech: 'PostgreSQL 15', deploy: 'Managed DB', description: 'Хранение данных: 44 таблицы, AES-256 шифрование ПДн, 10 миграций.' },
  { id: 'C-06', name: 'S3 Storage', type: 'Файловое хранилище', tech: 'S3-совместимое', deploy: 'bucket.poehali.dev', description: 'Хранение документов, файлов, зашифрованных бэкапов.' },
  { id: 'C-07', name: 'CDN', type: 'Сеть доставки контента', tech: 'HTTPS CDN', deploy: 'cdn.poehali.dev', description: 'Раздача статических ресурсов: JS, CSS, изображения.' },
];

const ACCOUNTS_TABLE = [
  { account: 'Администратор ИБ', role: 'admin', rights: 'Полный доступ ко всем разделам, управление пользователями, просмотр журналов ИБ, настройка защиты данных, сетевая архитектура', owner: 'Руководитель ИБ', authMethod: 'Email + пароль (12+ символов) + JWT', mfa: 'Планируется' },
  { account: 'Ответственный за ПБ', role: 'responsible', rights: 'Доступ ко всем разделам ПБ: документация, мониторинг, журнал, чек-лист, расчёты, аудиты, декларация, страхование. Без доступа к ИБ-разделам.', owner: 'Инженер ПБ / Начальник службы ПБ', authMethod: 'Email + пароль (12+ символов) + JWT', mfa: 'Планируется' },
  { account: 'Менеджер', role: 'manager', rights: 'Ограниченный доступ: профиль, характеристика (только чтение), оценка ПБ, аудиты, декларация, страхование, пожары, FAQ', owner: 'Линейный руководитель', authMethod: 'Email + пароль (12+ символов) + JWT', mfa: 'Планируется' },
  { account: 'Сервисная (Auth)', role: 'service', rights: 'Обработка запросов аутентификации, генерация/проверка JWT, управление сессиями', owner: 'Системный администратор', authMethod: 'Env-переменные (JWT_SECRET, DATABASE_URL)', mfa: '—' },
  { account: 'Сервисная (DB)', role: 'service', rights: 'CRUD-операции к БД, аудит изменений, валидация данных', owner: 'Системный администратор', authMethod: 'Env-переменные (DATABASE_URL)', mfa: '—' },
  { account: 'Сервисная (S3)', role: 'service', rights: 'Загрузка/выгрузка файлов в объектное хранилище', owner: 'Системный администратор', authMethod: 'Env-переменные (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)', mfa: '—' },
];

const INFO_FLOWS = [
  { id: 'F-01', from: 'Браузер пользователя', to: 'CDN (SPA)', protocol: 'HTTPS/TLS 1.3', port: '443', data: 'HTML, JS, CSS, изображения', classification: 'Открытые', direction: 'Клиент→Сервер' },
  { id: 'F-02', from: 'SPA (фронтенд)', to: 'Auth Function', protocol: 'HTTPS REST API', port: '443', data: 'Логин/пароль, JWT-токены, данные регистрации', classification: 'Конфиденциальные', direction: 'Двунаправленный' },
  { id: 'F-03', from: 'SPA (фронтенд)', to: 'DB Function', protocol: 'HTTPS REST API', port: '443', data: 'CRUD-операции: чек-листы, журналы, объекты, документы', classification: 'Служебные', direction: 'Двунаправленный' },
  { id: 'F-04', from: 'SPA (фронтенд)', to: 'Security-Log Function', protocol: 'HTTPS REST API', port: '443', data: 'События ИБ, записи журнала аудита', classification: 'Конфиденциальные', direction: 'Двунаправленный' },
  { id: 'F-05', from: 'Auth Function', to: 'PostgreSQL', protocol: 'PostgreSQL/SSL', port: '5432', data: 'Учётные записи, токены, ПДн (зашифрованные AES-256)', classification: 'Конфиденциальные', direction: 'Двунаправленный' },
  { id: 'F-06', from: 'DB Function', to: 'PostgreSQL', protocol: 'PostgreSQL/SSL', port: '5432', data: 'Данные объектов ПБ, чек-листы, журналы, расчёты', classification: 'Служебные', direction: 'Двунаправленный' },
  { id: 'F-07', from: 'Security-Log Function', to: 'PostgreSQL', protocol: 'PostgreSQL/SSL', port: '5432', data: 'Записи событий безопасности', classification: 'Конфиденциальные', direction: 'Запись' },
  { id: 'F-08', from: 'Backend', to: 'S3 Storage', protocol: 'HTTPS S3 API', port: '443', data: 'Документы, файлы, бэкапы', classification: 'Конфиденциальные', direction: 'Двунаправленный' },
  { id: 'F-09', from: 'Браузер', to: 'Яндекс.Метрика', protocol: 'HTTPS', port: '443', data: 'Аналитика посещений (анонимизированная)', classification: 'Открытые', direction: 'Клиент→Внешний' },
  { id: 'F-10', from: 'Серверы', to: 'NTP-серверы', protocol: 'NTP/UDP', port: '123', data: 'Синхронизация времени', classification: 'Открытые', direction: 'Клиент→Внешний' },
];

const PROTECTION_SUBSYSTEMS = [
  { subsystem: 'Идентификация и аутентификация', measures: 'Email + пароль (PBKDF2-SHA256, 310 000 итераций), JWT HS256, refresh-токены с SHA256-хешем', status: 'Реализовано' },
  { subsystem: 'Управление доступом', measures: '3 роли (admin/responsible/manager), ролевая модель на фронтенде и бэкенде, adminOnlySections', status: 'Реализовано' },
  { subsystem: 'Защита от НСД', measures: 'Блокировка после 5 попыток на 15 мин, rate-limiting 30 рек./мин, CAPTCHA после 3 неудач', status: 'Реализовано' },
  { subsystem: 'Криптографическая защита', measures: 'AES-256-CBC шифрование ПДн (ФИО, телефон, должность), ключ в env-переменной, уникальный IV', status: 'Реализовано' },
  { subsystem: 'Защита каналов связи', measures: 'HTTPS/TLS 1.3, HSTS (365 дней), PostgreSQL SSL', status: 'Реализовано' },
  { subsystem: 'Защита от инъекций', measures: 'Параметризованные SQL, whitelist таблиц (30 шт.), валидация полей по regex, санитизация строк', status: 'Реализовано' },
  { subsystem: 'Защита от XSS', measures: 'DOMPurify 3.x, серверная санитизация, X-Content-Type-Options, X-XSS-Protection', status: 'Реализовано' },
  { subsystem: 'Защита от CSRF', measures: 'HMAC-SHA256 токены с timestamp, генерация/валидация на сервере, TTL 1 час', status: 'Реализовано' },
  { subsystem: 'Антифрейминг', measures: 'X-Frame-Options: DENY, Content-Security-Policy (meta-теги)', status: 'Реализовано' },
  { subsystem: 'Журналирование', measures: 'auth_logs + security_events, запись IP/UA/действий, хранение 180 дней', status: 'Реализовано' },
  { subsystem: 'Резервное копирование', measures: 'Ежедневный бэкап БД, шифрование бэкапов, хранение 90 дней, чек-лист восстановления', status: 'Реализовано' },
];

async function exportPDF() {
  const doc = await createPDF('p');
  const pw = 190;
  let y = 15;

  const title = (t: string, s = 14) => { doc.setFontSize(s); setFontBold(doc); doc.text(t, 10, y); y += s * 0.7; };
  const text = (t: string, s = 9) => {
    doc.setFontSize(s); setFontNormal(doc);
    doc.splitTextToSize(t, pw).forEach((l: string) => { if (y > 275) { doc.addPage(); y = 15; } doc.text(l, 10, y); y += s * 0.5; });
  };
  const row = (cols: string[], ws: number[], bold = false) => {
    if (y > 268) { doc.addPage(); y = 15; }
    doc.setFontSize(6.5); if (bold) { setFontBold(doc); } else { setFontNormal(doc); }
    let x = 10; let maxH = 4;
    cols.forEach((c, i) => {
      const ls = doc.splitTextToSize(c, ws[i] - 2);
      maxH = Math.max(maxH, ls.length * 2.5 + 1);
    });
    cols.forEach((c, i) => {
      const ls = doc.splitTextToSize(c, ws[i] - 2);
      ls.forEach((l: string, li: number) => doc.text(l, x + 1, y + li * 2.5));
      doc.rect(x, y - 3, ws[i], maxH);
      x += ws[i];
    });
    y += maxH;
  };

  title('Приложение В. Техническое решение на инфраструктуру', 14);
  y += 2;
  text('Система: Подсистема пожарной безопасности (СПБ РУСАЛ)');
  text('Дата: ' + new Date().toLocaleDateString('ru-RU'));
  text('Версия: 1.0');
  y += 4;

  title('1. Схема компонентов системы', 12);
  y += 2;
  const cw = [12, 35, 25, 30, 25, pw - 127];
  row(['ID', 'Компонент', 'Тип', 'Технология', 'Развертывание', 'Описание'], cw, true);
  SYSTEM_COMPONENTS.forEach(c => row([c.id, c.name, c.type, c.tech, c.deploy, c.description], cw));
  y += 5;

  title('2. Таблица учётных записей', 12);
  y += 2;
  const aw = [30, 16, 55, 30, 30, pw - 161];
  row(['Учётная запись', 'Роль', 'Права', 'Владелец', 'Аутентификация', 'МFA'], aw, true);
  ACCOUNTS_TABLE.forEach(a => row([a.account, a.role, a.rights.substring(0, 120), a.owner, a.authMethod, a.mfa], aw));
  y += 5;

  if (y > 100) { doc.addPage(); y = 15; }
  title('3. Матрица информационных потоков', 12);
  y += 2;
  const fw = [12, 28, 28, 22, 10, 40, 22, pw - 162];
  row(['ID', 'Источник', 'Цель', 'Протокол', 'Порт', 'Данные', 'Класс.', 'Направление'], fw, true);
  INFO_FLOWS.forEach(f => row([f.id, f.from, f.to, f.protocol, f.port, f.data, f.classification, f.direction], fw));
  y += 5;

  doc.addPage(); y = 15;
  title('4. Подсистемы защиты информации', 12);
  y += 2;
  const sw = [40, pw - 60, 20];
  row(['Подсистема', 'Реализованные меры', 'Статус'], sw, true);
  PROTECTION_SUBSYSTEMS.forEach(p => row([p.subsystem, p.measures, p.status], sw));

  doc.save('prilozhenie-v-teh-reshenie.pdf');
}

export default function TechnicalSolutionSection() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileStack" size={24} className="text-blue-600" />
                Приложение В. Техническое решение на инфраструктуру
              </CardTitle>
              <CardDescription>Схема компонентов, учётные записи, матрица информационных потоков</CardDescription>
            </div>
            <Button onClick={exportPDF} className="gap-1.5">
              <Icon name="Download" size={14} />
              Экспорт PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="components">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="components">Компоненты</TabsTrigger>
          <TabsTrigger value="accounts">Учётные записи</TabsTrigger>
          <TabsTrigger value="flows">Инф. потоки</TabsTrigger>
          <TabsTrigger value="subsystems">Подсистемы ПЗИ</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Icon name="Server" size={18} className="text-blue-600" />Схема компонентов системы</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SYSTEM_COMPONENTS.map(c => (
                  <div key={c.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border">
                    <Badge variant="outline" className="mt-0.5 flex-shrink-0 font-mono">{c.id}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{c.name}</p>
                        <Badge className="bg-blue-100 text-blue-700 text-[10px]">{c.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                      <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Icon name="Cpu" size={10} />{c.tech}</span>
                        <span className="flex items-center gap-1"><Icon name="Globe" size={10} />{c.deploy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Icon name="Users" size={18} className="text-indigo-600" />Таблица учётных записей</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead>Учётная запись</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Права доступа</TableHead>
                      <TableHead>Владелец</TableHead>
                      <TableHead>Аутентификация</TableHead>
                      <TableHead>MFA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ACCOUNTS_TABLE.map((a, i) => (
                      <TableRow key={i} className="text-xs">
                        <TableCell className="font-medium">{a.account}</TableCell>
                        <TableCell><Badge variant="outline" className="font-mono text-[10px]">{a.role}</Badge></TableCell>
                        <TableCell className="max-w-[280px] text-muted-foreground">{a.rights}</TableCell>
                        <TableCell>{a.owner}</TableCell>
                        <TableCell className="text-muted-foreground text-[10px]">{a.authMethod}</TableCell>
                        <TableCell>{a.mfa}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Icon name="ArrowLeftRight" size={18} className="text-green-600" />Матрица информационных потоков</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead className="w-[45px]">ID</TableHead>
                      <TableHead>Источник</TableHead>
                      <TableHead>Цель</TableHead>
                      <TableHead>Протокол</TableHead>
                      <TableHead className="w-[45px]">Порт</TableHead>
                      <TableHead>Передаваемые данные</TableHead>
                      <TableHead>Классификация</TableHead>
                      <TableHead>Направление</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INFO_FLOWS.map(f => (
                      <TableRow key={f.id} className="text-xs">
                        <TableCell className="font-mono font-bold">{f.id}</TableCell>
                        <TableCell>{f.from}</TableCell>
                        <TableCell>{f.to}</TableCell>
                        <TableCell className="font-mono text-[10px]">{f.protocol}</TableCell>
                        <TableCell className="font-mono">{f.port}</TableCell>
                        <TableCell className="text-muted-foreground">{f.data}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            f.classification === 'Конфиденциальные' ? 'border-red-300 text-red-600' :
                            f.classification === 'Служебные' ? 'border-amber-300 text-amber-600' :
                            'border-green-300 text-green-600'
                          }>{f.classification}</Badge>
                        </TableCell>
                        <TableCell className="text-[10px]">{f.direction}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subsystems" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Icon name="ShieldCheck" size={18} className="text-emerald-600" />Подсистемы защиты информации</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {PROTECTION_SUBSYSTEMS.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.subsystem}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.measures}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 flex-shrink-0 text-[10px]">{p.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}