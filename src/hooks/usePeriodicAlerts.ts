import { useEffect, useState, useCallback } from 'react';
import { authedFetch, DB_API } from '@/lib/api';
import { buildAlert, PeriodicAlert, SECTION_PERIODICITY } from '@/lib/periodicity';

const SECTION_TABLE_MAP: Record<string, { table: string; dateField: string; nameField: string }> = {
  aups: { table: 'section_aups', dateField: 'work_date', nameField: 'building_name' },
  soue: { table: 'section_soue', dateField: 'work_date', nameField: 'building_name' },
  smoke_ventilation: { table: 'section_smoke_ventilation', dateField: 'work_date', nameField: 'system_type' },
  aupt: { table: 'section_aupt', dateField: 'work_date', nameField: 'building_name' },
  fire_extinguishers: { table: 'section_fire_extinguishers', dateField: 'maintenance_date', nameField: 'assigned_number' },
  fire_blankets: { table: 'section_fire_blankets', dateField: 'inspection_date', nameField: 'location_info' },
  fire_protection: { table: 'section_fire_protection', dateField: 'inspection_date', nameField: 'structure_info' },
  indoor_hydrants: { table: 'section_indoor_hydrants', dateField: 'inspection_date', nameField: 'location' },
  hose_rolling: { table: 'section_hose_rolling', dateField: 'inspection_date', nameField: 'location' },
};

interface AlertsState {
  alerts: PeriodicAlert[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

interface JournalRow {
  id: number | string;
  entry_data?: Record<string, string>;
  [k: string]: unknown;
}

export function usePeriodicAlerts(objectId?: number): AlertsState {
  const [alerts, setAlerts] = useState<PeriodicAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!objectId) {
      setAlerts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const collected: PeriodicAlert[] = [];

      // Журналы (АУПС, СОУЭ, ...) хранятся в journal_entries с разными section_id
      const journalRes = await authedFetch(`${DB_API}?table=journal_entries&object_id=${objectId}`);
      if (journalRes.ok) {
        const rows: JournalRow[] = await journalRes.json();
        const lastBySection: Record<string, { id: number | string; date: string; name: string }> = {};

        rows.forEach((row) => {
          const sectionId = (row as { section_id?: string }).section_id;
          if (!sectionId || !SECTION_PERIODICITY[sectionId]) return;
          const data = typeof row.entry_data === 'string' ? JSON.parse(row.entry_data) : (row.entry_data || {});
          const map = SECTION_TABLE_MAP[sectionId];
          const dateField = map?.dateField || 'work_date';
          const nameField = map?.nameField || 'building_name';
          const dateVal = data[dateField] as string | undefined;
          if (!dateVal) return;
          const existing = lastBySection[sectionId];
          if (!existing || new Date(dateVal) > new Date(existing.date)) {
            lastBySection[sectionId] = {
              id: row.id,
              date: dateVal,
              name: (data[nameField] as string) || sectionId.toUpperCase(),
            };
          }
        });

        Object.entries(lastBySection).forEach(([sectionId, info]) => {
          const a = buildAlert(sectionId, info.id, info.name, info.date);
          if (a) collected.push(a);
        });
      }

      // Отдельные таблицы для проверок (огнетушители, покрывала, гидранты, перекатка)
      const standaloneSections = ['fire_extinguishers', 'fire_blankets', 'fire_protection', 'indoor_hydrants', 'hose_rolling'];
      for (const sectionId of standaloneSections) {
        const map = SECTION_TABLE_MAP[sectionId];
        if (!map) continue;
        try {
          const res = await authedFetch(`${DB_API}?table=${map.table}&object_id=${objectId}`);
          if (!res.ok) continue;
          const items: Record<string, unknown>[] = await res.json();
          items.forEach((item) => {
            const dateVal = item[map.dateField] as string | undefined;
            if (!dateVal) return;
            const itemName = (item[map.nameField] as string) || `#${item.id}`;
            const a = buildAlert(sectionId, item.id as number, itemName, dateVal);
            if (a) collected.push(a);
          });
        } catch {
          /* skip */
        }
      }

      // Тренировки (drills) — должны быть 2 раза в год
      try {
        const drillsRes = await authedFetch(`${DB_API}?table=drills&object_id=${objectId}`);
        if (drillsRes.ok) {
          const drills: Record<string, unknown>[] = await drillsRes.json();
          // Берём самую свежую тренировку
          const lastDrill = drills
            .map((d) => ({ ...d, drill_date: d.drill_date as string }))
            .filter((d) => d.drill_date)
            .sort((a, b) => new Date(b.drill_date).getTime() - new Date(a.drill_date).getTime())[0];
          if (lastDrill) {
            const a = buildAlert('hose_rolling', lastDrill.id as number, 'Учебная тренировка по эвакуации', lastDrill.drill_date);
            if (a) {
              a.sectionLabel = 'Тренировки';
              collected.push(a);
            }
          } else {
            // Тренировок нет вообще — критично
            collected.push({
              id: 'drills-none',
              sectionId: 'drills',
              sectionLabel: 'Тренировки',
              itemName: 'Учебная тренировка по эвакуации',
              lastDate: null,
              nextDueDate: new Date(),
              daysLeft: 0,
              severity: 'overdue',
              message: 'Тренировки не проводились',
            });
          }
        }
      } catch {
        /* skip */
      }

      // Сортировка: сначала просроченные, потом ближайшие
      collected.sort((a, b) => a.daysLeft - b.daysLeft);
      setAlerts(collected);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [objectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { alerts, loading, error, refresh: load };
}
