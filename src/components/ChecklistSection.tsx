import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ChecklistItem {
  id: string;
  text: string;
  status: 'yes' | 'no' | 'not_set';
  photos: File[];
  documents: File[];
}

const checklistItems = [
  { id: '1', text: 'Разработана инструкция о мерах пожарной безопасности на каждое здание' },
  { id: '2', text: 'Проведено обучение работников мерам пожарной безопасности. Ведётся журнал инструктажей' },
  { id: '3', text: 'Назначено лицо, ответственное за обеспечение пожарной безопасности' },
  { id: '4', text: 'Разработаны и размещены на видных местах планы эвакуации' },
  { id: '5', text: 'Проведена тренировка по эвакуации' },
  { id: '6', text: 'Обозначены категории пожарной опасности и классы зон на дверях производственных и складских помещений' },
  { id: '7', text: 'Разработана декларация пожарной безопасности' },
  { id: '8', text: 'В местах установки приёмно-контрольных приборов размещена информация о защищаемых помещениях' },
  { id: '9', text: 'Заведён журнал эксплуатации систем противопожарной защиты' },
  { id: '10', text: 'Утверждён регламент технического обслуживания систем противопожарной защиты' },
  { id: '11', text: 'В здании находится (хранится) техническая документация на системы противопожарной защиты' },
  { id: '12', text: 'Определено и обозначено место для курения' },
  { id: '13', text: 'Дежурный персонал обеспечен телефонной связью, электрическими фонарями и пожарными СИЗОД' },
  { id: '14', text: 'Подвальные, чердачные и технические помещения очищены от мусора' },
  { id: '15', text: 'Пути эвакуации и эвакуационные выходы свободны (не загромождены мебелью, оборудованием)' },
  { id: '16', text: 'Двери эвакуационных выходов свободно открываются изнутри без ключа' },
  { id: '17', text: 'Электроустановки помещений соответствуют требованиям норм пожарной безопасности' },
  { id: '18', text: 'Пожарные краны укомплектованы рукавами и стволами, а также проверены на водоотдачу' },
  { id: '19', text: 'Помещения обеспечены первичными средствами пожаротушения по нормам' },
];

const checklistTemplates = [
  { id: 'daily', name: 'Ежедневная проверка', description: 'Проверка критичных элементов безопасности', icon: 'Calendar' },
  { id: 'monthly', name: 'Ежемесячная проверка', description: 'Плановая проверка всех систем', icon: 'CalendarDays' },
  { id: 'target', name: 'Целевая проверка', description: 'Проверка по конкретной теме', icon: 'Target' },
];

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';

export default function ChecklistSection() {
  const [activeTab, setActiveTab] = useState('current');
  const [checklistData, setChecklistData] = useState<Record<string, ChecklistItem>>(
    Object.fromEntries(
      checklistItems.map((item) => [
        item.id,
        { id: item.id, text: item.text, status: 'not_set', photos: [], documents: [] },
      ])
    )
  );
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadChecklistData();
  }, []);

  const loadChecklistData = async () => {
    try {
      const response = await fetch(`${API_URL}?table=checklist_items`);
      const data = await response.json();
      if (data.length > 0) {
        const loadedData: Record<string, ChecklistItem> = {};
        data.forEach((item: any) => {
          const checklistItem = checklistItems.find(ci => ci.id === item.item_id);
          if (checklistItem) {
            loadedData[item.item_id] = {
              id: item.item_id,
              text: checklistItem.text,
              status: item.status,
              photos: [],
              documents: [],
            };
          }
        });
        setChecklistData(prev => ({ ...prev, ...loadedData }));
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    }
  };

  const handleStatusChange = async (itemId: string, status: 'yes' | 'no') => {
    setChecklistData((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], status },
    }));
    
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'checklist_items',
          item_id: itemId,
          status: status,
          updated_at: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error saving checklist item:', error);
    }
  };

  const handleFileUpload = (itemId: string, type: 'photos' | 'documents', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setChecklistData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [type]: [...prev[itemId][type], ...files],
      },
    }));
  };

  const handleSaveChecklist = async () => {
    try {
      for (const [itemId, itemData] of Object.entries(checklistData)) {
        if (itemData.status !== 'not_set') {
          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              table: 'checklist_items',
              item_id: itemId,
              status: itemData.status,
              updated_at: new Date().toISOString(),
            }),
          });
        }
      }
      
      const timestamp = new Date().toISOString();
      setHistory((prev) => [
        { id: timestamp, date: timestamp, data: { ...checklistData } },
        ...prev,
      ]);
      alert('Чек-лист успешно сохранен в базу данных');
    } catch (error) {
      console.error('Error saving checklist:', error);
      alert('Ошибка при сохранении чек-листа');
    }
  };

  const completedCount = Object.values(checklistData).filter((item) => item.status === 'yes').length;
  const totalCount = checklistItems.length;
  const completionPercentage = (completedCount / totalCount) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-orange-500 flex items-center justify-center">
            <Icon name="CheckSquare" className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <CardTitle>Чек-лист самопроверки состояния пожарной безопасности рабочего места</CardTitle>
            <CardDescription>Проверка соответствия требованиям ПБ</CardDescription>
          </div>
        </div>
        <div className="mt-4 p-3 bg-muted/30 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Прогресс проверки</span>
            <Badge variant="outline">
              {completedCount} / {totalCount}
            </Badge>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div
              className="bg-primary h-full transition-all rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="current" className="flex-1">
              <Icon name="ClipboardList" size={16} className="mr-2" />
              Текущая проверка
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex-1">
              <Icon name="Library" size={16} className="mr-2" />
              Библиотека шаблонов
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              <Icon name="History" size={16} className="mr-2" />
              История проверок
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-6 space-y-4">
            {checklistItems.map((item) => {
              const itemData = checklistData[item.id];
              return (
                <Card key={item.id} className="border-l-4" style={{
                  borderLeftColor: itemData.status === 'yes' ? '#22c55e' : itemData.status === 'no' ? '#ef4444' : '#6b7280'
                }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">{item.id}</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <RadioGroup
                      value={itemData.status}
                      onValueChange={(value) => handleStatusChange(item.id, value as 'yes' | 'no')}
                    >
                      <div className="flex items-center gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id={`${item.id}-yes`} />
                          <Label htmlFor={`${item.id}-yes`} className="cursor-pointer">
                            <span className="flex items-center gap-2">
                              <Icon name="CheckCircle" size={16} className="text-green-600" />
                              Да
                            </span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`${item.id}-no`} />
                          <Label htmlFor={`${item.id}-no`} className="cursor-pointer">
                            <span className="flex items-center gap-2">
                              <Icon name="XCircle" size={16} className="text-red-600" />
                              Нет
                            </span>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>

                    <div className="flex gap-2">
                      <label htmlFor={`photo-${item.id}`}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`photo-${item.id}`)?.click()}
                        >
                          <Icon name="Camera" size={14} className="mr-2" />
                          Фото ({itemData.photos.length})
                        </Button>
                        <input
                          id={`photo-${item.id}`}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileUpload(item.id, 'photos', e)}
                          className="hidden"
                        />
                      </label>

                      <label htmlFor={`doc-${item.id}`}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`doc-${item.id}`)?.click()}
                        >
                          <Icon name="FileText" size={14} className="mr-2" />
                          Документы ({itemData.documents.length})
                        </Button>
                        <input
                          id={`doc-${item.id}`}
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(item.id, 'documents', e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Button className="w-full" size="lg" onClick={handleSaveChecklist}>
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить результаты проверки
            </Button>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {checklistTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                        <Icon name={template.icon as any} className="text-primary" size={20} />
                      </div>
                    </div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      <Icon name="FileCheck" size={14} className="mr-2" />
                      Использовать шаблон
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6 border-dashed">
              <CardContent className="py-12 text-center">
                <Icon name="Plus" size={48} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">Создать свой шаблон чек-листа</p>
                <Button variant="outline">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Новый шаблон
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6 space-y-3">
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="History" size={48} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">История проверок пуста</p>
                </CardContent>
              </Card>
            ) : (
              history.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Проверка от {new Date(record.date).toLocaleDateString('ru-RU')}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(record.date).toLocaleTimeString('ru-RU')}
                        </CardDescription>
                      </div>
                      <Badge>
                        {Object.values(record.data).filter((item: any) => item.status === 'yes').length} / {totalCount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm">
                      <Icon name="Eye" size={14} className="mr-2" />
                      Просмотреть
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}