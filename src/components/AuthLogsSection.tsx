import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

const AUTH_URL = 'https://functions.poehali.dev/a44dbf08-b20a-4c77-a799-0874d91052ae';

interface AuthLog {
  id: number;
  email: string;
  full_name: string | null;
  action: string;
  success: boolean;
  ip_address: string;
  user_agent: string;
  details: string;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; icon: string }> = {
  login: { label: 'Вход', icon: 'LogIn' },
  register: { label: 'Регистрация', icon: 'UserPlus' },
  logout: { label: 'Выход', icon: 'LogOut' },
  refresh: { label: 'Обновление токена', icon: 'RefreshCw' },
};

export default function AuthLogsSection() {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [emailFilter, setEmailFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const LIMIT = 25;

  const loadLogs = async (p = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'auth_logs',
        limit: String(LIMIT),
        offset: String(p * LIMIT),
      });
      if (emailFilter) params.set('email', emailFilter);
      const res = await fetch(`${AUTH_URL}?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('Failed to load auth logs', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs(0);
    setPage(0);
  }, [emailFilter]);

  const handlePageChange = (p: number) => {
    setPage(p);
    loadLogs(p);
  };

  const totalPages = Math.ceil(total / LIMIT);

  const formatDate = (d: string) => {
    try {
      const date = new Date(d);
      return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return d;
    }
  };

  const stats = {
    total,
    failed: logs.filter(l => !l.success && l.action === 'login').length,
    logins: logs.filter(l => l.success && l.action === 'login').length,
    locked: logs.filter(l => l.details?.includes('ЗАБЛОКИРОВАН')).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Icon name="FileText" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Всего записей</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.logins}</p>
              <p className="text-xs text-muted-foreground">Успешных входов</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Icon name="XCircle" size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.failed}</p>
              <p className="text-xs text-muted-foreground">Неудачных попыток</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Icon name="Lock" size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.locked}</p>
              <p className="text-xs text-muted-foreground">Блокировок</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShieldAlert" size={20} className="text-blue-600" />
                Журнал событий авторизации
              </CardTitle>
              <CardDescription>Все попытки входа, регистрации и выхода из системы</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Поиск по email..."
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="w-full sm:w-60"
              />
              <Button variant="outline" size="sm" onClick={() => loadLogs(page)} disabled={loading}>
                <Icon name={loading ? 'Loader2' : 'RefreshCw'} size={16} className={loading ? 'animate-spin' : ''} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Icon name="Loader2" size={20} className="animate-spin" />
              Загрузка...
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Icon name="ShieldCheck" size={48} className="mb-2 opacity-30" />
              <p>Нет записей</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Дата / время</TableHead>
                      <TableHead>Действие</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>IP-адрес</TableHead>
                      <TableHead>Детали</TableHead>
                      <TableHead className="text-center">Результат</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const actionInfo = ACTION_LABELS[log.action] || { label: log.action, icon: 'Activity' };
                      return (
                        <TableRow key={log.id} className={!log.success ? 'bg-red-50/50 dark:bg-red-950/20' : ''}>
                          <TableCell className="text-xs font-mono whitespace-nowrap">{formatDate(log.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm">
                              <Icon name={actionInfo.icon} size={14} />
                              {actionInfo.label}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-mono">{log.email}</TableCell>
                          <TableCell className="text-sm">{log.full_name || '—'}</TableCell>
                          <TableCell className="text-xs font-mono">{log.ip_address}</TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">{log.details || '—'}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={log.success ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>
                              {log.success ? 'OK' : 'Ошибка'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Показано {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} из {total}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => handlePageChange(page - 1)}>
                      <Icon name="ChevronLeft" size={16} />
                    </Button>
                    <span className="text-sm px-3">{page + 1} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => handlePageChange(page + 1)}>
                      <Icon name="ChevronRight" size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}