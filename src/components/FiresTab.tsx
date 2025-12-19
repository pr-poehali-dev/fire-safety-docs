import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

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

export default function FiresTab() {
  const [incidents, setIncidents] = useState<FireIncident[]>([
    {
      id: '1',
      date: '12.10.2024',
      location: 'Складское помещение, сектор C',
      area: 45.5,
      startTime: '14:23',
      endTime: '15:47',
      casualties: 'Нет',
      cause: 'Короткое замыкание электропроводки',
      damage: '2 350 000 руб.',
      productionStop: '8 часов',
    },
    {
      id: '2',
      date: '05.08.2024',
      location: 'Офисное помещение, 3 этаж',
      area: 12.0,
      startTime: '09:15',
      endTime: '09:58',
      casualties: 'Нет',
      cause: 'Неисправность электрочайника',
      damage: '450 000 руб.',
      productionStop: '3 часа',
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newIncident, setNewIncident] = useState<Omit<FireIncident, 'id'>>({
    date: '',
    location: '',
    area: 0,
    startTime: '',
    endTime: '',
    casualties: '',
    cause: '',
    damage: '',
    productionStop: '',
  });

  const handleAddIncident = () => {
    if (newIncident.date && newIncident.location) {
      const incident: FireIncident = {
        id: Date.now().toString(),
        ...newIncident,
      };
      setIncidents([incident, ...incidents]);
      setNewIncident({
        date: '',
        location: '',
        area: 0,
        startTime: '',
        endTime: '',
        casualties: '',
        cause: '',
        damage: '',
        productionStop: '',
      });
      setIsAdding(false);
    }
  };

  const handleDeleteIncident = (id: string) => {
    setIncidents(incidents.filter((inc) => inc.id !== id));
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '—';
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const durationMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    const hours = Math.floor(durationMin / 60);
    const mins = durationMin % 60;
    return `${hours}ч ${mins}мин`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="Flame" size={28} className="text-red-600" />
            Учёт пожаров
          </h2>
          <p className="text-muted-foreground mt-1">Регистрация и анализ пожарных инцидентов</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2 bg-red-600 hover:bg-red-700">
            <Icon name="Plus" size={16} />
            Добавить инцидент
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileWarning" size={24} className="text-red-600" />
              Новый инцидент
            </CardTitle>
            <CardDescription>Заполните все данные о произошедшем пожаре</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-date">Дата пожара *</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={newIncident.date.split('.').reverse().join('-')}
                  onChange={(e) => {
                    const formatted = e.target.value.split('-').reverse().join('.');
                    setNewIncident({ ...newIncident, date: formatted });
                  }}
                />
              </div>

              <div>
                <Label htmlFor="new-location">Место пожара *</Label>
                <Input
                  id="new-location"
                  placeholder="Укажите точное место"
                  value={newIncident.location}
                  onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="new-area">Площадь пожара (м²)</Label>
                <Input
                  id="new-area"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={newIncident.area || ''}
                  onChange={(e) => setNewIncident({ ...newIncident, area: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="new-start-time">Время начала</Label>
                <Input
                  id="new-start-time"
                  type="time"
                  value={newIncident.startTime}
                  onChange={(e) => setNewIncident({ ...newIncident, startTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="new-end-time">Время ликвидации</Label>
                <Input
                  id="new-end-time"
                  type="time"
                  value={newIncident.endTime}
                  onChange={(e) => setNewIncident({ ...newIncident, endTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="new-casualties">Пострадавшие</Label>
                <Input
                  id="new-casualties"
                  placeholder="Нет / количество"
                  value={newIncident.casualties}
                  onChange={(e) => setNewIncident({ ...newIncident, casualties: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="new-cause">Причина пожара</Label>
                <Input
                  id="new-cause"
                  placeholder="Установленная причина возникновения"
                  value={newIncident.cause}
                  onChange={(e) => setNewIncident({ ...newIncident, cause: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="new-damage">Материальный ущерб</Label>
                <Input
                  id="new-damage"
                  placeholder="Сумма в рублях"
                  value={newIncident.damage}
                  onChange={(e) => setNewIncident({ ...newIncident, damage: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="new-stop">Остановка производства</Label>
                <Input
                  id="new-stop"
                  placeholder="Длительность простоя"
                  value={newIncident.productionStop}
                  onChange={(e) => setNewIncident({ ...newIncident, productionStop: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleAddIncident} className="gap-2 bg-red-600 hover:bg-red-700">
                <Icon name="Save" size={16} />
                Сохранить инцидент
              </Button>
              <Button
                onClick={() => setIsAdding(false)}
                variant="outline"
                className="gap-2"
              >
                <Icon name="X" size={16} />
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="List" size={20} />
            Зарегистрированные инциденты
          </CardTitle>
          <CardDescription>
            Всего инцидентов: {incidents.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Icon name="CheckCircle2" size={64} className="text-green-400 mb-4" />
              <p className="text-lg font-medium mb-2">Инцидентов не зарегистрировано</p>
              <p className="text-sm text-muted-foreground">
                Это хорошая новость! На объекте не было пожаров.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <Card
                  key={incident.id}
                  className="bg-white dark:bg-slate-950 border-l-4 border-l-red-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-red-600">{incident.date}</Badge>
                          <span className="text-lg font-semibold">{incident.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Maximize2" size={14} />
                            Площадь: {incident.area} м²
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={14} />
                            {incident.startTime} - {incident.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Timer" size={14} />
                            Длительность: {calculateDuration(incident.startTime, incident.endTime)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteIncident(incident.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Пострадавшие</p>
                        <p className="font-medium flex items-center gap-2">
                          <Icon name="Users" size={16} className="text-blue-600" />
                          {incident.casualties || '—'}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Материальный ущерб</p>
                        <p className="font-medium flex items-center gap-2">
                          <Icon name="DollarSign" size={16} className="text-red-600" />
                          {incident.damage || '—'}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Остановка производства</p>
                        <p className="font-medium flex items-center gap-2">
                          <Icon name="PauseCircle" size={16} className="text-orange-600" />
                          {incident.productionStop || '—'}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Причина пожара</p>
                        <p className="font-medium flex items-center gap-2">
                          <Icon name="Info" size={16} className="text-purple-600" />
                          {incident.cause || '—'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {incidents.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BarChart3" size={20} className="text-amber-600" />
              Статистика инцидентов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                <p className="text-2xl font-bold text-red-600">{incidents.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Всего инцидентов</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {incidents.reduce((sum, inc) => sum + inc.area, 0).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Общая площадь (м²)</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {incidents.filter((inc) => inc.casualties !== 'Нет' && inc.casualties !== '').length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">С пострадавшими</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                <p className="text-2xl font-bold text-green-600">
                  {new Date().getFullYear()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Текущий год</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
