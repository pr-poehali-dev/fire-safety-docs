import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';
const HIDDEN_SYSTEM_KEYS = ['fire_water'];

const JOURNAL_SECTIONS = [
  'section_aups', 'section_soue', 'section_smoke_ventilation', 'section_aupt',
  'section_fire_extinguishers', 'section_fire_blankets', 'section_fire_protection',
  'section_fire_dampers', 'section_indoor_hydrants',
];

const JOURNAL_LABELS: Record<string, string> = {
  section_aups: 'АУПС',
  section_soue: 'СОУЭ',
  section_smoke_ventilation: 'Противодымная вентиляция',
  section_aupt: 'АУПТ',
  section_fire_extinguishers: 'Огнетушители',
  section_fire_blankets: 'Покрывала',
  section_fire_protection: 'Огнезащита',
  section_fire_dampers: 'Огнезадерживающие',
  section_indoor_hydrants: 'Гидранты и краны',
};

interface SystemData {
  condition: string;
  system_key: string;
  system_name: string;
  maintenance_contract: string;
  contract_expiry: string;
}

interface ObjectSummaryCardsProps {
  objectId?: number;
}

export default function ObjectSummaryCards({ objectId }: ObjectSummaryCardsProps) {
  const [journalCounts, setJournalCounts] = useState<Record<string, number>>({});
  const [systems, setSystems] = useState<SystemData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const objFilter = objectId ? `&object_id=${objectId}` : '';
      const requests = JOURNAL_SECTIONS.map(async (table) => {
        try {
          const res = await fetch(`${API_URL}?table=${table}${objFilter}`);
          if (!res.ok) return { table, count: 0 };
          const data = await res.json();
          return { table, count: Array.isArray(data) ? data.length : 0 };
        } catch {
          return { table, count: 0 };
        }
      });

      const sysRes = await fetch(`${API_URL}?table=protection_systems${objFilter}`);
      const sysData = sysRes.ok ? await sysRes.json() : [];

      const results = await Promise.all(requests);
      const counts: Record<string, number> = {};
      results.forEach(r => { counts[r.table] = r.count; });
      setJournalCounts(counts);

      const unique = new Map<string, SystemData>();
      (sysData as SystemData[])
        .filter((s: SystemData) => !HIDDEN_SYSTEM_KEYS.includes(s.system_key))
        .forEach((s: SystemData) => {
          if (!unique.has(s.system_key) || (s.condition && !unique.get(s.system_key)!.condition)) {
            unique.set(s.system_key, s);
          }
        });
      setSystems(Array.from(unique.values()));
    } catch (e) {
      console.error('Error fetching summary data:', e);
    } finally {
      setLoading(false);
    }
  }, [objectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalSections = JOURNAL_SECTIONS.length;
  const filledSections = Object.values(journalCounts).filter(c => c > 0).length;
  const journalCompletion = totalSections > 0 ? Math.round((filledSections / totalSections) * 100) : 0;
  const totalEntries = Object.values(journalCounts).reduce((s, c) => s + c, 0);

  const activeSystems = systems.filter(s => s.condition !== 'Не требуется');
  const okSystems = activeSystems.filter(s => s.condition === 'Исправна').length;
  const needRepair = activeSystems.filter(s => s.condition === 'Требует ремонта' || s.condition === 'Неисправна').length;
  const withContract = activeSystems.filter(s => s.maintenance_contract).length;
  const expiredContracts = activeSystems.filter(s => {
    if (!s.contract_expiry) return false;
    return new Date(s.contract_expiry) < new Date();
  }).length;

  const risks: { level: 'high' | 'medium' | 'low'; title: string }[] = [];
  activeSystems.forEach(s => {
    if (s.condition === 'Неисправна') risks.push({ level: 'high', title: `${s.system_name} — неисправна` });
    if (s.condition === 'Требует ремонта') risks.push({ level: 'medium', title: `${s.system_name} — требует ремонта` });
    if (!s.maintenance_contract) risks.push({ level: 'medium', title: `${s.system_name} — нет договора ТО` });
    if (s.contract_expiry && new Date(s.contract_expiry) < new Date()) {
      risks.push({ level: 'high', title: `${s.system_name} — договор ТО истёк` });
    }
  });
  if (journalCompletion < 50) risks.push({ level: 'high', title: 'Журнал эксплуатации заполнен менее чем на 50%' });
  else if (journalCompletion < 80) risks.push({ level: 'medium', title: 'Журнал эксплуатации заполнен не полностью' });

  if (risks.length === 0) {
    risks.push({ level: 'low', title: 'Критичных рисков не выявлено' });
  }

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

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800">
        <CardContent className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span className="text-sm">Загрузка сводки...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="BookOpen" size={20} className="text-orange-600" />
              Состояние заполнения журнала
            </CardTitle>
            <CardDescription>Заполнено {filledSections} из {totalSections} разделов ({totalEntries} записей)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex-1">
                <p className="text-4xl font-bold mb-2">{journalCompletion}%</p>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-700" style={{ width: `${journalCompletion}%` }} />
                </div>
              </div>
              <div className="text-center">
                <Icon name={journalCompletion >= 80 ? 'CheckCircle2' : journalCompletion >= 50 ? 'AlertCircle' : 'XCircle'} size={48} className={journalCompletion >= 80 ? 'text-green-500' : journalCompletion >= 50 ? 'text-yellow-500' : 'text-red-500'} />
                <p className="text-xs mt-1 text-muted-foreground">{journalCompletion >= 80 ? 'Хорошо' : journalCompletion >= 50 ? 'Внимание' : 'Критично'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {JOURNAL_SECTIONS.map(sec => (
                <div key={sec} className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 ${journalCounts[sec] > 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${journalCounts[sec] > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
                  {JOURNAL_LABELS[sec]} ({journalCounts[sec] || 0})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-cyan-200 dark:border-cyan-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-cyan-600" />
              Основные показатели оценки ПБ
            </CardTitle>
            <CardDescription>На основании реальных данных объекта</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Систем исправно</p>
                <p className="text-lg font-bold text-green-600">{okSystems} из {activeSystems.length}</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Требуют ремонта</p>
                <p className="text-lg font-bold text-red-600">{needRepair}</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Договоров ТО</p>
                <p className="text-lg font-bold text-blue-600">{withContract} из {activeSystems.length}</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Истёкших договоров</p>
                <p className="text-lg font-bold text-amber-600">{expiredContracts}</p>
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
          <CardDescription>Автоматически выявленные на основании данных</CardDescription>
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
    </>
  );
}
