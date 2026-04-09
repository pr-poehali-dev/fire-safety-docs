import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
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
import LoadingIndicator from '@/components/LoadingIndicator';
import ActivityHistory from '@/components/ActivityHistory';
import AuthLogsSection from '@/components/AuthLogsSection';
import SecurityEventsSection from '@/components/SecurityEventsSection';
import DataProtectionSection from '@/components/DataProtectionSection';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

const allSections = [
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
  { id: 'data_protection', icon: 'FileKey', title: 'Защита данных', color: 'bg-emerald-700' },
  { id: 'security_events', icon: 'Shield', title: 'Журнал событий ИБ', color: 'bg-indigo-700' },
  { id: 'auth_logs', icon: 'ShieldAlert', title: 'Журнал авторизации', color: 'bg-slate-600' },
  { id: 'faq', icon: 'HelpCircle', title: 'Вопросы и ответы', color: 'bg-purple-500' },
];

const managerSections = new Set([
  'profile',
  'characteristic',
  'assessment',
  'audits',
  'declaration',
  'insurance',
  'fires',
  'faq',
]);

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

function convertObjectToLocal(obj: Record<string, unknown>): ObjectData {
  return {
    name: (obj.name as string) || '',
    functionalClass: (obj.functional_class as string) || '',
    commissioningDate: (obj.commissioning_date as string) || '',
    address: (obj.address as string) || '',
    fireResistance: (obj.fire_resistance as string) || '',
    structuralFireHazard: (obj.structural_fire_hazard as string) || '',
    area: obj.area != null ? String(obj.area) : '',
    floorArea: obj.floor_area != null ? String(obj.floor_area) : '',
    height: obj.height != null ? String(obj.height) : '',
    floors: obj.floors != null ? String(obj.floors) : '',
    volume: obj.volume != null ? String(obj.volume) : '',
    outdoorCategory: (obj.outdoor_category as string) || '',
    buildingCategory: (obj.building_category as string) || '',
    workplaces: obj.workplaces != null ? String(obj.workplaces) : '',
    workingHours: (obj.working_hours as string) || '',
    protectionSystems: (obj.protection_systems as string) || '',
    photo: (obj.photo as string) || null,
  };
}

const AppPage = () => {
  const { user, currentObject, selectObject, updateObject, hasRole, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [activeJournalSubsection, setActiveJournalSubsection] = useState(journalSubsections[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarScrolled, setSidebarScrolled] = useState(false);
  const [sidebarAtBottom, setSidebarAtBottom] = useState(false);

  const handleSidebarScroll = useCallback(() => {
    const el = sidebarRef.current;
    if (!el) return;
    setSidebarScrolled(el.scrollTop > 10);
    setSidebarAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 10);
  }, []);

  const [fireIncidents, setFireIncidents] = useState<Record<string, unknown>[]>([]);

  const [objectData, setObjectData] = useState<ObjectData>(() =>
    currentObject ? convertObjectToLocal(currentObject as unknown as Record<string, unknown>) : {
      name: '', functionalClass: '', commissioningDate: '', address: '',
      fireResistance: '', structuralFireHazard: '', area: '', floorArea: '',
      height: '', floors: '', volume: '', outdoorCategory: '', buildingCategory: '',
      workplaces: '', workingHours: '', protectionSystems: '', photo: null,
    }
  );

  useEffect(() => {
    if (currentObject) {
      setObjectData(convertObjectToLocal(currentObject as unknown as Record<string, unknown>));
    }
  }, [currentObject]);

  const objectId = currentObject?.id ?? 0;

  const adminOnlySections = new Set(['auth_logs', 'security_events', 'data_protection']);
  const mainSections = (hasRole(['admin', 'responsible'])
    ? allSections
    : allSections.filter((s) => managerSections.has(s.id))
  ).filter((s) => !adminOnlySections.has(s.id) || hasRole(['admin']));

  const handleSaveObject = async () => {
    if (!currentObject) return;
    setIsLoading(true);
    try {
      const dbData: Record<string, unknown> = {
        object_id: currentObject.id,
        name: objectData.name,
        functional_class: objectData.functionalClass,
        commissioning_date: objectData.commissioningDate || null,
        address: objectData.address,
        fire_resistance: objectData.fireResistance,
        structural_fire_hazard: objectData.structuralFireHazard,
        area: objectData.area ? parseFloat(objectData.area) : null,
        floor_area: objectData.floorArea ? parseFloat(objectData.floorArea) : null,
        height: objectData.height ? parseFloat(objectData.height) : null,
        floors: objectData.floors ? parseInt(objectData.floors) : null,
        volume: objectData.volume ? parseFloat(objectData.volume) : null,
        outdoor_category: objectData.outdoorCategory,
        building_category: objectData.buildingCategory,
        workplaces: objectData.workplaces ? parseInt(objectData.workplaces) : null,
        working_hours: objectData.workingHours,
        protection_systems: objectData.protectionSystems,
        photo: objectData.photo,
      };

      const ok = await updateObject(dbData);
      if (!ok) throw new Error('Failed to save');

      toast({
        title: 'Успешно сохранено',
        description: 'Данные объекта обновлены',
      });

      const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
      logs.push({
        id: Date.now().toString(),
        action: 'Обновлены характеристики объекта',
        section: 'Характеристика объекта',
        timestamp: new Date().toISOString(),
        details: objectData.name,
      });
      localStorage.setItem('activity_logs', JSON.stringify(logs.slice(-100)));
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

  const isReadOnlyCharacteristic = hasRole(['manager']);

  const renderMainSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileTab />;
      case 'characteristic':
        return <CharacteristicTab objectData={objectData} onSave={handleSaveObject} onInputChange={handleInputChange} objectId={objectId} readOnly={isReadOnlyCharacteristic} />;
      case 'informing':
        return <InformingTab />;
      case 'documentation':
        return <DocumentationSection objectId={objectId} />;
      case 'monitoring':
        return <MonitoringSection objectId={objectId} />;
      case 'fires':
        return <FiresTab incidents={fireIncidents} onIncidentsChange={setFireIncidents} objectId={objectId} />;
      case 'journal':
        return (
          <div>
            <Tabs value={activeJournalSubsection} onValueChange={setActiveJournalSubsection}>
              <div className="mb-6">
                <TabsList className="flex flex-wrap gap-1.5 bg-transparent p-0 h-auto">
                  {journalSubsections.map((subsection) => (
                    <TabsTrigger 
                      key={subsection.id} 
                      value={subsection.id} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 hover:bg-gray-50 transition-all text-xs"
                    >
                      <Icon name={subsection.icon} size={14} />
                      <span className="font-medium">{subsection.title}</span>
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
                    objectId={objectId}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        );
      case 'checklist':
        return <ChecklistSection objectId={objectId} />;
      case 'drills':
        return <DrillsSection fields={drillFields} objectId={objectId} />;
      case 'assessment':
        return <AssessmentDashboard />;
      case 'executive_docs':
        return <ExecutiveDocsSection objectId={objectId} />;
      case 'calculations':
        return <CalculationsSection objectId={objectId} />;
      case 'audits':
        return <AuditsSection objectId={objectId} />;
      case 'declaration':
        return <DeclarationSection objectData={objectData} objectId={objectId} />;
      case 'insurance':
        return <InsuranceSection objectId={objectId} />;
      case 'notifications':
        return <NotificationsSection objectId={objectId} />;
      case 'export':
        return <ExportSection objectId={objectId} />;
      case 'data_protection':
        return <DataProtectionSection />;
      case 'security_events':
        return <SecurityEventsSection />;
      case 'auth_logs':
        return <AuthLogsSection />;
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
          <div ref={sidebarRef} onScroll={handleSidebarScroll} className="w-80 h-screen bg-white border-r border-gray-200 shadow-lg fixed left-0 top-0 overflow-y-auto">
            {sidebarScrolled && (
              <div className="sticky top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/10 to-transparent z-10 pointer-events-none" />
            )}
            <div className={`p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-orange-500 ${sidebarScrolled ? '-mt-4' : ''}`}>
              <div className="bg-white rounded-xl px-4 py-3 inline-block mb-3">
                <img
                  src="https://cdn.poehali.dev/projects/fc8972aa-4cef-4b81-a7f2-8d2dc556f071/bucket/4ad57d25-eeff-4ea2-9c47-a108c700f08b.png"
                  alt="Код безопасности РУСАЛ"
                  className="h-14 object-contain"
                />
              </div>
              <h1 className="text-sm font-semibold text-white/90 leading-snug">
                Система управления<br/>пожарной безопасностью
              </h1>
              {currentObject && (
                <p className="text-xs text-white/70 mt-2 truncate">{currentObject.name}</p>
              )}
            </div>
            
            <div className="p-4 space-y-1">
              <Button
                variant="ghost"
                onClick={() => selectObject(null)}
                className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900"
              >
                <Icon name="ArrowLeft" size={20} />
                <span>К списку объектов</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900"
              >
                <Icon name="Home" size={20} />
                <span>На главную</span>
              </Button>
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start gap-2 text-gray-600 hover:text-red-600"
              >
                <Icon name="LogOut" size={20} />
                <span>Выйти</span>
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
            {!sidebarAtBottom && (
              <div className="sticky bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            )}
          </div>

          <div className="ml-80 flex-1 p-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">{renderMainSection()}</CardContent>
            </Card>
          </div>

          <ChatAssistant />
          <ActivityHistory />
        </div>
      </div>
    </>
  );
};

export default AppPage;