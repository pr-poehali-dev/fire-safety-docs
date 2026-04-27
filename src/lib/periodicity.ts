/**
 * Периодичности проверок согласно ТЗ Этапа 4.
 * Возвращает количество дней между проверками.
 */
export const PERIODICITY_DAYS = {
  AUSP_MAINTENANCE: 30,        // Журнал АУСП — 1 раз в месяц
  FIRE_EXTINGUISHERS: 90,      // Огнетушители — раз в квартал
  FIRE_BLANKETS: 365,          // Покрывала — раз в год
  FIRE_PROTECTION: 365 * 5,    // Огнезащита — раз в 5 лет
  HYDRANTS: 180,               // Гидранты и краны — 2 раза в год
  HOSE_ROLLING: 365,           // Перекатка рукавов — раз в год
  DRILLS: 180,                 // Тренировки — 2 раза в год
} as const;

export const SECTION_PERIODICITY: Record<string, number> = {
  aups: PERIODICITY_DAYS.AUSP_MAINTENANCE,
  soue: PERIODICITY_DAYS.AUSP_MAINTENANCE,
  smoke_ventilation: PERIODICITY_DAYS.AUSP_MAINTENANCE,
  aupt: PERIODICITY_DAYS.AUSP_MAINTENANCE,
  fire_extinguishers: PERIODICITY_DAYS.FIRE_EXTINGUISHERS,
  fire_blankets: PERIODICITY_DAYS.FIRE_BLANKETS,
  fire_protection: PERIODICITY_DAYS.FIRE_PROTECTION,
  hydrants: PERIODICITY_DAYS.HYDRANTS,
  indoor_hydrants: PERIODICITY_DAYS.HYDRANTS,
  outdoor_hydrants: PERIODICITY_DAYS.HYDRANTS,
  hose_rolling: PERIODICITY_DAYS.HOSE_ROLLING,
};

export const SECTION_LABELS: Record<string, string> = {
  aups: 'АУПС',
  soue: 'СОУЭ',
  smoke_ventilation: 'Противодымная вентиляция',
  aupt: 'АУПТ',
  fire_extinguishers: 'Огнетушители',
  fire_blankets: 'Покрывала',
  fire_protection: 'Огнезащита',
  hydrants: 'Гидранты и краны',
  indoor_hydrants: 'Внутренние пожарные краны',
  outdoor_hydrants: 'Наружные гидранты',
  hose_rolling: 'Перекатка рукавов',
};

export function calculateNextDueDate(lastDate: string | Date | null, periodicityDays: number): Date | null {
  if (!lastDate) return null;
  const d = typeof lastDate === 'string' ? new Date(lastDate) : lastDate;
  if (isNaN(d.getTime())) return null;
  const next = new Date(d);
  next.setDate(next.getDate() + periodicityDays);
  return next;
}

export function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export type AlertSeverity = 'overdue' | 'soon' | 'upcoming';

export interface PeriodicAlert {
  id: string;
  sectionId: string;
  sectionLabel: string;
  itemName: string;
  lastDate: Date | null;
  nextDueDate: Date | null;
  daysLeft: number;
  severity: AlertSeverity;
  message: string;
}

/**
 * Превращает запись из журнала в alert, если:
 * - срок прошёл (overdue, daysLeft < 0)
 * - срок наступает в ближайшие 14 дней (soon)
 * - срок наступает в ближайшие 30 дней (upcoming)
 */
export function buildAlert(
  sectionId: string,
  itemId: string | number,
  itemName: string,
  lastDate: string | null,
): PeriodicAlert | null {
  const periodicity = SECTION_PERIODICITY[sectionId];
  if (!periodicity) return null;

  const nextDue = calculateNextDueDate(lastDate, periodicity);
  if (!nextDue) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = daysBetween(today, nextDue);

  let severity: AlertSeverity;
  let message: string;

  if (daysLeft < 0) {
    severity = 'overdue';
    message = `Просрочено на ${Math.abs(daysLeft)} ${pluralDays(Math.abs(daysLeft))}`;
  } else if (daysLeft <= 14) {
    severity = 'soon';
    message = `Срок через ${daysLeft} ${pluralDays(daysLeft)}`;
  } else if (daysLeft <= 30) {
    severity = 'upcoming';
    message = `Срок через ${daysLeft} ${pluralDays(daysLeft)}`;
  } else {
    return null;
  }

  const sectionLabel = SECTION_LABELS[sectionId] || sectionId;
  return {
    id: `${sectionId}-${itemId}`,
    sectionId,
    sectionLabel,
    itemName,
    lastDate: lastDate ? new Date(lastDate) : null,
    nextDueDate: nextDue,
    daysLeft,
    severity,
    message,
  };
}

function pluralDays(n: number): string {
  const lastTwo = n % 100;
  const last = n % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'дней';
  if (last === 1) return 'день';
  if (last >= 2 && last <= 4) return 'дня';
  return 'дней';
}

export function severityColor(s: AlertSeverity): string {
  if (s === 'overdue') return 'bg-red-500';
  if (s === 'soon') return 'bg-amber-500';
  return 'bg-blue-500';
}

export function severityLabel(s: AlertSeverity): string {
  if (s === 'overdue') return 'Пропущено';
  if (s === 'soon') return 'Скоро';
  return 'Предстоит';
}
