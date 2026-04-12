import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const journalCompletion = 92;
const mainIndicators = { tasksCompleted: '47 из 52', avgResponseTime: '4.2 мин', uptime: '99.8%', alertsThisMonth: 3 };
const risks = [
  { level: 'high' as const, title: 'Устаревшее оборудование АУПТ в секторе B' },
  { level: 'medium' as const, title: 'Требуется обновление ПО пожарной сигнализации' },
  { level: 'low' as const, title: 'Планируется замена резервного источника питания' },
];

const getRiskColor = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-blue-500';
  }
};

const getRiskText = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
  }
};

export default function ObjectSummaryCards() {
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="BookOpen" size={20} className="text-orange-600" />
              Состояние заполнения журнала
            </CardTitle>
            <CardDescription>Процент заполненности документации</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <p className="text-4xl font-bold mb-2">{journalCompletion}%</p>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${journalCompletion}%` }} />
                </div>
              </div>
              <div className="text-center">
                <Icon name={journalCompletion >= 90 ? 'CheckCircle2' : 'AlertCircle'} size={48} className={journalCompletion >= 90 ? 'text-green-500' : 'text-yellow-500'} />
                <p className="text-xs mt-1 text-muted-foreground">{journalCompletion >= 90 ? 'Хорошо' : 'Требует внимания'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-cyan-200 dark:border-cyan-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-cyan-600" />
              Основные показатели оценки ПБ
            </CardTitle>
            <CardDescription>Ключевые метрики из раздела оценки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Задачи выполнено</p>
                <p className="text-lg font-bold">{mainIndicators.tasksCompleted}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Время реакции</p>
                <p className="text-lg font-bold">{mainIndicators.avgResponseTime}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Uptime систем</p>
                <p className="text-lg font-bold">{mainIndicators.uptime}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Тревог в месяц</p>
                <p className="text-lg font-bold">{mainIndicators.alertsThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={24} className="text-red-600" />
            Риски объекта
          </CardTitle>
          <CardDescription>Выявленные риски и области для улучшения</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {risks.map((risk, index) => (
              <div key={index} className="flex items-center gap-3 h-10 px-3 bg-muted/50 rounded-md border text-sm">
                <Badge className={getRiskColor(risk.level)}>{getRiskText(risk.level)}</Badge>
                <p className="flex-1 text-sm">{risk.title}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
