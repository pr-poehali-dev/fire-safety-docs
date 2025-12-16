import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function AssessmentDashboard() {
  const metrics = [
    { label: 'Документация', value: 75, total: 100, icon: 'FileText', color: 'bg-orange-500' },
    { label: 'Журнал эксплуатации', value: 45, total: 100, icon: 'Clipboard', color: 'bg-blue-500' },
    { label: 'Чек-листы', value: 19, total: 19, icon: 'CheckSquare', color: 'bg-green-500' },
    { label: 'Тренировки', value: 2, total: 4, icon: 'Users', color: 'bg-purple-500' },
    { label: 'Исполнительная документация', value: 8, total: 15, icon: 'FolderOpen', color: 'bg-yellow-500' },
    { label: 'Проверки', value: 1, total: 3, icon: 'Search', color: 'bg-red-500' },
  ];

  const upcomingTasks = [
    { task: 'Перезарядка огнетушителей', dueDate: '2025-01-15', priority: 'high' },
    { task: 'Проверка АУПС', dueDate: '2025-01-20', priority: 'medium' },
    { task: 'Тренировка по эвакуации', dueDate: '2025-02-01', priority: 'high' },
    { task: 'Проверка внутренних ПК', dueDate: '2025-02-10', priority: 'low' },
  ];

  const overallCompletion =
    (metrics.reduce((sum, m) => sum + m.value, 0) / metrics.reduce((sum, m) => sum + m.total, 0)) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-orange-500 flex items-center justify-center">
            <Icon name="AlertTriangle" className="text-white" size={24} />
          </div>
          <div>
            <CardTitle>Оценка пожарной безопасности и риски</CardTitle>
            <CardDescription>Интерактивный дашборд состояния ПБ</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Общая готовность объекта</span>
              <Badge variant="outline" className="text-lg font-bold">
                {Math.round(overallCompletion)}%
              </Badge>
            </div>
            <div className="w-full bg-background/50 rounded-full h-4 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${overallCompletion}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const percentage = (metric.value / metric.total) * 100;
            return (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded ${metric.color} flex items-center justify-center`}>
                      <Icon name={metric.icon as any} className="text-white" size={16} />
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {metric.value}/{metric.total}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm">{metric.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-full transition-all rounded-full ${metric.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Clock" size={18} />
              Предстоящие задачи и сроки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded border border-border hover:bg-muted/20 transition"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      task.priority === 'high'
                        ? 'destructive'
                        : task.priority === 'medium'
                        ? 'default'
                        : 'outline'
                    }
                  >
                    {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </Badge>
                  <span className="text-sm font-medium">{task.task}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Calendar" size={14} />
                  {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-sm">Соблюдается</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">85%</p>
              <p className="text-xs text-muted-foreground mt-1">требований ПБ</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-sm">Требует внимания</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">12%</p>
              <p className="text-xs text-muted-foreground mt-1">замечаний</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="text-sm">Критичные</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">3%</p>
              <p className="text-xs text-muted-foreground mt-1">нарушений</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
