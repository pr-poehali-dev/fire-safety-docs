import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityLog {
  id: string;
  action: string;
  section: string;
  timestamp: string;
  details?: string;
}

export default function ActivityHistory() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadActivities = () => {
      const logs = localStorage.getItem('activity_logs');
      if (logs) {
        try {
          setActivities(JSON.parse(logs));
        } catch (e) {
          console.error('Error loading activity logs:', e);
        }
      }
    };

    loadActivities();
    const interval = setInterval(loadActivities, 5000);
    return () => clearInterval(interval);
  }, []);

  const clearHistory = () => {
    localStorage.setItem('activity_logs', JSON.stringify([]));
    setActivities([]);
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Добавлена')) return 'Plus';
    if (action.includes('Удалена')) return 'Trash2';
    if (action.includes('Изменена')) return 'Edit';
    return 'Activity';
  };

  const getActionColor = (action: string) => {
    if (action.includes('Добавлена')) return 'text-green-600';
    if (action.includes('Удалена')) return 'text-red-600';
    if (action.includes('Изменена')) return 'text-blue-600';
    return 'text-gray-600';
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
        size="icon"
      >
        <Icon name="History" size={24} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 shadow-2xl z-50">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-orange-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="History" size={20} />
              История активности
            </CardTitle>
            <CardDescription className="text-white/80 text-xs">
              {activities.length} записей
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">История пуста</p>
              </div>
            ) : (
              activities.slice().reverse().map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className={`flex-shrink-0 ${getActionColor(activity.action)}`}>
                    <Icon name={getActionIcon(activity.action)} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.section}</p>
                    {activity.details && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {activity.details}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        {activities.length > 0 && (
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="w-full"
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Очистить историю
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
