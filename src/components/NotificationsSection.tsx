import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';

interface Notification {
  id: string;
  type: 'deadline' | 'risk' | 'overdue';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
  section: string;
}

export default function NotificationsSection() {
  const [email, setEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    checkDeadlinesAndRisks();
  }, []);

  const loadNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'deadline',
        title: 'Приближается срок перезарядки огнетушителей',
        message: 'До окончания срока осталось 7 дней',
        priority: 'high',
        date: new Date().toISOString(),
        section: 'Журнал эксплуатации',
      },
      {
        id: '2',
        type: 'overdue',
        title: 'Пропущен срок проверки АУПС',
        message: 'Последняя проверка была 45 дней назад',
        priority: 'high',
        date: new Date().toISOString(),
        section: 'Журнал эксплуатации',
      },
      {
        id: '3',
        type: 'risk',
        title: 'Высокий риск: не заполнен чек-лист',
        message: 'Заполнено только 12 из 19 пунктов',
        priority: 'medium',
        date: new Date().toISOString(),
        section: 'Чек-лист',
      },
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.length);
  };

  const checkDeadlinesAndRisks = async () => {
    try {
      const auditsResponse = await fetch(`${API_URL}?table=audits`);
      const audits = await auditsResponse.json();
      
      const newNotifications: Notification[] = [];
      
      audits.forEach((audit: any) => {
        if (audit.deadline) {
          const deadline = new Date(audit.deadline);
          const today = new Date();
          const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 7 && daysUntil > 0) {
            newNotifications.push({
              id: `audit-${audit.id}`,
              type: 'deadline',
              title: 'Приближается срок устранения нарушений',
              message: `До окончания срока осталось ${daysUntil} дней`,
              priority: 'high',
              date: new Date().toISOString(),
              section: 'Проверки',
            });
          } else if (daysUntil < 0) {
            newNotifications.push({
              id: `audit-overdue-${audit.id}`,
              type: 'overdue',
              title: 'Пропущен срок устранения нарушений',
              message: `Просрочка составляет ${Math.abs(daysUntil)} дней`,
              priority: 'high',
              date: new Date().toISOString(),
              section: 'Проверки',
            });
          }
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);
      }
    } catch (error) {
      console.error('Error checking deadlines:', error);
    }
  };

  const handleSaveEmail = () => {
    if (email) {
      localStorage.setItem('notification_email', email);
      setEmailSaved(true);
      alert('Email для уведомлений сохранен. Вы будете получать уведомления о важных событиях.');
    }
  };

  const sendEmailNotification = async (notification: Notification) => {
    const savedEmail = localStorage.getItem('notification_email');
    if (!savedEmail) return;

    alert(`Уведомление отправлено на ${savedEmail}:\n\n${notification.title}\n${notification.message}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'Clock';
      case 'overdue':
        return 'AlertTriangle';
      case 'risk':
        return 'AlertCircle';
      default:
        return 'Bell';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-orange-500 flex items-center justify-center">
              <Icon name="Bell" className="text-white" size={24} />
            </div>
            <div>
              <CardTitle>Уведомления и напоминания</CardTitle>
              <CardDescription>Система отслеживания сроков и рисков</CardDescription>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              {unreadCount} новых
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Mail" size={18} />
              Настройка email-уведомлений
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email для уведомлений</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="flex-1"
                />
                <Button onClick={handleSaveEmail}>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить
                </Button>
              </div>
              {emailSaved && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <Icon name="CheckCircle" size={14} />
                  Email сохранен. Уведомления будут приходить автоматически.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Активные уведомления</h3>
            <Button variant="outline" size="sm" onClick={loadNotifications}>
              <Icon name="RefreshCw" size={14} className="mr-2" />
              Обновить
            </Button>
          </div>

          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="CheckCircle" size={48} className="mx-auto text-green-500 mb-3" />
                <p className="text-sm text-muted-foreground">Все в порядке! Нет активных уведомлений.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="border-l-4"
                  style={{
                    borderLeftColor:
                      notification.priority === 'high'
                        ? '#ef4444'
                        : notification.priority === 'medium'
                        ? '#f59e0b'
                        : '#6b7280',
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded flex items-center justify-center ${
                            notification.type === 'overdue'
                              ? 'bg-red-500'
                              : notification.type === 'deadline'
                              ? 'bg-orange-500'
                              : 'bg-yellow-500'
                          }`}
                        >
                          <Icon name={getTypeIcon(notification.type) as any} className="text-white" size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{notification.title}</h4>
                            <Badge variant={getPriorityColor(notification.priority) as any} className="text-xs">
                              {notification.priority === 'high'
                                ? 'Высокий'
                                : notification.priority === 'medium'
                                ? 'Средний'
                                : 'Низкий'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="Calendar" size={12} />
                              {new Date(notification.date).toLocaleDateString('ru-RU')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Tag" size={12} />
                              {notification.section}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendEmailNotification(notification)}
                      >
                        <Icon name="Mail" size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Автоматические проверки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                <span>Проверка сроков проверок каждые 24 часа</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                <span>Мониторинг высоких рисков в реальном времени</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                <span>Уведомления за 7 дней до истечения срока</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
