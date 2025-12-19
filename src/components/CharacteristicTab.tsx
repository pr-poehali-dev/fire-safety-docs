import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface CharacteristicData {
  name: string;
  address: string;
  systems: {
    aups: { status: 'active' | 'warning' | 'inactive'; percentage: number };
    soue: { status: 'active' | 'warning' | 'inactive'; percentage: number };
    aupt: { status: 'active' | 'warning' | 'inactive'; percentage: number };
    smoke: { status: 'active' | 'warning' | 'inactive'; percentage: number };
  };
  journalCompletion: number;
  mainIndicators: {
    tasksCompleted: string;
    avgResponseTime: string;
    uptime: string;
    alertsThisMonth: number;
  };
  risks: Array<{ level: 'high' | 'medium' | 'low'; title: string }>;
  objectPhoto?: string;
}

export default function CharacteristicTab() {
  const [objectPhoto, setObjectPhoto] = useState<string | null>(null);

  const characteristicData: CharacteristicData = {
    name: 'ТЦ "Галерея"',
    address: 'г. Москва, ул. Примерная, д. 123',
    systems: {
      aups: { status: 'active', percentage: 96 },
      soue: { status: 'active', percentage: 98 },
      aupt: { status: 'warning', percentage: 87 },
      smoke: { status: 'active', percentage: 94 },
    },
    journalCompletion: 92,
    mainIndicators: {
      tasksCompleted: '47 из 52',
      avgResponseTime: '4.2 мин',
      uptime: '99.8%',
      alertsThisMonth: 3,
    },
    risks: [
      { level: 'high', title: 'Устаревшее оборудование АУПТ в секторе B' },
      { level: 'medium', title: 'Требуется обновление ПО пожарной сигнализации' },
      { level: 'low', title: 'Планируется замена резервного источника питания' },
    ],
    objectPhoto: objectPhoto || undefined,
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setObjectPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusColor = (status: 'active' | 'warning' | 'inactive') => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-red-500';
    }
  };

  const getStatusText = (status: 'active' | 'warning' | 'inactive') => {
    switch (status) {
      case 'active':
        return 'Исправна';
      case 'warning':
        return 'Требует внимания';
      case 'inactive':
        return 'Неисправна';
    }
  };

  const getRiskColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
    }
  };

  const getRiskText = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Building2" size={24} className="text-blue-600" />
              Общая информация об объекте
            </CardTitle>
            <CardDescription>Основные сведения</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Наименование объекта</p>
              <p className="text-2xl font-bold">{characteristicData.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Адрес</p>
              <p className="text-lg flex items-center gap-2">
                <Icon name="MapPin" size={16} className="text-blue-600" />
                {characteristicData.address}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Image" size={20} className="text-purple-600" />
              Фото объекта
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {objectPhoto ? (
                <div className="relative group">
                  <img
                    src={objectPhoto}
                    alt="Объект"
                    className="w-full h-48 object-cover rounded-lg border-2 border-purple-200 dark:border-purple-700"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setObjectPhoto(null)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              ) : (
                <div className="w-full h-48 bg-purple-100 dark:bg-purple-900 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700 flex flex-col items-center justify-center">
                  <Icon name="ImagePlus" size={48} className="text-purple-400 mb-2" />
                  <p className="text-sm text-purple-600 dark:text-purple-400">Фото не загружено</p>
                </div>
              )}
              <label htmlFor="photo-upload">
                <Button variant="outline" className="w-full" asChild>
                  <span className="flex items-center gap-2 cursor-pointer">
                    <Icon name="Upload" size={16} />
                    Загрузить фото
                  </span>
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Activity" size={24} className="text-green-600" />
            Состояние систем пожарной безопасности
          </CardTitle>
          <CardDescription>Текущий статус всех систем</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">АУПС</span>
                <Badge className={getStatusColor(characteristicData.systems.aups.status)}>
                  {getStatusText(characteristicData.systems.aups.status)}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{characteristicData.systems.aups.percentage}%</p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${characteristicData.systems.aups.percentage}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">СОУЭ</span>
                <Badge className={getStatusColor(characteristicData.systems.soue.status)}>
                  {getStatusText(characteristicData.systems.soue.status)}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{characteristicData.systems.soue.percentage}%</p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${characteristicData.systems.soue.percentage}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">АУПТ</span>
                <Badge className={getStatusColor(characteristicData.systems.aupt.status)}>
                  {getStatusText(characteristicData.systems.aupt.status)}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{characteristicData.systems.aupt.percentage}%</p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: `${characteristicData.systems.aupt.percentage}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Противодымная</span>
                <Badge className={getStatusColor(characteristicData.systems.smoke.status)}>
                  {getStatusText(characteristicData.systems.smoke.status)}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{characteristicData.systems.smoke.percentage}%</p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500"
                  style={{ width: `${characteristicData.systems.smoke.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <p className="text-4xl font-bold mb-2">{characteristicData.journalCompletion}%</p>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                    style={{ width: `${characteristicData.journalCompletion}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <Icon
                  name={characteristicData.journalCompletion >= 90 ? 'CheckCircle2' : 'AlertCircle'}
                  size={48}
                  className={
                    characteristicData.journalCompletion >= 90 ? 'text-green-500' : 'text-yellow-500'
                  }
                />
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
                <p className="text-lg font-bold">{characteristicData.mainIndicators.tasksCompleted}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Время реакции</p>
                <p className="text-lg font-bold">{characteristicData.mainIndicators.avgResponseTime}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Uptime систем</p>
                <p className="text-lg font-bold">{characteristicData.mainIndicators.uptime}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Тревог в месяц</p>
                <p className="text-lg font-bold">{characteristicData.mainIndicators.alertsThisMonth}</p>
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
            {characteristicData.risks.map((risk, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-white dark:bg-slate-950 rounded-lg border"
              >
                <Badge className={getRiskColor(risk.level)}>{getRiskText(risk.level)}</Badge>
                <p className="flex-1 text-sm">{risk.title}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
