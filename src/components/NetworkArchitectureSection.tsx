import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import jsPDF from 'jspdf';

const INBOUND_RULES = [
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

const OUTBOUND_RULES = [
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

const INTERACTION_TABLE = [
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

const NETWORK_DIAGRAM_ZONES = [
  { zone: 'DMZ (Демилитаризованная зона)', color: 'bg-blue-100 border-blue-300', components: ['Веб-приложение (SPA)', 'CDN (cdn.poehali.dev)', 'Яндекс.Метрика'] },
  { zone: 'Прикладная зона', color: 'bg-green-100 border-green-300', components: ['Auth Function', 'DB Function', 'Security-Log Function', 'S3 Storage'] },
  { zone: 'Зона данных', color: 'bg-amber-100 border-amber-300', components: ['PostgreSQL (managed)', 'Бэкапы (зашифрованные)'] },
  { zone: 'Служебная зона', color: 'bg-slate-100 border-slate-300', components: ['NTP-серверы', 'Репозитории ОС', 'SMTP (зарезервировано)', 'Telegram API (зарезервировано)'] },
];

export default function NetworkArchitectureSection() {
  const [activeTab, setActiveTab] = useState('diagram');
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = 190;
    let y = 15;

    const addTitle = (text: string, size = 14) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', 'bold');
      doc.text(text, 10, y);
      y += size * 0.6;
    };
    const addText = (text: string, size = 9) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(text, pageW);
      lines.forEach((line: string) => {
        if (y > 275) { doc.addPage(); y = 15; }
        doc.text(line, 10, y);
        y += size * 0.5;
      });
    };
    const addTableRow = (cols: string[], widths: number[], bold = false) => {
      if (y > 270) { doc.addPage(); y = 15; }
      doc.setFontSize(7);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      let x = 10;
      cols.forEach((col, i) => {
        const lines = doc.splitTextToSize(col, widths[i] - 2);
        lines.forEach((line: string, li: number) => {
          doc.text(line, x + 1, y + li * 3);
        });
        doc.rect(x, y - 3, widths[i], Math.max(lines.length * 3, 4) + 1);
        x += widths[i];
      });
      y += 6;
    };

    addTitle('Setevaya arhitektura — Pravila MSE', 16);
    y += 3;
    addText('Dokument: Setevaya arhitektura sistemy pozharnoy bezopasnosti');
    addText('Data: ' + new Date().toLocaleDateString('ru-RU'));
    addText('Organizaciya: RUSAL');
    y += 5;

    addTitle('1. Vhodyashchie pravila (Inbound)', 12);
    y += 2;
    const inW = [14, 30, 16, 14, 28, 12, pageW - 114];
    addTableRow(['ID', 'Istochnik', 'Port', 'Protokol', 'Naznachenie', 'Deystvie', 'Obosnovanie'], inW, true);
    INBOUND_RULES.forEach(r => {
      addTableRow([r.id, r.source, r.dstPort, r.protocol.split('/').pop() || '', r.destination, r.action, r.justification], inW);
    });
    y += 5;

    addTitle('2. Ishodyashchie pravila (Outbound)', 12);
    y += 2;
    addTableRow(['ID', 'Istochnik', 'Port', 'Protokol', 'Naznachenie', 'Deystvie', 'Obosnovanie'], inW, true);
    OUTBOUND_RULES.forEach(r => {
      addTableRow([r.id, r.source, r.dstPort, r.protocol.split('/').pop() || '', r.destination, r.action, r.justification], inW);
    });
    y += 5;

    doc.addPage();
    y = 15;
    addTitle('3. Tablica informacionnyh vzaimodeystviy', 12);
    y += 2;
    const intW = [28, 12, 22, 28, 34, 22, pageW - 146];
    addTableRow(['Istochnik', 'Port', 'Protokol', 'Cel', 'Dannye', 'Chastota', 'Klass.'], intW, true);
    INTERACTION_TABLE.forEach(r => {
      addTableRow([r.from, r.port, r.protocol.split('/').pop() || r.protocol, r.to, r.dataType, r.frequency, r.classification], intW);
    });

    doc.save('setevaya-arhitektura-mse.pdf');
  };

  return (
    <div className="space-y-6 animate-in fade-in" ref={printRef}>
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Network" size={24} className="text-blue-600" />
                Сетевая архитектура
              </CardTitle>
              <CardDescription>Правила МСЭ, таблица взаимодействий и зоны безопасности</CardDescription>
            </div>
            <Button onClick={handleExportPDF} className="gap-1.5">
              <Icon name="Download" size={14} />
              Экспорт PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="diagram">Схема зон</TabsTrigger>
          <TabsTrigger value="inbound">Входящие правила</TabsTrigger>
          <TabsTrigger value="outbound">Исходящие правила</TabsTrigger>
          <TabsTrigger value="interactions">Взаимодействия</TabsTrigger>
        </TabsList>

        <TabsContent value="diagram" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {NETWORK_DIAGRAM_ZONES.map((zone) => (
              <Card key={zone.zone} className={`border-2 ${zone.color}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Layers" size={16} />
                    {zone.zone}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {zone.components.map((c) => (
                      <div key={c} className="flex items-center gap-2 text-sm">
                        <Icon name="Server" size={14} className="text-muted-foreground" />
                        {c}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-3">
                <div className="text-center p-3 bg-slate-100 rounded-lg border w-full max-w-xs">
                  <Icon name="Globe" size={20} className="mx-auto mb-1 text-slate-500" />
                  <p className="text-xs font-medium">Интернет (пользователи)</p>
                </div>
                <Icon name="ArrowDown" size={20} className="text-blue-500" />
                <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                  <Badge variant="outline" className="border-blue-300">443 HTTPS</Badge>
                  <Badge variant="outline" className="border-blue-300">22 SSH (VPN)</Badge>
                </div>
                <Icon name="ArrowDown" size={20} className="text-blue-500" />
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-300 w-full max-w-xs">
                  <Icon name="Shield" size={20} className="mx-auto mb-1 text-red-500" />
                  <p className="text-xs font-medium text-red-700">Межсетевой экран (МСЭ)</p>
                  <p className="text-[10px] text-red-500">Deny All + Allow List</p>
                </div>
                <Icon name="ArrowDown" size={20} className="text-green-500" />
                <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
                  {['Auth API', 'DB API', 'Security Log'].map((svc) => (
                    <div key={svc} className="text-center p-2 bg-green-50 rounded-lg border border-green-300">
                      <Icon name="Cloud" size={16} className="mx-auto mb-1 text-green-600" />
                      <p className="text-[10px] font-medium">{svc}</p>
                    </div>
                  ))}
                </div>
                <Icon name="ArrowDown" size={20} className="text-amber-500" />
                <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
                  <Badge variant="outline" className="border-amber-300">5432 PostgreSQL/SSL</Badge>
                </div>
                <Icon name="ArrowDown" size={20} className="text-amber-500" />
                <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-300 w-full max-w-xs">
                  <Icon name="Database" size={20} className="mx-auto mb-1 text-amber-600" />
                  <p className="text-xs font-medium text-amber-700">PostgreSQL (managed)</p>
                  <p className="text-[10px] text-amber-500">AES-256 шифрование ПДн</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbound" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="ArrowDownToLine" size={18} className="text-green-600" />
                Входящие правила МСЭ
              </CardTitle>
              <CardDescription>Разрешённые входящие соединения. Все остальные — DENY.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead className="w-[60px]">ID</TableHead>
                      <TableHead>Источник</TableHead>
                      <TableHead className="w-[60px]">Порт</TableHead>
                      <TableHead>Протокол</TableHead>
                      <TableHead>Назначение</TableHead>
                      <TableHead className="w-[80px]">Действие</TableHead>
                      <TableHead>Ответственный</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INBOUND_RULES.map((r) => (
                      <TableRow key={r.id} className="text-xs">
                        <TableCell className="font-mono font-bold">{r.id}</TableCell>
                        <TableCell>{r.source}</TableCell>
                        <TableCell className="font-mono">{r.dstPort}</TableCell>
                        <TableCell>{r.protocol}</TableCell>
                        <TableCell>{r.destination}</TableCell>
                        <TableCell>
                          <Badge className={
                            r.action === 'ALLOW' ? 'bg-green-100 text-green-700' :
                            r.action === 'DENY' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }>{r.action}</Badge>
                        </TableCell>
                        <TableCell>{r.responsible}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold">Обоснования</h4>
                {INBOUND_RULES.map((r) => (
                  <div key={r.id} className="flex gap-2 text-xs p-2 bg-slate-50 rounded border">
                    <Badge variant="outline" className="flex-shrink-0">{r.id}</Badge>
                    <span className="text-muted-foreground">{r.justification}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outbound" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="ArrowUpFromLine" size={18} className="text-orange-600" />
                Исходящие правила МСЭ
              </CardTitle>
              <CardDescription>Разрешённые исходящие соединения. Все остальные — DENY.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead className="w-[60px]">ID</TableHead>
                      <TableHead>Источник</TableHead>
                      <TableHead className="w-[60px]">Порт</TableHead>
                      <TableHead>Протокол</TableHead>
                      <TableHead>Назначение</TableHead>
                      <TableHead className="w-[80px]">Действие</TableHead>
                      <TableHead>Ответственный</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {OUTBOUND_RULES.map((r) => (
                      <TableRow key={r.id} className="text-xs">
                        <TableCell className="font-mono font-bold">{r.id}</TableCell>
                        <TableCell>{r.source}</TableCell>
                        <TableCell className="font-mono">{r.dstPort}</TableCell>
                        <TableCell>{r.protocol}</TableCell>
                        <TableCell>{r.destination}</TableCell>
                        <TableCell>
                          <Badge className={
                            r.action === 'ALLOW' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }>{r.action}</Badge>
                        </TableCell>
                        <TableCell>{r.responsible}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold">Обоснования</h4>
                {OUTBOUND_RULES.map((r) => (
                  <div key={r.id} className="flex gap-2 text-xs p-2 bg-slate-50 rounded border">
                    <Badge variant="outline" className="flex-shrink-0">{r.id}</Badge>
                    <span className="text-muted-foreground">{r.justification}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="ArrowLeftRight" size={18} className="text-indigo-600" />
                Таблица информационных взаимодействий
              </CardTitle>
              <CardDescription>Все потоки данных между компонентами системы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead>Источник</TableHead>
                      <TableHead className="w-[50px]">Порт</TableHead>
                      <TableHead>Протокол</TableHead>
                      <TableHead>Цель</TableHead>
                      <TableHead>Тип данных</TableHead>
                      <TableHead>Частота</TableHead>
                      <TableHead>Классификация</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INTERACTION_TABLE.map((r, i) => (
                      <TableRow key={i} className="text-xs">
                        <TableCell className="font-medium">{r.from}</TableCell>
                        <TableCell className="font-mono">{r.port}</TableCell>
                        <TableCell>{r.protocol}</TableCell>
                        <TableCell>{r.to}</TableCell>
                        <TableCell>{r.dataType}</TableCell>
                        <TableCell className="text-muted-foreground">{r.frequency}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            r.classification === 'Конфиденциальные' ? 'border-red-300 text-red-600' :
                            r.classification === 'Служебные' ? 'border-amber-300 text-amber-600' :
                            'border-green-300 text-green-600'
                          }>{r.classification}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
