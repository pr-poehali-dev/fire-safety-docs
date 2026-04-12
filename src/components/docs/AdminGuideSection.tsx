import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import jsPDF from 'jspdf';

interface Procedure {
  step: number;
  title: string;
  details: string;
  responsible: string;
  note?: string;
}

const USER_MANAGEMENT: Procedure[] = [
  { step: 1, title: 'Получение заявки на создание УЗ', details: 'Получить заявку от руководителя подразделения с указанием: ФИО, email (@rusal.com), должность, требуемая роль (admin/responsible/manager).', responsible: 'Администратор ИБ' },
  { step: 2, title: 'Проверка полномочий', details: 'Убедиться, что заявку подписал уполномоченный руководитель. Для роли admin — согласование с руководителем ИБ.', responsible: 'Администратор ИБ' },
  { step: 3, title: 'Регистрация пользователя', details: 'Открыть систему → Раздел «Личный кабинет» (admin) → Регистрационная форма. Заполнить email, ФИО, телефон, должность, роль. Установить временный пароль (мин. 12 символов: заглавные + строчные + цифры + спецсимволы).', responsible: 'Администратор ИБ', note: 'Персональные данные (ФИО, телефон, должность) автоматически шифруются AES-256 при сохранении.' },
  { step: 4, title: 'Передача учётных данных', details: 'Передать email и временный пароль пользователю по защищённому каналу (лично или корпоративный мессенджер). Запретить передачу через email или SMS.', responsible: 'Администратор ИБ' },
  { step: 5, title: 'Первый вход и смена пароля', details: 'Пользователь входит с временным паролем и обязан сменить его при первом входе. Новый пароль должен соответствовать политике: ≥12 символов, заглавные, строчные, цифры, спецсимволы.', responsible: 'Пользователь' },
  { step: 6, title: 'Подтверждение активации', details: 'Проверить в журнале авторизации (auth_logs) наличие записи об успешном первом входе пользователя.', responsible: 'Администратор ИБ' },
];

const USER_DELETION: Procedure[] = [
  { step: 1, title: 'Получение заявки на удаление/блокировку', details: 'Заявка от руководителя подразделения или кадровой службы (при увольнении/переводе).', responsible: 'Администратор ИБ' },
  { step: 2, title: 'Блокировка учётной записи', details: 'Немедленная деактивация: установить is_active = FALSE через админ-панель. Все активные сессии прекращены, refresh-токены отозваны.', responsible: 'Администратор ИБ', note: 'При подозрении на компрометацию — блокировка выполняется немедленно, без ожидания заявки.' },
  { step: 3, title: 'Ревизия действий пользователя', details: 'Проверить журнал авторизации и журнал событий ИБ за последние 30 дней на предмет подозрительной активности.', responsible: 'Администратор ИБ' },
  { step: 4, title: 'Документирование', details: 'Зафиксировать факт блокировки в журнале событий ИБ: дата, причина, кем заблокирован.', responsible: 'Администратор ИБ' },
];

const COMPROMISE_ACTIONS: Procedure[] = [
  { step: 1, title: 'Немедленная блокировка', details: 'Заблокировать скомпрометированную учётную запись (is_active = FALSE). Отозвать все refresh-токены пользователя. Время реакции: не более 15 минут с момента обнаружения.', responsible: 'Администратор ИБ' },
  { step: 2, title: 'Фиксация инцидента', details: 'Создать запись в журнале событий ИБ: категория «Инцидент ИБ», severity = «critical». Зафиксировать: время обнаружения, признаки компрометации, IP-адреса, затронутые данные.', responsible: 'Администратор ИБ' },
  { step: 3, title: 'Анализ масштаба', details: 'Проанализировать auth_logs и security_events: 1) Какие действия совершены от имени пользователя; 2) К каким данным был доступ; 3) Были ли изменения/удаления; 4) Другие IP-адреса в сессиях.', responsible: 'Администратор ИБ' },
  { step: 4, title: 'Смена секретов (при необходимости)', details: 'Если скомпрометирован admin: сменить JWT_SECRET, ENCRYPTION_KEY (с перешифрованием данных). Сменить DATABASE_URL если есть подозрение на утечку DSN. Обновить AWS-ключи при подозрении на доступ к хранилищу.', responsible: 'Системный администратор', note: 'Смена JWT_SECRET приведёт к выходу ВСЕХ пользователей. Смена ENCRYPTION_KEY требует перешифрования всех ПДн.' },
  { step: 5, title: 'Уведомление', details: 'Уведомить: руководителя ИБ, руководителя подразделения пользователя. При утечке ПДн — уведомить субъектов данных в соответствии с 152-ФЗ (72 часа).', responsible: 'Руководитель ИБ' },
  { step: 6, title: 'Восстановление доступа', details: 'После устранения угрозы: создать новую учётную запись для пользователя с новым паролем. Старая УЗ остаётся заблокированной навсегда (для аудита).', responsible: 'Администратор ИБ' },
  { step: 7, title: 'Пост-анализ', details: 'В течение 5 рабочих дней подготовить отчёт об инциденте: причины, последствия, принятые меры, рекомендации по предотвращению.', responsible: 'Администратор ИБ' },
];

const PATCH_MANAGEMENT: Procedure[] = [
  { step: 1, title: 'Мониторинг уязвимостей', details: 'Еженедельная проверка обновлений: npm audit (frontend), pip audit (backend psycopg2), CVE-базы для Python 3.11, PostgreSQL 15.', responsible: 'Системный администратор' },
  { step: 2, title: 'Оценка критичности', details: 'Классификация по CVSS: Critical (9.0+) — патч в течение 24ч; High (7.0–8.9) — 72ч; Medium (4.0–6.9) — 7 дней; Low (<4.0) — плановое обновление.', responsible: 'Администратор ИБ' },
  { step: 3, title: 'Тестирование патча', details: 'Применить обновление на тестовом стенде. Прогнать ПМИ ПЗИ (минимум критические тесты T-01…T-17). Убедиться в отсутствии регрессий.', responsible: 'Системный администратор' },
  { step: 4, title: 'Бэкап перед обновлением', details: 'Создать полный бэкап БД и конфигурации. Убедиться, что бэкап успешен (проверить чек-лист в разделе «Защита данных»).', responsible: 'Системный администратор' },
  { step: 5, title: 'Применение обновления', details: 'Применить патч в production. Для frontend: обновить package.json → bun install → vite build → deploy. Для backend: обновить requirements.txt → sync_backend. Для БД: миграция через migrate_db.', responsible: 'Системный администратор' },
  { step: 6, title: 'Верификация', details: 'Проверить работоспособность системы после обновления: вход, CRUD-операции, журналы. Убедиться, что security headers присутствуют.', responsible: 'Администратор ИБ' },
  { step: 7, title: 'Документирование', details: 'Зафиксировать в журнале событий ИБ: какой патч применён, дата, кем, результат. Обновить SBOM в разделе «Отчёт безопасности».', responsible: 'Администратор ИБ' },
];

function exportPDF() {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = 190;
  let y = 15;
  const title = (t: string, s = 14) => { doc.setFontSize(s); doc.setFont('helvetica', 'bold'); doc.text(t, 10, y); y += s * 0.7; };
  const text = (t: string, s = 9) => {
    doc.setFontSize(s); doc.setFont('helvetica', 'normal');
    doc.splitTextToSize(t, pw).forEach((l: string) => { if (y > 275) { doc.addPage(); y = 15; } doc.text(l, 10, y); y += s * 0.5; });
  };
  const procSection = (name: string, procs: Procedure[]) => {
    if (y > 200) { doc.addPage(); y = 15; }
    title(name, 12); y += 2;
    procs.forEach(p => {
      if (y > 260) { doc.addPage(); y = 15; }
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(`${p.step}. ${p.title}`, 10, y); y += 4;
      text(p.details);
      text(`Otvetstvennyy: ${p.responsible}`);
      if (p.note) { text(`! ${p.note}`); }
      y += 2;
    });
  };

  title('Rukovodstvo administratora PZI', 16); y += 2;
  text('Sistema: Podsistema pozharnoy bezopasnosti (SPB RUSAL)');
  text('Data: ' + new Date().toLocaleDateString('ru-RU'));
  text('Versiya: 1.0'); y += 5;

  procSection('1. Poryadok dobavleniya polzovateley', USER_MANAGEMENT);
  y += 3;
  procSection('2. Poryadok blokirovki/udaleniya polzovateley', USER_DELETION);
  y += 3;
  procSection('3. Deystviya pri podozrenii na komprometaciyu', COMPROMISE_ACTIONS);
  y += 3;
  procSection('4. Reglament obnovleniya i primeneniya patchey', PATCH_MANAGEMENT);

  doc.save('rukovodstvo-administratora-pzi.pdf');
}

function ProcedureCard({ title: t, icon, procedures, color }: { title: string; icon: string; procedures: Procedure[]; color: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name={icon} size={18} className={color} />
          {t}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {procedures.map(p => (
            <div key={p.step} className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                {p.step}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.details}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    <Icon name="User" size={10} className="mr-1" />{p.responsible}
                  </Badge>
                </div>
                {p.note && (
                  <div className="mt-1.5 p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-700 flex gap-1.5">
                    <Icon name="AlertTriangle" size={12} className="flex-shrink-0 mt-0.5" />
                    {p.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminGuideSection() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BookOpen" size={24} className="text-orange-600" />
                Руководство администратора ПЗИ
              </CardTitle>
              <CardDescription>Порядок управления УЗ, действия при инцидентах, регламент обновлений</CardDescription>
            </div>
            <Button onClick={exportPDF} className="gap-1.5">
              <Icon name="Download" size={14} />
              Экспорт PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="users">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="users">Добавление УЗ</TabsTrigger>
          <TabsTrigger value="deletion">Блокировка УЗ</TabsTrigger>
          <TabsTrigger value="compromise">Компрометация</TabsTrigger>
          <TabsTrigger value="patches">Обновления</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <ProcedureCard title="Порядок добавления пользователей" icon="UserPlus" procedures={USER_MANAGEMENT} color="text-green-600" />
        </TabsContent>

        <TabsContent value="deletion" className="mt-4">
          <ProcedureCard title="Порядок блокировки / удаления учётных записей" icon="UserMinus" procedures={USER_DELETION} color="text-red-600" />
        </TabsContent>

        <TabsContent value="compromise" className="mt-4">
          <ProcedureCard title="Действия при подозрении на компрометацию" icon="ShieldAlert" procedures={COMPROMISE_ACTIONS} color="text-red-600" />
        </TabsContent>

        <TabsContent value="patches" className="mt-4">
          <ProcedureCard title="Регламент обновления и применения патчей" icon="RefreshCw" procedures={PATCH_MANAGEMENT} color="text-blue-600" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
