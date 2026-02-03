import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface ObjectData {
  name: string;
  functionalClass: string;
  commissioningDate: string;
  address: string;
  fireResistance: string;
  structuralFireHazard: string;
  area: string;
  floorArea: string;
  height: string;
  floors: string;
  volume: string;
  outdoorCategory: string;
  buildingCategory: string;
  workplaces: string;
  workingHours: string;
  protectionSystems: string;
  photo?: string | null;
}

interface CharacteristicTabProps {
  objectData: ObjectData;
  onSave: () => void;
  onInputChange: (field: keyof ObjectData, value: string) => void;
}

export default function CharacteristicTab({ objectData, onSave, onInputChange }: CharacteristicTabProps) {
  const [objectPhoto, setObjectPhoto] = useState<string | null>(objectData.photo || null);
  const [isEditing, setIsEditing] = useState(false);

  const systems = {
    aups: { status: 'active' as const, percentage: 96 },
    soue: { status: 'active' as const, percentage: 98 },
    aupt: { status: 'warning' as const, percentage: 87 },
    smoke: { status: 'active' as const, percentage: 94 },
  };

  const journalCompletion = 92;

  const mainIndicators = {
    tasksCompleted: '47 из 52',
    avgResponseTime: '4.2 мин',
    uptime: '99.8%',
    alertsThisMonth: 3,
  };

  const risks = [
    { level: 'high' as const, title: 'Устаревшее оборудование АУПТ в секторе B' },
    { level: 'medium' as const, title: 'Требуется обновление ПО пожарной сигнализации' },
    { level: 'low' as const, title: 'Планируется замена резервного источника питания' },
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        setObjectPhoto(photoData);
        onInputChange('photo' as keyof ObjectData, photoData);
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

  const handleSave = () => {
    onSave();
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Building2" size={24} className="text-blue-600" />
                Характеристики объекта защиты
              </CardTitle>
              <CardDescription>Полная информация об объекте и системах безопасности</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                <Icon name="Edit" size={16} />
                Редактировать
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="gap-2">
                  <Icon name="Check" size={16} />
                  Сохранить
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="gap-2">
                  <Icon name="X" size={16} />
                  Отмена
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Наименование объекта *</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={objectData.name}
                  onChange={(e) => onInputChange('name', e.target.value)}
                  placeholder="Введите наименование"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border text-lg font-medium">
                  {objectData.name || '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Адрес объекта *</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={objectData.address}
                  onChange={(e) => onInputChange('address', e.target.value)}
                  placeholder="Введите адрес"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border flex items-center gap-2">
                  <Icon name="MapPin" size={16} className="text-blue-600" />
                  {objectData.address || '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="functionalClass">Класс функциональной пожарной опасности</Label>
              {isEditing ? (
                <Input
                  id="functionalClass"
                  value={objectData.functionalClass}
                  onChange={(e) => onInputChange('functionalClass', e.target.value)}
                  placeholder="Например: Ф1.1, Ф2.3"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {objectData.functionalClass || '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissioningDate">Дата ввода в эксплуатацию</Label>
              {isEditing ? (
                <Input
                  id="commissioningDate"
                  type="date"
                  value={objectData.commissioningDate}
                  onChange={(e) => onInputChange('commissioningDate', e.target.value)}
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {objectData.commissioningDate || '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fireResistance">Степень огнестойкости</Label>
              {isEditing ? (
                <Input
                  id="fireResistance"
                  value={objectData.fireResistance}
                  onChange={(e) => onInputChange('fireResistance', e.target.value)}
                  placeholder="Например: I, II, III, IV, V"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {objectData.fireResistance || '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="structuralFireHazard">Класс конструктивной пожарной опасности</Label>
              {isEditing ? (
                <Input
                  id="structuralFireHazard"
                  value={objectData.structuralFireHazard}
                  onChange={(e) => onInputChange('structuralFireHazard', e.target.value)}
                  placeholder="Например: С0, С1, С2, С3"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {objectData.structuralFireHazard || '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Общая площадь (м²)</Label>
              {isEditing ? (
                <Input
                  id="area"
                  type="number"
                  value={objectData.area}
                  onChange={(e) => onInputChange('area', e.target.value)}
                  placeholder="0"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {objectData.area ? `${objectData.area} м²` : '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="floors">Количество этажей</Label>
              {isEditing ? (
                <Input
                  id="floors"
                  type="number"
                  value={objectData.floors}
                  onChange={(e) => onInputChange('floors', e.target.value)}
                  placeholder="0"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {objectData.floors || '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Высота здания (м)</Label>
              {isEditing ? (
                <Input
                  id="height"
                  type="number"
                  value={objectData.height}
                  onChange={(e) => onInputChange('height', e.target.value)}
                  placeholder="0"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {objectData.height ? `${objectData.height} м` : '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buildingCategory">Категория здания по взрывопожарной опасности</Label>
              {isEditing ? (
                <Input
                  id="buildingCategory"
                  value={objectData.buildingCategory}
                  onChange={(e) => onInputChange('buildingCategory', e.target.value)}
                  placeholder="Например: А, Б, В1, В2, Г, Д"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {objectData.buildingCategory || '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workplaces">Количество рабочих мест</Label>
              {isEditing ? (
                <Input
                  id="workplaces"
                  type="number"
                  value={objectData.workplaces}
                  onChange={(e) => onInputChange('workplaces', e.target.value)}
                  placeholder="0"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {objectData.workplaces || '—'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingHours">Режим работы</Label>
              {isEditing ? (
                <Input
                  id="workingHours"
                  value={objectData.workingHours}
                  onChange={(e) => onInputChange('workingHours', e.target.value)}
                  placeholder="Например: 8:00 - 20:00"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {objectData.workingHours || '—'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ShieldCheck" size={20} className="text-purple-600" />
              Системы противопожарной защиты
            </CardTitle>
            <CardDescription>Установленные на объекте</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="protectionSystems">Перечень систем</Label>
              {isEditing ? (
                <textarea
                  id="protectionSystems"
                  value={objectData.protectionSystems}
                  onChange={(e) => onInputChange('protectionSystems', e.target.value)}
                  placeholder="АУПС, СОУЭ, АУПТ, Противодымная вентиляция и т.д."
                  className="w-full p-3 border rounded-lg min-h-[100px] bg-white dark:bg-slate-950"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border whitespace-pre-wrap">
                  {objectData.protectionSystems || '—'}
                </p>
              )}
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
                    onClick={() => {
                      setObjectPhoto(null);
                      onInputChange('photo' as keyof ObjectData, '');
                    }}
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
                <Badge className={getStatusColor(systems.aups.status)}>
                  {getStatusText(systems.aups.status)}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{systems.aups.percentage}%</p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${systems.aups.percentage}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">СОУЭ</span>
                <Badge className={getStatusColor(systems.soue.status)}>
                  {getStatusText(systems.soue.status)}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{systems.soue.percentage}%</p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${systems.soue.percentage}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">АУПТ</span>
                <Badge className={getStatusColor(systems.aupt.status)}>
                  {getStatusText(systems.aupt.status)}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{systems.aupt.percentage}%</p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: `${systems.aupt.percentage}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Противодымная</span>
                <Badge className={getStatusColor(systems.smoke.status)}>
                  {getStatusText(systems.smoke.status)}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{systems.smoke.percentage}%</p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500"
                  style={{ width: `${systems.smoke.percentage}%` }}
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
                <p className="text-4xl font-bold mb-2">{journalCompletion}%</p>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                    style={{ width: `${journalCompletion}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <Icon
                  name={journalCompletion >= 90 ? 'CheckCircle2' : 'AlertCircle'}
                  size={48}
                  className={
                    journalCompletion >= 90 ? 'text-green-500' : 'text-yellow-500'
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