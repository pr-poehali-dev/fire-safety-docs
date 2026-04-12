import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import jsPDF from 'jspdf';

interface TestCheck {
  id: string;
  subsystem: string;
  test: string;
  method: string;
  criteria: string;
  passed: boolean | null;
}

const INITIAL_CHECKS: TestCheck[] = [
  { id: 'T-01', subsystem: 'Идентификация и аутентификация', test: 'Вход с корректными учётными данными', method: 'Ввести email и пароль зарегистрированного пользователя', criteria: 'Успешный вход, получение JWT-токена, отображение профиля', passed: null },
  { id: 'T-02', subsystem: 'Идентификация и аутентификация', test: 'Отказ входа при неверном пароле', method: 'Ввести корректный email и неверный пароль', criteria: 'Отказ входа, отображение ошибки, счётчик неудач увеличен', passed: null },
  { id: 'T-03', subsystem: 'Идентификация и аутентификация', test: 'Блокировка аккаунта после 5 неудачных попыток', method: '5 раз ввести неверный пароль подряд', criteria: 'Аккаунт заблокирован на 15 мин, сообщение о блокировке', passed: null },
  { id: 'T-04', subsystem: 'Идентификация и аутентификация', test: 'Проверка требований к паролю', method: 'Попытка регистрации с паролем < 12 символов, без заглавных, без цифр, без спецсимволов', criteria: 'Отказ регистрации с описанием нарушенного требования', passed: null },
  { id: 'T-05', subsystem: 'Идентификация и аутентификация', test: 'Автоматический выход по неактивности', method: 'Войти и не производить действий 20 минут', criteria: 'Автоматический logout, перенаправление на форму входа', passed: null },
  { id: 'T-06', subsystem: 'Идентификация и аутентификация', test: 'Обновление JWT-токена через refresh', method: 'Дождаться истечения access-токена (15 мин), выполнить действие', criteria: 'Автоматическое обновление токена без повторного входа', passed: null },

  { id: 'T-07', subsystem: 'Управление доступом', test: 'Разграничение доступа по роли admin', method: 'Войти под admin, проверить доступность всех 20 разделов', criteria: 'Все разделы доступны, включая ИБ-разделы', passed: null },
  { id: 'T-08', subsystem: 'Управление доступом', test: 'Разграничение доступа по роли manager', method: 'Войти под manager, проверить список разделов', criteria: 'Доступны только 8 разделов (профиль, характеристика, оценка, аудиты, декларация, страхование, пожары, FAQ). ИБ-разделы скрыты.', passed: null },
  { id: 'T-09', subsystem: 'Управление доступом', test: 'Запрет прямого доступа к ИБ-разделам для manager', method: 'Под ролью manager попытаться открыть журнал авторизации через URL', criteria: 'Раздел не отображается, нет данных', passed: null },

  { id: 'T-10', subsystem: 'Защита от НСД', test: 'Rate-limiting на форму входа', method: 'Отправить 31+ запрос на login с одного IP за 60 секунд', criteria: 'HTTP 429 после 30-го запроса, сообщение о превышении лимита', passed: null },
  { id: 'T-11', subsystem: 'Защита от НСД', test: 'Появление CAPTCHA после 3 неудач', method: '3 раза ввести неверный пароль с одного IP', criteria: 'На 4-й попытке отображается арифметическая капча', passed: null },
  { id: 'T-12', subsystem: 'Защита от НСД', test: 'Валидация CAPTCHA', method: 'Ввести неверный ответ на капчу', criteria: 'Ошибка «Неверный ответ на капчу», вход не выполнен', passed: null },

  { id: 'T-13', subsystem: 'Криптографическая защита', test: 'Шифрование ПДн при регистрации', method: 'Зарегистрировать пользователя, проверить в БД поля *_enc', criteria: 'Поля full_name_enc, phone_enc, position_enc содержат Base64, encryption_version = 1', passed: null },
  { id: 'T-14', subsystem: 'Криптографическая защита', test: 'Дешифрование ПДн при входе', method: 'Войти под зашифрованным пользователем, проверить отображение ФИО/телефона', criteria: 'ФИО, телефон и должность отображаются корректно в профиле', passed: null },
  { id: 'T-15', subsystem: 'Криптографическая защита', test: 'Защита ключа шифрования', method: 'Проверить отсутствие ключа в коде приложения (grep по репозиторию)', criteria: 'Ключ хранится только в env-переменной ENCRYPTION_KEY, в коде отсутствует', passed: null },

  { id: 'T-16', subsystem: 'Защита каналов связи', test: 'Принудительное HTTPS', method: 'Открыть приложение по HTTP', criteria: 'Перенаправление на HTTPS, заголовок HSTS присутствует', passed: null },
  { id: 'T-17', subsystem: 'Защита каналов связи', test: 'Заголовки безопасности в ответах API', method: 'Выполнить запрос к API, проверить response headers', criteria: 'Наличие: X-Content-Type-Options, X-Frame-Options, HSTS, X-XSS-Protection, Referrer-Policy', passed: null },

  { id: 'T-18', subsystem: 'Защита от инъекций', test: 'SQL-инъекция через имя таблицы', method: 'Отправить GET с table=users; DROP TABLE users;--', criteria: 'HTTP 403, запись в журнал ИБ, таблица не затронута', passed: null },
  { id: 'T-19', subsystem: 'Защита от инъекций', test: 'SQL-инъекция через поле данных', method: 'Отправить POST с полем value: "\'; DROP TABLE users; --"', criteria: 'Значение сохранено как строка, SQL не выполнен', passed: null },
  { id: 'T-20', subsystem: 'Защита от инъекций', test: 'Whitelist таблиц в DB Function', method: 'Отправить запрос к несуществующей/системной таблице', criteria: 'HTTP 403, запись access_denied в security_events', passed: null },

  { id: 'T-21', subsystem: 'Защита от XSS', test: 'XSS через поле ввода', method: 'Ввести <script>alert(1)</script> в текстовое поле', criteria: 'Скрипт не выполняется, теги удалены или экранированы', passed: null },
  { id: 'T-22', subsystem: 'Защита от XSS', test: 'Проверка DOMPurify на клиенте', method: 'Подставить HTML с onclick/onerror атрибутами', criteria: 'Атрибуты событий удалены, только безопасный текст', passed: null },

  { id: 'T-23', subsystem: 'Журналирование', test: 'Запись событий аутентификации', method: 'Выполнить вход, выход, неудачный вход', criteria: 'Все 3 события записаны в auth_logs с IP, email, timestamp', passed: null },
  { id: 'T-24', subsystem: 'Журналирование', test: 'Запись CRUD-операций в security_events', method: 'Создать, изменить и удалить запись в отслеживаемой таблице', criteria: '3 записи в security_events: create, update, delete с old/new values', passed: null },

  { id: 'T-25', subsystem: 'Резервное копирование', test: 'Наличие бэкапа за последние 24 часа', method: 'Проверить наличие актуального бэкапа БД', criteria: 'Бэкап существует, дата не старше 24 часов', passed: null },
  { id: 'T-26', subsystem: 'Резервное копирование', test: 'Восстановление из бэкапа', method: 'Выполнить тестовое восстановление в изолированное окружение', criteria: 'Данные восстановлены, целостность подтверждена, зашифрованные поля дешифруются', passed: null },
];

const PROTOCOL_TEMPLATE = {
  title: 'Протокол испытаний подсистемы защиты информации (Приложение Г)',
  fields: [
    { label: 'Наименование системы', value: 'Подсистема пожарной безопасности (СПБ)' },
    { label: 'Заказчик', value: 'ОК РУСАЛ' },
    { label: 'Исполнитель', value: '(указать)' },
    { label: 'Основание', value: 'Программа и методика испытаний ПЗИ v1.0' },
    { label: 'Дата проведения', value: new Date().toLocaleDateString('ru-RU') },
    { label: 'Место проведения', value: 'Тестовый стенд / Production-среда' },
  ],
  conclusion: 'ПЗИ считается прошедшей испытание, если все тесты категории «Критический» (T-01…T-06, T-13…T-17) выполнены успешно И не менее 90% всех тестов завершены положительно.',
};

function exportPDF(checks: TestCheck[], notes: string) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = 190;
  let y = 15;

  const title = (t: string, s = 14) => { doc.setFontSize(s); doc.setFont('helvetica', 'bold'); doc.text(t, 10, y); y += s * 0.7; };
  const text = (t: string, s = 9) => {
    doc.setFontSize(s); doc.setFont('helvetica', 'normal');
    doc.splitTextToSize(t, pw).forEach((l: string) => { if (y > 275) { doc.addPage(); y = 15; } doc.text(l, 10, y); y += s * 0.5; });
  };
  const row = (cols: string[], ws: number[], bold = false) => {
    if (y > 265) { doc.addPage(); y = 15; }
    doc.setFontSize(6.5); doc.setFont('helvetica', bold ? 'bold' : 'normal');
    let x = 10; let maxH = 4;
    cols.forEach((c, i) => { maxH = Math.max(maxH, doc.splitTextToSize(c, ws[i] - 2).length * 2.5 + 1); });
    cols.forEach((c, i) => {
      doc.splitTextToSize(c, ws[i] - 2).forEach((l: string, li: number) => doc.text(l, x + 1, y + li * 2.5));
      doc.rect(x, y - 3, ws[i], maxH); x += ws[i];
    });
    y += maxH;
  };

  title('Prilozhenie G. Protokol ispytaniy PZI', 14);
  y += 2;
  PROTOCOL_TEMPLATE.fields.forEach(f => text(`${f.label}: ${f.value}`));
  y += 4;

  title('Rezultaty ispytaniy', 12);
  y += 2;
  const cw = [12, 35, 42, 42, 42, pw - 173];
  row(['ID', 'Podsistema', 'Test', 'Metod', 'Kriteriy', 'Rezultat'], cw, true);
  checks.forEach(c => {
    const res = c.passed === null ? 'Ne provereno' : c.passed ? 'PASSED' : 'FAILED';
    row([c.id, c.subsystem, c.test, c.method, c.criteria, res], cw);
  });

  y += 5;
  const passed = checks.filter(c => c.passed === true).length;
  const total = checks.length;
  text(`Itogo: ${passed}/${total} testov (${Math.round(passed / total * 100)}%)`);
  y += 3;
  text('Kriteriy uspeshnosti: ' + PROTOCOL_TEMPLATE.conclusion);
  y += 3;
  if (notes) { text('Primechaniya: ' + notes); }
  y += 8;
  text('Podpisi:');
  y += 5;
  text('Predsedatel komissii: _________________ / _________________ /');
  y += 4;
  text('Chlen komissii: _________________ / _________________ /');
  y += 4;
  text('Chlen komissii: _________________ / _________________ /');

  doc.save('protokol-ispytaniy-pzi.pdf');
}

export default function TestingProgramSection() {
  const [checks, setChecks] = useState<TestCheck[]>(INITIAL_CHECKS);
  const [notes, setNotes] = useState('');

  const toggle = (id: string) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, passed: c.passed === true ? false : c.passed === false ? null : true } : c));
  };

  const passed = checks.filter(c => c.passed === true).length;
  const failed = checks.filter(c => c.passed === false).length;
  const pending = checks.filter(c => c.passed === null).length;
  const subsystems = [...new Set(checks.map(c => c.subsystem))];

  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ClipboardCheck" size={24} className="text-purple-600" />
                Программа и методика испытаний ПЗИ
              </CardTitle>
              <CardDescription>Приложение Г. Чек-лист проверок, критерии успешности, протокол испытаний</CardDescription>
            </div>
            <Button onClick={() => exportPDF(checks, notes)} className="gap-1.5">
              <Icon name="Download" size={14} />
              Экспорт протокола
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{checks.length}</p>
          <p className="text-xs text-muted-foreground">Всего тестов</p>
        </Card>
        <Card className="p-3 text-center border-green-200">
          <p className="text-2xl font-bold text-green-600">{passed}</p>
          <p className="text-xs text-muted-foreground">Пройдено</p>
        </Card>
        <Card className="p-3 text-center border-red-200">
          <p className="text-2xl font-bold text-red-600">{failed}</p>
          <p className="text-xs text-muted-foreground">Не пройдено</p>
        </Card>
        <Card className="p-3 text-center border-slate-200">
          <p className="text-2xl font-bold text-slate-500">{pending}</p>
          <p className="text-xs text-muted-foreground">Ожидает</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon name="Target" size={16} className="text-amber-600" />
            Критерий успешности испытаний
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm">
            {PROTOCOL_TEMPLATE.conclusion}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={subsystems[0]}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {subsystems.map(s => (
            <TabsTrigger key={s} value={s} className="text-xs px-2 py-1">
              {s.split(' ').slice(0, 2).join(' ')}
              <Badge className="ml-1 text-[9px] h-4 px-1" variant="outline">
                {checks.filter(c => c.subsystem === s && c.passed === true).length}/{checks.filter(c => c.subsystem === s).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {subsystems.map(s => (
          <TabsContent key={s} value={s} className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">{s}</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs">
                        <TableHead className="w-[55px]">ID</TableHead>
                        <TableHead>Проверка</TableHead>
                        <TableHead>Методика</TableHead>
                        <TableHead>Критерий успешности</TableHead>
                        <TableHead className="w-[90px]">Результат</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checks.filter(c => c.subsystem === s).map(c => (
                        <TableRow key={c.id} className="text-xs">
                          <TableCell className="font-mono font-bold">{c.id}</TableCell>
                          <TableCell className="font-medium">{c.test}</TableCell>
                          <TableCell className="text-muted-foreground">{c.method}</TableCell>
                          <TableCell className="text-muted-foreground">{c.criteria}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => toggle(c.id)}
                              className="flex items-center gap-1"
                            >
                              {c.passed === null ? (
                                <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-slate-100">Не проверено</Badge>
                              ) : c.passed ? (
                                <Badge className="bg-green-100 text-green-700 text-[10px] cursor-pointer hover:bg-green-200">PASSED</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 text-[10px] cursor-pointer hover:bg-red-200">FAILED</Badge>
                              )}
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="FileText" size={18} className="text-slate-600" />
            Шаблон протокола (Приложение Г)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            {PROTOCOL_TEMPLATE.fields.map(f => (
              <div key={f.label} className="flex gap-2 text-sm">
                <span className="text-muted-foreground min-w-[140px]">{f.label}:</span>
                <span className="font-medium">{f.value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Примечания к протоколу</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Дополнительные замечания, выявленные недостатки, рекомендации..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
