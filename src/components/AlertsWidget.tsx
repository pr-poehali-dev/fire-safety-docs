import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePeriodicAlerts } from '@/hooks/usePeriodicAlerts';
import { PeriodicAlert, severityLabel } from '@/lib/periodicity';

interface AlertsWidgetProps {
  objectId?: number;
  objectName?: string;
  onNavigate?: (sectionId: string) => void;
}

export default function AlertsWidget({ objectId, objectName, onNavigate }: AlertsWidgetProps) {
  const { alerts, loading } = usePeriodicAlerts(objectId);
  const [open, setOpen] = useState(false);
  const [autoShown, setAutoShown] = useState(false);

  const overdue = alerts.filter((a) => a.severity === 'overdue');
  const soon = alerts.filter((a) => a.severity === 'soon');
  const upcoming = alerts.filter((a) => a.severity === 'upcoming');
  const hasCritical = overdue.length > 0 || soon.length > 0;

  // Автопоказ модалки при заходе на объект, если есть критичные алерты
  useEffect(() => {
    if (loading) return;
    if (autoShown) return;
    if (!objectId) return;
    const seenKey = `alerts_seen_${objectId}_${new Date().toDateString()}`;
    if (sessionStorage.getItem(seenKey)) {
      setAutoShown(true);
      return;
    }
    if (hasCritical) {
      setOpen(true);
      sessionStorage.setItem(seenKey, '1');
    }
    setAutoShown(true);
  }, [loading, hasCritical, objectId, autoShown]);

  const handleClick = (alert: PeriodicAlert) => {
    setOpen(false);
    const target = ['fire_extinguishers', 'fire_blankets', 'fire_protection', 'indoor_hydrants', 'hose_rolling',
      'aups', 'soue', 'aupt', 'smoke_ventilation'].includes(alert.sectionId) ? 'journal' : alert.sectionId;
    onNavigate?.(target);
  };

  if (!objectId) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className={`relative gap-2 h-9 rounded-xl ${
          overdue.length > 0
            ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
            : soon.length > 0
            ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
            : ''
        }`}
        title="Уведомления и сроки"
      >
        <Icon name="Bell" size={15} />
        <span className="hidden sm:inline text-xs font-medium">Уведомления</span>
        {alerts.length > 0 && (
          <Badge
            className={`h-5 min-w-5 px-1.5 text-[10px] flex items-center justify-center ${
              overdue.length > 0
                ? 'bg-red-500 text-white'
                : soon.length > 0
                ? 'bg-amber-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {alerts.length}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="BellRing" size={20} className="text-primary" />
              Сводка по срокам
              {objectName && <span className="text-sm font-normal text-muted-foreground">— {objectName}</span>}
            </DialogTitle>
            <DialogDescription>
              Контроль ТО, проверок и тренировок согласно правилам ППР
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Icon name="Loader2" size={18} className="animate-spin" />
              Загрузка данных...
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
                <Icon name="CheckCircle2" size={28} className="text-emerald-600" />
              </div>
              <p className="font-medium">Все сроки в норме</p>
              <p className="text-sm text-muted-foreground mt-1">Просроченных и приближающихся проверок нет</p>
            </div>
          ) : (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 pb-2">
                {overdue.length > 0 && (
                  <AlertGroup
                    title="Пропущенные мероприятия"
                    icon="AlertOctagon"
                    color="red"
                    alerts={overdue}
                    onClick={handleClick}
                  />
                )}
                {soon.length > 0 && (
                  <AlertGroup
                    title="Срок наступает в ближайшие 14 дней"
                    icon="AlertTriangle"
                    color="amber"
                    alerts={soon}
                    onClick={handleClick}
                  />
                )}
                {upcoming.length > 0 && (
                  <AlertGroup
                    title="Предстоящие мероприятия (до 30 дней)"
                    icon="CalendarClock"
                    color="blue"
                    alerts={upcoming}
                    onClick={handleClick}
                  />
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface AlertGroupProps {
  title: string;
  icon: string;
  color: 'red' | 'amber' | 'blue';
  alerts: PeriodicAlert[];
  onClick: (a: PeriodicAlert) => void;
}

function AlertGroup({ title, icon, color, alerts, onClick }: AlertGroupProps) {
  const styles = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', iconBg: 'bg-red-100', iconColor: 'text-red-600', badge: 'bg-red-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', badge: 'bg-amber-500' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', badge: 'bg-blue-500' },
  }[color];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
          <Icon name={icon} size={14} className={styles.iconColor} />
        </div>
        <h3 className={`text-sm font-semibold ${styles.text}`}>{title}</h3>
        <Badge className={`${styles.badge} text-white text-[10px] h-5`}>{alerts.length}</Badge>
      </div>
      <div className="space-y-1.5">
        {alerts.map((a) => (
          <Card
            key={a.id}
            className={`${styles.border} ${styles.bg} cursor-pointer transition-all hover:shadow-sm`}
            onClick={() => onClick(a)}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${styles.text}`}>
                    {a.sectionLabel}
                  </Badge>
                  <Badge className={`${styles.badge} text-white text-[10px] h-4 px-1.5`}>
                    {severityLabel(a.severity)}
                  </Badge>
                </div>
                <p className="text-sm font-medium truncate">{a.itemName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {a.message}
                  {a.nextDueDate && (
                    <>
                      {' • '}
                      срок: {a.nextDueDate.toLocaleDateString('ru-RU')}
                    </>
                  )}
                </p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
