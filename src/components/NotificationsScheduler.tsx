import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { authedFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const NOTIFY_API = 'https://functions.poehali.dev/22fb22b6-8e71-4acf-b2a0-d3bf8dadd080';

interface RunResult {
  success: boolean;
  checked?: number;
  sent?: number;
  skipped?: number;
  failed?: number;
  details?: { object: string; status: string; alerts?: number; critical?: number; error?: string }[];
  error?: string;
}

interface Props {
  objectId?: number;
}

export default function NotificationsScheduler({ objectId }: Props) {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await authedFetch(NOTIFY_API, {
        method: 'POST',
        body: JSON.stringify({
          action: 'run_periodic_check',
          ...(objectId ? { object_id: objectId } : {}),
        }),
      });
      const data: RunResult = await res.json();
      setResult(data);
      if (res.ok && data.success) {
        toast({
          title: 'Проверка завершена',
          description: `Проверено: ${data.checked}, отправлено: ${data.sent}, без алертов: ${data.skipped}`,
        });
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Сбой запуска', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Ошибка', description: e instanceof Error ? e.message : 'Сбой', variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Icon name="MailCheck" className="text-white" size={20} />
          </div>
          <div>
            <CardTitle>Email-уведомления о сроках</CardTitle>
            <CardDescription>
              Сканирование журналов и рассылка писем о просроченных и приближающихся проверках
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Icon name="Info" size={16} />
          <AlertDescription className="text-xs">
            Кнопка ниже запустит ручную проверку всех объектов и разошлёт сводку по email-адресам, указанным в карточке объекта.
            Письма отправляются только если есть просрочки или сроки в ближайшие 14 дней.
            <br />
            Для автоматического ежедневного запуска используется внешний cron-сервис, который дёргает этот endpoint с заголовком X-Cron-Token.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={handleRun} disabled={running} className="gap-2">
            {running ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Play" size={16} />}
            {objectId ? 'Проверить этот объект' : 'Проверить все объекты'}
          </Button>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Stat label="Проверено" value={result.checked ?? 0} color="default" />
              <Stat label="Отправлено" value={result.sent ?? 0} color="emerald" />
              <Stat label="Без алертов" value={result.skipped ?? 0} color="slate" />
              <Stat label="Ошибок" value={result.failed ?? 0} color={(result.failed ?? 0) > 0 ? 'red' : 'default'} />
            </div>

            {result.details && result.details.length > 0 && (
              <details className="border rounded-lg" open>
                <summary className="cursor-pointer px-4 py-2.5 font-medium text-sm hover:bg-muted/30 select-none flex items-center gap-2">
                  <Icon name="List" size={14} />
                  Детали по объектам ({result.details.length})
                </summary>
                <div className="px-4 py-3 border-t space-y-1.5 max-h-72 overflow-y-auto text-xs">
                  {result.details.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 border-b last:border-0">
                      <Badge
                        className={
                          d.status === 'sent' ? 'bg-emerald-500' :
                          d.status === 'skipped' ? 'bg-slate-400' :
                          'bg-red-500'
                        }
                      >
                        {d.status === 'sent' ? 'отпр.' : d.status === 'skipped' ? 'нет алертов' : 'ошибка'}
                      </Badge>
                      <span className="font-medium flex-1 truncate">{d.object}</span>
                      {d.alerts !== undefined && (
                        <span className="text-muted-foreground">{d.alerts} алертов{d.critical ? `, ${d.critical} критич.` : ''}</span>
                      )}
                      {d.error && <span className="text-red-600 truncate max-w-[180px]" title={d.error}>{d.error}</span>}
                    </div>
                  ))}
                </div>
              </details>
            )}

            {result.error && (
              <Alert variant="destructive">
                <Icon name="AlertCircle" size={16} />
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: 'default' | 'emerald' | 'red' | 'slate' }) {
  const colorClass =
    color === 'emerald' ? 'text-emerald-600' :
    color === 'red' ? 'text-red-600' :
    color === 'slate' ? 'text-slate-600' :
    'text-foreground';
  return (
    <div className="p-2.5 rounded-lg border bg-muted/20">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}
