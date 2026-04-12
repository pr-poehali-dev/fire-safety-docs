import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

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

interface ObjectInfoCardProps {
  objectData: ObjectData;
  onSave: () => void;
  onInputChange: (field: keyof ObjectData, value: string) => void;
  readOnly?: boolean;
}

export default function ObjectInfoCard({ objectData, onSave, onInputChange, readOnly }: ObjectInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [objectPhoto, setObjectPhoto] = useState<string | null>(objectData.photo || null);

  const renderField = (_id: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string) => {
    return isEditing ? (
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type || 'text'} />
    ) : (
      <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">{value || '—'}</p>
    );
  };

  const handleSave = () => {
    onSave();
    setIsEditing(false);
  };

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

  return (
    <>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </>
  );
}