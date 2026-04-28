import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const AUTH_URL = 'https://functions.poehali.dev/a44dbf08-b20a-4c77-a799-0874d91052ae';

interface ObjectCard {
  id: number;
  name: string;
  address?: string;
  journal_entries: number;
  audits_total: number;
  violations: number;
  open_violations: number;
  checklist_total: number;
  checklist_done: number;
  checklist_failed: number;
  checklist_pct: number;
  drills_count: number;
  last_drill: string | null;
  has_declaration: boolean;
  rooms_count: number;
  score: number;
  status: 'good' | 'warning' | 'critical';
}

interface LegalEntity {
  inn: string;
  ogrn: string;
  legal_name: string;
  objects: ObjectCard[];
  objects_count: number;
  avg_score: number;
  total_violations: number;
  total_open_violations: number;
  critical_count: number;
  warning_count: number;
  good_count: number;
}

interface DashboardData {
  legal_entities: LegalEntity[];
  totals: {
    legal_entities_count: number;
    objects_count: number;
    critical_count: number;
    warning_count: number;
    good_count: number;
    total_violations: number;
    total_open_violations: number;
    avg_score: number;
  };
}

const STATUS_LABELS = {
  good: { label: 'Хорошо', color: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50', border: 'border-emerald-300' },
  warning: { label: 'Внимание', color: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-300' },
  critical: { label: 'Критично', color: 'bg-red-500', text: 'text-red-700', bgLight: 'bg-red-50', border: 'border-red-300' },
};

export default function PBOverviewSection() {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);

  const isAllowed = hasRole('admin') || hasRole('manager');

  useEffect(() => {
    if (!isAllowed || !user) return;
    setLoading(true);
    setError(null);
    fetch(`${AUTH_URL}?action=pb_dashboard`, { headers: { 'X-Auth-Token': user.token } })
      .then(async (r) => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({}));
          throw new Error(e.error || `Ошибка ${r.status}`);
        }
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message || 'Сбой загрузки'))
      .finally(() => setLoading(false));
  }, [user, isAllowed]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase().trim();
    if (!q) return data.legal_entities;
    return data.legal_entities.filter((e) =>
      e.legal_name.toLowerCase().includes(q) ||
      (e.inn || '').includes(q) ||
      (e.ogrn || '').includes(q) ||
      e.objects.some((o) => o.name.toLowerCase().includes(q)),
    );
  }, [data, search]);

  if (!isAllowed) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Icon name="Lock" size={48} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-base font-semibold">Раздел недоступен</p>
          <p className="text-sm text-muted-foreground mt-1">
            Анализ ПБ по юр. лицам доступен только администратору и руководителю.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center gap-3 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span>Загрузка данных по объектам...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Icon name="AlertCircle" size={16} />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.legal_entities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Icon name="Building" size={48} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-base font-semibold">Объекты не найдены</p>
          <p className="text-sm text-muted-foreground mt-1">
            Создайте хотя бы один объект защиты с заполненным юр. лицом.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totals = data.totals;

  return (
    <div className="space-y-5">
      {/* Заголовок */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center">
                <Icon name="PieChart" className="text-white" size={24} />
              </div>
              <div>
                <CardTitle>Анализ пожарной безопасности по юридическим лицам</CardTitle>
                <CardDescription>
                  Сводка по объектам защиты с группировкой по ИНН/ОГРН. Доступно только руководителю и администратору.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Сводные метрики */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard
          icon="Building"
          label="Юр. лиц"
          value={totals.legal_entities_count}
          color="text-blue-600"
        />
        <MetricCard
          icon="Layers"
          label="Объектов"
          value={totals.objects_count}
          color="text-indigo-600"
        />
        <MetricCard
          icon="CheckCircle2"
          label="В норме"
          value={totals.good_count}
          color="text-emerald-600"
        />
        <MetricCard
          icon="AlertTriangle"
          label="Внимание"
          value={totals.warning_count}
          color="text-amber-600"
        />
        <MetricCard
          icon="AlertOctagon"
          label="Критично"
          value={totals.critical_count}
          color="text-red-600"
        />
        <MetricCard
          icon="Search"
          label="Откр. наруш."
          value={totals.total_open_violations}
          color="text-orange-600"
        />
        <MetricCard
          icon="Activity"
          label="Средн. оценка"
          value={`${totals.avg_score}/100`}
          color={totals.avg_score >= 80 ? 'text-emerald-600' : totals.avg_score >= 50 ? 'text-amber-600' : 'text-red-600'}
        />
      </div>

      {/* Графики */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList>
          <TabsTrigger value="charts" className="gap-1.5"><Icon name="BarChart3" size={14} />Графики</TabsTrigger>
          <TabsTrigger value="entities" className="gap-1.5"><Icon name="List" size={14} />Юр. лица</TabsTrigger>
          <TabsTrigger value="objects" className="gap-1.5"><Icon name="Grid2X2" size={14} />Все объекты</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Оценка ПБ по юр. лицам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.legal_entities.map((e) => ({
                    name: e.legal_name.length > 20 ? e.legal_name.substring(0, 20) + '…' : e.legal_name,
                    score: e.avg_score,
                    fill: e.avg_score >= 80 ? '#10b981' : e.avg_score >= 50 ? '#f59e0b' : '#ef4444',
                  }))}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score">
                      {data.legal_entities.map((e, i) => (
                        <Cell key={i} fill={e.avg_score >= 80 ? '#10b981' : e.avg_score >= 50 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Распределение объектов по статусу</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'В норме', value: totals.good_count, fill: '#10b981' },
                        { name: 'Внимание', value: totals.warning_count, fill: '#f59e0b' },
                        { name: 'Критично', value: totals.critical_count, fill: '#ef4444' },
                      ].filter((d) => d.value > 0)}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Открытые нарушения по юр. лицам</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.legal_entities.map((e) => ({
                  name: e.legal_name.length > 25 ? e.legal_name.substring(0, 25) + '…' : e.legal_name,
                  open: e.total_open_violations,
                  total: e.total_violations,
                }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#94a3b8" name="Всего нарушений" />
                  <Bar dataKey="open" fill="#ef4444" name="Открытые" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entities" className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Поиск по ИНН, ОГРН, наименованию или объекту..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <Badge variant="secondary">{filtered.length} из {data.legal_entities.length}</Badge>
          </div>

          {filtered.map((e) => {
            const key = e.inn || e.legal_name;
            const isExpanded = expandedEntity === key;
            return (
              <Card key={key} className="overflow-hidden">
                <button
                  onClick={() => setExpandedEntity(isExpanded ? null : key)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-white flex-shrink-0
                    ${e.avg_score >= 80 ? 'bg-emerald-500' : e.avg_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}>
                    <span className="text-xl leading-none">{e.avg_score}</span>
                    <span className="text-[9px] opacity-80 mt-0.5">из 100</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">{e.legal_name}</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                      {e.inn && <span>ИНН: <b className="text-foreground">{e.inn}</b></span>}
                      {e.ogrn && <span>ОГРН: <b className="text-foreground">{e.ogrn}</b></span>}
                      <span>Объектов: <b className="text-foreground">{e.objects_count}</b></span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    {e.good_count > 0 && <Badge className="bg-emerald-500">{e.good_count} ✓</Badge>}
                    {e.warning_count > 0 && <Badge className="bg-amber-500">{e.warning_count} !</Badge>}
                    {e.critical_count > 0 && <Badge className="bg-red-500">{e.critical_count} ⚠</Badge>}
                    {e.total_open_violations > 0 && (
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        {e.total_open_violations} откр. нарушений
                      </Badge>
                    )}
                  </div>
                  <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground flex-shrink-0" />
                </button>

                {isExpanded && (
                  <div className="border-t bg-muted/10 p-4 space-y-2">
                    {e.objects.map((o) => <ObjectRow key={o.id} obj={o} />)}
                  </div>
                )}
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Ничего не найдено
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="objects" className="space-y-2">
          {data.legal_entities.flatMap((e) => e.objects.map((o) => ({ ...o, legal_name: e.legal_name })))
            .sort((a, b) => a.score - b.score)
            .map((o) => <ObjectRow key={o.id} obj={o} legalName={o.legal_name} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon name={icon} size={14} className={color} />
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
        </div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function ObjectRow({ obj, legalName }: { obj: ObjectCard; legalName?: string }) {
  const status = STATUS_LABELS[obj.status];
  return (
    <div className={`p-3 rounded-lg border ${status.border} ${status.bgLight}`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-lg ${status.color} text-white flex flex-col items-center justify-center font-bold flex-shrink-0`}>
          <span className="text-sm leading-none">{obj.score}</span>
          <span className="text-[8px] opacity-80 mt-0.5">из 100</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{obj.name}</div>
          {legalName && <div className="text-[11px] text-muted-foreground truncate">{legalName}</div>}
          {obj.address && <div className="text-[11px] text-muted-foreground truncate">{obj.address}</div>}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[11px]">
            <div>
              <div className="text-muted-foreground">Журнал</div>
              <div className="font-semibold">{obj.journal_entries} записей</div>
            </div>
            <div>
              <div className="text-muted-foreground">Аудиты</div>
              <div className="font-semibold">
                {obj.audits_total} ({obj.open_violations > 0 && (
                  <span className="text-red-600">{obj.open_violations} откр.</span>
                )}
                {obj.open_violations === 0 && <span className="text-emerald-600">✓</span>})
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Чек-лист</div>
              <div className="flex items-center gap-1.5">
                <Progress value={obj.checklist_pct} className="h-1.5 flex-1" />
                <span className="font-semibold">{obj.checklist_pct}%</span>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Тренировки</div>
              <div className="font-semibold">{obj.drills_count} {obj.drills_count === 0 && '⚠'}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <Badge className={`${status.color} text-white text-[10px] h-5`}>{status.label}</Badge>
            {obj.has_declaration ? (
              <Badge variant="outline" className="text-[10px] h-5 text-emerald-700 border-emerald-300">Декларация ✓</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] h-5 text-amber-700 border-amber-300">Нет декларации</Badge>
            )}
            {obj.last_drill && (
              <Badge variant="outline" className="text-[10px] h-5">
                Посл. тренир.: {new Date(obj.last_drill).toLocaleDateString('ru-RU')}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
