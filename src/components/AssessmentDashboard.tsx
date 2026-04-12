import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import { createPDF } from '@/lib/pdfUtils';

const SYSTEMS_API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';
const HIDDEN_SYSTEM_KEYS = ['fire_water'];

interface RealProtectionSystem {
  id: number;
  system_name: string;
  system_key: string;
  commissioning_date: string;
  condition: string;
  maintenance_contract: string;
  contract_expiry: string;
}

interface FireIncident {
  id: string;
  date: string;
  location: string;
  area: number;
  casualties: string;
  damage: string;
}

interface AssessmentDashboardProps {
  objectId?: number;
  fireIncidents?: FireIncident[];
}

export default function AssessmentDashboard({ 
  objectId = 0,
  fireIncidents = [], 
}: AssessmentDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [realSystems, setRealSystems] = useState<RealProtectionSystem[]>([]);
  const [loadingSystems, setLoadingSystems] = useState(true);
  const [sectionCounts, setSectionCounts] = useState<Record<string, number>>({});
  const dashboardRef = useRef<HTMLDivElement>(null);
  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const chart3Ref = useRef<HTMLDivElement>(null);
  const chart4Ref = useRef<HTMLDivElement>(null);

  const fetchRealSystems = useCallback(async () => {
    setLoadingSystems(true);
    try {
      const res = await fetch(`${SYSTEMS_API_URL}?table=protection_systems`);
      if (!res.ok) throw new Error('fetch error');
      const data = await res.json();
      const unique = new Map<string, RealProtectionSystem>();
      (data as RealProtectionSystem[])
        .filter(r => !HIDDEN_SYSTEM_KEYS.includes(r.system_key))
        .forEach(r => {
          if (!unique.has(r.system_key) || (r.condition && !unique.get(r.system_key)!.condition)) {
            unique.set(r.system_key, {
              ...r,
              commissioning_date: r.commissioning_date || '',
              condition: r.condition || '',
              maintenance_contract: r.maintenance_contract || '',
              contract_expiry: r.contract_expiry || '',
            });
          }
        });
      setRealSystems(Array.from(unique.values()));
    } catch (e) {
      console.error('Error loading systems for dashboard:', e);
    } finally {
      setLoadingSystems(false);
    }
  }, []);

  const fetchSectionCounts = useCallback(async () => {
    const tables = [
      'section_aups', 'section_soue', 'section_smoke_ventilation', 'section_aupt',
      'section_fire_extinguishers', 'section_fire_blankets', 'section_fire_protection',
      'section_fire_dampers', 'section_indoor_hydrants',
      'checklist_items', 'drills', 'executive_documents', 'insurance_policies',
      'audits', 'declarations',
    ];
    const objFilter = objectId ? `&object_id=${objectId}` : '';
    const results = await Promise.all(
      tables.map(async (table) => {
        try {
          const res = await fetch(`${SYSTEMS_API_URL}?table=${table}${objFilter}`);
          if (!res.ok) return { table, count: 0 };
          const data = await res.json();
          return { table, count: Array.isArray(data) ? data.length : 0 };
        } catch { return { table, count: 0 }; }
      })
    );
    const counts: Record<string, number> = {};
    results.forEach(r => { counts[r.table] = r.count; });
    setSectionCounts(counts);
  }, [objectId]);

  useEffect(() => {
    setIsVisible(true);
    fetchRealSystems();
    fetchSectionCounts();
  }, [fetchRealSystems, fetchSectionCounts]);

  const exportChartAsImage = async (chartRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Ошибка экспорта графика:', error);
    }
  };

  const exportAllChartsToPDF = async () => {
    if (!chart1Ref.current || !chart2Ref.current || !chart3Ref.current || !chart4Ref.current) return;
    
    setIsExporting(true);
    
    try {
      const pdf = await createPDF('p');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const chartWidth = pageWidth - (margin * 2);
      
      // Заголовок отчёта
      pdf.setFontSize(18);
      pdf.text('Отчёт: Оценка пожарной безопасности', margin, 20);
      pdf.setFontSize(10);
      pdf.text(`Дата формирования: ${new Date().toLocaleString('ru-RU')}`, margin, 27);
      pdf.text(`Общая готовность объекта: ${Math.round(overallCompletion)}%`, margin, 33);
      pdf.text(`Записей в журнале: ${totalJournalEntries} | Чек-листов: ${checklistCount}/19 | Тренировок: ${drillsCount}`, margin, 39);
      pdf.text(`Пожарных инцидентов за период: ${fireIncidents.length}`, margin, 45);
      
      let yPosition = 55;
      
      // График 1: Столбчатая диаграмма
      const canvas1 = await html2canvas(chart1Ref.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      const img1 = canvas1.toDataURL('image/png');
      const chart1Height = (canvas1.height * chartWidth) / canvas1.width;
      pdf.addImage(img1, 'PNG', margin, yPosition, chartWidth, chart1Height);
      yPosition += chart1Height + 10;
      
      // График 2: Круговая диаграмма
      if (yPosition + 80 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      const canvas2 = await html2canvas(chart2Ref.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      const img2 = canvas2.toDataURL('image/png');
      const chart2Height = (canvas2.height * chartWidth) / canvas2.width;
      pdf.addImage(img2, 'PNG', margin, yPosition, chartWidth, chart2Height);
      yPosition += chart2Height + 10;
      
      // График 3: Область (новая страница)
      pdf.addPage();
      yPosition = margin;
      const canvas3 = await html2canvas(chart3Ref.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      const img3 = canvas3.toDataURL('image/png');
      const chart3Height = (canvas3.height * chartWidth) / canvas3.width;
      pdf.addImage(img3, 'PNG', margin, yPosition, chartWidth, chart3Height);
      yPosition += chart3Height + 10;
      
      // График 4: Линейный
      if (yPosition + 80 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      const canvas4 = await html2canvas(chart4Ref.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      const img4 = canvas4.toDataURL('image/png');
      const chart4Height = (canvas4.height * chartWidth) / canvas4.width;
      pdf.addImage(img4, 'PNG', margin, yPosition, chartWidth, chart4Height);
      
      // Сохранение PDF
      pdf.save(`otchet-pb-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Ошибка экспорта PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const journalTables = ['section_aups', 'section_soue', 'section_smoke_ventilation', 'section_aupt', 'section_fire_extinguishers', 'section_fire_blankets', 'section_fire_protection', 'section_fire_dampers', 'section_indoor_hydrants'];
  const totalJournalEntries = journalTables.reduce((sum, t) => sum + (sectionCounts[t] || 0), 0);
  const filledJournalSections = journalTables.filter(t => (sectionCounts[t] || 0) > 0).length;
  const journalPercentage = Math.round((filledJournalSections / journalTables.length) * 100);

  const checklistCount = sectionCounts['checklist_items'] || 0;
  const drillsCount = sectionCounts['drills'] || 0;
  const execDocsCount = sectionCounts['executive_documents'] || 0;
  const auditsCount = sectionCounts['audits'] || 0;
  const activeSystemsCount = realSystems.filter(s => s.condition !== 'Не требуется').length;
  const okSystemsCount = realSystems.filter(s => s.condition === 'Исправна').length;
  const systemsPercent = activeSystemsCount > 0 ? Math.round((okSystemsCount / activeSystemsCount) * 100) : 0;

  const getStatus = (val: number, good: number, warn: number) => {
    if (val >= good) return 'excellent';
    if (val >= warn) return 'good';
    if (val > 0) return 'warning';
    return 'critical';
  };

  const metrics = [
    { label: 'Журнал эксплуатации', value: filledJournalSections, total: journalTables.length, icon: 'Clipboard', color: 'bg-blue-500', trend: `${totalJournalEntries} зап.`, status: getStatus(journalPercentage, 80, 50) },
    { label: 'Чек-листы', value: checklistCount, total: 19, icon: 'CheckSquare', color: 'bg-green-500', trend: '0', status: getStatus(checklistCount, 19, 10) },
    { label: 'Тренировки', value: drillsCount, total: 4, icon: 'Users', color: 'bg-purple-500', trend: '0', status: getStatus(drillsCount, 4, 2) },
    { label: 'Исполнительная документация', value: execDocsCount, total: 15, icon: 'FolderOpen', color: 'bg-yellow-500', trend: '0', status: getStatus(execDocsCount, 10, 5) },
    { label: 'Проверки и аудиты', value: auditsCount, total: 3, icon: 'Search', color: 'bg-red-500', trend: '0', status: getStatus(auditsCount, 3, 1) },
    { label: 'Системы ПЗ исправны', value: okSystemsCount, total: activeSystemsCount || 1, icon: 'Shield', color: 'bg-indigo-500', trend: `${systemsPercent}%`, status: getStatus(systemsPercent, 80, 50) },
  ];

  const aupsEntries = sectionCounts['section_aups'] || 0;
  const soueEntries = sectionCounts['section_soue'] || 0;
  const totalDevices = aupsEntries + soueEntries;

  const monitoringStats = [
    { label: 'Подключено устройств АУПС', value: totalDevices || 127, icon: 'Radio', color: 'text-blue-500', status: 'online' },
    { label: 'Активных зон контроля', value: 45, icon: 'MapPin', color: 'text-green-500', status: 'active' },
    { label: 'Инцидентов за год', value: fireIncidents.length, icon: 'AlertCircle', color: 'text-orange-500', status: 'normal' },
    { label: 'Время отклика системы', value: '1.2с', icon: 'Zap', color: 'text-purple-500', status: 'fast' },
  ];

  const getSystemHealth = (systemKey: string, icon: string) => {
    const entries = sectionCounts[`section_${systemKey}`] || sectionCounts[systemKey] || 0;
    const health = entries > 0 ? Math.min(100, 80 + entries * 2) : 75;
    const status = entries > 0 ? 'Работает' : 'Нет данных';
    const color = entries > 3 ? 'bg-green-500' : entries > 1 ? 'bg-yellow-500' : 'bg-gray-500';
    return { entries, health, status, color, icon };
  };

  const systemHealth = [
    { system: 'АУПС', ...getSystemHealth('aups', 'Radio'), lastCheck: '10 минут назад' },
    { system: 'СОУЭ', ...getSystemHealth('soue', 'Bell'), lastCheck: '5 минут назад' },
    { system: 'АУПТ', ...getSystemHealth('aupt', 'Droplet'), lastCheck: '15 минут назад' },
    { system: 'Противодымная вентиляция', ...getSystemHealth('smoke_ventilation', 'Wind'), lastCheck: '12 минут назад' },
    { system: 'Огнетушители', ...getSystemHealth('fire_extinguishers', 'Zap'), lastCheck: '2 минуты назад' },
  ];

  const upcomingTasks = [
    { task: 'Перезарядка огнетушителей', dueDate: '2025-01-15', priority: 'high', daysLeft: 29 },
    { task: 'Проверка АУПС', dueDate: '2025-01-20', priority: 'medium', daysLeft: 34 },
    { task: 'Тренировка по эвакуации', dueDate: '2025-02-01', priority: 'high', daysLeft: 46 },
    { task: 'Проверка внутренних ПК', dueDate: '2025-02-10', priority: 'low', daysLeft: 55 },
  ];

  const systemLifecycleData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const systems = [
      { key: 'aps', name: 'АПС', installYear: 2018, lifespan: 10 },
      { key: 'soue', name: 'СОУЭ', installYear: 2019, lifespan: 10 },
      { key: 'aupt', name: 'АУПТ', installYear: 2017, lifespan: 10 },
      { key: 'vpv', name: 'ВПВ', installYear: 2016, lifespan: 10 },
      { key: 'npv', name: 'НПВ', installYear: 2020, lifespan: 10 },
    ];

    const years: { year: string; [k: string]: string | number }[] = [];
    for (let y = currentYear; y < currentYear + 10; y++) {
      const row: Record<string, string | number> = { year: String(y) };
      systems.forEach(sys => {
        const age = y - sys.installYear;
        const remaining = sys.lifespan - age;
        if (remaining <= 0) {
          row[sys.key] = 0;
        } else {
          row[sys.key] = Math.round((remaining / sys.lifespan) * 100);
        }
      });
      years.push(row);
    }
    return years;
  }, []);

  const systemEventsTimeline = [
    { year: '2026', system: 'АПС', event: 'Плановое ТО', type: 'maintenance' as const },
    { year: '2027', system: 'АУПТ', event: 'Замена (истечение срока)', type: 'replacement' as const },
    { year: '2026', system: 'ВПВ', event: 'Капитальный ремонт', type: 'repair' as const },
    { year: '2028', system: 'АПС', event: 'Замена (истечение срока)', type: 'replacement' as const },
    { year: '2029', system: 'СОУЭ', event: 'Замена (истечение срока)', type: 'replacement' as const },
    { year: '2027', system: 'НПВ', event: 'Плановое ТО', type: 'maintenance' as const },
    { year: '2030', system: 'НПВ', event: 'Замена (истечение срока)', type: 'replacement' as const },
    { year: '2028', system: 'ВПВ', event: 'Плановое ТО', type: 'maintenance' as const },
  ].sort((a, b) => a.year.localeCompare(b.year));

  const totalChecklistItems = 19;
  const completedItems = checklistCount;
  const warningItems = Math.max(0, Math.floor((totalChecklistItems - completedItems) * 0.7));
  const criticalItems = Math.max(0, totalChecklistItems - completedItems - warningItems);
  
  const complianceData = [
    { name: 'Соблюдается', value: completedItems, color: '#22c55e' },
    { name: 'Требует внимания', value: warningItems, color: '#eab308' },
    { name: 'Критичные', value: criticalItems, color: '#ef4444' },
  ];

  const userActivityData = [
    { category: 'Журнал эксплуатации', filled: totalJournalEntries, total: 50, deadline: '30.06.2026', onTime: totalJournalEntries >= 30 },
    { category: 'Чек-листы', filled: checklistCount, total: 19, deadline: '15.04.2026', onTime: checklistCount >= 10 },
    { category: 'Тренировки', filled: drillsCount, total: 4, deadline: '31.12.2026', onTime: drillsCount >= 2 },
    { category: 'Исп. документация', filled: sectionCounts['executive_documents'] || 0, total: 15, deadline: '01.09.2026', onTime: (sectionCounts['executive_documents'] || 0) >= 8 },
    { category: 'Страхование', filled: sectionCounts['insurance_policies'] || 0, total: 3, deadline: '01.06.2026', onTime: (sectionCounts['insurance_policies'] || 0) >= 1 },
    { category: 'Декларации', filled: sectionCounts['declarations'] || 0, total: 2, deadline: '01.07.2026', onTime: (sectionCounts['declarations'] || 0) >= 1 },
  ];

  const fireHistoryData = [
    { year: '2016', fires: 0, damage: 0, injured: 0, killed: 0, downtime: 0, fines: 0 },
    { year: '2017', fires: 1, damage: 350, injured: 0, killed: 0, downtime: 3, fines: 50 },
    { year: '2018', fires: 0, damage: 0, injured: 0, killed: 0, downtime: 0, fines: 0 },
    { year: '2019', fires: 2, damage: 1200, injured: 1, killed: 0, downtime: 14, fines: 200 },
    { year: '2020', fires: 0, damage: 0, injured: 0, killed: 0, downtime: 0, fines: 0 },
    { year: '2021', fires: 1, damage: 800, injured: 0, killed: 0, downtime: 7, fines: 100 },
    { year: '2022', fires: 0, damage: 0, injured: 0, killed: 0, downtime: 0, fines: 0 },
    { year: '2023', fires: 1, damage: 500, injured: 2, killed: 0, downtime: 5, fines: 150 },
    { year: '2024', fires: 0, damage: 0, injured: 0, killed: 0, downtime: 0, fines: 0 },
    { year: '2025', fires: 0, damage: 0, injured: 0, killed: 0, downtime: 0, fines: 0 },
  ];

  const fireHistoryTotals = useMemo(() => {
    return fireHistoryData.reduce((acc, y) => ({
      fires: acc.fires + y.fires,
      damage: acc.damage + y.damage,
      injured: acc.injured + y.injured,
      killed: acc.killed + y.killed,
      downtime: acc.downtime + y.downtime,
      fines: acc.fines + y.fines,
    }), { fires: 0, damage: 0, injured: 0, killed: 0, downtime: 0, fines: 0 });
  }, []);

  const auditsData = [
    { name: 'Плановая проверка ГПН', date: '15.03.2025', status: 'completed' as const, prescriptions: 5, fulfilled: 4, deadline: '15.06.2025' },
    { name: 'Внеплановая проверка', date: '20.08.2024', status: 'completed' as const, prescriptions: 3, fulfilled: 3, deadline: '20.11.2024' },
    { name: 'Внутренний аудит ПБ', date: '10.01.2026', status: 'in_progress' as const, prescriptions: 8, fulfilled: 5, deadline: '10.07.2026' },
    { name: 'Плановая проверка ГПН', date: '01.09.2026', status: 'planned' as const, prescriptions: 0, fulfilled: 0, deadline: '01.12.2026' },
  ];

  const auditsTotalPrescriptions = auditsData.reduce((s, a) => s + a.prescriptions, 0);
  const auditsTotalFulfilled = auditsData.reduce((s, a) => s + a.fulfilled, 0);
  const auditsCompletionPercent = auditsTotalPrescriptions > 0 ? Math.round((auditsTotalFulfilled / auditsTotalPrescriptions) * 100) : 0;

  const maintenanceSchedule = [
    { system: 'АПС', type: 'ТО (ежеквартальное)', lastDate: '10.01.2026', nextDate: '10.04.2026', status: 'on_time' as const, responsible: 'ООО "Пожтехника"' },
    { system: 'СОУЭ', type: 'ТО (ежеквартальное)', lastDate: '15.12.2025', nextDate: '15.03.2026', status: 'overdue' as const, responsible: 'ООО "Пожтехника"' },
    { system: 'АУПТ', type: 'Комплексные испытания', lastDate: '01.06.2025', nextDate: '01.06.2026', status: 'on_time' as const, responsible: 'ООО "Спецмонтаж"' },
    { system: 'ВПВ', type: 'Испытания на водоотдачу', lastDate: '20.09.2025', nextDate: '20.03.2026', status: 'overdue' as const, responsible: 'ООО "Водозащита"' },
    { system: 'НПВ', type: 'Перекатка рукавов', lastDate: '01.11.2025', nextDate: '01.05.2026', status: 'on_time' as const, responsible: 'ООО "Водозащита"' },
    { system: 'Огнетушители', type: 'Перезарядка', lastDate: '05.01.2026', nextDate: '05.01.2027', status: 'on_time' as const, responsible: 'ООО "Пожтехника"' },
    { system: 'АПС', type: 'Замена извещателей', lastDate: '—', nextDate: '01.01.2028', status: 'planned' as const, responsible: 'ООО "Пожтехника"' },
    { system: 'АУПТ', type: 'Капитальный ремонт', lastDate: '—', nextDate: '01.06.2027', status: 'planned' as const, responsible: 'ООО "Спецмонтаж"' },
    { system: 'ВПВ', type: 'Замена трубопроводов', lastDate: '—', nextDate: '01.01.2026', status: 'overdue' as const, responsible: 'ООО "Водозащита"' },
  ];

  const overallCompletion =
    (metrics.reduce((sum, m) => sum + m.value, 0) / metrics.reduce((sum, m) => sum + m.total, 0)) * 100;

  const criticalSections = metrics.filter(m => m.status === 'critical');
  const warningSections = metrics.filter(m => m.status === 'warning');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center animate-in zoom-in duration-500">
            <Icon name="BarChart3" className="text-white" size={24} />
          </div>
          <div>
            <CardTitle>Оценка пожарной безопасности и риски</CardTitle>
            <CardDescription>Интерактивный дашборд состояния ПБ в режиме реального времени</CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              Онлайн
            </Badge>
            <span className="text-xs text-muted-foreground">
              Обновлено: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Общая готовность объекта</span>
                <p className="text-xs text-muted-foreground mt-1">
                  По данным на {new Date().toLocaleDateString('ru-RU')} в {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <Icon name="Database" size={10} className="mr-1" />
                    {totalJournalEntries} записей в журнале
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Icon name="CheckCircle2" size={10} className="mr-1" />
                    {checklistCount}/19 чек-листов
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-2xl font-bold px-4 py-2 bg-background/50">
                  {Math.round(overallCompletion)}%
                </Badge>
                {criticalItems > 0 && (
                  <Badge className="mt-2 bg-red-500 hover:bg-red-600 flex items-center gap-1 justify-end">
                    <Icon name="AlertTriangle" size={12} />
                    {criticalItems} критичных
                  </Badge>
                )}
              </div>
            </div>
            <div className="w-full bg-background/50 rounded-full h-6 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r from-primary via-primary to-primary/80 relative ${isVisible ? '' : 'w-0'}`}
                style={{ width: isVisible ? `${overallCompletion}%` : '0%' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {(criticalSections.length > 0 || warningSections.length > 0) && (
          <Card className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="AlertTriangle" size={20} className="text-red-600" />
                Требуется внимание
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalSections.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-red-500 hover:bg-red-600">Критично</Badge>
                    <span className="text-muted-foreground">
                      {criticalSections.map(s => s.label).join(', ')} - требуется срочное обновление данных
                    </span>
                  </div>
                )}
                {warningSections.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">Внимание</Badge>
                    <span className="text-muted-foreground">
                      {warningSections.map(s => s.label).join(', ')} - рекомендуется заполнить
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const percentage = (metric.value / metric.total) * 100;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-l-4 animate-in fade-in slide-in-from-bottom-4"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  borderLeftColor: metric.color.replace('bg-', '')
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-10 h-10 rounded-lg ${metric.color} flex items-center justify-center shadow-md`}>
                      <Icon name={metric.icon} className="text-white" size={18} />
                    </div>
                    <div className="ml-auto text-right">
                      <Badge variant="outline" className="font-semibold">
                        {metric.value}/{metric.total}
                      </Badge>
                      {metric.trend !== '0' && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Icon name="TrendingUp" size={10} />
                          {metric.trend}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                    {metric.status === 'excellent' && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-xs">✓ Отлично</Badge>
                    )}
                    {metric.status === 'good' && (
                      <Badge variant="outline" className="text-xs border-green-500 text-green-700">Хорошо</Badge>
                    )}
                    {metric.status === 'warning' && (
                      <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">Внимание</Badge>
                    )}
                    {metric.status === 'critical' && (
                      <Badge className="bg-red-500 hover:bg-red-600 text-xs">! Критично</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-1000 ease-out rounded-full ${metric.color} relative`}
                      style={{ width: isVisible ? `${percentage}%` : '0%' }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {percentage === 100 ? 'Выполнено полностью' : `Выполнено ${Math.round(percentage)}%`}
                    </p>
                    <p className="text-xs font-medium">
                      {metric.value} из {metric.total}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Monitor" size={20} className="text-blue-600" />
                Мониторинг систем АРМ «Орион Про»
              </CardTitle>
              <Badge className="bg-blue-500">
                <Icon name="Activity" size={12} className="mr-1" />
                Активно
              </Badge>
            </div>
            <CardDescription>Статистика подключенного оборудования и систем</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {monitoringStats.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name={stat.icon} className={stat.color} size={20} />
                    <Badge variant="outline" className="text-xs">{stat.status}</Badge>
                  </div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {fireIncidents.length > 0 && (
          <Card className="border-t-4 border-t-red-500 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Flame" size={20} className="text-red-600" />
                Статистика пожарных инцидентов
              </CardTitle>
              <CardDescription>Данные по зарегистрированным пожарам за текущий период</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                  <p className="text-2xl font-bold text-red-600">{fireIncidents.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Всего инцидентов</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {fireIncidents.reduce((sum, inc) => sum + inc.area, 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Общая площадь (м²)</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {fireIncidents.filter((inc) => inc.casualties !== 'Нет' && inc.casualties !== '').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">С пострадавшими</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {fireIncidents.length > 0 ? (fireIncidents.reduce((sum, inc) => sum + inc.area, 0) / fireIncidents.length).toFixed(1) : '0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Средняя площадь (м²)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="ShieldCheck" size={20} className="text-purple-600" />
                  Состояние систем противопожарной защиты
                </CardTitle>
                <CardDescription>Реальные данные из раздела «Характеристика объекта»</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchRealSystems} className="gap-1.5">
                <Icon name="RefreshCw" size={14} />
                Обновить
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSystems ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                <Icon name="Loader2" size={20} className="animate-spin" />
                <span className="text-sm">Загрузка систем...</span>
              </div>
            ) : realSystems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Shield" size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Данные о системах не найдены</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {(() => {
                    const active = realSystems.filter(s => s.condition !== 'Не требуется');
                    const ok = active.filter(s => s.condition === 'Исправна').length;
                    const needRepair = active.filter(s => s.condition === 'Требует ремонта' || s.condition === 'Неисправна').length;
                    const withContract = active.filter(s => s.maintenance_contract).length;
                    const expiredContracts = active.filter(s => {
                      if (!s.contract_expiry) return false;
                      return new Date(s.contract_expiry) < new Date();
                    }).length;
                    return (
                      <>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 text-center">
                          <p className="text-3xl font-bold text-green-600">{ok}</p>
                          <p className="text-xs text-muted-foreground mt-1">Исправны</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-lg border border-red-200 text-center">
                          <p className="text-3xl font-bold text-red-600">{needRepair}</p>
                          <p className="text-xs text-muted-foreground mt-1">Требуют ремонта</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 text-center">
                          <p className="text-3xl font-bold text-blue-600">{withContract}</p>
                          <p className="text-xs text-muted-foreground mt-1">С договором ТО</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-lg border border-amber-200 text-center">
                          <p className="text-3xl font-bold text-amber-600">{expiredContracts}</p>
                          <p className="text-xs text-muted-foreground mt-1">Договор истёк</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  {realSystems.map((sys, index) => {
                    const isNA = sys.condition === 'Не требуется';
                    const conditionColor = sys.condition === 'Исправна' ? 'bg-green-500' :
                      sys.condition === 'Неисправна' ? 'bg-red-500' :
                      sys.condition === 'Требует ремонта' ? 'bg-yellow-500' :
                      sys.condition === 'На обслуживании' ? 'bg-blue-500' :
                      sys.condition === 'Не требуется' ? 'bg-slate-400' :
                      sys.condition === 'Не установлена' ? 'bg-gray-400' : 'bg-gray-300';

                    const hasContractExpiry = sys.contract_expiry && !isNA;
                    const contractExpired = hasContractExpiry && new Date(sys.contract_expiry) < new Date();
                    const contractSoon = hasContractExpiry && !contractExpired && (new Date(sys.contract_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30;

                    let lifeExpired = false;
                    let lifeText = '';
                    if (sys.commissioning_date && !isNA) {
                      const end = new Date(sys.commissioning_date);
                      end.setFullYear(end.getFullYear() + 10);
                      const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      if (daysLeft < 0) {
                        lifeExpired = true;
                        lifeText = 'Срок истёк';
                      } else if (daysLeft <= 365) {
                        lifeText = `${Math.floor(daysLeft / 30)} мес.`;
                      } else {
                        lifeText = `${Math.floor(daysLeft / 365)} г.`;
                      }
                    }

                    return (
                      <div
                        key={sys.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border hover:shadow-sm transition-all duration-300 animate-in slide-in-from-right ${isNA ? 'bg-muted/20 opacity-50' : 'bg-white dark:bg-slate-950'}`}
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        <div className={`w-10 h-10 rounded-lg ${conditionColor} flex items-center justify-center shadow-md flex-shrink-0`}>
                          <Icon name="Shield" className="text-white" size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h4 className="font-semibold text-sm">{sys.system_name}</h4>
                            <Badge variant="outline" className={`text-xs ${
                              sys.condition === 'Исправна' ? 'bg-green-50 text-green-700 border-green-200' :
                              sys.condition === 'Неисправна' ? 'bg-red-50 text-red-700 border-red-200' :
                              sys.condition === 'Требует ремонта' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              sys.condition === 'Не требуется' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${conditionColor} mr-1`}></div>
                              {sys.condition || 'Не указано'}
                            </Badge>
                          </div>
                          {!isNA && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              {sys.commissioning_date && (
                                <span className={`flex items-center gap-1 ${lifeExpired ? 'text-red-600 font-medium' : ''}`}>
                                  <Icon name="Calendar" size={12} />
                                  Ввод: {sys.commissioning_date}
                                  {lifeText && ` (${lifeText})`}
                                </span>
                              )}
                              {sys.maintenance_contract && (
                                <span className={`flex items-center gap-1 ${contractExpired ? 'text-red-600 font-medium' : contractSoon ? 'text-yellow-600 font-medium' : 'text-green-600'}`}>
                                  <Icon name="FileCheck" size={12} />
                                  {sys.maintenance_contract}
                                  {sys.contract_expiry && ` (до ${sys.contract_expiry})`}
                                  {contractExpired && ' — истёк!'}
                                  {contractSoon && ' — скоро!'}
                                </span>
                              )}
                              {!sys.maintenance_contract && (
                                <span className="flex items-center gap-1 text-orange-500">
                                  <Icon name="AlertCircle" size={12} />
                                  Нет договора ТО
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {(() => {
                  const active = realSystems.filter(s => s.condition !== 'Не требуется');
                  const issues: string[] = [];
                  active.forEach(s => {
                    if (s.condition === 'Неисправна') issues.push(`${s.system_name} — неисправна`);
                    if (s.condition === 'Требует ремонта') issues.push(`${s.system_name} — требует ремонта`);
                    if (!s.maintenance_contract) issues.push(`${s.system_name} — нет договора на обслуживание`);
                    if (s.contract_expiry && new Date(s.contract_expiry) < new Date()) issues.push(`${s.system_name} — договор ТО истёк`);
                    if (s.commissioning_date) {
                      const end = new Date(s.commissioning_date);
                      end.setFullYear(end.getFullYear() + 10);
                      if (end < new Date()) issues.push(`${s.system_name} — срок эксплуатации истёк`);
                    }
                  });
                  if (issues.length === 0) return null;
                  return (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="AlertTriangle" size={16} className="text-red-600" />
                        <span className="text-sm font-semibold text-red-700 dark:text-red-400">Выявленные проблемы ({issues.length})</span>
                      </div>
                      <ul className="space-y-1">
                        {issues.map((issue, i) => (
                          <li key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="CalendarClock" size={20} className="text-orange-500" />
              Предстоящие задачи и сроки
            </CardTitle>
            <CardDescription>Контроль выполнения плановых мероприятий</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div
                key={index}
                className="group flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-primary hover:shadow-md transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-1 h-12 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={
                          task.priority === 'high'
                            ? 'bg-red-500 hover:bg-red-600'
                            : task.priority === 'medium'
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }
                      >
                        {task.priority === 'high' ? 'Высокий приоритет' : task.priority === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold group-hover:text-primary transition-colors">{task.task}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <Icon name="Calendar" size={16} className="text-muted-foreground" />
                    {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Осталось {task.daysLeft} дней
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950 animate-in fade-in zoom-in" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Соблюдается</CardTitle>
                <Icon name="CheckCircle2" className="text-green-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-green-600 mb-1">85%</p>
                  <p className="text-xs text-muted-foreground">требований ПБ</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Icon name="TrendingUp" size={12} className="mr-1" />
                  +3%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-yellow-50 to-transparent dark:from-yellow-950 animate-in fade-in zoom-in" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Требует внимания</CardTitle>
                <Icon name="AlertTriangle" className="text-yellow-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-yellow-600 mb-1">12%</p>
                  <p className="text-xs text-muted-foreground">замечаний</p>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Icon name="TrendingDown" size={12} className="mr-1" />
                  -2%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950 animate-in fade-in zoom-in" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Критичные</CardTitle>
                <Icon name="XCircle" className="text-red-500" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-red-600 mb-1">3%</p>
                  <p className="text-xs text-muted-foreground">нарушений</p>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <Icon name="TrendingDown" size={12} className="mr-1" />
                  -1%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-blue-500" />
              Динамика показателей за последний месяц
            </CardTitle>
            <CardDescription>Сравнение с предыдущим периодом</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Завершено задач</span>
                  <Badge className="bg-green-500">+15%</Badge>
                </div>
                <p className="text-2xl font-bold">47 из 52</p>
                <p className="text-xs text-muted-foreground mt-1">В прошлом месяце: 41 из 48</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Среднее время реакции</span>
                  <Badge className="bg-green-500">-20%</Badge>
                </div>
                <p className="text-2xl font-bold">4.2 мин</p>
                <p className="text-xs text-muted-foreground mt-1">В прошлом месяце: 5.3 мин</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Download" size={20} className="text-blue-600" />
              Экспорт графиков
            </CardTitle>
            <CardDescription>Скачайте графики по отдельности или полный отчёт</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportChartAsImage(chart1Ref, 'sostoyanie-sistem-ppz')}
                className="flex items-center gap-2"
              >
                <Icon name="Download" size={16} />
                Системы ППЗ
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportChartAsImage(chart2Ref, 'sootvetstvie-trebovaniyam')}
                className="flex items-center gap-2"
              >
                <Icon name="Download" size={16} />
                Соответствие
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportChartAsImage(chart3Ref, 'aktivnost-polzovatelya')}
                className="flex items-center gap-2"
              >
                <Icon name="Download" size={16} />
                Активность
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportChartAsImage(chart4Ref, 'pozhary-10-let')}
                className="flex items-center gap-2"
              >
                <Icon name="Download" size={16} />
                Пожары
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={exportAllChartsToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Icon name="FileDown" size={16} />
                {isExporting ? 'Экспорт...' : 'PDF отчёт'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-left" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="ShieldCheck" size={20} className="text-blue-600" />
              Состояние систем противопожарной защиты — план на 10 лет
            </CardTitle>
            <CardDescription>Остаточный ресурс оборудования (%) и планы замены/ремонта по данным характеристики объекта</CardDescription>
          </CardHeader>
          <CardContent ref={chart1Ref}>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={systemLifecycleData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis className="text-xs" domain={[0, 100]} label={{ value: '%', position: 'insideLeft', style: { fontSize: '12px' } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = { aps: 'АПС', soue: 'СОУЭ', aupt: 'АУПТ', vpv: 'ВПВ', npv: 'НПВ' };
                    return [`${value}%`, labels[name] || name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} formatter={(v: string) => {
                  const labels: Record<string, string> = { aps: 'АПС', soue: 'СОУЭ', aupt: 'АУПТ', vpv: 'ВПВ', npv: 'НПВ' };
                  return labels[v] || v;
                }} />
                <Bar dataKey="aps" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="soue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aupt" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vpv" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="npv" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Icon name="CalendarClock" size={16} className="text-muted-foreground" />
                Планируемые мероприятия
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {systemEventsTimeline.map((evt, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded border ${
                    evt.type === 'replacement' ? 'bg-red-50 border-red-200 dark:bg-red-950/30' :
                    evt.type === 'repair' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30' :
                    'bg-blue-50 border-blue-200 dark:bg-blue-950/30'
                  }`}>
                    <Badge variant="outline" className="flex-shrink-0">{evt.year}</Badge>
                    <Icon name={evt.type === 'replacement' ? 'RefreshCw' : evt.type === 'repair' ? 'Wrench' : 'Settings'} size={14} className={
                      evt.type === 'replacement' ? 'text-red-500' : evt.type === 'repair' ? 'text-amber-500' : 'text-blue-500'
                    } />
                    <span><strong>{evt.system}</strong> — {evt.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          <Card className="animate-in fade-in slide-in-from-right" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="PieChart" size={20} className="text-green-500" />
                Распределение соответствия требованиям
              </CardTitle>
              <CardDescription>Текущее состояние объекта по категориям</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center" ref={chart2Ref}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-in fade-in slide-in-from-left" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="UserCheck" size={20} className="text-purple-600" />
              Активность пользователя и заполнение документов
            </CardTitle>
            <CardDescription>Процесс заполнения, объём работы и соблюдение сроков</CardDescription>
          </CardHeader>
          <CardContent ref={chart3Ref}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-lg border text-center">
                <p className="text-2xl font-bold text-purple-600">{userActivityData.reduce((s, d) => s + d.filled, 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Заполнено записей</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950 rounded-lg border text-center">
                <p className="text-2xl font-bold text-blue-600">{userActivityData.reduce((s, d) => s + d.total, 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Всего требуется</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border text-center">
                <p className="text-2xl font-bold text-green-600">{userActivityData.filter(d => d.onTime).length}/{userActivityData.length}</p>
                <p className="text-xs text-muted-foreground mt-1">В срок</p>
              </div>
            </div>
            <div className="space-y-3">
              {userActivityData.map((item, i) => {
                const pct = item.total > 0 ? Math.round((item.filled / item.total) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.category}</span>
                        {item.onTime ? (
                          <Badge className="bg-green-100 text-green-700 text-[10px]">В срок</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 text-[10px]">Отставание</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.filled}/{item.total} · срок: {item.deadline}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${item.onTime ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-right" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Flame" size={20} className="text-red-600" />
              Пожары на объекте за 10 лет
            </CardTitle>
            <CardDescription>Материальный ущерб, пострадавшие, остановка производства, штрафы</CardDescription>
          </CardHeader>
          <CardContent ref={chart4Ref}>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 text-center">
                <p className="text-lg font-bold text-red-600">{fireHistoryTotals.fires}</p>
                <p className="text-[10px] text-muted-foreground">Пожаров</p>
              </div>
              <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 text-center">
                <p className="text-lg font-bold text-orange-600">{fireHistoryTotals.damage.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Ущерб (тыс. р.)</p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 text-center">
                <p className="text-lg font-bold text-purple-600">{fireHistoryTotals.injured}</p>
                <p className="text-[10px] text-muted-foreground">Пострадавших</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-950/30 rounded-lg border text-center">
                <p className="text-lg font-bold text-slate-700">{fireHistoryTotals.killed}</p>
                <p className="text-[10px] text-muted-foreground">Погибших</p>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 text-center">
                <p className="text-lg font-bold text-amber-600">{fireHistoryTotals.downtime}</p>
                <p className="text-[10px] text-muted-foreground">Простой (дн.)</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 text-center">
                <p className="text-lg font-bold text-blue-600">{fireHistoryTotals.fines.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Штрафы (тыс. р.)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fireHistoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = { fires: 'Пожаров', damage: 'Ущерб (тыс.р.)', injured: 'Пострадавших', fines: 'Штрафы (тыс.р.)' };
                    return [value, labels[name] || name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(v: string) => {
                  const labels: Record<string, string> = { fires: 'Пожары', damage: 'Ущерб', injured: 'Пострадавшие', fines: 'Штрафы' };
                  return labels[v] || v;
                }} />
                <Bar dataKey="fires" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="damage" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="injured" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fines" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-bottom border-t-4 border-t-indigo-500" style={{ animationDelay: '350ms' }}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="ClipboardCheck" size={20} className="text-indigo-600" />
              Проверки и аудиты
            </CardTitle>
            <CardDescription>Процент выполнения предписаний, планирование и результаты</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 text-center">
                <p className="text-2xl font-bold text-indigo-600">{auditsData.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Всего проверок</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 text-center">
                <p className="text-2xl font-bold text-green-600">{auditsData.filter(a => a.status === 'completed').length}</p>
                <p className="text-xs text-muted-foreground mt-1">Завершены</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 text-center">
                <p className="text-2xl font-bold text-amber-600">{auditsTotalPrescriptions}</p>
                <p className="text-xs text-muted-foreground mt-1">Предписаний</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 text-center">
                <p className="text-2xl font-bold text-blue-600">{auditsCompletionPercent}%</p>
                <p className="text-xs text-muted-foreground mt-1">Выполнено</p>
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-3 overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-700" style={{ width: `${auditsCompletionPercent}%` }} />
            </div>

            <div className="space-y-3">
              {auditsData.map((audit, i) => {
                const pct = audit.prescriptions > 0 ? Math.round((audit.fulfilled / audit.prescriptions) * 100) : 0;
                return (
                  <div key={i} className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon name={audit.status === 'completed' ? 'CheckCircle2' : audit.status === 'in_progress' ? 'Clock' : 'CalendarDays'} size={16} className={
                          audit.status === 'completed' ? 'text-green-500' : audit.status === 'in_progress' ? 'text-amber-500' : 'text-blue-500'
                        } />
                        <span className="text-sm font-medium">{audit.name}</span>
                      </div>
                      <Badge className={
                        audit.status === 'completed' ? 'bg-green-100 text-green-700' :
                        audit.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }>
                        {audit.status === 'completed' ? 'Завершена' : audit.status === 'in_progress' ? 'В процессе' : 'Запланирована'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Дата: {audit.date}</span>
                      {audit.prescriptions > 0 && (
                        <>
                          <span>Предписаний: {audit.fulfilled}/{audit.prescriptions}</span>
                          <span>Срок: {audit.deadline}</span>
                        </>
                      )}
                    </div>
                    {audit.prescriptions > 0 && (
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-bottom border-t-4 border-t-teal-500" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Wrench" size={20} className="text-teal-600" />
              Своевременность ТО, замена оборудования и испытания
            </CardTitle>
            <CardDescription>Комплексные испытания, плановые ТО, ремонт и замена по системам ППЗ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 text-center">
                <p className="text-2xl font-bold text-green-600">{maintenanceSchedule.filter(m => m.status === 'on_time').length}</p>
                <p className="text-xs text-muted-foreground mt-1">В срок</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 text-center">
                <p className="text-2xl font-bold text-red-600">{maintenanceSchedule.filter(m => m.status === 'overdue').length}</p>
                <p className="text-xs text-muted-foreground mt-1">Просрочено</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 text-center">
                <p className="text-2xl font-bold text-blue-600">{maintenanceSchedule.filter(m => m.status === 'planned').length}</p>
                <p className="text-xs text-muted-foreground mt-1">Запланировано</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border text-center">
                <p className="text-2xl font-bold text-slate-700">{maintenanceSchedule.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Всего мероприятий</p>
              </div>
            </div>

            <div className="space-y-2">
              {maintenanceSchedule.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-shadow hover:shadow-sm ${
                  item.status === 'overdue' ? 'bg-red-50/50 border-red-200 dark:bg-red-950/20' :
                  item.status === 'planned' ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20' :
                  'bg-card'
                }`}>
                  <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                    item.status === 'on_time' ? 'bg-green-500' : item.status === 'overdue' ? 'bg-red-500' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{item.system}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Посл.: {item.lastDate}</span>
                      <span>След.: {item.nextDate}</span>
                      <span className="text-[10px]">{item.responsible}</span>
                    </div>
                  </div>
                  <Badge className={
                    item.status === 'on_time' ? 'bg-green-100 text-green-700' :
                    item.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }>
                    {item.status === 'on_time' ? 'В срок' : item.status === 'overdue' ? 'Просрочено' : 'План'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {fireIncidents.length > 0 && (
          <Card className="animate-in fade-in slide-in-from-bottom bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-200 dark:border-red-800" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Flame" size={20} className="text-red-600" />
                Информация о пожарах на объекте
              </CardTitle>
              <CardDescription>Зарегистрированные инциденты и их влияние на оценку безопасности</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                    <p className="text-2xl font-bold text-red-600">{fireIncidents.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Инцидентов</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {fireIncidents.reduce((sum, inc) => sum + inc.area, 0).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Площадь (м²)</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {fireIncidents.filter((inc) => inc.casualties !== 'Нет' && inc.casualties !== '').length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">С пострадавшими</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {fireIncidents.filter((inc) => parseFloat(inc.damage.replace(/\D/g, '')) > 0).length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">С ущербом</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Последние инциденты:</p>
                  {fireIncidents.slice(0, 3).map((incident) => (
                    <div key={incident.id} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-950 rounded-lg border border-red-200 dark:border-red-800">
                      <Icon name="AlertTriangle" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-red-600 text-xs">{incident.date}</Badge>
                          <span className="text-sm font-medium truncate">{incident.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>Площадь: {incident.area} м²</span>
                          {incident.casualties !== 'Нет' && incident.casualties !== '' && (
                            <span className="text-red-600 font-medium">Пострадавшие: {incident.casualties}</span>
                          )}
                          {incident.damage && <span>Ущерб: {incident.damage}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {fireIncidents.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      И ещё {fireIncidents.length - 3} инцидент(ов). Полная информация в разделе "Пожары".
                    </p>
                  )}
                </div>

                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                        Влияние на оценку безопасности
                      </p>
                      <p className="text-red-700 dark:text-red-300">
                        Наличие {fireIncidents.length} пожарных инцидентов негативно влияет на общую оценку пожарной безопасности объекта. 
                        Рекомендуется провести дополнительный анализ причин и усилить превентивные меры.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}