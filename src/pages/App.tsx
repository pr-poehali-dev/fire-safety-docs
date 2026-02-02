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
import NotificationsSection from '@/components/NotificationsSection';
import ExportSection from '@/components/ExportSection';
import FAQSection from '@/components/FAQSection';
import ChatAssistant from '@/components/ChatAssistant';
import MonitoringSection from '@/components/MonitoringSection';
import CharacteristicTab from '@/components/CharacteristicTab';
import InformingTab from '@/components/InformingTab';
import ProfileTab from '@/components/ProfileTab';
import FiresTab from '@/components/FiresTab';
import FiresDashboard from '@/components/FiresDashboard';
import LoadingIndicator from '@/components/LoadingIndicator';
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
}

const mainSections = [
  { id: 'profile', icon: 'User', title: 'Личный кабинет', color: 'bg-indigo-500' },
  { id: 'characteristic', icon: 'Building2', title: 'Характеристика объекта', color: 'bg-blue-500' },
  { id: 'informing', icon: 'Info', title: 'Информирование', color: 'bg-cyan-500' },
  { id: 'documentation', icon: 'FileText', title: 'Документация', color: 'bg-orange-500' },
  { id: 'monitoring', icon: 'Monitor', title: 'Мониторинг и управление АРМ', color: 'bg-indigo-500' },
  { id: 'fires', icon: 'Flame', title: 'Пожары', color: 'bg-red-600' },
  { id: 'journal', icon: 'Clipboard', title: 'Журнал эксплуатации систем противопожарной защиты', color: 'bg-blue-500' },
  { id: 'checklist', icon: 'CheckSquare', title: 'Чек-лист', color: 'bg-orange-500' },
  { id: 'assessment', icon: 'AlertTriangle', title: 'Оценка ПБ и риски', color: 'bg-orange-500' },
  { id: 'executive_docs', icon: 'FolderOpen', title: 'Исполнительная документация', color: 'bg-blue-500' },
  { id: 'calculations', icon: 'Calculator', title: 'Расчеты по категории взрывопожарной и пожарной опасности', color: 'bg-orange-500' },
  { id: 'audits', icon: 'Search', title: 'Проверки (аудиты) объекта', color: 'bg-blue-500' },
  { id: 'declaration', icon: 'FileCheck', title: 'Декларация ПБ', color: 'bg-orange-500' },
  { id: 'insurance', icon: 'Shield', title: 'Страхование объекта', color: 'bg-blue-500' },
  { id: 'faq', icon: 'HelpCircle', title: 'Вопросы и ответы', color: 'bg-purple-500' },
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
      { key: 'inspection_date', label: 'Дата проверки', type: 'date' },
      { key: 'condition', label: 'Исправно / Неисправно', type: 'text' },
      { key: 'maintenance_performed', label: 'Проведено ТО', type: 'textarea' },
      { key: 'inspector', label: 'Проверку провел' },
    ],
  },
  {
    id: 'hydrants',
    icon: 'Droplets',
    title: 'IX. Пожарные гидранты и краны',
    fullTitle: 'Раздел IX. Проверка внутренних пожарных кранов и наружных гидрантов',
    fields: [
      { key: 'device_number', label: 'Номер устройства' },
      { key: 'location', label: 'Место установки', type: 'textarea' },
      { key: 'inspection_date', label: 'Дата проверки', type: 'date' },
      { key: 'condition', label: 'Состояние', type: 'text' },
      { key: 'pressure', label: 'Давление (МПа)', type: 'text' },
      { key: 'defects', label: 'Выявленные недостатки', type: 'textarea' },
      { key: 'inspector', label: 'Проверку провел' },
    ],
  },
];

const drillFields = [
  { key: 'drill_date', label: 'Дата проведения тренировки', type: 'date' },
  { key: 'drill_type', label: 'Тип тренировки', type: 'text' },
  { key: 'participants_count', label: 'Количество участников', type: 'number' },
  { key: 'evacuation_time', label: 'Время эвакуации (мин)', type: 'text' },
  { key: 'remarks', label: 'Замечания', type: 'textarea' },
  { key: 'measures', label: 'Принятые меры', type: 'textarea' },
  { key: 'responsible_person', label: 'Ответственное лицо' },
];

const AppPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [activeJournalSubsection, setActiveJournalSubsection] = useState(journalSubsections[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [fireIncidents, setFireIncidents] = useState<any[]>([]);

  const [objectData, setObjectData] = useState<ObjectData>({
    name: '',
    functionalClass: '',
    commissioningDate: '',
    address: '',
    fireResistance: '',
    structuralFireHazard: '',
    area: '',
    floorArea: '',
    height: '',
    floors: '',
    volume: '',
    outdoorCategory: '',
    buildingCategory: '',
    workplaces: '',
    workingHours: '',
    protectionSystems: '',
  });

  useEffect(() => {
    const fetchObjectData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/get-object-data`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (data) {
          setObjectData(data);
        }
      } catch (error) {
        console.error('Error fetching object data:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    fetchObjectData();
  }, []);

  const handleSaveObject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/save-object-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(objectData),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast({
        title: 'Успешно сохранено',
        description: 'Данные объекта обновлены',
      });
    } catch (error) {
      console.error('Error saving object data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить данные',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleInputChange = (field: keyof ObjectData, value: string) => {
    setObjectData(prev => ({ ...prev, [field]: value }));
  };

  const renderMainSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileTab />;
      case 'characteristic':
        return <CharacteristicTab objectData={objectData} onSave={handleSaveObject} onInputChange={handleInputChange} />;
      case 'informing':
        return <InformingTab />;
      case 'documentation':
        return <DocumentationSection />;
      case 'monitoring':
        return <MonitoringSection />;
      case 'fires':
        return <FiresTab incidents={fireIncidents} onIncidentsChange={setFireIncidents} />;
      case 'journal':
        return (
          <div>
            <Tabs value={activeJournalSubsection} onValueChange={setActiveJournalSubsection}>
              <div className="mb-6 overflow-x-auto">
                <TabsList className="inline-flex gap-2 bg-transparent p-0">
                  {journalSubsections.map((subsection) => (
                    <TabsTrigger 
                      key={subsection.id} 
                      value={subsection.id} 
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 hover:bg-gray-50 transition-all"
                    >
                      <Icon name={subsection.icon} size={16} />
                      <span className="text-sm font-medium whitespace-nowrap">{subsection.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {journalSubsections.map((subsection) => (
                <TabsContent key={subsection.id} value={subsection.id}>
                  <JournalSection 
                    sectionId={subsection.id}
                    title={subsection.fullTitle}
                    icon={subsection.icon}
                    color="bg-blue-500"
                    fields={subsection.fields}
                    onSave={(data) => console.log('Saved:', data)}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        );
      case 'checklist':
        return <ChecklistSection />;
      case 'drills':
        return <DrillsSection fields={drillFields} />;
      case 'assessment':
        return <AssessmentDashboard />;
      case 'executive_docs':
        return <ExecutiveDocsSection />;
      case 'calculations':
        return <CalculationsSection />;
      case 'audits':
        return <AuditsSection />;
      case 'declaration':
        return <DeclarationSection />;
      case 'insurance':
        return <InsuranceSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'export':
        return <ExportSection />;
      case 'faq':
        return <FAQSection />;
      default:
        return <div>Раздел в разработке</div>;
    }
  };

  return (
    <>
      {isLoading && <LoadingIndicator />}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="flex">
          {/* Боковая навигация */}
          <div className="w-80 min-h-screen bg-white border-r border-gray-200 shadow-lg fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-orange-500">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Flame" size={32} className="text-white" />
                <h1 className="text-xl font-bold text-white">
                  Система управления ПБ
                </h1>
              </div>
              <p className="text-white/80 text-sm">
                Управление пожарной безопасностью
              </p>
            </div>
            
            <div className="p-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <Icon name="ArrowLeft" size={20} />
                <span>К презентации</span>
              </Button>
            </div>

            <nav className="px-4 pb-4 space-y-1">
              {mainSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 ${
                    activeSection === section.id
                      ? section.color + ' text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon 
                    name={section.icon} 
                    size={20} 
                    className={activeSection === section.id ? '' : 'text-gray-500'}
                  />
                  <span className="text-sm">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Основной контент */}
          <div className="ml-80 flex-1 p-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">{renderMainSection()}</CardContent>
            </Card>
          </div>

          <ChatAssistant />
        </div>
      </div>
    </>
  );
};

export default AppPage;