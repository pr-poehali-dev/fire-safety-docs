import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';

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

interface ProtectionSystem {
  id: number;
  system_name: string;
  system_key: string;
  commissioning_date: string;
  project: string;
  complex_tests: string;
  condition: string;
}

interface RoomCategory {
  id: number | string;
  name: string;
  area: string;
  category: string;
  has_lvzh: boolean;
  has_aps: boolean;
  has_aupt: boolean;
  _isNew?: boolean;
}

interface CharacteristicTabProps {
  objectData: ObjectData;
  onSave: () => void;
  onInputChange: (field: keyof ObjectData, value: string) => void;
  objectId?: number;
  readOnly?: boolean;
}

const SERVICE_LIFE_YEARS = 10;

function getServiceLifeInfo(dateStr: string) {
  if (!dateStr) return null;
  const start = new Date(dateStr);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + SERVICE_LIFE_YEARS);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(Math.abs(diffDays) / 365);
  const months = Math.floor((Math.abs(diffDays) % 365) / 30);

  if (diffDays < 0) {
    return { expired: true, text: `Истёк ${years > 0 ? years + ' г. ' : ''}${months} мес. назад`, color: 'text-red-600', badge: 'bg-red-500' };
  }
  if (diffDays <= 365) {
    return { expired: false, text: `Осталось ${months > 0 ? months + ' мес.' : diffDays + ' дн.'}`, color: 'text-yellow-600', badge: 'bg-yellow-500' };
  }
  return { expired: false, text: `Осталось ${years} г. ${months} мес.`, color: 'text-green-600', badge: 'bg-green-500' };
}

const conditionOptions = ['Исправна', 'Требует ремонта', 'Неисправна', 'На обслуживании', 'Не установлена'];
const categoryOptions = ['А', 'Б', 'В1', 'В2', 'В3', 'В4', 'Г', 'Д'];

export default function CharacteristicTab({ objectData, onSave, onInputChange, objectId, readOnly }: CharacteristicTabProps) {
  const { toast } = useToast();
  const [objectPhoto, setObjectPhoto] = useState<string | null>(objectData.photo || null);
  const [isEditing, setIsEditing] = useState(false);
  const [protectionSystems, setProtectionSystems] = useState<ProtectionSystem[]>([]);
  const [rooms, setRooms] = useState<RoomCategory[]>([]);
  const [isEditingSystems, setIsEditingSystems] = useState(false);
  const [isEditingRooms, setIsEditingRooms] = useState(false);
  const [savingSystems, setSavingSystems] = useState(false);
  const [savingRooms, setSavingRooms] = useState(false);
  const [loadingSystems, setLoadingSystems] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const journalCompletion = 92;
  const mainIndicators = { tasksCompleted: '47 из 52', avgResponseTime: '4.2 мин', uptime: '99.8%', alertsThisMonth: 3 };
  const risks = [
    { level: 'high' as const, title: 'Устаревшее оборудование АУПТ в секторе B' },
    { level: 'medium' as const, title: 'Требуется обновление ПО пожарной сигнализации' },
    { level: 'low' as const, title: 'Планируется замена резервного источника питания' },
  ];

  const fetchSystems = useCallback(async () => {
    setLoadingSystems(true);
    try {
      const objFilter = objectId ? `&object_id=${objectId}` : '';
      const res = await fetch(`${API_URL}?table=protection_systems${objFilter}`);
      if (!res.ok) throw new Error('fetch error');
      const data = await res.json();
      setProtectionSystems(data.map((row: Record<string, string>) => ({
        ...row,
        commissioning_date: row.commissioning_date || '',
        project: row.project || '',
        complex_tests: row.complex_tests || '',
        condition: row.condition || '',
      })));
    } catch (e) {
      console.error('Error loading protection systems:', e);
    } finally {
      setLoadingSystems(false);
    }
  }, [objectId]);

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const objFilter = objectId ? `&object_id=${objectId}` : '';
      const res = await fetch(`${API_URL}?table=rooms_categories${objFilter}`);
      if (!res.ok) throw new Error('fetch error');
      const data = await res.json();
      setRooms(data.map((row: Record<string, unknown>) => ({
        id: row.id,
        name: row.name || '',
        area: row.area ? String(row.area) : '',
        category: row.category || '',
        has_lvzh: !!row.has_lvzh,
        has_aps: !!row.has_aps,
        has_aupt: !!row.has_aupt,
      })));
    } catch (e) {
      console.error('Error loading rooms:', e);
    } finally {
      setLoadingRooms(false);
    }
  }, [objectId]);

  useEffect(() => {
    fetchSystems();
    fetchRooms();
  }, [fetchSystems, fetchRooms]);

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

  const handleSave = () => {
    onSave();
    setIsEditing(false);
  };

  const updateSystem = (id: number, field: string, value: string) => {
    setProtectionSystems(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveSystems = async () => {
    setSavingSystems(true);
    try {
      for (const sys of protectionSystems) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'protection_systems',
            id: sys.id,
            commissioning_date: sys.commissioning_date || null,
            project: sys.project || null,
            complex_tests: sys.complex_tests || null,
            condition: sys.condition || null,
            ...(objectId ? { object_id: objectId } : {}),
          }),
        });
      }
      toast({ title: 'Сохранено', description: 'Данные систем противопожарной защиты обновлены' });
      setIsEditingSystems(false);
    } catch (e) {
      console.error('Error saving systems:', e);
      toast({ title: 'Ошибка', description: 'Не удалось сохранить системы', variant: 'destructive' });
    } finally {
      setSavingSystems(false);
    }
  };

  const addRoom = () => {
    const tempId = `new_${Date.now()}`;
    setRooms(prev => [...prev, {
      id: tempId,
      name: '',
      area: '',
      category: '',
      has_lvzh: false,
      has_aps: false,
      has_aupt: false,
      _isNew: true,
    }]);
    if (!isEditingRooms) setIsEditingRooms(true);
  };

  const updateRoom = (id: number | string, field: string, value: string | boolean) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRoom = async (id: number | string) => {
    const room = rooms.find(r => r.id === id);
    if (room && !room._isNew) {
      try {
        await fetch(`${API_URL}?table=rooms_categories&id=${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Error deleting room:', e);
      }
    }
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const saveRooms = async () => {
    setSavingRooms(true);
    try {
      for (const room of rooms) {
        const payload: Record<string, unknown> = {
          table: 'rooms_categories',
          name: room.name,
          area: room.area ? parseFloat(room.area) : null,
          category: room.category || null,
          has_lvzh: room.has_lvzh,
          has_aps: room.has_aps,
          has_aupt: room.has_aupt,
        };
        if (objectId) payload.object_id = objectId;

        if (room._isNew) {
          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, id: room.id }),
          });
        }
      }
      toast({ title: 'Сохранено', description: 'Перечень помещений обновлён' });
      setIsEditingRooms(false);
      fetchRooms();
    } catch (e) {
      console.error('Error saving rooms:', e);
      toast({ title: 'Ошибка', description: 'Не удалось сохранить помещения', variant: 'destructive' });
    } finally {
      setSavingRooms(false);
    }
  };

  const renderField = (_id: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string) => {
    return isEditing ? (
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type || 'text'} />
    ) : (
      <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">{value || '—'}</p>
    );
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
            {!readOnly && (
              !isEditing ? (
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
              )
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Наименование объекта *</Label>
              {renderField('name', objectData.name, (v) => onInputChange('name', v), 'Введите наименование')}
            </div>
            <div className="space-y-2">
              <Label>Адрес объекта *</Label>
              {isEditing ? (
                <Input value={objectData.address} onChange={(e) => onInputChange('address', e.target.value)} placeholder="Введите адрес" />
              ) : (
                <p className="h-10 px-3 flex items-center gap-2 bg-muted/50 rounded-md border text-sm">
                  <Icon name="MapPin" size={16} className="text-blue-600 flex-shrink-0" />
                  {objectData.address || '—'}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Класс функциональной пожарной опасности</Label>
              {renderField('functionalClass', objectData.functionalClass, (v) => onInputChange('functionalClass', v), 'Например: Ф1.1, Ф2.3')}
            </div>
            <div className="space-y-2">
              <Label>Дата ввода в эксплуатацию</Label>
              {isEditing ? (
                <Input type="date" value={objectData.commissioningDate} onChange={(e) => onInputChange('commissioningDate', e.target.value)} />
              ) : (
                <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">{objectData.commissioningDate || '—'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Степень огнестойкости</Label>
              {renderField('fireResistance', objectData.fireResistance, (v) => onInputChange('fireResistance', v), 'Например: I, II, III, IV, V')}
            </div>
            <div className="space-y-2">
              <Label>Класс конструктивной пожарной опасности</Label>
              {renderField('structuralFireHazard', objectData.structuralFireHazard, (v) => onInputChange('structuralFireHazard', v), 'Например: С0, С1, С2, С3')}
            </div>
            <div className="space-y-2">
              <Label>Общая площадь (м²)</Label>
              {isEditing ? (
                <Input type="number" value={objectData.area} onChange={(e) => onInputChange('area', e.target.value)} placeholder="0" />
              ) : (
                <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">{objectData.area ? `${objectData.area} м²` : '—'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Количество этажей</Label>
              {renderField('floors', objectData.floors, (v) => onInputChange('floors', v), '0', 'number')}
            </div>
            <div className="space-y-2">
              <Label>Высота здания (м)</Label>
              {isEditing ? (
                <Input type="number" value={objectData.height} onChange={(e) => onInputChange('height', e.target.value)} placeholder="0" />
              ) : (
                <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">{objectData.height ? `${objectData.height} м` : '—'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Категория здания по взрывопожарной опасности</Label>
              {renderField('buildingCategory', objectData.buildingCategory, (v) => onInputChange('buildingCategory', v), 'Например: А, Б, В1, В2, Г, Д')}
            </div>
            <div className="space-y-2">
              <Label>Количество рабочих мест</Label>
              {renderField('workplaces', objectData.workplaces, (v) => onInputChange('workplaces', v), '0', 'number')}
            </div>
            <div className="space-y-2">
              <Label>Режим работы</Label>
              {renderField('workingHours', objectData.workingHours, (v) => onInputChange('workingHours', v), 'Например: 8:00 - 20:00')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ShieldCheck" size={24} className="text-purple-600" />
                Системы противопожарной защиты
              </CardTitle>
              <CardDescription>Установленные на объекте (срок службы — {SERVICE_LIFE_YEARS} лет)</CardDescription>
            </div>
            {!readOnly && (
              !isEditingSystems ? (
                <Button onClick={() => setIsEditingSystems(true)} variant="outline" className="gap-2">
                  <Icon name="Edit" size={16} />
                  Редактировать
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={saveSystems} disabled={savingSystems} className="gap-2">
                    <Icon name={savingSystems ? 'Loader2' : 'Save'} size={16} className={savingSystems ? 'animate-spin' : ''} />
                    {savingSystems ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button onClick={() => { setIsEditingSystems(false); fetchSystems(); }} variant="outline" className="gap-2">
                    <Icon name="X" size={16} />
                    Отмена
                  </Button>
                </div>
              )
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingSystems ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Icon name="Loader2" size={20} className="animate-spin" />
              <span className="text-sm">Загрузка систем...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {protectionSystems.map((system) => {
                const lifeInfo = getServiceLifeInfo(system.commissioning_date);
                return (
                  <div key={system.id} className="p-4 bg-white dark:bg-slate-950 rounded-lg border space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{system.system_name}</h4>
                      {lifeInfo && (
                        <Badge className={lifeInfo.badge}>{lifeInfo.expired ? 'Срок истёк' : 'Действует'}</Badge>
                      )}
                      {!system.commissioning_date && (
                        <Badge variant="outline" className="text-muted-foreground">Не заполнено</Badge>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Дата ввода в эксплуатацию</Label>
                        {isEditingSystems ? (
                          <Input type="date" value={system.commissioning_date} onChange={(e) => updateSystem(system.id, 'commissioning_date', e.target.value)} className="h-9 text-sm" />
                        ) : (
                          <p className="h-9 px-2 flex items-center bg-muted/50 rounded border text-sm">{system.commissioning_date || '—'}</p>
                        )}
                        {lifeInfo && <p className={`text-xs ${lifeInfo.color} font-medium`}>{lifeInfo.text}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Проект</Label>
                        {isEditingSystems ? (
                          <Input value={system.project} onChange={(e) => updateSystem(system.id, 'project', e.target.value)} placeholder="№ проекта / наименование" className="h-9 text-sm" />
                        ) : (
                          <p className="h-9 px-2 flex items-center bg-muted/50 rounded border text-sm">{system.project || '—'}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Комплексные испытания</Label>
                        {isEditingSystems ? (
                          <Input value={system.complex_tests} onChange={(e) => updateSystem(system.id, 'complex_tests', e.target.value)} placeholder="Дата / результат" className="h-9 text-sm" />
                        ) : (
                          <p className="h-9 px-2 flex items-center bg-muted/50 rounded border text-sm">{system.complex_tests || '—'}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Состояние</Label>
                        {isEditingSystems ? (
                          <Select value={system.condition} onValueChange={(v) => updateSystem(system.id, 'condition', v)}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Выберите" />
                            </SelectTrigger>
                            <SelectContent>
                              {conditionOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="h-9 px-2 flex items-center bg-muted/50 rounded border text-sm">
                            {system.condition ? (
                              <span className={`flex items-center gap-1.5 ${
                                system.condition === 'Исправна' ? 'text-green-600' :
                                system.condition === 'Неисправна' ? 'text-red-600' :
                                system.condition === 'Требует ремонта' ? 'text-yellow-600' : ''
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                  system.condition === 'Исправна' ? 'bg-green-500' :
                                  system.condition === 'Неисправна' ? 'bg-red-500' :
                                  system.condition === 'Требует ремонта' ? 'bg-yellow-500' :
                                  system.condition === 'На обслуживании' ? 'bg-blue-500' : 'bg-gray-400'
                                }`} />
                                {system.condition}
                              </span>
                            ) : '—'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                <img src={objectPhoto} alt="Объект" className="w-full max-h-[400px] object-contain rounded-lg border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-900" />
                <Button variant="destructive" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setObjectPhoto(null); onInputChange('photo' as keyof ObjectData, ''); }}>
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
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <span className="flex items-center gap-2 cursor-pointer">
                  <Icon name="Upload" size={16} />
                  Загрузить фото
                </span>
              </Button>
              <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="LayoutList" size={24} className="text-amber-600" />
                Помещения по категориям взрывопожарной и пожарной опасности
              </CardTitle>
              <CardDescription>Перечень помещений объекта с указанием категорий</CardDescription>
            </div>
            {!readOnly && (
              <div className="flex gap-2">
                {isEditingRooms ? (
                  <>
                    <Button onClick={saveRooms} disabled={savingRooms} className="gap-2">
                      <Icon name={savingRooms ? 'Loader2' : 'Save'} size={16} className={savingRooms ? 'animate-spin' : ''} />
                      {savingRooms ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    <Button onClick={() => { setIsEditingRooms(false); fetchRooms(); }} variant="outline" className="gap-2">
                      <Icon name="X" size={16} />
                      Отмена
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditingRooms(true)} variant="outline" className="gap-2">
                    <Icon name="Edit" size={16} />
                    Редактировать
                  </Button>
                )}
                <Button onClick={addRoom} variant="outline" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingRooms ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Icon name="Loader2" size={20} className="animate-spin" />
              <span className="text-sm">Загрузка помещений...</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Building" size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Помещения не добавлены</p>
              <p className="text-xs mt-1">Нажмите «Добавить» для внесения помещений</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Наименование помещения</th>
                    <th className="text-left p-3 font-medium">Площадь, м²</th>
                    <th className="text-left p-3 font-medium">Категория</th>
                    <th className="text-center p-3 font-medium">ЛВЖ / ГЖ</th>
                    <th className="text-center p-3 font-medium">АПС</th>
                    <th className="text-center p-3 font-medium">АУПТ</th>
                    {isEditingRooms && <th className="p-3 w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">
                        {isEditingRooms ? (
                          <Input value={room.name} onChange={(e) => updateRoom(room.id, 'name', e.target.value)} placeholder="Название помещения" className="h-9 text-sm" />
                        ) : (
                          <span>{room.name || '—'}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditingRooms ? (
                          <Input type="number" value={room.area} onChange={(e) => updateRoom(room.id, 'area', e.target.value)} placeholder="0" className="h-9 text-sm w-24" />
                        ) : (
                          <span>{room.area ? `${room.area} м²` : '—'}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditingRooms ? (
                          <Select value={room.category} onValueChange={(v) => updateRoom(room.id, 'category', v)}>
                            <SelectTrigger className="h-9 text-sm w-24">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryOptions.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          room.category ? (
                            <Badge variant="outline" className={
                              room.category === 'А' || room.category === 'Б' ? 'border-red-300 text-red-700 bg-red-50' :
                              room.category.startsWith('В') ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                              'border-green-300 text-green-700 bg-green-50'
                            }>{room.category}</Badge>
                          ) : '—'
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {isEditingRooms ? (
                          <button onClick={() => updateRoom(room.id, 'has_lvzh', !room.has_lvzh)} className={`w-8 h-8 rounded-md border-2 flex items-center justify-center transition-colors mx-auto ${room.has_lvzh ? 'bg-red-100 border-red-400' : 'bg-white border-gray-300'}`}>
                            {room.has_lvzh && <Icon name="Check" size={16} className="text-red-600" />}
                          </button>
                        ) : (
                          room.has_lvzh ? <Badge className="bg-red-500">Да</Badge> : <span className="text-muted-foreground">Нет</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {isEditingRooms ? (
                          <button onClick={() => updateRoom(room.id, 'has_aps', !room.has_aps)} className={`w-8 h-8 rounded-md border-2 flex items-center justify-center transition-colors mx-auto ${room.has_aps ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300'}`}>
                            {room.has_aps && <Icon name="Check" size={16} className="text-green-600" />}
                          </button>
                        ) : (
                          room.has_aps ? <Badge className="bg-green-500">Да</Badge> : <span className="text-muted-foreground">Нет</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {isEditingRooms ? (
                          <button onClick={() => updateRoom(room.id, 'has_aupt', !room.has_aupt)} className={`w-8 h-8 rounded-md border-2 flex items-center justify-center transition-colors mx-auto ${room.has_aupt ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-300'}`}>
                            {room.has_aupt && <Icon name="Check" size={16} className="text-blue-600" />}
                          </button>
                        ) : (
                          room.has_aupt ? <Badge className="bg-blue-500">Да</Badge> : <span className="text-muted-foreground">Нет</span>
                        )}
                      </td>
                      {isEditingRooms && (
                        <td className="p-3">
                          <Button variant="ghost" size="sm" onClick={() => removeRoom(room.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-3">
                <span>Всего помещений: {rooms.length}</span>
                <span>
                  Категории А/Б: {rooms.filter(r => r.category === 'А' || r.category === 'Б').length} |
                  В: {rooms.filter(r => r.category.startsWith('В')).length} |
                  Г/Д: {rooms.filter(r => r.category === 'Г' || r.category === 'Д').length}
                </span>
              </div>
            </div>
          )}
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
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${journalCompletion}%` }} />
                </div>
              </div>
              <div className="text-center">
                <Icon name={journalCompletion >= 90 ? 'CheckCircle2' : 'AlertCircle'} size={48} className={journalCompletion >= 90 ? 'text-green-500' : 'text-yellow-500'} />
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
    </div>
  );
}