import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FireIncident {
  id: string;
  date: string;
  location: string;
  area: number;
  startTime: string;
  endTime: string;
  casualties: string;
  cause: string;
  damage: string;
  productionStop: string;
}

interface FiresDashboardProps {
  incidents: FireIncident[];
}

export default function FiresDashboard({ incidents }: FiresDashboardProps) {
  const monthlyData = incidents.reduce((acc: Record<string, any>, incident) => {
    const [day, month, year] = incident.date.split('.');
    const monthKey = `${month}.${year}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, count: 0, totalArea: 0, withCasualties: 0, totalDamage: 0 };
    }
    
    acc[monthKey].count += 1;
    acc[monthKey].totalArea += incident.area;
    if (incident.casualties !== 'Нет' && incident.casualties !== '') {
      acc[monthKey].withCasualties += 1;
    }
    
    const damageNum = parseFloat(incident.damage.replace(/\D/g, ''));
    if (!isNaN(damageNum)) {
      acc[monthKey].totalDamage += damageNum;
    }
    
    return acc;
  }, {});

  const monthlyChartData = Object.values(monthlyData).sort((a: any, b: any) => {
    const [monthA, yearA] = a.month.split('.');
    const [monthB, yearB] = b.month.split('.');
    return new Date(`${yearA}-${monthA}`).getTime() - new Date(`${yearB}-${monthB}`).getTime();
  });

  const causeData = incidents.reduce((acc: Record<string, number>, incident) => {
    const cause = incident.cause || 'Не установлена';
    acc[cause] = (acc[cause] || 0) + 1;
    return acc;
  }, {});

  const causeChartData = Object.entries(causeData).map(([cause, count]) => ({
    name: cause.length > 30 ? cause.substring(0, 30) + '...' : cause,
    value: count,
  }));

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4'];

  const totalArea = incidents.reduce((sum, inc) => sum + inc.area, 0);
  const totalDamage = incidents.reduce((sum, inc) => {
    const damageNum = parseFloat(inc.damage.replace(/\D/g, ''));
    return sum + (isNaN(damageNum) ? 0 : damageNum);
  }, 0);
  const withCasualties = incidents.filter(inc => inc.casualties !== 'Нет' && inc.casualties !== '').length;
  const avgArea = incidents.length > 0 ? (totalArea / incidents.length).toFixed(1) : '0';

  const riskLevel = incidents.length === 0 ? 'low' : 
                   incidents.length >= 5 ? 'high' : 
                   incidents.length >= 2 ? 'medium' : 'low';

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'high': return 'Высокий уровень риска';
      case 'medium': return 'Средний уровень риска';
      case 'low': return 'Низкий уровень риска';
      default: return 'Не определен';
    }
  };

  if (incidents.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="CheckCircle2" size={24} className="text-green-600" />
            Статистика пожаров
          </CardTitle>
          <CardDescription>Анализ пожарных инцидентов на объекте</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="Shield" size={64} className="text-green-400 mb-4" />
            <p className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
              Отличные показатели!
            </p>
            <p className="text-muted-foreground">
              На объекте не зарегистрировано пожарных инцидентов. Продолжайте соблюдать меры пожарной безопасности.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className={`bg-gradient-to-br ${
        riskLevel === 'high' ? 'from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-200 dark:border-red-800' :
        riskLevel === 'medium' ? 'from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800' :
        'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Flame" size={24} className="text-red-600" />
            Общая статистика пожаров
          </CardTitle>
          <CardDescription>Ключевые показатели за весь период наблюдения</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
              <Icon name="AlertTriangle" size={32} className="text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600">{incidents.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Всего инцидентов</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
              <Icon name="Maximize2" size={32} className="text-orange-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-orange-600">{totalArea.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground mt-1">Общая площадь (м²)</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
              <Icon name="Users" size={32} className="text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{withCasualties}</p>
              <p className="text-sm text-muted-foreground mt-1">С пострадавшими</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
              <Icon name="DollarSign" size={32} className="text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {(totalDamage / 1000000).toFixed(2)} млн
              </p>
              <p className="text-sm text-muted-foreground mt-1">Общий ущерб (₽)</p>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 flex items-start gap-3 ${
            riskLevel === 'high' ? 'bg-red-100 dark:bg-red-900/30 border-red-400' :
            riskLevel === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400' :
            'bg-green-100 dark:bg-green-900/30 border-green-400'
          }`}>
            <Badge className={`${getRiskColor(riskLevel)} text-white`}>
              {getRiskText(riskLevel)}
            </Badge>
            <div className="flex-1 text-sm">
              <p className="font-medium mb-1">Оценка пожарной безопасности</p>
              <p className="text-muted-foreground">
                {riskLevel === 'high' && 'Критический уровень! Требуется немедленный пересмотр мер пожарной безопасности и проведение дополнительных инструктажей.'}
                {riskLevel === 'medium' && 'Необходимо усилить профилактические меры и провести внеплановую проверку систем противопожарной защиты.'}
                {riskLevel === 'low' && 'Уровень безопасности в норме. Продолжайте соблюдать установленные правила и регламенты.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-red-600" />
              Динамика инцидентов по месяцам
            </CardTitle>
            <CardDescription>Количество пожаров и пострадавших</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="count" name="Инциденты" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withCasualties" name="С пострадавшими" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="PieChart" size={20} className="text-orange-600" />
              Причины пожаров
            </CardTitle>
            <CardDescription>Распределение по установленным причинам</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={causeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {causeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="AreaChart" size={20} className="text-blue-600" />
              Площадь поражения
            </CardTitle>
            <CardDescription>Площадь пожаров по месяцам (м²)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="totalArea"
                  name="Площадь (м²)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="DollarSign" size={20} className="text-green-600" />
              Материальный ущерб
            </CardTitle>
            <CardDescription>Ущерб по месяцам (млн руб.)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [(value / 1000000).toFixed(2) + ' млн', 'Ущерб']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar 
                  dataKey="totalDamage" 
                  name="Материальный ущерб" 
                  fill="#22c55e" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Target" size={20} className="text-purple-600" />
            Средние показатели
          </CardTitle>
          <CardDescription>Аналитика по всем инцидентам</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Средняя площадь пожара</p>
              <p className="text-2xl font-bold text-purple-600">{avgArea} м²</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Процент с пострадавшими</p>
              <p className="text-2xl font-bold text-red-600">
                {((withCasualties / incidents.length) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Средний ущерб</p>
              <p className="text-2xl font-bold text-blue-600">
                {(totalDamage / incidents.length / 1000000).toFixed(2)} млн
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ListChecks" size={20} className="text-amber-600" />
            Рекомендации по снижению рисков
          </CardTitle>
          <CardDescription>На основе анализа произошедших инцидентов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-950 rounded-lg border">
              <Icon name="AlertCircle" size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Усилить профилактику</p>
                <p className="text-muted-foreground">
                  Провести дополнительные инструктажи сотрудников, особенно в местах с высокой пожарной нагрузкой.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-950 rounded-lg border">
              <Icon name="Wrench" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Проверить оборудование</p>
                <p className="text-muted-foreground">
                  Внеплановая проверка электропроводки и систем противопожарной защиты в зонах повышенного риска.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-950 rounded-lg border">
              <Icon name="FileText" size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Актуализировать документацию</p>
                <p className="text-muted-foreground">
                  Обновить планы эвакуации и инструкции с учетом выявленных слабых мест.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
