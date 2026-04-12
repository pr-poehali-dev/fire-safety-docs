import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import jsPDF from 'jspdf';

type CheckStatus = 'pending' | 'passed' | 'failed' | 'na';

interface CheckItem {
  id: string;
  text: string;
  status: CheckStatus;
  note: string;
  tester: string;
  timestamp: string | null;
}

interface CheckGroup {
  id: string;
  title: string;
  icon: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  items: CheckItem[];
}

const STORAGE_KEY = 'acceptance-checklist-v1';

function createInitialGroups(): CheckGroup[] {
  return [
    {
      id: 'auth',
      title: 'Аутентификация и доступ',
      icon: 'Lock',
      emoji: '🔐',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      items: [
        { id: 'auth-01', text: 'Вход с корректными учётными данными → успешная аутентификация, получение JWT-токена', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'auth-02', text: 'Вход с неверным паролем ×5 → блокировка аккаунта на 15 минут', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'auth-03', text: 'Попытка доступа к чужим данным (подмена user_id) → отказ 403', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'auth-04', text: 'Сессия истекает через 20 мин неактивности → автоматический logout', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'auth-05', text: 'Refresh-токен обновляет access-токен без повторного ввода пароля', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'auth-06', text: 'Пароль соответствует политике: ≥12 символов, заглавные, строчные, цифры, спецсимволы', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'auth-07', text: 'Rate-limiting: 31-й запрос на login за 60 сек → HTTP 429', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'auth-08', text: 'Капча появляется после 3 неудачных попыток входа с одного IP', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'auth-09', text: 'Роль manager не видит ИБ-разделы (защита данных, журналы, отчёты)', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'auth-10', text: 'CSRF-токен генерируется и валидируется на сервере', status: 'pending', note: '', tester: '', timestamp: null },
      ],
    },
    {
      id: 'logging',
      title: 'Журналирование',
      icon: 'FileText',
      emoji: '📝',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      items: [
        { id: 'log-01', text: 'Все действия аутентификации попадают в auth_logs: email, IP, timestamp, success/fail', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'log-02', text: 'CRUD-операции в отслеживаемых таблицах записываются в security_events с old/new values', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'log-03', text: 'Логи защищены от модификации: обычный пользователь не может удалить/изменить записи', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'log-04', text: 'Экспорт журналов доступен только администратору (роль admin)', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'log-05', text: 'Попытка доступа к запрещённой таблице фиксируется с severity=warning', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'log-06', text: 'Журнал содержит IP-адрес, User-Agent и Session ID для каждого события', status: 'pending', note: '', tester: '', timestamp: null },
      ],
    },
    {
      id: 'protection',
      title: 'Защита данных',
      icon: 'Shield',
      emoji: '🛡️',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      items: [
        { id: 'prot-01', text: 'Пароли не отображаются в логах, ответах API и localStorage (только хеш в БД)', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'prot-02', text: 'HTTPS принудителен: заголовок HSTS max-age=31536000 присутствует', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'prot-03', text: 'Бэкап БД создаётся автоматически каждые 24 часа', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'prot-04', text: 'Тестовое восстановление из бэкапа выполнено, данные целостны', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'prot-05', text: 'ПДн (ФИО, телефон, должность) зашифрованы AES-256 в БД, encryption_version ≥ 1', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'prot-06', text: 'Ключ шифрования хранится в env-переменной, отсутствует в коде приложения', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'prot-07', text: 'Security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff, X-XSS-Protection', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'prot-08', text: 'SQL-инъекция через имя таблицы → HTTP 403, whitelist блокирует', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'prot-09', text: 'XSS через поле ввода → скрипт не выполняется (DOMPurify + серверная санитизация)', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'prot-10', text: 'Cache-Control: no-store на всех API-ответах с конфиденциальными данными', status: 'pending', note: '', tester: '', timestamp: null },
      ],
    },
    {
      id: 'docs',
      title: 'Документация',
      icon: 'FileCheck',
      emoji: '📄',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      items: [
        { id: 'doc-01', text: 'Приложение В «Техническое решение» заполнено: компоненты, УЗ, потоки, подсистемы ПЗИ', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'doc-02', text: 'ПМИ ПЗИ (Приложение Г) содержит 26 тестов по 9 подсистемам', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'doc-03', text: 'Руководство администратора ПЗИ: порядок УЗ, компрометация, патчи', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'doc-04', text: 'Сетевая архитектура: правила МСЭ (14 правил), таблица взаимодействий (11 потоков)', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'doc-05', text: 'SBOM сформирован: 19 компонентов с версиями и лицензиями', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'doc-06', text: 'Обоснования для каждого исходящего соединения МСЭ задокументированы', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'doc-07', text: 'Схема шифрования документирована: алгоритм, хранение ключа, IV, формат', status: 'pending', note: '', tester: '', timestamp: null },
        { id: 'doc-08', text: 'Все PDF-документы экспортируются корректно из каждого ИБ-раздела', status: 'pending', note: '', tester: '', timestamp: null },
      ],
    },
  ];
}

const STATUS_CONFIG: Record<CheckStatus, { label: string; icon: string; color: string; bgColor: string }> = {
  pending: { label: 'Ожидает', icon: 'Circle', color: 'text-slate-400', bgColor: 'bg-slate-100' },
  passed: { label: 'Пройдено', icon: 'CheckCircle', color: 'text-green-600', bgColor: 'bg-green-100 text-green-700' },
  failed: { label: 'Не пройдено', icon: 'XCircle', color: 'text-red-600', bgColor: 'bg-red-100 text-red-700' },
  na: { label: 'Неприменимо', icon: 'MinusCircle', color: 'text-slate-500', bgColor: 'bg-slate-100 text-slate-600' },
};

const nextStatus = (s: CheckStatus): CheckStatus => {
  const order: CheckStatus[] = ['pending', 'passed', 'failed', 'na'];
  return order[(order.indexOf(s) + 1) % order.length];
};

export default function AcceptanceChecklist() {
  const [groups, setGroups] = useState<CheckGroup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return createInitialGroups();
  });
  const [inspector, setInspector] = useState('');
  const [organization, setOrganization] = useState('ОК РУСАЛ');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  const updateItem = (groupId: string, itemId: string, patch: Partial<CheckItem>) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, items: g.items.map(it => it.id === itemId ? { ...it, ...patch } : it) }
        : g
    ));
  };

  const toggleStatus = (groupId: string, itemId: string) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? {
            ...g,
            items: g.items.map(it =>
              it.id === itemId
                ? { ...it, status: nextStatus(it.status), timestamp: nextStatus(it.status) !== 'pending' ? new Date().toISOString() : null }
                : it
            ),
          }
        : g
    ));
  };

  const resetAll = () => {
    if (confirm('Сбросить все отметки? Данные будут потеряны.')) {
      setGroups(createInitialGroups());
    }
  };

  const allItems = groups.flatMap(g => g.items);
  const totalCount = allItems.length;
  const passedCount = allItems.filter(i => i.status === 'passed').length;
  const failedCount = allItems.filter(i => i.status === 'failed').length;
  const naCount = allItems.filter(i => i.status === 'na').length;
  const pendingCount = totalCount - passedCount - failedCount - naCount;
  const progressPct = totalCount > 0 ? Math.round(((passedCount + failedCount + naCount) / totalCount) * 100) : 0;
  const isComplete = pendingCount === 0;
  const verdict = isComplete && failedCount === 0 ? 'accepted' : isComplete && failedCount > 0 ? 'rejected' : 'in_progress';

  const exportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pw = 190;
    let y = 15;

    const addTitle = (t: string, s = 14) => {
      doc.setFontSize(s); doc.setFont('helvetica', 'bold');
      doc.text(t, 10, y); y += s * 0.7;
    };
    const addText = (t: string, s = 9) => {
      doc.setFontSize(s); doc.setFont('helvetica', 'normal');
      doc.splitTextToSize(t, pw).forEach((l: string) => {
        if (y > 275) { doc.addPage(); y = 15; }
        doc.text(l, 10, y); y += s * 0.5;
      });
    };
    const addRow = (cols: string[], ws: number[], bold = false) => {
      if (y > 262) { doc.addPage(); y = 15; }
      doc.setFontSize(7); doc.setFont('helvetica', bold ? 'bold' : 'normal');
      let x = 10;
      let maxH = 4;
      cols.forEach((c, i) => {
        const ls = doc.splitTextToSize(c, ws[i] - 2);
        maxH = Math.max(maxH, ls.length * 2.8 + 1);
      });
      cols.forEach((c, i) => {
        const ls = doc.splitTextToSize(c, ws[i] - 2);
        ls.forEach((l: string, li: number) => doc.text(l, x + 1, y + li * 2.8));
        doc.rect(x, y - 3, ws[i], maxH);
        x += ws[i];
      });
      y += maxH;
    };

    addTitle('AKT PRIEMKI — Chek-list proverki PZI', 16);
    y += 2;
    addText(`Organizaciya: ${organization}`);
    addText(`Proverka provedena: ${inspector || '(ne ukazano)'}`);
    addText(`Data: ${new Date().toLocaleDateString('ru-RU')}`);
    y += 2;
    addText(`Itogo: ${passedCount} passed / ${failedCount} failed / ${naCount} N/A / ${pendingCount} pending iz ${totalCount}`);
    addText(`Progress: ${progressPct}%`);

    const verdictText = verdict === 'accepted' ? 'PRINYATO — vse proverki projdeny' : verdict === 'rejected' ? 'NE PRINYATO — est ne projdennye proverki' : 'V PROCESSE — ne vse proverki zaversheny';
    addText(`Reshenie: ${verdictText}`);
    y += 5;

    groups.forEach(g => {
      if (y > 220) { doc.addPage(); y = 15; }
      addTitle(`${g.emoji} ${g.title}`, 11);
      y += 2;
      const ws = [14, 80, 20, 30, pw - 144];
      addRow(['ID', 'Proverka', 'Status', 'Proveril', 'Primechanie'], ws, true);
      g.items.forEach(it => {
        const statusLabel = STATUS_CONFIG[it.status].label;
        addRow([it.id.toUpperCase(), it.text, statusLabel, it.tester || '—', it.note || '—'], ws);
      });
      y += 4;
    });

    y += 6;
    if (y > 240) { doc.addPage(); y = 15; }
    addText('Podpisi:'); y += 5;
    addText('Predsedatel komissii: _________________ / _________________ /'); y += 5;
    addText('Chlen komissii:      _________________ / _________________ /'); y += 5;
    addText('Chlen komissii:      _________________ / _________________ /');

    doc.save('akt-priemki-pzi.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">

        <Card className="border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Icon name="ClipboardCheck" size={28} />
                  Чек-лист приёмки системы ПЗИ
                </CardTitle>
                <CardDescription className="text-blue-100 mt-1">
                  Интерактивная проверка подсистемы защиты информации
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetAll} className="text-white border-white/30 hover:bg-white/10 gap-1.5">
                  <Icon name="RotateCcw" size={14} />
                  Сбросить
                </Button>
                <Button size="sm" onClick={exportPDF} className="bg-white text-blue-700 hover:bg-blue-50 gap-1.5">
                  <Icon name="Download" size={14} />
                  Экспорт PDF
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Проверяющий:</label>
              <Input value={inspector} onChange={e => setInspector(e.target.value)} placeholder="ФИО проверяющего" className="text-sm" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Организация:</label>
              <Input value={organization} onChange={e => setOrganization(e.target.value)} className="text-sm" />
            </div>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">Прогресс проверки</span>
                  <span className="text-sm font-bold">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-3" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold">{totalCount}</p>
                <p className="text-[10px] text-muted-foreground">Всего</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
                <p className="text-lg font-bold text-green-600">{passedCount}</p>
                <p className="text-[10px] text-green-600">Пройдено</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
                <p className="text-lg font-bold text-red-600">{failedCount}</p>
                <p className="text-[10px] text-red-600">Не пройдено</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-lg font-bold text-slate-500">{naCount}</p>
                <p className="text-[10px] text-muted-foreground">N/A</p>
              </div>
              <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-lg font-bold text-amber-600">{pendingCount}</p>
                <p className="text-[10px] text-amber-600">Ожидает</p>
              </div>
            </div>
            {isComplete && (
              <div className={`mt-4 p-3 rounded-lg border text-center text-sm font-semibold ${
                verdict === 'accepted' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'
              }`}>
                <Icon name={verdict === 'accepted' ? 'CheckCircle' : 'XCircle'} size={20} className="inline mr-2" />
                {verdict === 'accepted' ? 'СИСТЕМА ПРИНЯТА — все проверки пройдены успешно' : `СИСТЕМА НЕ ПРИНЯТА — ${failedCount} проверок не пройдено`}
              </div>
            )}
          </CardContent>
        </Card>

        {groups.map(group => {
          const gPassed = group.items.filter(i => i.status === 'passed').length;
          const gTotal = group.items.length;
          const gDone = group.items.filter(i => i.status !== 'pending').length;
          return (
            <Card key={group.id} className={`${group.borderColor} border`}>
              <CardHeader className={`${group.bgColor} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-lg">{group.emoji}</span>
                    <Icon name={group.icon} size={18} className={group.color} />
                    {group.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={gPassed === gTotal ? 'bg-green-100 text-green-700 border-green-300' : ''}>
                      {gPassed}/{gTotal}
                    </Badge>
                    <Progress value={gTotal > 0 ? (gDone / gTotal) * 100 : 0} className="w-20 h-2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {group.items.map(item => {
                    const sc = STATUS_CONFIG[item.status];
                    const isExpanded = expandedNote === item.id;
                    return (
                      <div key={item.id} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleStatus(group.id, item.id)}
                            className="mt-0.5 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full"
                            title="Нажмите для смены статуса: Ожидает → Пройдено → Не пройдено → N/A"
                          >
                            <Icon name={sc.icon} size={22} className={`${sc.color} transition-colors`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm ${item.status === 'passed' ? 'line-through text-muted-foreground' : ''}`}>
                                <span className="font-mono text-[10px] text-muted-foreground mr-1.5">{item.id.toUpperCase()}</span>
                                {item.text}
                              </p>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <Badge className={`${sc.bgColor} text-[10px]`}>{sc.label}</Badge>
                                <button
                                  onClick={() => setExpandedNote(isExpanded ? null : item.id)}
                                  className="text-muted-foreground hover:text-foreground"
                                  title="Добавить примечание"
                                >
                                  <Icon name={item.note ? 'MessageSquareText' : 'MessageSquare'} size={14} className={item.note ? 'text-blue-500' : ''} />
                                </button>
                              </div>
                            </div>
                            {item.timestamp && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(item.timestamp).toLocaleString('ru-RU')}
                                {item.tester && ` — ${item.tester}`}
                              </p>
                            )}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-2 ml-[34px] space-y-2 animate-in slide-in-from-top-2">
                            <div className="flex gap-2">
                              <Input
                                value={item.tester}
                                onChange={e => updateItem(group.id, item.id, { tester: e.target.value })}
                                placeholder="Кто проверил"
                                className="text-xs h-8 max-w-[200px]"
                              />
                            </div>
                            <Textarea
                              value={item.note}
                              onChange={e => updateItem(group.id, item.id, { note: e.target.value })}
                              placeholder="Примечание: результат проверки, замечания..."
                              rows={2}
                              className="text-xs"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>Данные сохраняются в браузере автоматически. Для передачи результатов используйте «Экспорт PDF».</p>
              <p>Нажимайте на иконку статуса для переключения: <span className="font-mono">Ожидает → Пройдено → Не пройдено → N/A</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
