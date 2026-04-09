import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

const injectionMeasures = [
  { measure: 'Параметризованные SQL-запросы', status: 'done', detail: 'Все запросы используют %s-плейсхолдеры psycopg2, ни один пользовательский ввод не подставляется напрямую в SQL' },
  { measure: 'Whitelist таблиц', status: 'done', detail: 'Набор ALLOWED_TABLES (30 таблиц) — запросы к любой другой таблице блокируются с кодом 403' },
  { measure: 'Валидация имён полей', status: 'done', detail: 'Regex ^[a-z_][a-z0-9_]{0,62}$ — только латинские буквы, цифры, подчёркивание' },
  { measure: 'Санитизация строк', status: 'done', detail: 'Удаление null-байтов, ограничение длины 10 000 символов, strip script-тегов' },
  { measure: 'XSS-санитизация на клиенте', status: 'done', detail: 'DOMPurify 3.x для очистки HTML-вывода, sanitizeInput() для всех форм' },
  { measure: 'X-Content-Type-Options: nosniff', status: 'done', detail: 'Запрет MIME-sniffing во всех ответах бэкенда и в meta-тегах HTML' },
];

const formMeasures = [
  { measure: 'CSRF-токены', status: 'done', detail: 'HMAC-SHA256 подписанные токены с timestamp, генерация через /csrf_token, валидация на сервере' },
  { measure: 'Rate-limiting логина', status: 'done', detail: '30 запросов/минуту с одного IP. При превышении — HTTP 429 с указанием retry_after' },
  { measure: 'Капча после 3 неудач', status: 'done', detail: 'Арифметическая капча включается автоматически после 3 неудачных попыток входа с IP за 15 мин' },
  { measure: 'Блокировка аккаунта', status: 'done', detail: '5 неудачных попыток → блокировка на 15 мин. Счётчик сбрасывается при успешном входе' },
  { measure: 'Маскировка пароля', status: 'done', detail: 'type="password" + кнопка toggle видимости. Пароль никогда не логируется' },
  { measure: 'Автовыход по неактивности', status: 'done', detail: '20 минут неактивности → автоматический logout + revoke refresh-токена' },
];

const sbom = [
  { name: 'react', version: '18.3.1', license: 'MIT', category: 'Frontend' },
  { name: 'react-dom', version: '18.3.1', license: 'MIT', category: 'Frontend' },
  { name: 'react-router-dom', version: '6.26.2', license: 'MIT', category: 'Frontend' },
  { name: 'typescript', version: '5.5.3', license: 'Apache-2.0', category: 'Frontend' },
  { name: 'vite (rolldown)', version: '7.1.13', license: 'MIT', category: 'Build' },
  { name: 'tailwindcss', version: '3.4.11', license: 'MIT', category: 'UI' },
  { name: 'zod', version: '3.23.8', license: 'MIT', category: 'Validation' },
  { name: 'dompurify', version: '3.3.3', license: 'Apache-2.0/MPL-2.0', category: 'Security' },
  { name: '@radix-ui (15 пакетов)', version: '1.x–2.x', license: 'MIT', category: 'UI' },
  { name: '@tanstack/react-query', version: '5.56.2', license: 'MIT', category: 'Data' },
  { name: 'recharts', version: '2.12.7', license: 'MIT', category: 'Charts' },
  { name: 'lucide-react', version: '0.462.0', license: 'ISC', category: 'Icons' },
  { name: 'class-variance-authority', version: '0.7.1', license: 'Apache-2.0', category: 'UI' },
  { name: 'date-fns', version: '3.6.0', license: 'MIT', category: 'Utility' },
  { name: 'html2canvas', version: '1.4.1', license: 'MIT', category: 'Export' },
  { name: 'jspdf', version: '3.0.4', license: 'MIT', category: 'Export' },
  { name: 'sonner', version: '1.5.0', license: 'MIT', category: 'UI' },
  { name: 'psycopg2-binary', version: '2.9.9', license: 'LGPL', category: 'Backend/DB' },
  { name: 'Python stdlib (hashlib, hmac, secrets, json, csv)', version: '3.11', license: 'PSF', category: 'Backend' },
];

const auditResults = [
  { check: 'npm audit (frontend)', result: 'Проводится при каждой сборке', severity: 'info' },
  { check: 'pip audit (backend)', result: 'psycopg2-binary — единственная зависимость', severity: 'info' },
  { check: 'Известные CVE в зависимостях', result: 'Критических уязвимостей не выявлено', severity: 'ok' },
  { check: 'Secrets в коде', result: 'Все секреты через env-переменные (JWT_SECRET, ENCRYPTION_KEY, DATABASE_URL)', severity: 'ok' },
  { check: 'SQL-инъекции', result: 'Все запросы параметризованы, таблицы по whitelist', severity: 'ok' },
  { check: 'XSS-уязвимости', result: 'DOMPurify + серверная санитизация + security headers', severity: 'ok' },
];

export default function SecurityReportSection() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ShieldCheck" size={24} className="text-green-600" />
            Отчёт о мерах защиты от веб-уязвимостей
          </CardTitle>
          <CardDescription>Статус применённых мер безопасности по OWASP Top 10</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Database" size={18} className="text-blue-600" />
            Защита от инъекций и XSS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {injectionMeasures.map((m) => (
              <div key={m.measure} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Icon name="CheckCircle" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{m.measure}</p>
                  <p className="text-xs text-muted-foreground">{m.detail}</p>
                </div>
                <Badge className="ml-auto bg-green-100 text-green-700 flex-shrink-0">Реализовано</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="FormInput" size={18} className="text-purple-600" />
            Защита форм и аутентификации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formMeasures.map((m) => (
              <div key={m.measure} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Icon name="CheckCircle" size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{m.measure}</p>
                  <p className="text-xs text-muted-foreground">{m.detail}</p>
                </div>
                <Badge className="ml-auto bg-purple-100 text-purple-700 flex-shrink-0">Реализовано</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Package" size={18} className="text-amber-600" />
            SBOM — Software Bill of Materials
          </CardTitle>
          <CardDescription>{sbom.length} компонентов в составе проекта</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Пакет</TableHead>
                  <TableHead>Версия</TableHead>
                  <TableHead>Лицензия</TableHead>
                  <TableHead>Категория</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sbom.map((pkg) => (
                  <TableRow key={pkg.name} className="text-xs">
                    <TableCell className="font-mono font-medium">{pkg.name}</TableCell>
                    <TableCell className="font-mono">{pkg.version}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{pkg.license}</Badge></TableCell>
                    <TableCell>{pkg.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="SearchCheck" size={18} className="text-teal-600" />
            Результаты аудита зависимостей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditResults.map((a) => (
              <div key={a.check} className="flex items-center gap-3 p-2.5 rounded-lg border text-sm">
                <Icon
                  name={a.severity === 'ok' ? 'CheckCircle' : 'Info'}
                  size={16}
                  className={a.severity === 'ok' ? 'text-green-500' : 'text-blue-500'}
                />
                <span className="font-medium min-w-[200px]">{a.check}</span>
                <span className="text-muted-foreground">{a.result}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
