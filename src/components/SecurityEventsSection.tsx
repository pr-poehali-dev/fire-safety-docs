import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SEC_URL = 'https://functions.poehali.dev/d4312df2-af21-4674-9bad-af0c3d4ed3a5';

interface SecurityEvent {
  id: number;
  timestamp: string;
  user_id: number | null;
  user_email: string;
  user_name: string;
  action: string;
  category: string;
  resource: string;
  object_id: number | null;
  record_id: number | null;
  old_value: string | null;
  new_value: string | null;
  ip_address: string;
  session_id: string;
  details: string;
  severity: string;
  success: boolean;
}

const CATEGORIES: Record<string, string> = {
  auth: 'Аутентификация',
  data_change: 'Изменение данных',
  access_denied: 'Запрет доступа',
  export: 'Экспорт данных',
  settings: 'Настройки системы',
  user_mgmt: 'Управление пользователями',
  audit_access: 'Доступ к логам',
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  info: { label: 'Инфо', color: 'bg-blue-100 text-blue-700', icon: 'Info' },
  warning: { label: 'Внимание', color: 'bg-amber-100 text-amber-700', icon: 'AlertTriangle' },
  error: { label: 'Ошибка', color: 'bg-red-100 text-red-700', icon: 'XCircle' },
  critical: { label: 'Критично', color: 'bg-red-200 text-red-900', icon: 'ShieldAlert' },
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Создание',
  update: 'Изменение',
  delete: 'Удаление',
  login: 'Вход',
  logout: 'Выход',
  register: 'Регистрация',
  refresh: 'Обновление токена',
  view_security_logs: 'Просмотр логов ИБ',
  export_security_logs: 'Экспорт логов ИБ',
};

const LIMIT = 30;

export default function SecurityEventsSection() {
  const { user } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    severity: '',
    success: '',
    date_from: '',
    date_to: '',
  });

  const loadEvents = useCallback(async (p = 0) => {
    setLoading(true);
    const params = new URLSearchParams({ action: 'search', limit: String(LIMIT), offset: String(p * LIMIT) });
    if (user) params.set('viewer_id', String(user.id));
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.severity) params.set('severity', filters.severity);
    if (filters.success) params.set('success', filters.success);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);

    try {
      const res = await fetch(`${SEC_URL}?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filters, user]);

  const loadStats = async () => {
    try {
      const res = await fetch(`${SEC_URL}?action=stats`);
      setStats(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadEvents(0);
    setPage(0);
  }, [filters.category, filters.severity, filters.success, filters.date_from, filters.date_to]);

  useEffect(() => { loadStats(); }, []);

  const handleSearch = () => { setPage(0); loadEvents(0); };
  const handlePageChange = (p: number) => { setPage(p); loadEvents(p); };

  const handleExportCSV = () => {
    const params = new URLSearchParams({ action: 'export_csv' });
    if (user) params.set('viewer_id', String(user.id));
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    if (filters.category) params.set('category', filters.category);
    window.open(`${SEC_URL}?${params}`, '_blank');
  };

  const fmt = (d: string) => {
    try { return new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    catch { return d; }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const bySeverity = (stats as Record<string, Record<string, number>>)?.by_severity || {};

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Всего событий', value: stats ? (stats as Record<string, number>).total : '—', icon: 'FileText', bg: 'bg-blue-100', fg: 'text-blue-600' },
          { label: 'Info', value: bySeverity.info ?? 0, icon: 'Info', bg: 'bg-sky-100', fg: 'text-sky-600' },
          { label: 'Warning', value: bySeverity.warning ?? 0, icon: 'AlertTriangle', bg: 'bg-amber-100', fg: 'text-amber-600' },
          { label: 'Error', value: bySeverity.error ?? 0, icon: 'XCircle', bg: 'bg-red-100', fg: 'text-red-600' },
          { label: 'Critical', value: bySeverity.critical ?? 0, icon: 'ShieldAlert', bg: 'bg-red-200', fg: 'text-red-800' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                <Icon name={s.icon} size={18} className={s.fg} />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon name="Shield" size={20} className="text-indigo-600" />
                Журнал событий информационной безопасности
              </CardTitle>
              <CardDescription>Централизованный аудит всех действий · Хранение {(stats as Record<string, number>)?.retention_days ?? 180} дней</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
                <Icon name="Download" size={14} />
                CSV для SIEM
              </Button>
              <Button variant="outline" size="sm" onClick={() => { loadEvents(page); loadStats(); }} disabled={loading}>
                <Icon name={loading ? 'Loader2' : 'RefreshCw'} size={14} className={loading ? 'animate-spin' : ''} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Поиск по действию, ресурсу, email, деталям..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={filters.category} onValueChange={(v) => setFilters(f => ({ ...f, category: v === 'all' ? '' : v }))}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Категория" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.severity} onValueChange={(v) => setFilters(f => ({ ...f, severity: v === 'all' ? '' : v }))}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Уровень" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все уровни</SelectItem>
                {Object.entries(SEVERITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.success} onValueChange={(v) => setFilters(f => ({ ...f, success: v === 'all' ? '' : v }))}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Результат" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="true">Успешно</SelectItem>
                <SelectItem value="false">Ошибка</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={filters.date_from} onChange={(e) => setFilters(f => ({ ...f, date_from: e.target.value }))} className="w-[150px]" />
            <Input type="date" value={filters.date_to} onChange={(e) => setFilters(f => ({ ...f, date_to: e.target.value }))} className="w-[150px]" />
            <Button size="sm" onClick={handleSearch}>
              <Icon name="Search" size={14} />
            </Button>
          </div>

          {loading && events.length === 0 ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Icon name="Loader2" size={20} className="animate-spin" />
              Загрузка...
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <Icon name="ShieldCheck" size={48} className="mb-2 opacity-20" />
              <p>Событий не найдено</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead className="w-[130px]">Дата / время</TableHead>
                      <TableHead>Уровень</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Действие</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Ресурс</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead className="text-center">OK</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((ev) => {
                      const sev = SEVERITY_CONFIG[ev.severity] || SEVERITY_CONFIG.info;
                      return (
                        <TableRow key={ev.id} className={`text-xs ${!ev.success ? 'bg-red-50/40' : ''} ${ev.severity === 'critical' ? 'bg-red-100/30' : ''}`}>
                          <TableCell className="font-mono whitespace-nowrap">{fmt(ev.timestamp)}</TableCell>
                          <TableCell>
                            <Badge className={`${sev.color} text-[10px] gap-1`}>
                              <Icon name={sev.icon} size={10} />
                              {sev.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{CATEGORIES[ev.category] || ev.category}</TableCell>
                          <TableCell className="font-medium">{ACTION_LABELS[ev.action] || ev.action}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{ev.user_name || ev.user_email || '—'}</TableCell>
                          <TableCell className="font-mono max-w-[120px] truncate">{ev.resource || '—'}</TableCell>
                          <TableCell className="font-mono">{ev.ip_address}</TableCell>
                          <TableCell className="text-center">
                            <Icon name={ev.success ? 'Check' : 'X'} size={14} className={ev.success ? 'text-green-500' : 'text-red-500'} />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedEvent(ev)}>
                              <Icon name="Eye" size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} из {total}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => handlePageChange(page - 1)}>
                      <Icon name="ChevronLeft" size={14} />
                    </Button>
                    <span className="text-xs px-2">{page + 1}/{totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => handlePageChange(page + 1)}>
                      <Icon name="ChevronRight" size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="FileText" size={18} />
              Событие #{selectedEvent?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Дата:</span> <span className="font-mono">{fmt(selectedEvent.timestamp)}</span></div>
                <div><span className="text-muted-foreground">Уровень:</span> <Badge className={SEVERITY_CONFIG[selectedEvent.severity]?.color}>{SEVERITY_CONFIG[selectedEvent.severity]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Категория:</span> {CATEGORIES[selectedEvent.category] || selectedEvent.category}</div>
                <div><span className="text-muted-foreground">Действие:</span> {ACTION_LABELS[selectedEvent.action] || selectedEvent.action}</div>
                <div><span className="text-muted-foreground">Пользователь:</span> {selectedEvent.user_name || selectedEvent.user_email || '—'}</div>
                <div><span className="text-muted-foreground">IP:</span> <span className="font-mono">{selectedEvent.ip_address}</span></div>
                <div><span className="text-muted-foreground">Ресурс:</span> <span className="font-mono">{selectedEvent.resource || '—'}</span></div>
                <div><span className="text-muted-foreground">Запись #:</span> {selectedEvent.record_id || '—'}</div>
                <div><span className="text-muted-foreground">Объект #:</span> {selectedEvent.object_id || '—'}</div>
                <div><span className="text-muted-foreground">Результат:</span> {selectedEvent.success ? '✅ Успешно' : '❌ Ошибка'}</div>
              </div>

              {selectedEvent.details && (
                <div>
                  <p className="text-muted-foreground mb-1">Детали:</p>
                  <pre className="bg-muted/50 p-3 rounded-lg text-xs whitespace-pre-wrap break-all">{selectedEvent.details}</pre>
                </div>
              )}

              {selectedEvent.old_value && (
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center gap-1"><Icon name="ArrowLeft" size={12} /> Старое значение:</p>
                  <pre className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg text-xs whitespace-pre-wrap break-all max-h-[200px] overflow-auto">
                    {tryFormat(selectedEvent.old_value)}
                  </pre>
                </div>
              )}

              {selectedEvent.new_value && (
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center gap-1"><Icon name="ArrowRight" size={12} /> Новое значение:</p>
                  <pre className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-xs whitespace-pre-wrap break-all max-h-[200px] overflow-auto">
                    {tryFormat(selectedEvent.new_value)}
                  </pre>
                </div>
              )}

              {selectedEvent.session_id && (
                <div><span className="text-muted-foreground">Session ID:</span> <span className="font-mono text-xs">{selectedEvent.session_id}</span></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function tryFormat(val: string): string {
  try {
    return JSON.stringify(JSON.parse(val), null, 2);
  } catch {
    return val;
  }
}
