import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

export default function AssessmentDashboard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const metrics = [
    { label: 'Документация', value: 75, total: 100, icon: 'FileText', color: 'bg-orange-500', trend: '+5', status: 'good' },
    { label: 'Журнал эксплуатации', value: 45, total: 100, icon: 'Clipboard', color: 'bg-blue-500', trend: '+12', status: 'good' },
    { label: 'Чек-листы', value: 19, total: 19, icon: 'CheckSquare', color: 'bg-green-500', trend: '0', status: 'excellent' },
    { label: 'Тренировки', value: 2, total: 4, icon: 'Users', color: 'bg-purple-500', trend: '+1', status: 'warning' },
    { label: 'Исполнительная документация', value: 8, total: 15, icon: 'FolderOpen', color: 'bg-yellow-500', trend: '+3', status: 'warning' },
    { label: 'Проверки', value: 1, total: 3, icon: 'Search', color: 'bg-red-500', trend: '+1', status: 'critical' },
  ];

  const monitoringStats = [
    { label: 'Подключено устройств АУПС', value: 127, icon: 'Radio', color: 'text-blue-500', status: 'online' },
    { label: 'Активных зон контроля', value: 45, icon: 'MapPin', color: 'text-green-500', status: 'active' },
    { label: 'Срабатываний за месяц', value: 3, icon: 'AlertCircle', color: 'text-orange-500', status: 'normal' },
    { label: 'Время отклика системы', value: '1.2с', icon: 'Zap', color: 'text-purple-500', status: 'fast' },
  ];

  const systemHealth = [
    { system: 'АУПС', status: 'Работает', health: 98, lastCheck: '10 минут назад', icon: 'Radio', color: 'bg-green-500' },
    { system: 'СОУЭ', status: 'Работает', health: 100, lastCheck: '5 минут назад', icon: 'Bell', color: 'bg-green-500' },
    { system: 'АУПТ', status: 'Работает', health: 95, lastCheck: '15 минут назад', icon: 'Droplet', color: 'bg-green-500' },
    { system: 'Противодымная вентиляция', status: 'Работает', health: 92, lastCheck: '12 минут назад', icon: 'Wind', color: 'bg-green-500' },
    { system: 'Видеонаблюдение', status: 'Работает', health: 100, lastCheck: '2 минуты назад', icon: 'Video', color: 'bg-green-500' },
  ];

  const upcomingTasks = [
    { task: 'Перезарядка огнетушителей', dueDate: '2025-01-15', priority: 'high', daysLeft: 29 },
    { task: 'Проверка АУПС', dueDate: '2025-01-20', priority: 'medium', daysLeft: 34 },
    { task: 'Тренировка по эвакуации', dueDate: '2025-02-01', priority: 'high', daysLeft: 46 },
    { task: 'Проверка внутренних ПК', dueDate: '2025-02-10', priority: 'low', daysLeft: 55 },
  ];

  const overallCompletion =
    (metrics.reduce((sum, m) => sum + m.value, 0) / metrics.reduce((sum, m) => sum + m.total, 0)) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center animate-in zoom-in duration-500">
            <Icon name="BarChart3" className="text-white" size={24} />
          </div>
          <div>
            <CardTitle>Оценка пожарной безопасности и риски</CardTitle>
            <CardDescription>Интерактивный дашборд состояния ПБ в режиме реального времени</CardDescription>
          </div>
          <Badge variant="outline" className="ml-auto flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            Онлайн
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Общая готовность объекта</span>
                <p className="text-xs text-muted-foreground mt-1">По данным на {new Date().toLocaleDateString('ru-RU')}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-2xl font-bold px-4 py-2 bg-background/50">
                  {Math.round(overallCompletion)}%
                </Badge>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1 justify-end">
                  <Icon name="TrendingUp" size={12} />
                  +8% за месяц
                </p>
              </div>
            </div>
            <div className="w-full bg-background/50 rounded-full h-6 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r from-primary via-primary to-primary/80 relative ${isVisible ? '' : 'w-0'}`}
                style={{ width: isVisible ? `${overallCompletion}%` : '0%' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const percentage = (metric.value / metric.total) * 100;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-l-4 animate-in fade-in slide-in-from-bottom-4"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  borderLeftColor: metric.color.replace('bg-', '')
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-10 h-10 rounded-lg ${metric.color} flex items-center justify-center shadow-md`}>
                      <Icon name={metric.icon as any} className="text-white" size={18} />
                    </div>
                    <div className="ml-auto text-right">
                      <Badge variant="outline" className="font-semibold">
                        {metric.value}/{metric.total}
                      </Badge>
                      {metric.trend !== '0' && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Icon name="TrendingUp" size={10} />
                          {metric.trend}
                        </p>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-1000 ease-out rounded-full ${metric.color} relative`}
                      style={{ width: isVisible ? `${percentage}%` : '0%' }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {percentage === 100 ? 'Выполнено полностью' : `Выполнено ${Math.round(percentage)}%`}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Monitor" size={20} className="text-blue-600" />
                Мониторинг систем АРМ «Орион Про»
              </CardTitle>
              <Badge className="bg-blue-500">
                <Icon name="Activity" size={12} className="mr-1" />
                Активно
              </Badge>
            </div>
            <CardDescription>Статистика подключенного оборудования и систем</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {monitoringStats.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name={stat.icon as any} className={stat.color} size={20} />
                    <Badge variant="outline" className="text-xs">{stat.status}</Badge>
                  </div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Activity" size={20} className="text-green-500" />
              Состояние систем противопожарной защиты
            </CardTitle>
            <CardDescription>Статус работы и показатели здоровья систем</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemHealth.map((system, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 animate-in slide-in-from-right"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className={`w-10 h-10 rounded-lg ${system.color} flex items-center justify-center shadow-md`}>
                  <Icon name={system.icon as any} className="text-white" size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{system.system}</h4>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                      {system.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Работоспособность</span>
                        <span className="text-xs font-semibold">{system.health}%</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                          style={{ width: isVisible ? `${system.health}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Icon name="Clock" size={12} />
                      {system.lastCheck}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="CalendarClock" size={20} className="text-orange-500" />
              Предстоящие задачи и сроки
            </CardTitle>
            <CardDescription>Контроль выполнения плановых мероприятий</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div
                key={index}
                className="group flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-primary hover:shadow-md transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-1 h-12 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={
                          task.priority === 'high'
                            ? 'bg-red-500 hover:bg-red-600'
                            : task.priority === 'medium'
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }
                      >
                        {task.priority === 'high' ? 'Высокий приоритет' : task.priority === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold group-hover:text-primary transition-colors">{task.task}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <Icon name="Calendar" size={16} className="text-muted-foreground" />
                    {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Осталось {task.daysLeft} дней
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950 animate-in fade-in zoom-in" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Соблюдается</CardTitle>
                <Icon name="CheckCircle2" className="text-green-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-green-600 mb-1">85%</p>
                  <p className="text-xs text-muted-foreground">требований ПБ</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Icon name="TrendingUp" size={12} className="mr-1" />
                  +3%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-yellow-50 to-transparent dark:from-yellow-950 animate-in fade-in zoom-in" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Требует внимания</CardTitle>
                <Icon name="AlertTriangle" className="text-yellow-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-yellow-600 mb-1">12%</p>
                  <p className="text-xs text-muted-foreground">замечаний</p>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Icon name="TrendingDown" size={12} className="mr-1" />
                  -2%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950 animate-in fade-in zoom-in" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Критичные</CardTitle>
                <Icon name="XCircle" className="text-red-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-red-600 mb-1">3%</p>
                  <p className="text-xs text-muted-foreground">нарушений</p>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <Icon name="TrendingDown" size={12} className="mr-1" />
                  -1%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-blue-500" />
              Динамика показателей за последний месяц
            </CardTitle>
            <CardDescription>Сравнение с предыдущим периодом</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Завершено задач</span>
                  <Badge className="bg-green-500">+15%</Badge>
                </div>
                <p className="text-2xl font-bold">47 из 52</p>
                <p className="text-xs text-muted-foreground mt-1">В прошлом месяце: 41 из 48</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Среднее время реакции</span>
                  <Badge className="bg-green-500">-20%</Badge>
                </div>
                <p className="text-2xl font-bold">4.2 мин</p>
                <p className="text-xs text-muted-foreground mt-1">В прошлом месяце: 5.3 мин</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}