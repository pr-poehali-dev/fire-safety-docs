/**
 * Расчёт категории помещения по пожарной и взрывопожарной опасности
 * согласно СП 12.13130.2009.
 *
 * Поддерживает множественный ввод веществ. Логика:
 *   - Q (полная пожарная нагрузка) = Σ G_i × Q_нi по всем веществам
 *   - ΔP считается для каждого взрывоопасного вещества (газы/ЛВЖ/пыли)
 *     отдельно; берётся максимум как определяющий
 *   - Категория А/Б — если есть хоть одно вещество с ΔP > 5 кПа
 *   - Категория В1–В4 — по суммарной удельной нагрузке g
 */

import { Substance } from './substances';

export type Category = 'А' | 'Б' | 'В1' | 'В2' | 'В3' | 'В4' | 'Г' | 'Д';

export interface SubstanceEntry {
  /** Уникальный id строки в форме */
  rowId: string;
  /** Вещество */
  substance: Substance;
  /** Количество (шт./единиц), опционально — для информативности */
  quantity?: number;
  /** Масса единицы (кг). Итоговая масса = quantity × massPerUnit, либо просто mass */
  massPerUnit?: number;
  /** Полная масса (кг). Если не задано — берётся quantity × massPerUnit */
  mass?: number;
}

export interface CalculationInput {
  roomName: string;
  area: number;
  height: number;
  freeVolume?: number;
  roomTemp?: number;
  /** Список веществ (одно или несколько) */
  substances: SubstanceEntry[];
  loadArea?: number;
  emergencyVentilation?: boolean;
  shutoffTime?: number;
}

export interface CalculationStep {
  label: string;
  formula?: string;
  value: string;
}

export interface SubstanceContribution {
  rowId: string;
  substanceName: string;
  totalMass: number;
  Q: number;
  deltaP?: number;
  isExplosive: boolean;
}

export interface CalculationResult {
  category: Category;
  reason: string;
  /** Максимальное избыточное давление взрыва среди всех веществ */
  deltaP?: number;
  /** Суммарная пожарная нагрузка, МДж */
  Q?: number;
  /** Удельная пожарная нагрузка, МДж/м² */
  g?: number;
  /** Свободный объём, м³ */
  freeVolume: number;
  /** Вклад каждого вещества */
  contributions: SubstanceContribution[];
  steps: CalculationStep[];
  warnings: string[];
  pressureCalculated: boolean;
}

const PMAX = 900;
const P0 = 101;
const Z = 0.5;
const Z_DUST = 0.5;
const KN = 3;

export function calcBeta(formula: { C: number; H: number; O: number; X: number }): number {
  const { C, H, O, X } = formula;
  return C + (H - X) / 4 - O / 2;
}

export function calcCst(beta: number): number {
  return 100 / (1 + 4.84 * beta);
}

export function calcDeltaP(
  substanceType: 'gas' | 'lvzh' | 'gzh' | 'dust' | 'solid',
  mass: number,
  freeVolume: number,
  density: number,
  Cst: number,
): number | null {
  if (freeVolume <= 0 || density <= 0 || mass <= 0) return null;

  if (substanceType === 'gas' || substanceType === 'lvzh') {
    if (Cst <= 0) return null;
    return ((PMAX - P0) * mass * Z * 100) / (freeVolume * density * Cst * KN);
  }

  if (substanceType === 'dust') {
    return (PMAX * (1 - (1.12 * P0) / PMAX) * mass * Z_DUST * 100) / (freeVolume * density * KN);
  }

  return null;
}

export function categorizeByLoad(g: number): { cat: Category; reason: string } | null {
  if (g <= 0) return null;
  if (g > 2200) return { cat: 'В1', reason: 'Удельная пожарная нагрузка g > 2200 МДж/м²' };
  if (g > 1400) return { cat: 'В2', reason: 'Удельная пожарная нагрузка 1401–2200 МДж/м²' };
  if (g > 180) return { cat: 'В3', reason: 'Удельная пожарная нагрузка 181–1400 МДж/м²' };
  return { cat: 'В4', reason: 'Удельная пожарная нагрузка 1–180 МДж/м²' };
}

function entryMass(e: SubstanceEntry): number {
  if (typeof e.mass === 'number' && e.mass > 0) return e.mass;
  if (typeof e.quantity === 'number' && typeof e.massPerUnit === 'number') {
    return e.quantity * e.massPerUnit;
  }
  return 0;
}

export function calculateCategory(input: CalculationInput): CalculationResult {
  const warnings: string[] = [];
  const steps: CalculationStep[] = [];
  const contributions: SubstanceContribution[] = [];

  const geomVolume = input.area * input.height;
  const freeVolume =
    input.freeVolume && input.freeVolume > 0 ? input.freeVolume : geomVolume * 0.8;

  steps.push({
    label: 'Геометрический объём помещения',
    formula: 'V = S × H',
    value: `${input.area} × ${input.height} = ${geomVolume.toFixed(2)} м³`,
  });
  steps.push({
    label: input.freeVolume
      ? 'Свободный объём (задан вручную)'
      : 'Свободный объём (по умолчанию 0,8 от геометрического)',
    formula: input.freeVolume ? undefined : 'V_св = V × 0,8',
    value: `V_св = ${freeVolume.toFixed(2)} м³`,
  });

  const validEntries = (input.substances || []).filter((e) => e.substance && entryMass(e) > 0);
  if (validEntries.length === 0) {
    return {
      category: 'Д',
      reason: 'Горючие вещества не указаны или их масса равна нулю',
      freeVolume,
      contributions: [],
      steps,
      warnings: ['Добавьте хотя бы одно вещество с ненулевой массой'],
      pressureCalculated: false,
    };
  }

  // Полная пожарная нагрузка
  let Q = 0;
  let maxDeltaP: number | null = null;
  let maxDeltaPEntry: SubstanceEntry | null = null;

  for (const entry of validEntries) {
    const m = entryMass(entry);
    const Qi = m * entry.substance.heatOfCombustion;
    Q += Qi;

    const sType = entry.substance.type;
    let dp: number | null = null;

    if (sType === 'gas' || sType === 'lvzh') {
      const beta = calcBeta(entry.substance.formula);
      const Cst = calcCst(beta);
      const density = entry.substance.vaporDensity || 0;
      if (density > 0) {
        dp = calcDeltaP(sType, m, freeVolume, density, Cst);
      }
    } else if (sType === 'dust') {
      const density = entry.substance.vaporDensity || 0;
      if (density > 0) {
        dp = calcDeltaP(sType, m, freeVolume, density, 0);
      }
    }

    contributions.push({
      rowId: entry.rowId,
      substanceName: entry.substance.name,
      totalMass: m,
      Q: Qi,
      deltaP: dp ?? undefined,
      isExplosive: sType === 'gas' || sType === 'lvzh' || sType === 'dust',
    });

    if (dp !== null && (maxDeltaP === null || dp > maxDeltaP)) {
      maxDeltaP = dp;
      maxDeltaPEntry = entry;
    }
  }

  steps.push({
    label: 'Суммарная пожарная нагрузка по всем веществам',
    formula: 'Q = Σ Gᵢ × Q_н(i)',
    value: contributions
      .map((c) => `${c.substanceName}: ${c.totalMass} × ${(c.Q / c.totalMass).toFixed(1)} = ${c.Q.toFixed(1)} МДж`)
      .join('; ') + ` → Σ = ${Q.toFixed(2)} МДж`,
  });

  const loadArea = input.loadArea && input.loadArea > 0 ? input.loadArea : Math.min(input.area, 10);
  const effArea = Math.max(loadArea, 10);
  const g = Q / effArea;
  steps.push({
    label: 'Удельная пожарная нагрузка',
    formula: 'g = Q / S (S не менее 10 м²)',
    value: `${Q.toFixed(2)} / ${effArea} = ${g.toFixed(2)} МДж/м²`,
  });

  let pressureCalculated = false;
  if (maxDeltaP !== null && maxDeltaPEntry) {
    pressureCalculated = true;
    steps.push({
      label: `Макс. избыточное давление взрыва (вещество: ${maxDeltaPEntry.substance.name})`,
      formula:
        maxDeltaPEntry.substance.type === 'dust'
          ? 'ΔP = P_max × (1 − 1,12·P_0/P_max) × m·Z·100 / (V_св × ρ × K_н)'
          : 'ΔP = (P_max − P_0) × m × Z × 100 / (V_св × ρ × C_st × K_н)',
      value: `ΔP_max = ${maxDeltaP.toFixed(3)} кПа`,
    });
  } else {
    const hasExplosiveSubstances = contributions.some((c) => c.isExplosive);
    if (hasExplosiveSubstances) {
      warnings.push('Не удалось рассчитать ΔP — проверьте плотность пара/газа в справочнике');
    } else {
      warnings.push('Среди указанных веществ нет газов, ЛВЖ или пылей. ΔP не рассчитывается, категория определяется по нагрузке.');
    }
  }

  // Определение категории
  let category: Category;
  let reason: string;

  if (pressureCalculated && maxDeltaP !== null && maxDeltaP > 5 && maxDeltaPEntry) {
    const sType = maxDeltaPEntry.substance.type;
    const flash = maxDeltaPEntry.substance.flashPoint;
    if (sType === 'gas' || (sType === 'lvzh' && flash !== undefined && flash <= 28)) {
      category = 'А';
      reason = `Горючий газ или ЛВЖ с t_всп ≤ 28°C (${maxDeltaPEntry.substance.name}); ΔP = ${maxDeltaP.toFixed(2)} кПа > 5 кПа`;
    } else if (sType === 'lvzh') {
      category = 'Б';
      reason = `ЛВЖ с t_всп > 28°C (${maxDeltaPEntry.substance.name}); ΔP = ${maxDeltaP.toFixed(2)} кПа > 5 кПа`;
    } else if (sType === 'dust') {
      category = 'Б';
      reason = `Горючая пыль (${maxDeltaPEntry.substance.name}); ΔP = ${maxDeltaP.toFixed(2)} кПа > 5 кПа`;
    } else {
      category = 'В1';
      reason = '';
    }
  } else {
    const cat = categorizeByLoad(g);
    if (cat) {
      category = cat.cat;
      reason = cat.reason;
      if (pressureCalculated && maxDeltaP !== null && maxDeltaP <= 5) {
        reason += ` (ΔP = ${maxDeltaP.toFixed(2)} кПа ≤ 5 кПа — взрывоопасности нет)`;
      }
    } else {
      category = 'Д';
      reason = 'Пожарная нагрузка нулевая или горючие вещества отсутствуют';
    }
  }

  if (input.emergencyVentilation && (category === 'А' || category === 'Б')) {
    warnings.push(
      'При наличии исправной аварийной вентиляции категория может быть снижена согласно СП 12 § 6.5 — требуется отдельный расчёт.',
    );
  }

  return {
    category,
    reason,
    deltaP: maxDeltaP || undefined,
    Q,
    g,
    freeVolume,
    contributions,
    steps,
    warnings,
    pressureCalculated,
  };
}

export const CATEGORY_COLORS: Record<Category, { bg: string; border: string; text: string; label: string }> = {
  'А': { bg: 'bg-red-500', border: 'border-red-600', text: 'text-white', label: 'Повышенная взрывопожароопасность' },
  'Б': { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-white', label: 'Взрывопожароопасность' },
  'В1': { bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-white', label: 'Пожароопасность (высокая)' },
  'В2': { bg: 'bg-amber-400', border: 'border-amber-500', text: 'text-white', label: 'Пожароопасность (повыш.)' },
  'В3': { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-slate-900', label: 'Пожароопасность (средняя)' },
  'В4': { bg: 'bg-yellow-300', border: 'border-yellow-400', text: 'text-slate-900', label: 'Пожароопасность (пониж.)' },
  'Г': { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white', label: 'Умеренная пожароопасность' },
  'Д': { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-white', label: 'Пониженная пожароопасность' },
};
