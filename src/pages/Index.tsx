import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface ObjectData {
  name: string;
  functionalClass: string;
  commissioningDate: string;
  address: string;
  area: string;
  height: string;
  floors: string;
  workplaces: string;
  workingHours: string;
  protectionSystems: string;
}

const sections = [
  { id: 'order', icon: 'FileText', title: 'Приказ о назначении ответственного за ПБ', color: 'bg-orange-500' },
  { id: 'instructions', icon: 'BookOpen', title: 'Инструкции о мерах пожарной безопасности', color: 'bg-blue-500' },
  { id: 'journal', icon: 'Clipboard', title: 'Журнал эксплуатации систем противопожарной защиты', color: 'bg-orange-500' },
  { id: 'checklist', icon: 'CheckSquare', title: 'Чек-лист', color: 'bg-blue-500' },
  { id: 'drills', icon: 'Users', title: 'Тренировки по эвакуации', color: 'bg-orange-500' },
  { id: 'assessment', icon: 'AlertTriangle', title: 'Оценка ПБ и риски', color: 'bg-blue-500' },
  { id: 'documentation', icon: 'FolderOpen', title: 'Исполнительная документация', color: 'bg-orange-500' },
  { id: 'calculations', icon: 'Calculator', title: 'Расчеты по категории взрывопожарной и пожарной опасности', color: 'bg-blue-500' },
  { id: 'audits', icon: 'Search', title: 'Проверки (аудиты) объекта', color: 'bg-orange-500' },
  { id: 'declaration', icon: 'FileCheck', title: 'Декларация ПБ', color: 'bg-blue-500' },
  { id: 'insurance', icon: 'Shield', title: 'Страхование объекта', color: 'bg-orange-500' },
];

export default function Index() {
  const [objectData, setObjectData] = useState<ObjectData>({
    name: '',
    functionalClass: '',
    commissioningDate: '',
    address: '',
    area: '',
    height: '',
    floors: '',
    workplaces: '',
    workingHours: '',
    protectionSystems: '',
  });

  const [activeSection, setActiveSection] = useState<string>('characteristics');

  const handleInputChange = (field: keyof ObjectData, value: string) => {
    setObjectData(prev => ({ ...prev, [field]: value }));
  };

  const completionPercentage = Object.values(objectData).filter(v => v !== '').length / Object.keys(objectData).length * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Icon name="Flame" className="text-primary" size={32} />
                Журнал документации по пожарной безопасности
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">Система управления документацией ПБ v1.0</p>
            </div>
            <Badge variant="outline" className="text-sm px-4 py-2">
              <Icon name="Database" size={16} className="mr-2" />
              Статус: {Math.round(completionPercentage)}% заполнено
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider flex items-center gap-2">
                  <Icon name="Menu" size={16} />
                  Навигация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={activeSection === 'characteristics' ? 'default' : 'ghost'}
                  className="w-full justify-start text-sm"
                  onClick={() => setActiveSection('characteristics')}
                >
                  <Icon name="Settings" size={16} className="mr-2" />
                  Характеристики объекта
                </Button>
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Icon name={section.icon as any} size={16} className="mr-2" />
                    <span className="truncate">{section.title}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9">
            {activeSection === 'characteristics' ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                      <Icon name="Building" className="text-primary" size={24} />
                    </div>
                    <div>
                      <CardTitle>Характеристики объекта</CardTitle>
                      <CardDescription>Заполните основные параметры объекта защиты</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">
                        01 / Наименование объекта
                      </Label>
                      <Input
                        id="name"
                        value={objectData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Введите наименование"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="functionalClass" className="text-xs uppercase tracking-wider text-muted-foreground">
                        02 / Класс функциональной пожарной опасности
                      </Label>
                      <Input
                        id="functionalClass"
                        value={objectData.functionalClass}
                        onChange={(e) => handleInputChange('functionalClass', e.target.value)}
                        placeholder="Например: Ф1.1, Ф2.3"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commissioningDate" className="text-xs uppercase tracking-wider text-muted-foreground">
                        03 / Дата ввода в эксплуатацию
                      </Label>
                      <Input
                        id="commissioningDate"
                        type="date"
                        value={objectData.commissioningDate}
                        onChange={(e) => handleInputChange('commissioningDate', e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-xs uppercase tracking-wider text-muted-foreground">
                        04 / Адрес
                      </Label>
                      <Input
                        id="address"
                        value={objectData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Полный адрес объекта"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-xs uppercase tracking-wider text-muted-foreground">
                        05 / Площадь (м²)
                      </Label>
                      <Input
                        id="area"
                        type="number"
                        value={objectData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        placeholder="0"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-xs uppercase tracking-wider text-muted-foreground">
                        06 / Высота (м)
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        value={objectData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder="0"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="floors" className="text-xs uppercase tracking-wider text-muted-foreground">
                        07 / Этажность
                      </Label>
                      <Input
                        id="floors"
                        type="number"
                        value={objectData.floors}
                        onChange={(e) => handleInputChange('floors', e.target.value)}
                        placeholder="0"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workplaces" className="text-xs uppercase tracking-wider text-muted-foreground">
                        08 / Количество рабочих мест
                      </Label>
                      <Input
                        id="workplaces"
                        type="number"
                        value={objectData.workplaces}
                        onChange={(e) => handleInputChange('workplaces', e.target.value)}
                        placeholder="0"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workingHours" className="text-xs uppercase tracking-wider text-muted-foreground">
                        09 / Режим работы
                      </Label>
                      <Input
                        id="workingHours"
                        value={objectData.workingHours}
                        onChange={(e) => handleInputChange('workingHours', e.target.value)}
                        placeholder="Например: 9:00-18:00"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="protectionSystems" className="text-xs uppercase tracking-wider text-muted-foreground">
                        10 / Наличие систем противопожарной защиты
                      </Label>
                      <Textarea
                        id="protectionSystems"
                        value={objectData.protectionSystems}
                        onChange={(e) => handleInputChange('protectionSystems', e.target.value)}
                        placeholder="Перечислите установленные системы: АУПС, СОУЭ, АПТ, АУПТ и т.д."
                        rows={4}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Прогресс заполнения</span>
                      <span className="text-sm text-muted-foreground">{Math.round(completionPercentage)}%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  <Button className="w-full mt-6" size="lg">
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить характеристики
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded ${sections.find(s => s.id === activeSection)?.color} flex items-center justify-center`}>
                      <Icon name={sections.find(s => s.id === activeSection)?.icon as any} className="text-white" size={24} />
                    </div>
                    <div>
                      <CardTitle>{sections.find(s => s.id === activeSection)?.title}</CardTitle>
                      <CardDescription>Раздел в разработке</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Icon name="Construction" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Этот раздел находится в разработке</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
