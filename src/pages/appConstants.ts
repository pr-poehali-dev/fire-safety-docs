export interface ObjectData {
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

export const allSections = [
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
  { id: 'security_report', icon: 'ShieldCheck', title: 'Отчёт безопасности', color: 'bg-teal-700' },
  { id: 'network_architecture', icon: 'Network', title: 'Сетевая архитектура', color: 'bg-blue-800' },
  { id: 'tech_solution', icon: 'FileStack', title: 'Приложение В. Тех. решение', color: 'bg-blue-700' },
  { id: 'testing_program', icon: 'ClipboardCheck', title: 'ПМИ ПЗИ (Приложение Г)', color: 'bg-purple-700' },
  { id: 'admin_guide', icon: 'BookOpen', title: 'Руководство администратора', color: 'bg-orange-700' },
  { id: 'security_events', icon: 'Shield', title: 'Журнал событий ИБ', color: 'bg-indigo-700' },
  { id: 'auth_logs', icon: 'ShieldAlert', title: 'Журнал авторизации', color: 'bg-slate-600' },
  { id: 'faq', icon: 'HelpCircle', title: 'Вопросы и ответы', color: 'bg-purple-500' },
];

export const managerSections = new Set([
  'profile',
  'characteristic',
  'assessment',
  'audits',
  'declaration',
  'insurance',
  'fires',
  'faq',
]);

export const adminOnlySections = new Set([
  'auth_logs',
  'security_events',
  'data_protection',
  'security_report',
  'network_architecture',
  'tech_solution',
  'testing_program',
  'admin_guide',
]);

export const journalSubsections = [
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

export const drillFields = [
  { key: 'drill_date', label: 'Дата проведения тренировки', type: 'date' },
  { key: 'drill_type', label: 'Тип тренировки', type: 'text' },
  { key: 'participants_count', label: 'Количество участников', type: 'number' },
  { key: 'evacuation_time', label: 'Время эвакуации (мин)', type: 'text' },
  { key: 'remarks', label: 'Замечания', type: 'textarea' },
  { key: 'measures', label: 'Принятые меры', type: 'textarea' },
  { key: 'responsible_person', label: 'Ответственное лицо' },
];

export function convertObjectToLocal(obj: Record<string, unknown>): ObjectData {
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
