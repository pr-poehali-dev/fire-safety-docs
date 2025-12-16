import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import JournalSection from '@/components/JournalSection';
import DocumentationSection from '@/components/DocumentationSection';
import ChecklistSection from '@/components/ChecklistSection';
import DrillsSection from '@/components/DrillsSection';
import AssessmentDashboard from '@/components/AssessmentDashboard';
import ExecutiveDocsSection from '@/components/ExecutiveDocsSection';
import CalculationsSection from '@/components/CalculationsSection';
import AuditsSection from '@/components/AuditsSection';
import DeclarationSection from '@/components/DeclarationSection';
import InsuranceSection from '@/components/InsuranceSection';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';

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

const mainSections = [
  { id: 'documentation', icon: 'FileText', title: 'Документация', color: 'bg-orange-500' },
  { id: 'journal', icon: 'Clipboard', title: 'Журнал эксплуатации систем противопожарной защиты', color: 'bg-blue-500' },
  { id: 'checklist', icon: 'CheckSquare', title: 'Чек-лист', color: 'bg-orange-500' },
  { id: 'drills', icon: 'Users', title: 'Тренировки по эвакуации', color: 'bg-blue-500' },
  { id: 'assessment', icon: 'AlertTriangle', title: 'Оценка ПБ и риски', color: 'bg-orange-500' },
  { id: 'executive_docs', icon: 'FolderOpen', title: 'Исполнительная документация', color: 'bg-blue-500' },
  { id: 'calculations', icon: 'Calculator', title: 'Расчеты по категории взрывопожарной и пожарной опасности', color: 'bg-orange-500' },
  { id: 'audits', icon: 'Search', title: 'Проверки (аудиты) объекта', color: 'bg-blue-500' },
  { id: 'declaration', icon: 'FileCheck', title: 'Декларация ПБ', color: 'bg-orange-500' },
  { id: 'insurance', icon: 'Shield', title: 'Страхование объекта', color: 'bg-blue-500' },
];

const journalSubsections = [
  {
    id: 'aups',
    icon: 'Radio',
    title: 'I. АУПС',
    fullTitle: 'Раздел I. АУПС (Автоматическая установка пожарной сигнализации)',
    headerFields: [
      { key: 'installation_type', label: 'Тип установки (адресная/безадресная)', type: 'text' },
      { key: 'commissioning_date', label: 'Дата ввода в эксплуатацию', type: 'date' },
    ],
    fields: [
      { key: 'work_date', label: 'Дата выполнения работ', type: 'date' },
      { key: 'building_name', label: 'Наименование здания/помещения', type: 'textarea' },
      { key: 'work_type', label: 'Вид работ. Результат.', type: 'textarea' },
      { key: 'executor', label: 'Работы проведены (должность, Ф.И.О., организация)', type: 'textarea' },
    ],
  },
  {
    id: 'soue',
    icon: 'Bell',
    title: 'II. СОУЭ',
    fullTitle: 'Раздел II. СОУЭ (Система оповещения и управления эвакуацией)',
    headerFields: [
      { key: 'installation_type', label: 'Тип установки (1-5)', type: 'text' },
      { key: 'commissioning_date', label: 'Дата ввода в эксплуатацию', type: 'date' },
    ],
    fields: [
      { key: 'work_date', label: 'Дата выполнения работ', type: 'date' },
      { key: 'building_name', label: 'Наименование здания/помещения', type: 'textarea' },
      { key: 'work_type', label: 'Вид работ. Результат.', type: 'textarea' },
      { key: 'executor', label: 'Работы проведены (должность, Ф.И.О., организация)', type: 'textarea' },
    ],
  },
  {
    id: 'smoke_ventilation',
    icon: 'Wind',
    title: 'III. Противодымная вентиляция',
    fullTitle: 'Раздел III. Системы противодымной вентиляции',
    headerFields: [
      { key: 'commissioning_date', label: 'Дата ввода в эксплуатацию', type: 'date' },
    ],
    fields: [
      { key: 'work_date', label: 'Дата выполнения работ', type: 'date' },
      { key: 'system_type', label: 'Тип системы (наименование здания/помещения)', type: 'textarea' },
      { key: 'work_type', label: 'Вид работ. Результат.', type: 'textarea' },
      { key: 'executor', label: 'Работы проведены (должность, Ф.И.О., организация)', type: 'textarea' },
    ],
  },
  {
    id: 'aupt',
    icon: 'Droplet',
    title: 'IV. АУПТ',
    fullTitle: 'Раздел IV. АУПТ (Автоматическая установка пожаротушения)',
    headerFields: [
      { key: 'installation_type', label: 'Тип установки', type: 'text' },
      { key: 'commissioning_date', label: 'Дата ввода в эксплуатацию', type: 'date' },
    ],
    fields: [
      { key: 'work_date', label: 'Дата выполнения работ', type: 'date' },
      { key: 'building_name', label: 'Наименование здания/помещения', type: 'textarea' },
      { key: 'work_type', label: 'Вид работ. Результат.', type: 'textarea' },
      { key: 'executor', label: 'Работы проведены (должность, Ф.И.О., организация)', type: 'textarea' },
    ],
  },
  {
    id: 'fire_extinguishers',
    icon: 'Zap',
    title: 'V. Огнетушители',
    fullTitle: 'Раздел V. Учет наличия, осмотра и перезарядки огнетушителей',
    fields: [
      { key: 'brand', label: 'Марка' },
      { key: 'assigned_number', label: 'Номер' },
      { key: 'commissioning_date', label: 'Дата ввода', type: 'date' },
      { key: 'installation_location', label: 'Место установки', type: 'textarea' },
      { key: 'initial_parameters', label: 'Параметры', type: 'textarea' },
      { key: 'inspection_dates', label: 'Даты осмотров', type: 'textarea' },
      { key: 'maintenance_date', label: 'Дата ТО', type: 'date' },
      { key: 'recharge_date', label: 'Дата перезарядки', type: 'date' },
      { key: 'recharge_organization', label: 'Организация', type: 'textarea' },
      { key: 'responsible_person', label: 'Ответственное лицо' },
    ],
  },
  {
    id: 'fire_blankets',
    icon: 'ShieldCheck',
    title: 'VI. Покрывала',
    fullTitle: 'Раздел VI. Проверка покрывал для изоляции очага возгорания',
    fields: [
      { key: 'inspection_date', label: 'Дата проверки', type: 'date' },
      { key: 'location_info', label: 'Место, количество, размер', type: 'textarea' },
      { key: 'inspection_result', label: 'Результат проверки', type: 'textarea' },
      { key: 'inspector', label: 'Проверку провел' },
    ],
  },
  {
    id: 'fire_protection',
    icon: 'Shield',
    title: 'VII. Огнезащита',
    fullTitle: 'Раздел VII. Проверка состояния огнезащитных покрытий',
    fields: [
      { key: 'inspection_date', label: 'Дата проверки', type: 'date' },
      { key: 'act_number', label: 'Номер акта' },
      { key: 'structure_info', label: 'Конструкции. Вид огнезащиты.', type: 'textarea' },
      { key: 'work_type', label: 'Вид работ. Результат.', type: 'textarea' },
      { key: 'inspector', label: 'Проверку провел' },
    ],
  },
  {
    id: 'fire_dampers',
    icon: 'Box',
    title: 'VIII. Огнезадерживающие устройства',
    fullTitle: 'Раздел VIII. Проверка огнезадерживающих устройств',
    fields: [
      { key: 'device_name', label: 'Устройство, место установки', type: 'textarea' },
      { key: 'inspection_dates', label: 'Дата проверки', type: 'textarea' },
      { key: 'inspection_result', label: 'Результаты', type: 'textarea' },
      { key: 'inspector', label: 'Проверку провел' },
    ],
  },
  {
    id: 'indoor_hydrants',
    icon: 'Pipette',
    title: 'IX. Внутренние пожарные краны',
    fullTitle: 'Раздел IX. Проверка водоотдачи внутренних пожарных кранов',
    fields: [
      { key: 'inspection_date', label: 'Дата', type: 'date' },
      { key: 'hydrant_numbers', label: 'Номера ПК', type: 'textarea' },
      { key: 'required_water_flow', label: 'Норматив', type: 'textarea' },
      { key: 'flow_result', label: 'Результат', type: 'textarea' },
      { key: 'completeness_result', label: 'Укомплектованность', type: 'textarea' },
      { key: 'inspector', label: 'Проверку провел' },
    ],
  },
  {
    id: 'outdoor_hydrants',
    icon: 'Wrench',
    title: 'X. Наружные гидранты',
    fullTitle: 'Раздел X. Проверка наружных водопроводов',
    fields: [
      { key: 'inspection_date', label: 'Дата', type: 'date' },
      { key: 'hydrant_info', label: 'Водопровод, номера гидрантов', type: 'textarea' },
      { key: 'required_water_flow', label: 'Норматив', type: 'textarea' },
      { key: 'flow_result', label: 'Результат', type: 'textarea' },
      { key: 'inspector', label: 'Проверку провел' },
    ],
  },
  {
    id: 'valves_pumps',
    icon: 'Settings',
    title: 'XI. Задвижки и насосы',
    fullTitle: 'Раздел XI. Проверка задвижек и пожарных насосных агрегатов',
    fields: [
      { key: 'inspection_date', label: 'Дата', type: 'date' },
      { key: 'equipment_info', label: 'Устройства, место', type: 'textarea' },
      { key: 'inspection_result', label: 'Результаты', type: 'textarea' },
      { key: 'inspector', label: 'Проверку провел' },
    ],
  },
  {
    id: 'hose_rolling',
    icon: 'RotateCw',
    title: 'XII. Перекатка рукавов',
    fullTitle: 'Раздел XII. Перекатка пожарных рукавов',
    fields: [
      { key: 'rolling_date', label: 'Дата', type: 'date' },
      { key: 'hose_count', label: 'Количество', type: 'number' },
      { key: 'completion_note', label: 'Отметка', type: 'textarea' },
      { key: 'executor', label: 'Выполнил' },
    ],
  },
  {
    id: 'ladder_tests',
    icon: 'Layers',
    title: 'XIII. Испытания лестниц',
    fullTitle: 'Раздел XIII. Испытания пожарных лестниц и ограждений',
    fields: [
      { key: 'test_date', label: 'Дата', type: 'date' },
      { key: 'protocol_number', label: 'Номер протокола' },
      { key: 'structure_name', label: 'Конструкции', type: 'textarea' },
      { key: 'test_result', label: 'Результаты', type: 'textarea' },
      { key: 'inspector', label: 'Выполнил' },
    ],
  },
  {
    id: 'ventilation_cleaning',
    icon: 'Filter',
    title: 'XIV. Очистка вентиляции',
    fullTitle: 'Раздел XIV. Очистка вентиляционных систем',
    fields: [
      { key: 'equipment_info', label: 'Системы, место, категория', type: 'textarea' },
      { key: 'work_date', label: 'Дата', type: 'date' },
      { key: 'act_number', label: 'Номер акта' },
      { key: 'work_description', label: 'Работы', type: 'textarea' },
      { key: 'executor', label: 'Выполнил' },
    ],
  },
  {
    id: 'ppe',
    icon: 'Glasses',
    title: 'XV. СИЗ',
    fullTitle: 'Раздел XV. Проверка средств индивидуальной защиты',
    fields: [
      { key: 'equipment_info', label: 'СИЗ, количество, место', type: 'textarea' },
      { key: 'inspection_date', label: 'Дата', type: 'date' },
      { key: 'inspection_result', label: 'Результаты', type: 'textarea' },
      { key: 'inspector', label: 'Проверку провел' },
    ],
  },
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
  const [activeJournalTab, setActiveJournalTab] = useState<string>('aups');
  const [journalData, setJournalData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadObjectData();
    loadJournalData();
  }, []);

  const loadObjectData = async () => {
    try {
      const response = await fetch(`${API_URL}?table=object_characteristics`);
      const data = await response.json();
      if (data.length > 0) {
        const latest = data[0];
        setObjectData({
          name: latest.name || '',
          functionalClass: latest.functional_class || '',
          commissioningDate: latest.commissioning_date || '',
          address: latest.address || '',
          area: latest.area?.toString() || '',
          height: latest.height?.toString() || '',
          floors: latest.floors?.toString() || '',
          workplaces: latest.workplaces?.toString() || '',
          workingHours: latest.working_hours || '',
          protectionSystems: latest.protection_systems || '',
        });
      }
    } catch (error) {
      console.error('Error loading object data:', error);
    }
  };

  const loadJournalData = async () => {
    const tables = [
      'section_aups', 'section_soue', 'section_smoke_ventilation', 'section_aupt',
      'section_fire_extinguishers', 'section_fire_blankets', 'section_fire_protection',
      'section_fire_dampers', 'section_indoor_hydrants', 'section_outdoor_hydrants',
      'section_valves_pumps', 'section_hose_rolling', 'section_ladder_tests',
      'section_ventilation_cleaning', 'section_ppe'
    ];
    
    const mapping: Record<string, string> = {
      'section_aups': 'aups',
      'section_soue': 'soue',
      'section_smoke_ventilation': 'smoke_ventilation',
      'section_aupt': 'aupt',
      'section_fire_extinguishers': 'fire_extinguishers',
      'section_fire_blankets': 'fire_blankets',
      'section_fire_protection': 'fire_protection',
      'section_fire_dampers': 'fire_dampers',
      'section_indoor_hydrants': 'indoor_hydrants',
      'section_outdoor_hydrants': 'outdoor_hydrants',
      'section_valves_pumps': 'valves_pumps',
      'section_hose_rolling': 'hose_rolling',
      'section_ladder_tests': 'ladder_tests',
      'section_ventilation_cleaning': 'ventilation_cleaning',
      'section_ppe': 'ppe'
    };

    try {
      const newData: Record<string, any[]> = {};
      for (const table of tables) {
        const response = await fetch(`${API_URL}?table=${table}`);
        const data = await response.json();
        newData[mapping[table]] = data;
      }
      setJournalData(newData);
    } catch (error) {
      console.error('Error loading journal data:', error);
    }
  };

  const handleInputChange = (field: keyof ObjectData, value: string) => {
    setObjectData(prev => ({ ...prev, [field]: value }));
  };

  const saveObjectCharacteristics = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'object_characteristics',
          name: objectData.name,
          functional_class: objectData.functionalClass,
          commissioning_date: objectData.commissioningDate || null,
          address: objectData.address,
          area: objectData.area ? parseFloat(objectData.area) : null,
          height: objectData.height ? parseFloat(objectData.height) : null,
          floors: objectData.floors ? parseInt(objectData.floors) : null,
          workplaces: objectData.workplaces ? parseInt(objectData.workplaces) : null,
          working_hours: objectData.workingHours,
          protection_systems: objectData.protectionSystems,
        }),
      });
      
      if (response.ok) {
        toast({
          title: 'Сохранено',
          description: 'Характеристики объекта успешно сохранены',
        });
        loadObjectData();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить данные',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSave = async (sectionId: string, data: any) => {
    const tableMapping: Record<string, string> = {
      'aups': 'section_aups',
      'soue': 'section_soue',
      'smoke_ventilation': 'section_smoke_ventilation',
      'aupt': 'section_aupt',
      'fire_extinguishers': 'section_fire_extinguishers',
      'fire_blankets': 'section_fire_blankets',
      'fire_protection': 'section_fire_protection',
      'fire_dampers': 'section_fire_dampers',
      'indoor_hydrants': 'section_indoor_hydrants',
      'outdoor_hydrants': 'section_outdoor_hydrants',
      'valves_pumps': 'section_valves_pumps',
      'hose_rolling': 'section_hose_rolling',
      'ladder_tests': 'section_ladder_tests',
      'ventilation_cleaning': 'section_ventilation_cleaning',
      'ppe': 'section_ppe'
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableMapping[sectionId],
          ...data,
        }),
      });
      
      if (response.ok) {
        toast({
          title: 'Запись добавлена',
          description: 'Данные успешно сохранены',
        });
        loadJournalData();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить запись',
        variant: 'destructive',
      });
    }
  };

  const completionPercentage = Object.values(objectData).filter(v => v !== '').length / Object.keys(objectData).length * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://cdn.poehali.dev/projects/fc8972aa-4cef-4b81-a7f2-8d2dc556f071/files/6d8b84fb-7f02-4c9f-9e0a-1f75017c83af.jpg" 
                alt="Fire Safety Logo" 
                className="w-20 h-20 object-contain rounded-lg"
              />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Цифровизация пожарной безопасности
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">Система управления пожарной безопасностью</p>
              </div>
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
              <CardContent className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                <Button
                  variant={activeSection === 'characteristics' ? 'default' : 'ghost'}
                  className="w-full justify-start text-sm"
                  onClick={() => setActiveSection('characteristics')}
                >
                  <Icon name="Settings" size={16} className="mr-2" />
                  Характеристики объекта
                </Button>
                {mainSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? 'default' : 'ghost'}
                    className="w-full justify-start text-xs h-auto py-2"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Icon name={section.icon as any} size={14} className="mr-2 shrink-0" />
                    <span className="text-left line-clamp-2">{section.title}</span>
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
                      <Label htmlFor="name">Наименование объекта</Label>
                      <Input
                        id="name"
                        value={objectData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Введите наименование"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="functionalClass">Класс функциональной пожарной опасности</Label>
                      <Input
                        id="functionalClass"
                        value={objectData.functionalClass}
                        onChange={(e) => handleInputChange('functionalClass', e.target.value)}
                        placeholder="Например: Ф1.1, Ф2.3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commissioningDate">Дата ввода в эксплуатацию</Label>
                      <Input
                        id="commissioningDate"
                        type="date"
                        value={objectData.commissioningDate}
                        onChange={(e) => handleInputChange('commissioningDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Адрес</Label>
                      <Input
                        id="address"
                        value={objectData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Полный адрес объекта"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area">Площадь (м²)</Label>
                      <Input
                        id="area"
                        type="number"
                        value={objectData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Высота (м)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={objectData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="floors">Этажность</Label>
                      <Input
                        id="floors"
                        type="number"
                        value={objectData.floors}
                        onChange={(e) => handleInputChange('floors', e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workplaces">Количество рабочих мест</Label>
                      <Input
                        id="workplaces"
                        type="number"
                        value={objectData.workplaces}
                        onChange={(e) => handleInputChange('workplaces', e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workingHours">Режим работы</Label>
                      <Input
                        id="workingHours"
                        value={objectData.workingHours}
                        onChange={(e) => handleInputChange('workingHours', e.target.value)}
                        placeholder="Например: 9:00-18:00"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="protectionSystems">Наличие систем противопожарной защиты</Label>
                      <Textarea
                        id="protectionSystems"
                        value={objectData.protectionSystems}
                        onChange={(e) => handleInputChange('protectionSystems', e.target.value)}
                        placeholder="Перечислите установленные системы: АУПС, СОУЭ, АПТ, АУПТ и т.д."
                        rows={4}
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

                  <Button className="w-full mt-6" size="lg" onClick={saveObjectCharacteristics} disabled={loading}>
                    <Icon name="Save" size={18} className="mr-2" />
                    {loading ? 'Сохранение...' : 'Сохранить характеристики'}
                  </Button>
                </CardContent>
              </Card>
            ) : activeSection === 'documentation' ? (
              <DocumentationSection />
            ) : activeSection === 'journal' ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-blue-500 flex items-center justify-center">
                      <Icon name="Clipboard" className="text-white" size={24} />
                    </div>
                    <div>
                      <CardTitle>Журнал эксплуатации систем противопожарной защиты</CardTitle>
                      <CardDescription>15 разделов учета работ по техническому обслуживанию</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeJournalTab} onValueChange={setActiveJournalTab}>
                    <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-2">
                      {journalSubsections.map((subsection) => (
                        <TabsTrigger
                          key={subsection.id}
                          value={subsection.id}
                          className="text-xs px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <Icon name={subsection.icon as any} size={12} className="mr-1" />
                          {subsection.title}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {journalSubsections.map((subsection) => (
                      <TabsContent key={subsection.id} value={subsection.id} className="mt-6">
                        <JournalSection
                          sectionId={subsection.id}
                          title={subsection.fullTitle}
                          icon={subsection.icon}
                          color="bg-blue-500"
                          fields={subsection.fields}
                          headerFields={subsection.headerFields}
                          onSave={(data) => handleSectionSave(subsection.id, data)}
                          data={journalData[subsection.id] || []}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            ) : activeSection === 'checklist' ? (
              <ChecklistSection />
            ) : activeSection === 'drills' ? (
              <DrillsSection />
            ) : activeSection === 'assessment' ? (
              <AssessmentDashboard />
            ) : activeSection === 'executive_docs' ? (
              <ExecutiveDocsSection />
            ) : activeSection === 'calculations' ? (
              <CalculationsSection />
            ) : activeSection === 'audits' ? (
              <AuditsSection />
            ) : activeSection === 'declaration' ? (
              <DeclarationSection objectData={objectData} />
            ) : activeSection === 'insurance' ? (
              <InsuranceSection />
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded ${mainSections.find(s => s.id === activeSection)?.color} flex items-center justify-center`}>
                      <Icon name={mainSections.find(s => s.id === activeSection)?.icon as any} className="text-white" size={24} />
                    </div>
                    <div>
                      <CardTitle>{mainSections.find(s => s.id === activeSection)?.title}</CardTitle>
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